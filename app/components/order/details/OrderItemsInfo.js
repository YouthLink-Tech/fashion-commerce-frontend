"use client";

import { useState } from "react";
import DiscountTooptip from "../../ui/DiscountTooltip";
import DiscountModal from "../../ui/DiscountModal";

export default function OrderItemsInfo({
  order
}) {
  const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

  const subtotal = Number(order?.subtotal || 0);
  const totalSpecialOfferDiscount = Number(
    order?.total_special_offer_discount || 0,
  );
  const shippingCharge = Number(order?.shipping_charge || 0);
  const total = Number(order?.total || 0);

  const hasPromo = !!order?.promo_code_snapshot;
  const promoTitle = order?.promo_code_snapshot;
  const promoValue =
    order?.promo_discount_type === "percentage"
      ? `${order?.promo_discount_value}%`
      : `৳ ${order?.promo_discount_value}`;
  const appliedPromo = Number(order?.applied_promo_discount || 0);

  return (
    <div className="space-y-2">
      <div className="flex justify-between">
        <h5 className="text-neutral-400">Subtotal</h5>
        <span>৳ {subtotal?.toLocaleString()}</span>
      </div>
      {!!totalSpecialOfferDiscount && (
        <div className="flex justify-between">
          <h5 className="text-neutral-400">Special Offer</h5>
          <span className="text-right text-red-600">
            - ৳ {totalSpecialOfferDiscount?.toLocaleString()}
          </span>
        </div>
      )}
      {hasPromo && (
        <div className="flex justify-between">
          <h5
            className="text-neutral-400 xl:hidden"
            onClick={() => setIsPromoModalOpen(true)}
          >
            Promo (
            <span className="cursor-default text-[#45963a] underline underline-offset-2">
              {promoTitle}
            </span>
            )
          </h5>
          <DiscountModal
            isDiscountModalOpen={isPromoModalOpen}
            setIsDiscountModalOpen={setIsPromoModalOpen}
            discountTitle={promoTitle}
            discountAmount={promoValue}
            isEligibleForDiscount={true}
            savedAmount={appliedPromo}
          />
          <h5 className="text-neutral-400 max-xl:hidden">
            Promo (
            <DiscountTooptip
              discountTitle={promoTitle}
              discountAmount={promoValue}
              isEligibleForSpecialOffer={true}
              savedAmount={appliedPromo}
            >
              <span className="cursor-default text-[#45963a] underline underline-offset-2">
                {promoTitle}
              </span>
            </DiscountTooptip>
            )
          </h5>
          <span className="text-right text-red-600">
            - ৳{" "}
            {`${appliedPromo.toLocaleString()}${order?.promo_discount_type === "percentage" && order?.promo_discount_value
                ? ` (${Number(order.promo_discount_value).toLocaleString()}%)`
                : ""
              }`}
          </span>
        </div>
      )}
      <div className="flex justify-between">
        <h5 className="text-neutral-400">Shipping Charge</h5>
        <span>৳ {shippingCharge?.toLocaleString()}</span>
      </div>
      <div className="flex justify-between text-sm text-neutral-700 md:text-base">
        <h5>Paid Amount</h5>
        <span>৳ {total?.toLocaleString()}</span>
      </div>
    </div>
  );
}
