import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
  Tooltip,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import { CgShoppingCart } from "react-icons/cg";
import ProductToast from "@/app/components/toast/ProductToast";
import * as fbq from "@/app/lib/fpixel";
import { calculateFinalPrice } from "@/app/utils/orderCalculations";

export default function ProductCartButton({
  userData,
  productTitle,
  productImg,
  defaultColor,
  productVariantSku,
  selectedOptions,
  setSelectedOptions,
  product,
  specialOffers,
}) {
  const router = useRouter();

  const selectedVariant = product?.variants?.find(
    (v) =>
      v.color?.id === selectedOptions?.color?.id &&
      v.size?.id === selectedOptions?.size?.id,
  );

  const isExistingItem = (item) => item.variant_id === selectedVariant?.id;

  const handleAddToCart = async () => {
    if (!selectedOptions?.size)
      return toast.error("Please select a size first.");

    if (!selectedVariant)
      return toast.error("Selected combination is unavailable.");

    const currentCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    let updatedCart;

    if (currentCart.some((item) => isExistingItem(item))) {
      updatedCart = currentCart.map((currentItem) => {
        const currentQuantity = Number(currentItem.selectedQuantity);
        const newlyAddedQuantity = Number(selectedOptions?.quantity);

        return {
          ...currentItem,
          selectedQuantity: !isExistingItem(currentItem)
            ? currentQuantity
            : Math.min(currentQuantity + newlyAddedQuantity, productVariantSku, 30),
        };
      });
    } else {
      const newlyAddedItem = {
        productId: product.id,
        variant_id: selectedVariant.id,
        selectedQuantity: Number(selectedOptions?.quantity) || 1,
        selectedSize: selectedOptions?.size,
        selectedColor: selectedOptions?.color,
        image: productImg,
      };

      updatedCart = [...currentCart, newlyAddedItem];
    }

    localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // Save item in local cart

    // Trigger FB Pixel AddToCart
    fbq.event("AddToCart", {
      content_type: "product",
      content_ids: [product.id],
      num_items: selectedOptions.quantity,
      value: calculateFinalPrice(product, specialOffers) * selectedOptions.quantity,
      currency: "BDT",
    });

    // Save item in server cart, if user is logged in
    if (userData) {
      try {
        const result = await routeFetch(`/api/cart`, {
          method: "POST",
          body: JSON.stringify({
            variant_id: selectedVariant.id,
            quantity: Number(selectedOptions?.quantity) || 1,
          }),
        });

        if (result.ok) {
          // Display custom success toast notification, if server cart is updated
          toast.custom(
            (t) => (
              <ProductToast
                defaultToast={t}
                isSuccess={true}
                message="Item added to cart"
                productImg={productImg}
                productTitle={productTitle}
                variantSize={selectedOptions?.size?.name}
                variantColor={selectedOptions?.color}
              />
            ),
            {
              position: "top-right",
            },
          );
          router.refresh();
        } else {
          console.error(
            "UpdateError (productCartButton):",
            result.message || "Failed to update the cart on server.",
          );
          toast.error(result.message || "Failed to update the cart on server.");
        }
      } catch (error) {
        console.error(
          "UpdateError (productCartButton):",
          error.message || error,
        );
        toast.error("Failed to update the cart on server.");
      }
    } else {
      // Display custom success toast notification, if saved only locally
      toast.custom(
        (t) => (
          <ProductToast
            defaultToast={t}
            isSuccess={true}
            message="Item added to cart"
            productImg={productImg}
            productTitle={productTitle}
            variantSize={selectedOptions?.size?.name}
            variantColor={selectedOptions?.color}
          />
        ),
        {
          position: "top-right",
        },
      );
    }

    window.dispatchEvent(new Event("storageCart"));
  };

  return (
    <>
      {!selectedOptions?.size ? (
        <>
          <Tooltip
            classNames={{
              content: [
                "px-3 rounded-[4px] py-2 shadow-[1px_1px_20px_0_rgba(0,0,0,0.15)]",
              ],
              base:
                !!selectedOptions?.size && !!productVariantSku
                  ? ["hidden"]
                  : [""],
            }}
            motionProps={{
              variants: {
                exit: {
                  opacity: 0,
                  transition: {
                    duration: 0.3,
                    ease: "easeIn",
                  },
                },
                enter: {
                  opacity: 1,
                  transition: {
                    duration: 0.3,
                    ease: "easeOut",
                  },
                },
              },
            }}
            shouldFlip
            placement="top"
            content={
              !!selectedOptions?.size && !!productVariantSku
                ? ""
                : "Select a size"
            }
          >
            <button
              disabled={!!selectedOptions?.size && !productVariantSku}
              className={`relative hidden h-11 items-center gap-1.5 overflow-visible whitespace-nowrap bg-[var(--color-secondary-500)] !transition-[background-color] !duration-300 !ease-in-out after:absolute after:-bottom-2 after:left-0 after:translate-y-full after:text-red-600 disabled:text-neutral-400 disabled:!opacity-50 disabled:after:content-['*_Out_of_Stock'] xl:flex ${!selectedOptions?.size ? "cursor-default text-neutral-400 !opacity-50" : "[&:not(:disabled):hover]:bg-[var(--color-secondary-600)]"}`}
              onClick={() => {
                if (!!selectedOptions?.size) {
                  handleAddToCart();
                  setSelectedOptions({
                    color: defaultColor,
                    size: undefined,
                    quantity: 1,
                  });
                }
              }}
            >
              Add to Cart
              <CgShoppingCart />
            </button>
          </Tooltip>
          <Popover
            classNames={{
              content: [
                "px-3 py-2 rounded-[4px] shadow-[1px_1px_20px_0_rgba(0,0,0,0.15)]",
              ],
              base:
                !!selectedOptions?.size && !!productVariantSku
                  ? ["hidden"]
                  : [""],
            }}
            placement="top"
          >
            <PopoverTrigger className="z-[0] outline-none xl:hidden">
              <button
                disabled={!!selectedOptions?.size && !productVariantSku}
                className={`!ease-in-outdisabled:mb-6 relative flex h-11 items-center gap-1.5 overflow-visible whitespace-nowrap bg-[var(--color-secondary-500)] !transition-[background-color] !duration-300 disabled:text-neutral-400 disabled:!opacity-50 ${!selectedOptions?.size ? "cursor-default text-neutral-400 !opacity-50" : "[&:not(:disabled):hover]:bg-[var(--color-secondary-600)]"}`}
                onClick={() => {
                  if (!!selectedOptions?.size) {
                    handleAddToCart();
                    setSelectedOptions({
                      color: defaultColor,
                      size: undefined,
                      quantity: 1,
                    });
                  }
                }}
              >
                Add to Cart
                <CgShoppingCart />
              </button>
            </PopoverTrigger>
            <PopoverContent>
              {!(!!selectedOptions?.size && !!productVariantSku) && (
                <p>Select a size</p>
              )}
            </PopoverContent>
          </Popover>
        </>
      ) : (
        <button
          disabled={!!selectedOptions?.size && !productVariantSku}
          className={`relative flex h-11 items-center gap-1.5 overflow-visible whitespace-nowrap bg-[var(--color-secondary-500)] !transition-[background-color] !duration-300 !ease-in-out disabled:text-neutral-400 disabled:!opacity-50 ${!selectedOptions?.size ? "cursor-default text-neutral-400 !opacity-50" : "[&:not(:disabled):hover]:bg-[var(--color-secondary-600)]"}`}
          onClick={() => {
            if (!!selectedOptions?.size) {
              handleAddToCart();
              setSelectedOptions({
                color: defaultColor,
                size: undefined,
                quantity: 1,
              });
            }
          }}
        >
          Add to Cart
          <CgShoppingCart />
        </button>
      )}
    </>
  );
}
