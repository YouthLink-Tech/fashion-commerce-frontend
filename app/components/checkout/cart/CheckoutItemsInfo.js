import { useState } from "react";
import {
  calculatePromoDiscount,
  calculateShippingCharge,
  calculateSubtotal,
  calculateTotalSpecialOfferDiscount,
  isDeliveryFree,
} from "@/app/utils/orderCalculations";
import DiscountTooptip from "../../ui/DiscountTooltip";
import DiscountModal from "../../ui/DiscountModal";

export default function CheckoutItemsInfo({
  productList,
  cartItems,
  specialOffers,
  shippingZones,
  userPromoCode,
  isPromoCodeValid,
  selectedCityId,
  selectedDeliveryType,
}) {
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);
  const subtotal = calculateSubtotal(productList, cartItems, specialOffers);
  const totalSpecialOfferDiscount = calculateTotalSpecialOfferDiscount(
    productList,
    cartItems,
    specialOffers,
  );
  const promoDiscount = calculatePromoDiscount(
    productList,
    cartItems,
    userPromoCode,
    specialOffers,
  );
  const shippingCharge = calculateShippingCharge(
    selectedCityId,
    selectedDeliveryType,
    shippingZones,
  );
  const free = isDeliveryFree(selectedCityId, selectedDeliveryType, shippingZones);
  const isDeliverySectionFilledUp = !!selectedCityId && !!selectedDeliveryType;
  const total =
    subtotal -
    totalSpecialOfferDiscount -
    promoDiscount +
    (free ? 0 : shippingCharge);

  const isPercentage =
    (userPromoCode?.discount_type || "").toLowerCase() === "percentage";

  return (
    <div className="space-y-2.5 [&>div>*]:z-[1] [&>div>span]:text-right [&>div]:flex [&>div]:justify-between">
      <div>
        <h5 className="text-neutral-500">Subtotal</h5>
        <span>৳ {subtotal.toLocaleString()}</span>
      </div>
      {!!totalSpecialOfferDiscount && (
        <div>
          <h5 className="text-neutral-500">Special Offer</h5>
          <span className="text-red-600">{`- ৳ ${totalSpecialOfferDiscount.toLocaleString()}`}</span>
        </div>
      )}
      {isPromoCodeValid && (
        <div>
          <h5 className="text-neutral-500 xl:hidden">
            Promo (
            <span
              className="cursor-default text-[#45963a] underline underline-offset-2"
              onClick={() => setIsPromoModalOpen(true)}
            >
              {userPromoCode?.code}*
            </span>
            )
          </h5>
          <DiscountModal
            isDiscountModalOpen={isPromoModalOpen}
            setIsDiscountModalOpen={setIsPromoModalOpen}
            discountTitle={userPromoCode?.code}
            discountAmount={
              isPercentage
                ? userPromoCode?.discount_value + "%"
                : "৳ " + userPromoCode?.discount_value
            }
            discountMinAmount={Number(userPromoCode?.min_amount)}
            discountMaxAmount={Number(userPromoCode?.max_amount)}
          />
          <h5 className="text-neutral-500 max-xl:hidden">
            Promo (
            <DiscountTooptip
              discountTitle={userPromoCode?.code}
              discountAmount={
                isPercentage
                  ? userPromoCode?.discount_value + "%"
                  : "৳ " + userPromoCode?.discount_value
              }
              discountMinAmount={Number(userPromoCode?.min_amount)}
              discountMaxAmount={Number(userPromoCode?.max_amount)}
            >
              <span className="cursor-default text-[#45963a] underline underline-offset-2">
                {userPromoCode?.code}*
              </span>
            </DiscountTooptip>
            )
          </h5>
          <span className="text-red-600">
            - ৳{" "}
            {`${Number(promoDiscount).toLocaleString()}${isPercentage
                ? ` (${Number(userPromoCode?.discount_value)?.toLocaleString()}%)`
                : ""
              }`}
          </span>
        </div>
      )}
      {isDeliverySectionFilledUp && (
        <div>
          <h5 className="text-neutral-500">Shipping Charge</h5>
          <span>
            {free ? (
              <>
                <span className="relative h-fit before:absolute before:-left-0.5 before:top-1/2 before:h-0.5 before:w-[calc(100%+4px)] before:bg-neutral-400 before:content-['']">{`৳ ${shippingCharge?.toLocaleString()}`}</span>
                <span className="ml-1.5">FREE</span>
              </>
            ) : (
              `৳ ${shippingCharge?.toLocaleString()}`
            )}
          </span>
        </div>
      )}
      {isDeliverySectionFilledUp && (
        <div className="text-sm text-neutral-700 md:text-base">
          <h5>Payable Amount</h5>
          <span>৳ {total.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}
