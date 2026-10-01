import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import {
  calculateSubtotal,
  checkIfSpecialOfferIsAvailable,
  getAvailableDeliveryTypes,
} from "@/app/utils/orderCalculations";
import checkIfPromoCodeIsValid from "@/app/utils/isPromoCodeValid";
import CheckoutLogin from "@/app/components/checkout/user/CheckoutLogin";
import CheckoutRegister from "@/app/components/checkout/user/CheckoutRegister";
import CheckoutPersonalInfo from "@/app/components/checkout/user/CheckoutPersonalInfo";
import CheckoutDeliveryAddress from "@/app/components/checkout/user/CheckoutDeliveryAddress";
import CheckoutPromoCode from "@/app/components/checkout/user/CheckoutPromoCode";
import CheckoutPaymentMethod from "@/app/components/checkout/user/CheckoutPaymentMethod";
import CheckoutCart from "@/app/components/checkout/cart/CheckoutCart";
import { invalidateCheckoutIntent, resolveIdempotencyKey } from "@/app/utils/idempotency";

export default function CheckoutForm({
  userData,
  productList,
  specialOffers,
  shippingZones,
  cartItems,
  legalPolicyPdfLinks,
  cities,
  thanas,
}) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const [userPromoCode, setUserPromoCode] = useState(null);

  // Check if ANY item in cart matches an active special offer
  const hasSpecialOfferInCart = cartItems?.some((cartItem) => {
    const product = Array.isArray(productList)
      ? productList.find((p) => p.id === cartItem.productId)
      : null;
    return checkIfSpecialOfferIsAvailable(product, specialOffers);
  });
  const isPromoCodeValid =
    !hasSpecialOfferInCart &&
    checkIfPromoCodeIsValid(
      userPromoCode,
      calculateSubtotal(productList, cartItems),
    );
  const [isAgreementCheckboxSelected, setIsAgreementCheckboxSelected] =
    useState(true);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const primaryAddress = userData?.addresses?.[0] || {};
  const defaultCityId = primaryAddress?.thana?.city_id || "";
  const defaultAvailableTypes = getAvailableDeliveryTypes(defaultCityId, shippingZones);
  const defaultDeliveryType = defaultAvailableTypes.length === 1 ? defaultAvailableTypes[0] : "";

  const {
    register,
    watch,
    control,
    setValue,
    getValues,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: userData?.name || "",
      email: userData?.email || "",
      hometownId: userData?.hometown || "",
      phoneNumber: userData?.phone_number || "",
      altPhoneNumber: userData?.phone_number_2 || "",
      addressLineOne: primaryAddress?.address1 || "",
      cityId: defaultCityId,
      thanaId: primaryAddress?.thana_id || "",
      postalCode: primaryAddress?.postal_code || "",
      note: "",
      deliveryType: defaultDeliveryType,
      paymentMethod: "",
    },
    mode: "onBlur",
  });

  const formData = watch();
  const selectedCityId = watch("cityId");
  const selectedDeliveryType = watch("deliveryType");

  function getCookie(name) {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  const onSubmit = async (data) => {
    if (isSubmitting) return;
    if (!isAgreementCheckboxSelected)
      return toast.error(
        "You must agree with the terms and conditions and policies.",
      );

    const phone = data.phoneNumber?.trim();
    const altPhone = data.altPhoneNumber?.trim();
    if (phone && altPhone && phone === altPhone) {
      setIsPageLoading(false);
      setIsSubmitting(false);
      return toast.error(
        "Alternative mobile number cannot be the same as primary mobile number.",
      );
    }

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

    const fbp = getCookie('_fbp');
    const fbc = getCookie('_fbc');

    // This is the only place the key is resolved. It returns:
    // - The SAME key if cart unchanged, session active, same user (retry/reload/re-click)
    // - A NEW key if cart changed, session expired, or previous payment completed
    const idempotencyKey = resolveIdempotencyKey(
      userData.id,
      cartItems,
      data,
      userPromoCode?.code || "",
    );

    const resolvedHometown = data.hometownId?.trim() || userData?.hometown || null;

    const payload = {
      name: data.name?.trim(),
      email: data.email?.trim(),
      phone_number: data.phoneNumber?.trim(),
      phone_number_2: data.altPhoneNumber?.trim() || "",
      hometown_id: resolvedHometown,
      delivery_address1: data.addressLineOne?.trim(),
      thana_id: data.thanaId,
      delivery_postal_code: String(data.postalCode || "").trim(),
      delivery_note_to_seller: data.note?.trim() || "",
      delivery_type: (data.deliveryType || "standard").toLowerCase(),
      payment_method: data.paymentMethod?.trim() || "SSLCommerz",
      promo_code: userPromoCode?.code || null,
      items: cartItems.map((item) => ({
        variant_id: item.variant_id,
        quantity: Number(item.selectedQuantity),
      })),
      user_device: userDevice.toLowerCase(), // "mobile" | "tablet" | "desktop"
      idempotency_key: idempotencyKey,
      fbp: fbp || null,
      fbc: fbc || null,
    };

    try {
      const result = await routeFetch("/api/order", {
        method: "POST",
        body: JSON.stringify(payload),
      });

      if (result.ok) {

        const checkoutSessionId = result.data?.checkout_session_id;

        if (!checkoutSessionId) {
          toast.error("Checkout session ID missing from response.");
          setIsSubmitting(false);
          setIsPageLoading(false);
          return;
        }

        const paymentRes = await routeFetch('/api/payment-init', {
          method: "POST",
          body: JSON.stringify({ checkout_session_id: checkoutSessionId })
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

        if (!paymentRes.data?.redirectUrl) {
          toast.error("Payment redirect URL missing.");
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
        setIsSubmitting(false);
        setIsPageLoading(false);

        if (result.errorCode === "FAULTY_ITEMS") {
          toast.error("Unable to place order. Please try again.");
          router.refresh();
        } else if (result.errorCode === "SESSION_EXPIRED") {
          // Backend explicitly said this key's session is expired.
          // Clear intent → next submit generates fresh key + new session.
          invalidateCheckoutIntent();
          toast.error("Your session expired. Please try again.");
        } else if (result.errorCode === "SESSION_ALREADY_SPENT") {
          toast.success("Your order has already been placed!");
          router.push("/user/orders");
        } else if (result.errorCode === "SESSION_PROCESSING") {
          toast.loading("Your payment is being processed. Please wait...");
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
      toast.error(
        errors.altPhoneNumber?.message ||
        errors.phoneNumber?.message ||
        "Please provide valid information.",
      );
    else if (
      errorTypes.includes("notMatchingWithConfirm") ||
      errorTypes.includes("notMatchingWithNew")
    )
      toast.error("Passwords do not match.");
    else toast.error("Something went wrong. Please try again.");
  };

  // Save form data to localStorage on input change
  useEffect(() => {
    const timeout = setTimeout(() => {
      localStorage.setItem("checkoutFormDraft", JSON.stringify(formData));
    }, 500); // debounce to prevent excessive writes

    return () => clearTimeout(timeout);
  }, [formData]);

  const thanasForSelectedCity = selectedCityId
    ? thanas.filter((t) => t.city_id === selectedCityId)
    : [];

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

    const primaryAddress = userData?.addresses?.[0] || {};
    const wasDeliveryEdited =
      draft?.addressLineOne ||
      draft?.cityId ||
      draft?.thanaId ||
      draft?.postalCode;
    const resolvedCityId = (wasDeliveryEdited ? draft.cityId : primaryAddress?.thana?.city_id) || "";
    const resolvedAvailableTypes = getAvailableDeliveryTypes(resolvedCityId, shippingZones);
    const resolvedDeliveryType =
      (draft.deliveryType && resolvedAvailableTypes.includes(draft.deliveryType))
        ? draft.deliveryType
        : resolvedAvailableTypes.length === 1
          ? resolvedAvailableTypes[0]
          : "";

    reset({
      name: userData?.name || draft.name || "",
      email: userData?.email || draft.email || "",
      hometownId: userData?.hometown || draft.hometownId || "",
      phoneNumber: draft.phoneNumber || userData?.phone_number || "",
      altPhoneNumber: draft.altPhoneNumber || userData?.phone_number_2 || "",
      addressLineOne:
        (wasDeliveryEdited
          ? draft.addressLineOne
          : primaryAddress?.address1) || "",
      cityId: resolvedCityId,
      thanaId: (wasDeliveryEdited ? draft.thanaId : primaryAddress?.thana_id) || "",
      postalCode:
        (wasDeliveryEdited ? draft.postalCode : primaryAddress?.postal_code) || "",
      note: draft.note || "",
      deliveryType: resolvedDeliveryType,
      paymentMethod: draft.paymentMethod || "",
    });
  }, [
    reset,
    userData?.email,
    userData?.name,
    userData?.phone_number,
    userData?.phone_number_2,
    userData?.hometown,
    userData?.addresses,
    shippingZones
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
            getValues={getValues}
            errors={errors}
            isUserLoggedIn={!!userData}
            userHometown={userData?.hometown}
            cities={cities}
          />
          <CheckoutDeliveryAddress
            register={register}
            control={control}
            errors={errors}
            setValue={setValue}
            deliveryAddresses={userData?.addresses}
            selectedCityId={selectedCityId}
            thanas={thanasForSelectedCity}
            selectedDeliveryType={selectedDeliveryType}
            shippingZones={shippingZones}
            cities={cities}
          />
          {/* If none of the cart item has special offer, show promo code section */}
          {!hasSpecialOfferInCart && (
            <CheckoutPromoCode
              userPromoCode={userPromoCode}
              setUserPromoCode={setUserPromoCode}
              cartItems={cartItems}
              cartSubtotal={calculateSubtotal(
                productList,
                cartItems,
              )}
              customerId={userData?.id}
              customerEmail={formData.email}
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
        userPromoCode={userPromoCode}
        isPromoCodeValid={isPromoCodeValid}
        selectedCityId={selectedCityId}
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
