"use client";

import { useEffect, useMemo, useState } from "react";
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
import { getImageSetsByColor } from "@/app/utils/getImageSetsBasedOnColors";
import {
  calculateFinalPrice,
  calculateSubtotal,
  getTotalItemCount,
} from "@/app/utils/orderCalculations";
import CartHeader from "./CartHeader";
import CartItems from "./CartItems";
import EmptyCartContent from "./EmptyCartContent";
import CartFooter from "./CartFooter";
import * as fbq from "@/app/lib/fpixel";

const EMPTY_ARRAY = [];

export default function CartButton({
  userData,
  productList,
  specialOffers,
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

  // Memoize products for CartItems and CartFooter so subtotal doesn't recalculate unnecessarily
  const products = useMemo(() => {
    return Array.isArray(productList)
      ? productList
      : productList?.items || EMPTY_ARRAY;
  }, [productList]);

  // Sync state with localStorage across tabs and component triggers
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

  // One-time sync on login only (never on page refresh)
  useEffect(() => {
    if (!userData?.id) {
      sessionStorage.removeItem("cart_synced_user");
      return;
    }

    // Check if this user session was already synced in this tab
    const alreadySynced = sessionStorage.getItem("cart_synced_user") === userData.id;
    if (alreadySynced) {
      // PAGE REFRESH: User was already logged in. Do NOT sync!
      // Simply rehydrate from server if localStorage is empty
      const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
      if (!localCart.length) {
        routeFetch("/api/cart")
          .then((res) => {
            if (res.ok && res.data?.items?.length) {
              const formattedCart = res.data.items.map((i) => ({
                productId: i.product.id,
                variant_id: i.variant_id,
                selectedQuantity: i.quantity,
                selectedSize: i.size,
                selectedColor: i.color,
                image: i.image,
              }));
              localStorage.setItem("cartItems", JSON.stringify(formattedCart));
              window.dispatchEvent(new Event("storageCart"));
            }
          })
          .catch((err) => console.error("CartHydrateError:", err));
      }
      return;
    }

    // FRESH LOGIN DETECTED: Mark this user as synced immediately
    sessionStorage.setItem("cart_synced_user", userData.id);

    const localCart = JSON.parse(localStorage.getItem("cartItems")) || [];
    const itemsToSync = localCart
      .map((item) => ({
        variant_id: item.variant_id,
        quantity: Number(item.selectedQuantity ?? item.quantity) || 1,
      }))
      .filter((i) => i.variant_id);

    const syncOrHydrateCart = async () => {
      try {
        if (itemsToSync.length > 0) {
          // Items were added as guest: clear old account cart so guest items REPLACE the account cart
          await routeFetch("/api/cart", { method: "DELETE" });

          const res = await routeFetch("/api/cart/sync", {
            method: "POST",
            body: JSON.stringify({ items: itemsToSync }),
          });

          if (res.ok && res.data?.items) {
            // Preserve original guest serial/order
            const orderMap = new Map(
              itemsToSync.map((item, idx) => [item.variant_id, idx]),
            );

            const formattedCart = res.data.items
              .map((i) => ({
                productId: i.product.id,
                variant_id: i.variant_id,
                selectedQuantity: i.quantity,
                selectedSize: i.size,
                selectedColor: i.color,
                image: i.image,
              }))
              .sort(
                (a, b) =>
                  (orderMap.get(a.variant_id) ?? 999) -
                  (orderMap.get(b.variant_id) ?? 999),
              );

            localStorage.setItem("cartItems", JSON.stringify(formattedCart));
            window.dispatchEvent(new Event("storageCart"));
          }
        } else {
          // No guest items: restore user's saved server cart
          const res = await routeFetch("/api/cart");
          if (res.ok && res.data?.items?.length) {
            const formattedCart = res.data.items.map((i) => ({
              productId: i.product.id,
              variant_id: i.variant_id,
              selectedQuantity: i.quantity,
              selectedSize: i.size,
              selectedColor: i.color,
              image: i.image,
            }));
            localStorage.setItem("cartItems", JSON.stringify(formattedCart));
            window.dispatchEvent(new Event("storageCart"));
          }
        }
      } catch (err) {
        console.error("CartSyncError:", err);
      }
    };

    syncOrHydrateCart();
  }, [userData?.id]);

  // Handle URL query parameters auto-add (?productId=...&size=...&colorCode=...)
  useEffect(() => {
    const productListItems = Array.isArray(productList)
      ? productList
      : productList?.items;

    if (!productId || !size || !colorCode) return;

    const debounceTimeout = setTimeout(async () => {
      // 1. Check in productList
      let product = productListItems?.find((p) => p?.id === productId);

      // 2. Fallback: If not in initial 30 items, fetch single product by ID
      if (!product) {
        try {
          const res = await routeFetch(`/api/products/single/${productId}`);
          if (res.ok && res.data) {
            product = res.data;
          }
        } catch (err) {
          console.error("Failed to fetch product for auto-add:", err);
        }
      }

      if (!product) {
        return router.replace(pathname, undefined, {
          shallow: true,
          scroll: false,
        });
      }

      // Case-insensitive hex/color and size match
      const targetColor = colorCode.toLowerCase();
      const variant = product.variants?.find(
        (v) =>
          (v.color?.hex?.toLowerCase() === targetColor ||
            v.color?.name?.toLowerCase() === targetColor) &&
          (v.size?.name === size || v.size?.id === size || v.size === size),
      );

      if (!variant) {
        return router.replace(pathname, undefined, {
          shallow: true,
          scroll: false,
        });
      }

      const isExistingItem = (item) => item.variant_id === variant.id;

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

        // Resolve product image for toast notification
        const imageSets = getImageSetsByColor(product?.variants);
        const productImg =
          imageSets?.find((imgSet) => imgSet?.color?.id === variant.color?.id)
            ?.images[0] ||
          product?.thumbnail?.public_id ||
          product?.media?.[0]?.public_id;

        const newlyAddedItem = {
          productId: product.id,
          variant_id: variant.id,
          selectedQuantity: 1,
          selectedSize: variant.size,
          selectedColor: variant.color,
          image: productImg,
        };

        const updatedCart = [...currentCart, newlyAddedItem];
        localStorage.setItem("cartItems", JSON.stringify(updatedCart));

        // Trigger FB Pixel AddToCart
        fbq.event("AddToCart", {
          content_type: "product",
          content_ids: [product.id],
          num_items: 1,
          value: calculateFinalPrice(product, specialOffers) * 1,
          currency: "BDT",
        });

        // Atomic PostgreSQL add if logged in
        if (userData) {
          try {
            const result = await routeFetch(`/api/cart`, {
              method: "POST",
              body: JSON.stringify({
                variant_id: variant.id,
                quantity: 1,
              }),
            });

            if (result.ok) {
              toast.custom(
                (t) => (
                  <ProductToast
                    defaultToast={t}
                    isSuccess={true}
                    message="Item added to cart"
                    productImg={productImg}
                    productTitle={product?.title}
                    variantSize={variant?.size?.name || variant?.size}
                    variantColor={variant?.color}
                  />
                ),
                { position: "top-right" },
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
          toast.custom(
            (t) => (
              <ProductToast
                defaultToast={t}
                isSuccess={true}
                message="Item added to cart"
                productImg={productImg}
                productTitle={product?.title}
                variantSize={variant?.size?.name || variant?.size}
                variantColor={variant?.color}
              />
            ),
            { position: "top-right" },
          );
        }

        router.replace(pathname, undefined, {
          shallow: true,
          scroll: false,
        });
        setIsPageLoading(false);
        window.dispatchEvent(new Event("storageCart"));
      };

      handleAddToCart();
    }, 25);

    return () => clearTimeout(debounceTimeout);
  }, [
    productList,
    productId,
    size,
    colorCode,
    userData,
    router,
    pathname,
    specialOffers,
    setIsPageLoading,
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
                  Number(item.selectedQuantity ?? item.quantity ?? 1) +
                  accumulator,
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
                productList={products}
                specialOffers={specialOffers}
                setIsDropdownOpen={setIsDropdownOpen}
              />
            ) : (
              <EmptyCartContent setIsDropdownOpen={setIsDropdownOpen} />
            )}
          </div>
          {!!cartItems?.length && (
            <CartFooter
              subtotal={calculateSubtotal(
                products,
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