"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import getImageSetsBasedOnColors from "@/app/utils/getImageSetsBasedOnColors";
import ProductToast from "../toast/ProductToast";
import CheckoutForm from "./CheckoutForm";
import CheckoutEmpty from "./CheckoutEmpty";
import * as fbq from "@/app/lib/fpixel";
import { useSearchParams } from "next/navigation";
import { buildCartSignature, clearCheckoutIntent } from "@/app/utils/idempotency";

export default function CheckoutContents({
  userData,
  productList,
  specialOffers,
  shippingZones,
  primaryLocation,
  legalPolicyPdfLinks,
}) {
  const [cartItems, setCartItems] = useState(null);
  const searchParams = useSearchParams();

  // const buildCartSignature = (cartItems = []) =>
  //   cartItems
  //     .map(i => `${i._id}:${i.selectedQuantity}`)
  //     .sort()
  //     .join("|");

  useEffect(() => {
    const paymentStatus = searchParams.get("payment");
    if (!paymentStatus) return;

    const messages = {
      failed: "Payment failed. Please try again.",
      cancelled: "Payment was cancelled.",
      expired: "Your session timed out. Please try again.",
      error: "Something went wrong on our end. Contact support if charged.",
    };

    toast.error(messages[paymentStatus] || "Payment unsuccessful.");
    localStorage.removeItem("checkout_payment_pending");

    // Clean the URL so refresh doesn't re-show the toast
    window.history.replaceState({}, "", "/checkout");
  }, [searchParams]);

  useEffect(() => {
    const handleStorageUpdate = () =>
      setCartItems(JSON.parse(localStorage.getItem("cartItems")));

    window.addEventListener("storageCart", handleStorageUpdate);
    handleStorageUpdate();

    return () => {
      window.removeEventListener("storageCart", handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    if (!productList?.length) return;

    const localCart = JSON.parse(localStorage.getItem("cartItems"));
    const storedCartItems = localCart?.length
      ? localCart
      : userData?.cartItems?.length
        ? userData.cartItems
        : [];
    const activeItemsInCart = storedCartItems
      .map((storedItem) => {
        const product = productList?.find((p) => p?._id === storedItem?._id);
        if (!product) return null;

        const productVariant = product.productVariants.find(
          (variant) =>
            variant.location === primaryLocation &&
            variant.size === storedItem.selectedSize &&
            variant.color._id === storedItem.selectedColor._id,
        );

        if (!productVariant) return null;

        const isInactive = product.status !== "active";
        const isOutOfStock = productVariant?.sku < 1;
        const isInsufficientStock =
          !isOutOfStock && productVariant?.sku < storedItem?.selectedQuantity;

        if (!isInactive && !isOutOfStock && !isInsufficientStock)
          return storedItem;

        toast.custom(
          (t) => (
            <ProductToast
              defaultToast={t}
              isSuccess={false}
              message={
                isInactive
                  ? "Item inactive"
                  : isOutOfStock
                    ? "Item out of stock"
                    : "Item with insufficient stock"
              }
              productImg={
                getImageSetsBasedOnColors(product.productVariants)?.find(
                  (imgSet) =>
                    imgSet?.color?.color === productVariant?.color?.color,
                )?.images[0]
              }
              productTitle={product.productTitle}
              variantSize={productVariant?.size}
              variantColor={productVariant?.color}
            />
          ),
          {
            position: "top-right",
          },
        );

        if (isInsufficientStock) {
          return {
            ...storedItem,
            selectedQuantity: productVariant?.sku,
          };
        } else {
          return null;
        }
      })
      .filter(Boolean);

    // ── IDEMPOTENCY: detect stock-driven cart adjustments ─────────────────
    // If items were removed or quantities capped, this is a new cart state.
    // Clear the stored intent so the next submit generates a fresh key.
    // We compare against storedCartItems (pre-validation) not cartItems state
    // (which may still be null on first load).
    const preValidationSignature = buildCartSignature(storedCartItems);
    const postValidationSignature = buildCartSignature(activeItemsInCart);

    if (preValidationSignature !== postValidationSignature) {
      clearCheckoutIntent();
    }

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
    // if (localCart?.length && userData) updateServerCart();
    if (localCart?.length && userData && !localStorage.getItem("checkout_payment_pending")) {
      updateServerCart();
    }

    setCartItems(activeItemsInCart);
    localStorage.setItem("cartItems", JSON.stringify(activeItemsInCart));
    window.dispatchEvent(new Event("storageCart"));

  }, [primaryLocation, productList, userData]);

  useEffect(() => {
    if (!cartItems?.length) return;

    const hasIntent = sessionStorage.getItem("checkout_intent");
    if (!hasIntent) return;

    const signature = buildCartSignature(cartItems);
    const lastSignature = sessionStorage.getItem("checkout_cart_signature");

    if (signature === lastSignature) return;

    const content_ids = [...new Set(cartItems.map(item => item._id))];
    const totalQuantity = cartItems.reduce((sum, i) => sum + i.selectedQuantity, 0);

    fbq.event("InitiateCheckout", {
      content_type: "product",
      content_ids,
      num_items: totalQuantity,
    });

    sessionStorage.setItem("checkout_cart_signature", signature);
    sessionStorage.removeItem("checkout_intent");

  }, [cartItems]);

  return (
    <main className="relative -mt-[calc(256*4px)] bg-neutral-50 pb-[var(--section-padding-double)] text-sm text-neutral-500 max-sm:-mt-[calc(256*2px)] md:text-base lg:pb-[var(--section-padding)] [&_h2]:uppercase [&_h2]:text-neutral-700">
      {/* Left Mesh Gradient */}
      <div className="sticky left-[5%] top-[55%] animate-blob bg-[var(--color-moving-bubble-secondary)] max-sm:hidden" />
      {/* Middle-Left Mesh Gradient */}
      <div className="sticky left-[30%] top-[5%] animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:1.5s] max-sm:left-[5%]" />
      {/* Middle-Right Mesh Gradient */}
      <div className="sticky left-[55%] top-[60%] animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:0.5s] max-sm:left-3/4" />
      {/* Right Mesh Gradient */}
      <div className="sticky left-[80%] top-1/3 animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:2s] max-sm:hidden" />
      {!!cartItems?.length ? (
        <CheckoutForm
          userData={userData}
          productList={productList}
          specialOffers={specialOffers}
          shippingZones={shippingZones}
          primaryLocation={primaryLocation}
          cartItems={cartItems}
          legalPolicyPdfLinks={legalPolicyPdfLinks}
        />
      ) : (
        <CheckoutEmpty />
      )}
    </main>
  );
}
