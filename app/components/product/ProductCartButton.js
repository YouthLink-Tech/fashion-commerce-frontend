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
  productId,
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

  const isExistingItem = (item) =>
    item._id === productId &&
    item.selectedSize === selectedOptions?.size &&
    item.selectedColor?._id === selectedOptions?.color?._id;

  const handleAddToCart = async () => {
    if (!selectedOptions?.size)
      return toast.error("Please select a size first.");

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
            : currentQuantity + newlyAddedQuantity > productVariantSku
              ? productVariantSku
              : currentQuantity + newlyAddedQuantity,
        };
      });
    } else {
      const newlyAddedItem = {
        _id: productId,
        selectedQuantity: selectedOptions?.quantity,
        selectedSize: selectedOptions?.size,
        selectedColor: selectedOptions?.color,
      };

      updatedCart = [...currentCart, newlyAddedItem];
    }

    localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // Save item in local cart

    // Trigger FB Pixel AddToCart
    fbq.event("AddToCart", {
      content_type: "product",
      content_ids: [productId],
      num_items: selectedOptions.quantity,
      value: calculateFinalPrice(product, specialOffers) * selectedOptions.quantity,
      currency: "BDT",
    });

    // Save item in server cart, if user is logged in
    if (userData) {
      const updatedUserData = {
        ...userData,
        cartItems: updatedCart,
        isCartLastModified: true,
      };

      try {
        const result = await routeFetch(`/api/user-data/${userData?._id}`, {
          method: "PUT",
          body: JSON.stringify(updatedUserData),
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
                variantSize={selectedOptions?.size}
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
            variantSize={selectedOptions?.size}
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
