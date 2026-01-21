"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import toast from "react-hot-toast";
import { IoCartOutline } from "react-icons/io5";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import ProductToast from "@/app/components/toast/ProductToast";
import getImageSetsBasedOnColors from "@/app/utils/getImageSetsBasedOnColors";
import {
  calculateSubtotal,
  getTotalItemCount,
} from "@/app/utils/orderCalculations";
import CartHeader from "./CartHeader";
import CartItems from "./CartItems";
import EmptyCartContent from "./EmptyCartContent";
import CartFooter from "./CartFooter";
import * as fbq from "@/app/lib/fpixel";

export default function CartButton({
  userData,
  productList,
  specialOffers,
  primaryLocation,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setIsPageLoading } = useLoading();
  const [cartItems, setCartItems] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const productId = searchParams.get("productId");
  const size = searchParams.get("size");
  const colorCode = searchParams.get("colorCode");

  useEffect(() => {
    const handleStorageUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem("cartItems"));
      setCartItems(updatedCart);
    };

    window.addEventListener("storageCart", handleStorageUpdate);
    handleStorageUpdate();

    return () => {
      window.removeEventListener("storageCart", handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    if (pathname !== "/checkout" && productList?.length) {
      const localCart = JSON.parse(localStorage.getItem("cartItems"));
      const storedCartItems = localCart?.length
        ? localCart
        : userData?.cartItems?.length
          ? userData.cartItems
          : [];
      const activeItemsInCart = storedCartItems.filter((storedItem) =>
        productList?.some(
          (product) =>
            product?._id === storedItem?._id && product?.status === "active",
        ),
      );

      const updateServerCart = async () => {
        const updatedUserData = {
          ...userData,
          cartItems: activeItemsInCart,
          isCartLastModified: true,
        };

        try {
          const result = await routeFetch(`/api/user-data/${userData?._id}`, {
            method: "PUT",
            body: JSON.stringify(updatedUserData),
          });

          if (!result.ok) {
            console.error(
              "UpdateError (cartButton):",
              result.message || "Failed to update the cart on server.",
            );
            toast.error(
              result.message || "Failed to update the cart on server.",
            );
          }
        } catch (error) {
          console.error("UpdateError (cartButton):", error.message || error);
          toast.error("Failed to update the cart on server.");
        }
      };

      // If there are cart items in local storage and user just logged in,
      // update the server cart with the newly added items
      if (localCart?.length && userData) updateServerCart();

      setCartItems(activeItemsInCart);
      localStorage.setItem("cartItems", JSON.stringify(activeItemsInCart));
      window.dispatchEvent(new Event("storageCart"));
    }
  }, [pathname, productList, userData]);

  useEffect(() => {
    if (!productList || !productId || !size || !colorCode) return;

    const debounceTimeout = setTimeout(() => {
      const product = productList?.find(
        (product) => product?._id === productId && product?.status === "active",
      );

      if (!product) {
        return router.replace(pathname, undefined, {
          shallow: true,
          scroll: false,
        });
      }

      const productVariant = product?.productVariants.find(
        (variant) => variant.color.color == colorCode && variant.size == size,
      );

      if (!productVariant) {
        return router.replace(pathname, undefined, {
          shallow: true,
          scroll: false,
        });
      }

      const isExistingItem = (item) =>
        item._id === productId &&
        item.selectedSize === size &&
        item.selectedColor?.color === colorCode;

      const handleAddToCart = async () => {
        const currentCart = JSON.parse(localStorage.getItem("cartItems")) || [];
        const doesItemExist = currentCart.some((item) => isExistingItem(item));

        if (doesItemExist) {
          return router.replace(pathname, undefined, {
            shallow: true,
            scroll: false,
          });
        }

        setIsPageLoading(true);

        const newlyAddedItem = {
          _id: productId,
          selectedQuantity: 1,
          selectedSize: size,
          selectedColor: productVariant.color,
        };

        const updatedCart = [...currentCart, newlyAddedItem];

        localStorage.setItem("cartItems", JSON.stringify(updatedCart)); // Save item in local cart

        // Trigger FB Pixel AddToCart
        fbq.event("AddToCart", {
          content_type: "product",
          content_ids: [productId],
          num_items: 1,
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
                    productImg={
                      getImageSetsBasedOnColors(product?.productVariants)?.find(
                        (imgSet) => imgSet?.color?.color === colorCode,
                      )?.images[0]
                    }
                    productTitle={product?.productTitle}
                    variantSize={productVariant?.size}
                    variantColor={productVariant?.color}
                  />
                ),
                {
                  position: "top-right",
                },
              );

              router.refresh();
            } else {
              console.error(
                "UpdateError (cartButton):",
                result.message || "Failed to update the cart on server.",
              );
              toast.error(
                result.message || "Failed to update the cart on server.",
              );
            }
          } catch (error) {
            console.error("UpdateError (cartButton):", error.message || error);
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
                productImg={
                  getImageSetsBasedOnColors(product?.productVariants)?.find(
                    (imgSet) => imgSet?.color?.color === colorCode,
                  )?.images[0]
                }
                productTitle={product?.productTitle}
                variantSize={productVariant?.size}
                variantColor={productVariant?.color}
              />
            ),
            {
              position: "top-right",
            },
          );
        }

        router.replace(pathname, undefined, {
          shallow: true,
          scroll: false,
        });
        setIsPageLoading(false);
        window.dispatchEvent(new Event("storageCart")); // Dispatch event so that event listener is triggered
      };

      handleAddToCart();
    }, 25);

    return () => clearTimeout(debounceTimeout);
  }, [
    productList,
    productId,
    size,
    colorCode,
    setIsPageLoading,
    userData,
    router,
    pathname,
  ]);

  return (
    <Dropdown
      isOpen={isDropdownOpen}
      onOpenChange={setIsDropdownOpen}
      placement="bottom-end"
      className="mt-5 rounded-md sm:mt-6 xl:mt-7"
      motionProps={{
        initial: { opacity: 0, scale: 0.95 },
        animate: {
          opacity: 1,
          scale: 1,
          transition: {
            duration: 0.25,
            ease: "easeInOut",
          },
        },
        exit: {
          opacity: 0,
          scale: 0.95,
          transition: {
            duration: 0.25,
            ease: "easeInOut",
          },
        },
      }}
    >
      <DropdownTrigger className="z-[0] !scale-100 !opacity-100">
        {/* Cart button */}
        <li
          className="relative my-auto cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new Event("storageCart"));
          }}
        >
          {/* Cart icon */}
          <IoCartOutline className="size-[18px] text-neutral-600 lg:size-[22px]" />
          {/* Badge (to display total cart items) */}
          <span
            className={`absolute right-0 top-0 flex size-3.5 -translate-y-1/2 translate-x-1/2 select-none items-center justify-center rounded-full bg-red-500 text-[8px] font-semibold text-white ${!cartItems?.length ? "hidden" : ""}`}
          >
            {!!cartItems?.length &&
              cartItems.reduce(
                (accumulator, item) =>
                  Number(item.selectedQuantity) + accumulator,
                0,
              )}
          </span>
        </li>
      </DropdownTrigger>
      <DropdownMenu aria-label="cart-dropdown" variant="flat">
        <DropdownItem
          key="cart-dropdown"
          isReadOnly
          textValue="Cart Dropdown"
          className="flex min-h-full cursor-default flex-col justify-between p-0 text-sm text-neutral-500 md:text-base max-sm:[&>span]:w-[calc(100dvw-20px*2)] sm:[&>span]:w-[425px] md:[&>span]:w-[450px]"
        >
          <div className="max-h-[50svh] overflow-y-auto px-2 pt-2 font-semibold [&::-webkit-scrollbar]:[-webkit-appearance:scrollbarthumb-vertical]">
            <CartHeader
              userData={userData}
              totalItems={getTotalItemCount(cartItems) || 0}
            />
            {!!cartItems?.length ? (
              <CartItems
                userData={userData}
                cartItems={cartItems}
                productList={productList}
                specialOffers={specialOffers}
                primaryLocation={primaryLocation}
                setIsDropdownOpen={setIsDropdownOpen}
              />
            ) : (
              <EmptyCartContent setIsDropdownOpen={setIsDropdownOpen} />
            )}
          </div>
          {!!cartItems?.length && (
            <CartFooter
              subtotal={calculateSubtotal(
                productList,
                cartItems,
                specialOffers,
              ).toLocaleString()}
              setIsDropdownOpen={setIsDropdownOpen}
            />
          )}
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
