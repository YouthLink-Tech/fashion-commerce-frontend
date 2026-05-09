import {
  calculateSubtotal,
  getProductSpecialOffer,
} from "@/app/utils/orderCalculations";
import CheckoutItemsInfo from "./CheckoutItemsInfo";
import CheckoutAgreement from "./CheckoutAgreement";
import CheckoutCartItems from "./CheckoutCartItems";

export default function CheckoutCart({
  userData,
  productList,
  cartItems,
  specialOffers,
  shippingZones,
  primaryLocation,
  userPromoCode,
  isPromoCodeValid,
  selectedCity,
  selectedDeliveryType,
  handleSubmit,
  onSubmit,
  onError,
  isAgreementCheckboxSelected,
  setIsAgreementCheckboxSelected,
  legalPolicyPdfLinks,
  isSubmitting,
}) {
  const isSpecialOfferApplied = cartItems.some((cartItem) => {
    const product = productList?.find(
      (product) => product._id === cartItem?._id,
    );
    const cartSubtotal = calculateSubtotal(
      productList,
      cartItems,
      specialOffers,
    );
    const specialOffer = getProductSpecialOffer(
      product,
      specialOffers,
      cartSubtotal,
    );

    return !!specialOffer;
  });

  const isAnyDiscountApplied = isPromoCodeValid || isSpecialOfferApplied;
  const isDeliverySectionFilledUp =
    !!selectedCity && (selectedCity !== "Dhaka City" || !!selectedDeliveryType);

  return (
    <section className="relative bottom-[var(--section-padding)] top-[var(--section-padding)] h-full min-h-full w-full rounded-md pt-5 font-semibold shadow-[0_0_20px_0_rgba(0,0,0,0.05)] before:pointer-events-none before:absolute before:top-0 before:h-full before:w-full before:rounded-md before:border-2 before:border-neutral-50/20 before:bg-white/40 before:backdrop-blur-2xl before:content-[''] lg:sticky lg:w-[calc(45%-16px/2)]">
      <div className="relative flex h-full min-h-full w-full flex-col justify-between">
        {!!cartItems?.length && (
          <div
            className={`relative z-[1] space-y-4 px-5 pb-5 text-[13px] before:pointer-events-none before:absolute before:left-0 before:h-full before:w-full before:rounded-b-md before:border-2 before:border-neutral-50/20 before:bg-white/50 before:backdrop-blur-2xl before:content-[''] max-lg:order-last md:text-sm lg:sticky ${isAnyDiscountApplied && isDeliverySectionFilledUp ? "lg:top-[calc(100svh-274px)]" : !isAnyDiscountApplied && !isDeliverySectionFilledUp ? "lg:top-[calc(100svh-180px)]" : !isAnyDiscountApplied ? "lg:top-[calc(100svh-244px)]" : "lg:top-[calc(100svh-210px)]"} `}
          >
            <hr className="relative z-[1] h-0.5 w-full bg-[#f1f1f1]" />
            <CheckoutItemsInfo
              productList={productList}
              cartItems={cartItems}
              specialOffers={specialOffers}
              shippingZones={shippingZones}
              isPromoCodeValid={isPromoCodeValid}
              userPromoCode={userPromoCode}
              selectedCity={selectedCity}
              selectedDeliveryType={selectedDeliveryType}
            />
            <hr className="h-0.5 w-full bg-[#f1f1f1]" />
            <CheckoutAgreement
              isAgreementCheckboxSelected={isAgreementCheckboxSelected}
              setIsAgreementCheckboxSelected={setIsAgreementCheckboxSelected}
              legalPolicyPdfLinks={legalPolicyPdfLinks}
            />
            <button
              disabled={isSubmitting}
              onClick={() => handleSubmit(onSubmit, onError)()}
              className="relative z-[1] w-full rounded-[4px] bg-[var(--color-primary-500)] py-2.5 text-xs text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)] md:text-sm"
            >
              Proceed to Payment
            </button>
          </div>
        )}
        <div
          className={`px-5 ${isAnyDiscountApplied && isDeliverySectionFilledUp ? "lg:-translate-y-[274px]" : !isAnyDiscountApplied && !isDeliverySectionFilledUp ? "lg:-translate-y-[180px]" : !isAnyDiscountApplied ? "lg:-translate-y-[244px]" : "lg:-translate-y-[210px]"} `}
        >
          <h2 className="pb-5 text-lg font-semibold md:text-lg">
            Cart Overview
          </h2>
          <CheckoutCartItems
            userData={userData}
            productList={productList}
            cartItems={cartItems}
            specialOffers={specialOffers}
            primaryLocation={primaryLocation}
          />
        </div>
      </div>
    </section>
  );
}
