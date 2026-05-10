import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import {
  calculateSubtotal,
  checkIfSpecialOfferIsAvailable,
} from "@/app/utils/orderCalculations";
import checkIfPromoCodeIsValid from "@/app/utils/isPromoCodeValid";
import CheckoutLogin from "@/app/components/checkout/user/CheckoutLogin";
import CheckoutRegister from "@/app/components/checkout/user/CheckoutRegister";
import CheckoutPersonalInfo from "@/app/components/checkout/user/CheckoutPersonalInfo";
import CheckoutDeliveryAddress from "@/app/components/checkout/user/CheckoutDeliveryAddress";
import CheckoutPromoCode from "@/app/components/checkout/user/CheckoutPromoCode";
import CheckoutPaymentMethod from "@/app/components/checkout/user/CheckoutPaymentMethod";
import CheckoutCart from "@/app/components/checkout/cart/CheckoutCart";
import { thanaByCity } from "@/app/data/cities";
import { invalidateCheckoutIntent, resolveIdempotencyKey } from "@/app/utils/idempotency";

export default function CheckoutForm({
  userData,
  productList,
  specialOffers,
  shippingZones,
  primaryLocation,
  cartItems,
  legalPolicyPdfLinks,
}) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const [userPromoCode, setUserPromoCode] = useState("");
  const isPromoCodeValid = checkIfPromoCodeIsValid(
    userPromoCode,
    calculateSubtotal(productList, cartItems, specialOffers),
  );
  const [isAgreementCheckboxSelected, setIsAgreementCheckboxSelected] =
    useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    watch,
    control,
    setValue,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: userData?.userInfo?.personalInfo?.customerName || "",
      email: userData?.email || "",
      hometown: userData?.userInfo?.personalInfo?.hometown || "",
      phoneNumber: userData?.userInfo?.personalInfo?.phoneNumber || "",
      altPhoneNumber: userData?.userInfo?.personalInfo?.phoneNumber2 || "",
      addressLineOne: userData?.userInfo?.savedDeliveryAddress?.address1 || "",
      city: userData?.userInfo?.savedDeliveryAddress?.city || "",
      thana: userData?.userInfo?.savedDeliveryAddress?.thana || "",
      postalCode: userData?.userInfo?.savedDeliveryAddress?.postalCode || "",
      note: "",
      deliveryType: "",
      paymentMethod: "",
    },
    mode: "onBlur",
  });

  const formData = watch();
  const selectedCity = watch("city");
  const selectedDeliveryType = watch("deliveryType");
  const isInitialCitySet = useRef(true);

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    if (!isAgreementCheckboxSelected)
      return toast.error(
        "You must agree with the terms and conditions and policies.",
      );

    if (!userData) return toast.error("Please log in or register to continue.");

    setIsPageLoading(true);
    setIsSubmitting(true);

    const userAgent = navigator.userAgent.toLowerCase();
    let userDevice;

    if (/mobile|android|iphone|ipad|ipod|blackberry|phone/.test(userAgent)) {
      userDevice = "Mobile";
    } else if (/tablet|ipad/.test(userAgent)) {
      userDevice = "Tablet";
    } else {
      userDevice = "Desktop";
    }

    // This is the only place the key is resolved. It returns:
    // - The SAME key if cart unchanged, session active, same user (retry/reload/re-click)
    // - A NEW key if cart changed, session expired, or previous payment completed
    const idempotencyKey = resolveIdempotencyKey(
      userData._id,
      cartItems,
      data,
      userPromoCode?.promoCode || "",
    );

    try {
      const result = await routeFetch("/api/order", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          idempotencyKey,
          promoCode: userPromoCode?.promoCode || null,
          cartItems,
          userDevice,
        }),
      });

      if (result.ok) {

        const { checkoutSessionId } = result.data;

        const paymentRes = await routeFetch('/api/payment-init', {
          method: "POST",
          body: JSON.stringify({ checkoutSessionId })
        });

        if (!paymentRes?.ok) {
          if (paymentRes?.errorCode === "SESSION_EXPIRED") {
            toast.error("Your session expired. Please try again.");
            // Backend said expired → force a fresh key on next attempt
            invalidateCheckoutIntent();
          } else {
            toast.error(paymentRes?.message || "Payment initialization failed");
          }
          // Only reset on failure
          setIsSubmitting(false);
          setIsPageLoading(false);
          return;
        }

        // UX signal
        toast.loading("Redirecting to secure payment...");
        localStorage.setItem("checkout_payment_pending", "true");

        setTimeout(() => {
          // redirect
          window.location.href = paymentRes.data.redirectUrl;
        }, 100);
      } else {
        if (result.errorCode === "FAULTY_ITEMS") {
          toast.error("Unable to place order. Please try again.");
          router.refresh();
        } else if (result.errorCode === "SESSION_EXPIRED") {
          // Backend explicitly said this key's session is expired.
          // Clear intent → next submit generates fresh key + new session.
          invalidateCheckoutIntent();
          toast.error("Your session expired. Please try again.");
          setIsSubmitting(false);
          setIsPageLoading(false);
        } else if (result.errorCode === "SESSION_ALREADY_SPENT") {
          toast.success("Your order has already been placed!");
          setIsSubmitting(false);
          setIsPageLoading(false);
          router.push("/user/orders");
        } else if (result.errorCode === "SESSION_PROCESSING") {
          toast.loading("Your payment is being processed. Please wait...");
          setIsSubmitting(false);
          setIsPageLoading(false);
        } else if (result.errorCode === "STOCK_UNAVAILABLE") {
          // Stock was grabbed by someone else between page load and submit.
          // Refresh to re-validate cart against live inventory.
          toast.error("An item just went out of stock. Refreshing...");
          router.refresh();
        } else {
          console.error(
            "SubmissionError (checkoutForm):",
            result.message || "Unable to place order.",
          );
          toast.error(result.message || "Unable to place order.");
          setIsSubmitting(false);
          setIsPageLoading(false);
        }
      }
    } catch (error) {
      console.error("SubmissionError (checkoutForm):", error.message || error);
      toast.error("Something went wrong while placing your order.");
      setIsSubmitting(false);
      setIsPageLoading(false);
    }
  };

  const onError = (errors) => {
    const errorTypes = Object.values(errors).map((error) => error.type);

    if (errorTypes.includes("required"))
      toast.error("Please fill up the required fields.");
    else if (errorTypes.includes("pattern") || errorTypes.includes("validate"))
      toast.error("Please provide valid information.");
    else if (
      errorTypes.includes("notMatchingWithConfirm") ||
      errorTypes.includes("notMatchingWithNew")
    )
      toast.error("Passwords do not match.");
    else toast.error("Something went wrong. Please try again.");
  };

  useEffect(() => {
    if (isInitialCitySet.current) {
      isInitialCitySet.current = false;
      return;
    }
    setValue("deliveryType", "");
  }, [selectedCity, setValue]);

  // Save form data to localStorage on input change
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("checkoutFormDraft", JSON.stringify(formData));
    }, 500); // debounce to prevent excessive writes

    return () => clearTimeout(timeout);
  }, [formData]);

  const thanas = selectedCity ? thanaByCity[selectedCity] || [] : [];

  // Load draft from localStorage or update form on user session change
  useEffect(() => {
    const draft = (() => {
      try {
        const rawDraft = localStorage.getItem("checkoutFormDraft");
        return rawDraft ? JSON.parse(rawDraft) : {};
      } catch (e) {
        console.error("Failed to parse form draft from localStorage:", e);
        return {};
      }
    })();

    const personalInfo = userData?.userInfo?.personalInfo || {};
    const prevSavedAddress = userData?.userInfo?.savedDeliveryAddress || {};
    const wasDeliveryEdited =
      draft?.addressLineOne ||
      draft?.city ||
      draft?.thana ||
      draft?.postalCode;

    isInitialCitySet.current = true;

    reset({
      name: personalInfo?.customerName || draft.name || "",
      email: userData?.email || draft.email || "",
      hometown: personalInfo?.hometown || draft.hometown || "",
      phoneNumber: draft.phoneNumber || personalInfo?.phoneNumber || "",
      altPhoneNumber: draft.altPhoneNumber || personalInfo?.phoneNumber2 || "",
      addressLineOne:
        (wasDeliveryEdited
          ? draft.addressLineOne
          : prevSavedAddress?.address1) || "",
      city: (wasDeliveryEdited ? draft.city : prevSavedAddress?.city) || "",
      thana: (wasDeliveryEdited ? draft.thana : prevSavedAddress?.thana) || "",
      postalCode:
        (wasDeliveryEdited ? draft.postalCode : prevSavedAddress?.postalCode) ||
        "",
      note: draft.note || "",
      deliveryType: draft.deliveryType || "",
      paymentMethod: draft.paymentMethod || "",
    });
  }, [
    reset,
    userData?.email,
    userData?.userInfo?.personalInfo,
    userData?.userInfo?.savedDeliveryAddress,
  ]);

  useEffect(() => {
    const autocompleteElements = document.querySelectorAll(
      "[aria-autocomplete]",
    );

    const handleAutocompleteClick = (event) =>
      event.currentTarget.querySelector("input").focus();

    autocompleteElements.forEach((element) => {
      element
        .closest('[data-slot="base"]')
        .addEventListener("click", handleAutocompleteClick);
    });

    autocompleteElements.forEach((element) => {
      return () =>
        element
          .closest('[data-slot="base"]')
          .removeEventListener("click", handleAutocompleteClick);
    });
  }, []);

  return (
    <div className="pt-header-h-full-section-pb relative min-h-svh gap-4 px-5 sm:px-8 lg:flex lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0">
      <div className="bottom-[var(--section-padding)] top-[var(--section-padding)] h-fit space-y-4 lg:sticky lg:w-[calc(55%-16px/2)]">
        {!userData && (
          <CheckoutLogin
            onError={onError}
            setIsPageLoading={setIsPageLoading}
            setIsRegisterModalOpen={setIsRegisterModalOpen}
          />
        )}
        <CheckoutRegister
          onError={onError}
          setIsPageLoading={setIsPageLoading}
          isRegisterModalOpen={isRegisterModalOpen}
          setIsRegisterModalOpen={setIsRegisterModalOpen}
          legalPolicyPdfLinks={legalPolicyPdfLinks}
        />
        <form
          className="space-y-4"
          noValidate
          onSubmit={handleSubmit(onSubmit, onError)}
        >
          <CheckoutPersonalInfo
            register={register}
            control={control}
            errors={errors}
            isUserLoggedIn={!!userData}
            userHometown={userData?.userInfo?.personalInfo?.hometown}
          />
          <CheckoutDeliveryAddress
            register={register}
            control={control}
            reset={reset}
            errors={errors}
            deliveryAddresses={userData?.userInfo?.deliveryAddresses}
            selectedCity={selectedCity}
            thanas={thanas}
            selectedDeliveryType={selectedDeliveryType}
            shippingZones={shippingZones}
          />
          {/* If none of the cart item has special offer, show promo code section */}
          {cartItems?.every(
            (cartItem) =>
              !checkIfSpecialOfferIsAvailable(
                productList?.find((product) => product._id === cartItem._id),
                specialOffers,
              ),
          ) && (
              <CheckoutPromoCode
                userPromoCode={userPromoCode}
                setUserPromoCode={setUserPromoCode}
                cartItems={cartItems}
                cartSubtotal={calculateSubtotal(
                  productList,
                  cartItems,
                  specialOffers,
                )}
              />
            )}
          <CheckoutPaymentMethod register={register} errors={errors} />
        </form>
      </div>
      <CheckoutCart
        userData={userData}
        productList={productList}
        cartItems={cartItems}
        specialOffers={specialOffers}
        shippingZones={shippingZones}
        primaryLocation={primaryLocation}
        userPromoCode={userPromoCode}
        isPromoCodeValid={isPromoCodeValid}
        selectedCity={selectedCity}
        selectedDeliveryType={selectedDeliveryType}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        onError={onError}
        isAgreementCheckboxSelected={isAgreementCheckboxSelected}
        setIsAgreementCheckboxSelected={setIsAgreementCheckboxSelected}
        legalPolicyPdfLinks={legalPolicyPdfLinks}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}
