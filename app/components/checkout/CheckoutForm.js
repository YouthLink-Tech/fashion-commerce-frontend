import { useState, useEffect } from "react";
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

export default function CheckoutForm({
  userData,
  productList,
  specialOffers,
  shippingZones,
  primaryLocation,
  setIsPaymentStepDone,
  setResolvedCart,
  cartItems,
  setCartItems,
  setOrderDetails,
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

  const onSubmit = async (data) => {
    if (!isAgreementCheckboxSelected)
      return toast.error(
        "You must agree with the terms and conditions and policies.",
      );

    if (!userData) return toast.error("Please log in or register to continue.");

    setIsPageLoading(true);

    const userAgent = navigator.userAgent.toLowerCase();
    let userDevice;

    if (/mobile|android|iphone|ipad|ipod|blackberry|phone/.test(userAgent)) {
      userDevice = "Mobile";
    } else if (/tablet|ipad/.test(userAgent)) {
      userDevice = "Tablet";
    } else {
      userDevice = "Desktop";
    }

    try {
      const result = await routeFetch("/api/order", {
        method: "POST",
        body: JSON.stringify({
          ...data,
          promoCode: userPromoCode?.promoCode || null,
          cartItems,
          userDevice,
        }),
      });

      if (result.ok) {
        const { orderNumber, totalAmount } = result.data;

        setResolvedCart(cartItems);

        setOrderDetails({
          orderNumber,
          phoneNumber: data.phoneNumber,
          totalAmount,
          address1: data.addressLineOne,
          city: data.city,
          thana: data.thana,
          postalCode: data.postalCode,
        });
        setIsPaymentStepDone(true);
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });

        const updatedPersonalInfo = {
          ...userData.userInfo.personalInfo,
          phoneNumber: data.phoneNumber,
          phoneNumber2: data.altPhoneNumber,
          hometown: userData?.userInfo?.personalInfo?.hometown || data.hometown,
        };

        const existingAddressId = userData?.userInfo?.deliveryAddresses?.find(
          (address) =>
            address?.address1 === data.addressLineOne &&
            address?.city === data.city &&
            address?.thana === data.thana &&
            address?.postalCode === data.postalCode,
        )?.id;

        const updatedDeliveryAddresses = !existingAddressId
          ? [
            ...userData.userInfo.deliveryAddresses,
            {
              id: `${userData?.email}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              nickname: undefined,
              address1: data.addressLineOne,
              city: data.city,
              thana: data.thana,
              postalCode: data.postalCode,
            },
          ]
          : userData?.userInfo?.deliveryAddresses?.map((availableAddress) =>
            availableAddress.id == existingAddressId
              ? {
                ...availableAddress,
                address1: data.addressLineOne,
                city: data.city,
                thana: data.thana,
                postalCode: data.postalCode,
              }
              : availableAddress,
          );

        const currentWishlist = JSON.parse(
          localStorage.getItem("wishlistItems"),
        );
        const currentCart = JSON.parse(localStorage.getItem("cartItems"));

        const updatedWishlist = !currentWishlist?.length
          ? []
          : currentWishlist.filter(
            (wishlistItem) =>
              !currentCart.some(
                (cartItem) => wishlistItem._id === cartItem._id,
              ),
          );

        const updatedUserData = {
          ...userData,
          userInfo: {
            ...userData.userInfo,
            personalInfo: updatedPersonalInfo,
            deliveryAddresses: updatedDeliveryAddresses,
            savedDeliveryAddress: {
              address1: data.addressLineOne,
              city: data.city,
              thana: data.thana,
              postalCode: data.postalCode,
            },
          },
          cartItems: [],
          isCartLastModified: true,
          wishlistItems: updatedWishlist,
        };

        try {
          setCartItems([]);
          localStorage.removeItem("checkoutFormDraft");
          localStorage.removeItem("cartItems");
          window.dispatchEvent(new Event("storageCart"));
          localStorage.setItem(
            "wishlistItems",
            JSON.stringify(updatedWishlist),
          );
          window.dispatchEvent(new Event("storageWishlist"));

          const result = await routeFetch(`/api/user-data/${userData?._id}`, {
            method: "PUT",
            body: JSON.stringify(updatedUserData),
          });

          if (!result.ok) {
            console.error(
              "UpdateError (checkoutForm):",
              result.message || "Failed update user data.",
            );
            toast.error(result.message || "Failed update user data.");
          } else {
            router.refresh();
          }
        } catch (error) {
          console.error("UpdateError (checkoutForm):", error.message || error);
          toast.error("Failed update user data.");
        }
      } else {
        if (result.data.hasFaultyItems) {
          toast.error("Unable to place order. Please try again.");
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
    }

    setIsPageLoading(false);
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

  useEffect(() => {
    if (!userData) {
      setIsPaymentStepDone(false);
      setOrderDetails(null);
    }
  }, [userData, setIsPaymentStepDone, setOrderDetails]);

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
      />
    </div>
  );
}
