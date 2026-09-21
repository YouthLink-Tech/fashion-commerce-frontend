import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CgTrash } from "react-icons/cg";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import {
  calculateFinalPrice,
  checkIfOnlyRegularDiscountIsAvailable,
} from "@/app/utils/orderCalculations";
import { getImageSetsByColor } from "@/app/utils/getImageSetsBasedOnColors";
import { getVariantAvailableSku } from "@/app/utils/productSkuCalculation";
import TransitionLink from "@/app/components/ui/TransitionLink";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function CartItems({
  userData,
  cartItems,
  productList,
  specialOffers,
  setIsDropdownOpen,
}) {
  const router = useRouter();

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
    <ul className="mb-4 space-y-[18px]">
      {cartItems.map((cartItemInfo) => {
        const cartItem = products.find(
          (product) => product.id === cartItemInfo.productId,
        );

        // Normalize data across local guest items and server-hydrated items
        const itemColor =
          cartItemInfo.selectedColor || cartItemInfo.color || {};
        const itemSize = cartItemInfo.selectedSize || cartItemInfo.size || {};
        const quantity =
          Number(cartItemInfo.selectedQuantity ?? cartItemInfo.quantity) || 1;

        const cartItemSKU =
          getVariantAvailableSku(
            cartItem?.variants,
            itemColor.id,
            itemSize.id,
          ) || 30;

        const maxQuantity = Math.max(1, Math.min(cartItemSKU, 30));

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
        const cartItemFinalPrice = calculateFinalPrice(cartItem, specialOffers);

        return (
          <li
            key={cartItemInfo.variant_id}
            className="flex w-full items-stretch justify-between gap-x-2.5"
          >
            {/* Cart Item Image (with link to product page) */}
            <TransitionLink
              href={`/product/${cartItem?.slug}`}
              hasDrawer={true}
              setIsDrawerOpen={setIsDropdownOpen}
              className="relative block min-h-full w-20 shrink-0 overflow-hidden rounded-[4px] bg-[var(--product-default)] sm:w-1/4"
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
                      hasDrawer={true}
                      setIsDrawerOpen={setIsDropdownOpen}
                      className="underline-offset-1 hover:underline"
                    >
                      <h4 className="text-neutral-600">
                        {cartItem?.title}
                      </h4>
                    </TransitionLink>

                    {/* Cart Item Unit Price (with discount price, if any) */}
                    <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                      <h5>
                        <span className="max-[389px]:hidden">Unit</span> Price:
                      </h5>
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
                                ? itemColor.hex
                                : "linear-gradient(90deg, blue 0%, red 40%, green 80%)",
                          }}
                          className="size-3.5 rounded-full"
                        />
                        {itemColor.name}
                      </div>
                    </div>
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
                  <div className="mt-auto flex gap-x-1.5 text-neutral-500 [&>*]:!m-0 [&>*]:grid [&>*]:size-8 [&>*]:place-content-center [&>*]:rounded-[4px] [&>*]:bg-neutral-100 [&>*]:!p-0 [&>*]:text-center hover:[&>*]:bg-[var(--color-secondary-500)]">
                    {/* Quantity Decrease Button */}
                    <button
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
                      className="w-fit text-center font-semibold [-moz-appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      type="number"
                      aria-label="Quantity"
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
  );
}
