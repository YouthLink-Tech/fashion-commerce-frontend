"use client";

import { useState } from "react";
import Image from "next/image";
import { FaCircleCheck } from "react-icons/fa6";
import TransitionLink from "@/app/components/ui/TransitionLink";
import DiscountModal from "../../ui/DiscountModal";
import DiscountTooptip from "../../ui/DiscountTooltip";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function OrderItems({ orderItems = [] }) {
  const [isSpecialOfferModalOpen, setIsSpecialOfferModalOpen] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState(null);

  const calculateTotalItems = () => {
    return orderItems?.reduce(
      (accumulator, item) => Number(item?.quantity || 0) + accumulator,
      0,
    );
  };

  return (
    <div>
      <div className="mb-3 flex items-center gap-2.5">
        <h2 className="text-sm font-semibold md:text-base">Items</h2>
        <span className="flex size-5 items-center justify-center rounded-full bg-neutral-200 text-[11px]/[11px] font-semibold text-neutral-600">
          {calculateTotalItems()}
        </span>
      </div>
      <ul className="mb-4 grid auto-rows-fr gap-5">
        {orderItems?.map((item) => {
          const unitPrice = Number(
            item?.final_price_after_discount ?? item?.regular_price ?? 0,
          );
          const itemTotalPrice = unitPrice * Number(item?.quantity || 1);

          return (
            <li
              key={item.id}
              className="flex w-full items-stretch justify-between gap-x-2.5"
            >
              <TransitionLink
                href={`/product/${item?.product_slug}`}
                className="relative block min-h-full w-[72px] shrink-0 overflow-hidden rounded-[4px] bg-[var(--product-default)] sm:w-20 xl:w-1/4"
              >
                {!!item?.thumbnail_image_url && (
                  <Image
                    className="h-full w-full object-cover"
                    src={getImage(item?.thumbnail_image_url, 400)}
                    alt={item?.product_title}
                    fill
                    sizes="15vh"
                  />
                )}
              </TransitionLink>
              <div className="min-w-0 grow text-xs text-neutral-400 lg:text-sm">
                <div className="flex h-full flex-col justify-between">
                  <div className="flex justify-between gap-x-2 sm:gap-x-5">
                    <div>
                      <TransitionLink
                        href={`/product/${item?.product_slug}`}
                        className="underline-offset-1 hover:underline"
                      >
                        <h4 className="line-clamp-1 text-neutral-600 md:text-[15px]">
                          {item?.product_title}
                        </h4>
                      </TransitionLink>
                      <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Unit Price:</h5>
                        <span>{unitPrice.toLocaleString()}</span>
                      </div>
                      <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Size:</h5>
                        <span>{item?.size_name}</span>
                      </div>
                      <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Color:</h5>
                        <div className="flex items-center gap-x-1">
                          <div
                            style={{
                              backgroundColor: item?.color_hex,
                            }}
                            className="size-3.5 max-h-3.5 max-w-3.5 rounded-full"
                          />
                          <p className="line-clamp-1">{item?.color_name}</p>
                        </div>
                      </div>
                      {/* Special Offer Text (if applicable) */}
                      {!!item?.offer_title && (
                        <>
                          <span
                            className="mt-1 flex cursor-default items-center gap-x-1 text-xs text-[#45963a] underline-offset-2 hover:underline xl:hidden"
                            onClick={() => {
                              setActiveModalItem(item);
                              setIsSpecialOfferModalOpen(true);
                            }}
                          >
                            <span>
                              Special Offer (
                              {item?.offer_discount_type === "percentage"
                                ? `${item?.offer_discount_value}%`
                                : `৳ ${item?.offer_discount_value}`}
                              )
                            </span>
                            <span>
                              <FaCircleCheck className="size-4" />
                            </span>
                          </span>
                          <DiscountTooptip
                            discountTitle={item?.offer_title}
                            discountAmount={
                              item?.offer_discount_type === "percentage"
                                ? `${item?.offer_discount_value}%`
                                : `৳ ${item?.offer_discount_value}`
                            }
                            isEligibleForSpecialOffer={true}
                            savedAmount={Number(
                              item?.applied_offer_discount || 0,
                            )}
                          >
                            <span className="mt-1 hidden cursor-default items-center gap-x-1 text-xs text-[#45963a] underline-offset-2 hover:underline xl:flex">
                              <span>
                                Special Offer (
                                {item?.offer_discount_type === "percentage"
                                  ? `${item?.offer_discount_value}%`
                                  : `৳ ${item?.offer_discount_value}`}
                                )
                              </span>
                              <span>
                                <FaCircleCheck className="size-4" />
                              </span>
                            </span>
                          </DiscountTooptip>
                        </>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex h-fit shrink-0 gap-x-2">
                        <p className="w-full text-nowrap text-right text-neutral-600 md:text-[15px]">
                          ৳ {itemTotalPrice?.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <div className="flex gap-x-1.5 justify-self-end text-[13px] md:text-sm">
                          <h5 className="lg:hidden">Qty:</h5>
                          <h5 className="max-lg:hidden">Quantity:</h5>
                          <span>{item?.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
      <DiscountModal
        isDiscountModalOpen={isSpecialOfferModalOpen}
        setIsDiscountModalOpen={setIsSpecialOfferModalOpen}
        discountTitle={activeModalItem?.offer_title}
        isEligibleForDiscount={true}
        discountAmount={
          activeModalItem?.offer_discount_type === "percentage"
            ? `${activeModalItem?.offer_discount_value}%`
            : `৳ ${activeModalItem?.offer_discount_value}`
        }
        savedAmount={Number(activeModalItem?.applied_offer_discount || 0)}
      />
    </div>
  );
}
