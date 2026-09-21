import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CgTrash } from "react-icons/cg";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { FaCircleCheck } from "react-icons/fa6";
import { FaExclamationCircle } from "react-icons/fa";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import {
  calculateFinalPrice,
  calculateProductSpecialOfferDiscount,
  calculateSubtotal,
  checkIfOnlyRegularDiscountIsAvailable,
  checkIfSpecialOfferIsAvailable,
  getProductSpecialOffer,
} from "@/app/utils/orderCalculations";
import { getImageSetsByColor } from "@/app/utils/getImageSetsBasedOnColors";
import { getVariantAvailableSku } from "@/app/utils/productSkuCalculation";
import TransitionLink from "@/app/components/ui/TransitionLink";
import DiscountModal from "../../ui/DiscountModal";
import DiscountTooptip from "../../ui/DiscountTooltip";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function CheckoutCartItems({
  userData,
  productList,
  cartItems,
  specialOffers,
}) {
  const router = useRouter();
  const cartSubtotal = calculateSubtotal(productList, cartItems, specialOffers);
  const [isSpecialOfferModalOpen, setIsSpecialOfferModalOpen] = useState(false);
  const [activeModalItem, setActiveModalItem] = useState(null);

  const products = Array.isArray(productList)
    ? productList
    : productList?.items || [];

  const handleQuantityUpdate = async (itemInfo, newQty, maxLimit = 30) => {
    const clampedQty = Math.max(1, Math.min(newQty, maxLimit));
    if (clampedQty < 1) return;

    const updatedCart = cartItems.map((item) =>
      item.variant_id === itemInfo.variant_id
        ? { ...item, selectedQuantity: clampedQty, quantity: clampedQty }
        : item,
    );
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    if (userData && itemInfo.variant_id) {
      try {
        const result = await routeFetch(`/api/cart/${itemInfo.variant_id}`, {
          method: "PATCH",
          body: JSON.stringify({ quantity: clampedQty }),
        });
        if (!result.ok) {
          toast.error(result.message || "Failed to update quantity.");
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error("UpdateQuantityError (cartItems):", error);
        toast.error("Failed to update cart on server.");
      }
    }
    window.dispatchEvent(new Event("storageCart"));
  };

  const handleRemoveItem = async (variantId) => {
    const updatedCart = cartItems.filter(
      (item) => item.variant_id !== variantId,
    );
    localStorage.setItem("cartItems", JSON.stringify(updatedCart));

    if (userData && variantId) {
      try {
        const result = await routeFetch(`/api/cart/${variantId}`, {
          method: "DELETE",
        });
        if (!result.ok) {
          toast.error(result.message || "Failed to remove item.");
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error("RemoveCartError (cartItems):", error);
        toast.error("Failed to remove item from server.");
      }
    }
    window.dispatchEvent(new Event("storageCart"));
  };

  return (
    <>
      <ul className="mb-4 space-y-5">
        {cartItems.map((cartItemInfo) => {
          // Lookup using PostgreSQL product id, consistent with CartItems.js
          const cartItem = products.find(
            (product) => product.id === cartItemInfo.productId,
          );
          // Normalize data across guest items and server-hydrated items identical to CartItems.js
          const itemColor =
            cartItemInfo.selectedColor || cartItemInfo.color || {};
          const itemSize = cartItemInfo.selectedSize || cartItemInfo.size || {};
          const quantity =
            Number(cartItemInfo.selectedQuantity ?? cartItemInfo.quantity) || 1;
          // Exact same SKU calculation helper as CartItems.js
          const cartItemSKU =
            getVariantAvailableSku(
              cartItem?.variants,
              itemColor.id,
              itemSize.id,
            ) || 30;
          // Exact same maxQuantity ceiling as CartItems.js
          const maxQuantity = Math.max(1, Math.min(cartItemSKU, 30));
          // Exact same color-based image set lookup as CartItems.js
          const imageSets = getImageSetsByColor(cartItem?.variants);
          const colorImage = imageSets?.find(
            (imgSet) => imgSet.color?.id === itemColor.id,
          )?.images[0];
          const cartItemImgUrl =
            colorImage ||
            cartItemInfo.image ||
            cartItem?.thumbnail?.public_id;
          const isOnlyRegularDiscountAvailable =
            checkIfOnlyRegularDiscountIsAvailable(cartItem, specialOffers);
          const cartItemFinalPrice = calculateFinalPrice(
            cartItem,
            specialOffers,
          );
          const specialOfferInfo = getProductSpecialOffer(
            cartItem,
            specialOffers,
            "NA",
          );
          const isEligibleForSpecialOffer =
            cartSubtotal >= parseFloat(specialOfferInfo?.min_amount || 0);

          const savedAmount = isEligibleForSpecialOffer
            ? calculateProductSpecialOfferDiscount(
              cartItem,
              cartItemInfo,
              specialOfferInfo,
              cartItems,
              products,
            )
            : 0;

          return (
            <li
              key={cartItemInfo.variant_id}
              className="flex w-full items-stretch justify-between gap-x-2.5"
            >
              {/* Cart Item Image (with link to product page) */}
              <TransitionLink
                href={`/product/${cartItem?.slug}`}
                className="relative block min-h-full w-1/4 shrink-0 overflow-hidden rounded-[4px] bg-[var(--product-default)] max-sm:w-20"
              >
                {!!cartItemImgUrl && (
                  <Image
                    className="h-full w-full object-cover"
                    src={getImage(cartItemImgUrl, 400)}
                    alt={cartItem?.title || "Cart item"}
                    fill
                    sizes="15vh"
                  />
                )}
              </TransitionLink>
              <div className="min-w-0 grow text-neutral-400">
                <div className="flex h-full flex-col justify-between gap-1.5">
                  <div className="flex justify-between gap-x-5">
                    <div>
                      {/* Cart Item Title (with link to product page) */}
                      <TransitionLink
                        href={`/product/${cartItem?.slug}`}
                        className="underline-offset-1 hover:underline"
                      >
                        <h4 className="line-clamp-1 text-neutral-600">
                          {cartItem?.title}
                        </h4>
                      </TransitionLink>
                      {/* Cart Item Unit Price (with discount price, if any) */}
                      <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Unit Price:</h5>
                        <div className="flex h-fit shrink-0 gap-x-1.5">
                          <p
                            className={
                              isOnlyRegularDiscountAvailable
                                ? "relative h-fit before:absolute before:left-0 before:right-0 before:top-1/2 before:h-0.5 before:w-full before:bg-neutral-400 before:content-['']"
                                : ""
                            }
                          >
                            ৳ {Number(cartItem?.regular_price || 0).toLocaleString()}
                          </p>
                          {isOnlyRegularDiscountAvailable && (
                            <p>৳ {cartItemFinalPrice.toLocaleString()}</p>
                          )}
                        </div>
                      </div>
                      {/* Cart Item Size */}
                      <div className="mt-[3px] flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Size:</h5>
                        <span>{itemSize.name || itemSize}</span>
                      </div>
                      {/* Cart Item Color */}
                      <div className="mt-[3px] flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Color:</h5>
                        <div className="flex items-center gap-x-1">
                          <div
                            style={{
                              background:
                                itemColor.name !== "Multicolor"
                                  ? (itemColor.hex || itemColor.color)
                                  : "linear-gradient(90deg, blue 0%, red 40%, green 80%)",
                            }}
                            className="size-3.5 rounded-full"
                          />
                          {itemColor.name}
                        </div>
                      </div>
                      {/* Special Offer Text (if applicable) */}
                      {checkIfSpecialOfferIsAvailable(
                        cartItem,
                        specialOffers,
                      ) && (
                          <>
                            <span
                              className={`mt-[3px] flex cursor-default items-center gap-x-1 text-xs underline-offset-2 hover:underline xl:hidden ${isEligibleForSpecialOffer ? "text-[#45963a]" : "text-[#90623a]"}`}
                              onClick={() => {
                                setActiveModalItem({
                                  ...specialOfferInfo,
                                  isEligibleForDiscount: isEligibleForSpecialOffer,
                                  savedAmount,
                                });
                                setIsSpecialOfferModalOpen(true);
                              }}
                            >
                              <span>
                                Special Offer* (
                                {(specialOfferInfo?.discount_type || "").toLowerCase() === "percentage"
                                  ? specialOfferInfo?.discount_value + "%"
                                  : "৳ " + specialOfferInfo?.discount_value}
                                )
                              </span>
                              <span>
                                {isEligibleForSpecialOffer ? (
                                  <FaCircleCheck className="size-4" />
                                ) : (
                                  <FaExclamationCircle className="size-4" />
                                )}{" "}
                              </span>
                            </span>
                            <DiscountTooptip
                              discountTitle={specialOfferInfo?.title}
                              discountAmount={
                                (specialOfferInfo?.discount_type || "").toLowerCase() === "percentage"
                                  ? specialOfferInfo?.discount_value + "%"
                                  : "৳ " + specialOfferInfo?.discount_value
                              }
                              isEligibleForSpecialOffer={isEligibleForSpecialOffer}
                              savedAmount={savedAmount}
                              discountMinAmount={Number(specialOfferInfo?.min_amount)}
                              discountMaxAmount={Number(specialOfferInfo?.max_amount)}
                            >
                              <span
                                className={`mt-[3px] hidden cursor-default items-center gap-x-1 text-xs underline-offset-2 hover:underline xl:flex ${isEligibleForSpecialOffer ? "text-[#45963a]" : "text-[#90623a]"}`}
                              >
                                <span>
                                  Special Offer* (
                                  {(specialOfferInfo?.discount_type || "").toLowerCase() === "percentage"
                                    ? specialOfferInfo?.discount_value + "%"
                                    : "৳ " + specialOfferInfo?.discount_value}
                                  )
                                </span>
                                <span>
                                  {isEligibleForSpecialOffer ? (
                                    <FaCircleCheck className="size-4" />
                                  ) : (
                                    <FaExclamationCircle className="size-4" />
                                  )}{" "}
                                </span>
                              </span>
                            </DiscountTooptip>
                          </>
                        )}
                    </div>
                    {/* Cart Item Price (unit price X quantity) */}
                    <span className="shrink-0 text-neutral-600">
                      ৳{" "}
                      {(
                        cartItemFinalPrice * quantity
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex grow items-end justify-between">
                    {/* Cart Item Remove Button */}
                    <div
                      className="mt-auto flex w-fit cursor-pointer items-center justify-between gap-x-1 font-semibold transition-[color] duration-300 ease-in-out hover:text-red-500"
                      onClick={() => handleRemoveItem(cartItemInfo.variant_id)}
                    >
                      <CgTrash className="text-sm" />
                      <p className="text-xs">Remove</p>
                    </div>
                    {/* Cart Item Quantity */}
                    <div className="mt-auto flex gap-x-1.5 text-neutral-500 [&>*]:!m-0 [&>*]:grid [&>*]:size-8 [&>*]:place-content-center [&>*]:rounded-[4px] [&>*]:border-2 [&>*]:border-neutral-200 [&>*]:bg-white/20 [&>*]:!p-0 [&>*]:text-center [&>*]:backdrop-blur-2xl [&>*]:transition-[background-color,border-color] [&>*]:duration-300 [&>*]:ease-in-out">
                      {/* Quantity Decrease Button */}
                      <button
                        className="transition-[background-color,border-color] hover:border-transparent hover:bg-[var(--color-secondary-500)]"
                        type="button"
                        onClick={() => {
                          if (quantity > 1) {
                            handleQuantityUpdate(
                              cartItemInfo,
                              quantity - 1,
                              maxQuantity,
                            );
                          }
                        }}
                      >
                        <HiChevronLeft />
                      </button>
                      {/* Quantity Input Field */}
                      <input
                        className="w-fit text-center font-semibold outline-none transition-[border-color] [-moz-appearance:textfield] focus:border-[var(--color-secondary-500)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        type="number"
                        arial-label="Quantity"
                        min={1}
                        max={maxQuantity}
                        value={quantity}
                        onChange={(e) => {
                          const val = Math.max(
                            1,
                            Math.min(Number(e.target.value) || 1, maxQuantity),
                          );
                          handleQuantityUpdate(cartItemInfo, val, maxQuantity);
                        }}
                      />
                      {/* Quantity Increase Button */}
                      <button
                        className="transition-[background-color,border-color] hover:border-transparent hover:bg-[var(--color-secondary-500)]"
                        type="button"
                        onClick={() => {
                          if (quantity < maxQuantity) {
                            handleQuantityUpdate(
                              cartItemInfo,
                              quantity + 1,
                              maxQuantity,
                            );
                          }
                        }}
                      >
                        <HiChevronRight />
                      </button>
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
        discountTitle={activeModalItem?.title}
        isEligibleForDiscount={activeModalItem?.isEligibleForDiscount ?? false}
        discountAmount={
          (activeModalItem?.discount_type || "").toLowerCase() === "percentage"
            ? activeModalItem?.discount_value + "%"
            : "৳ " + activeModalItem?.discount_value
        }
        savedAmount={activeModalItem?.savedAmount}
        discountMinAmount={Number(activeModalItem?.min_amount)}
        discountMaxAmount={Number(activeModalItem?.max_amount)}
      />
    </>
  );
}
