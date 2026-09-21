"use client";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import ProductToast from "../toast/ProductToast";
import CheckoutForm from "./CheckoutForm";
import CheckoutEmpty from "./CheckoutEmpty";
import * as fbq from "@/app/lib/fpixel";
import { useSearchParams } from "next/navigation";
import { buildCartSignature, clearCheckoutIntent, invalidateCheckoutIntent } from "@/app/utils/idempotency";
import { calculateSubtotal, calculateTotalSpecialOfferDiscount } from "@/app/utils/orderCalculations";

export default function CheckoutContents({
  userData,
  productList,
  specialOffers,
  shippingZones,
  legalPolicyPdfLinks,
  cities,
  thanas,
}) {
  const [cartItems, setCartItems] = useState(null);
  const searchParams = useSearchParams();

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
    invalidateCheckoutIntent();

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

  // Hydrate cart from localStorage or server, then validate against live product catalog
  useEffect(() => {
    if (!productList?.length) return;
    let isMounted = true;
    const validateAndHydrateCart = async () => {
      let localCart = null;
      try {
        localCart = JSON.parse(localStorage.getItem("cartItems"));
      } catch (e) {
        localCart = null;
      }
      let storedCartItems = Array.isArray(localCart) && localCart.length ? localCart : null;
      // If localStorage is empty and user is logged in, hydrate from server cart (/api/cart)
      if (!storedCartItems && userData?.id) {
        try {
          const res = await routeFetch("/api/cart");
          if (res.ok && res.data?.items?.length) {
            storedCartItems = res.data.items.map((i) => ({
              productId: i.product.id,        // Pure PostgreSQL product UUID
              variant_id: i.variant_id,      // Pure PostgreSQL variant UUID
              selectedQuantity: i.quantity,  // Hydrated quantity
              selectedSize: i.size,          // Size object { id, name }
              selectedColor: i.color,        // Color object { id, name, hex }
              image: i.image,                // Cloudinary image ID
            }));
          }
        } catch (error) {
          console.error("CartHydrateError (checkout):", error);
        }
      }
      if (!isMounted) return;
      // If still no items found in either storage or server, cart is genuinely empty
      if (!storedCartItems || !storedCartItems.length) {
        setCartItems([]);
        localStorage.setItem("cartItems", JSON.stringify([]));
        window.dispatchEvent(new Event("storageCart"));
        return;
      }
      // Validate stored cart items against PostgreSQL product schema
      const activeItemsInCart = storedCartItems
        .map((storedItem) => {
          const product = productList?.find((p) => p?.id === storedItem?.productId); // Pure PostgreSQL product ID
          if (!product) return null;
          const productVariant = product.variants?.find(
            (variant) => variant.id === storedItem.variant_id, // Pure PostgreSQL variant ID
          );
          if (!productVariant) return null;
          const isInactive = Boolean(product.status && product.status !== "active");
          const isOutOfStock = productVariant.available_sku < 1; // Pure PostgreSQL available_sku
          const isInsufficientStock =
            !isOutOfStock && productVariant.available_sku < storedItem.selectedQuantity; // available_sku check
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
                  productVariant.media?.[0]?.media?.public_id ||
                  productVariant.media?.[0]?.public_id ||
                  product.thumbnail?.public_id
                }
                productTitle={product.title}                 // Pure PostgreSQL title
                variantSize={productVariant?.size?.name}     // Pure PostgreSQL size name
                variantColor={productVariant?.color?.name}   // Pure PostgreSQL color name
              />
            ),
            {
              position: "top-right",
            },
          );
          if (isInsufficientStock) {
            return {
              ...storedItem,
              selectedQuantity: productVariant.available_sku, // Cap to available_sku, not undefined sku
            };
          } else {
            return null;
          }
        })
        .filter(Boolean);
      if (!isMounted) return;
      // ── IDEMPOTENCY: detect stock-driven cart adjustments ─────────────────
      const preValidationSignature = buildCartSignature(storedCartItems);
      const postValidationSignature = buildCartSignature(activeItemsInCart);
      if (preValidationSignature !== postValidationSignature) {
        clearCheckoutIntent();
      }

      setCartItems(activeItemsInCart);
      localStorage.setItem("cartItems", JSON.stringify(activeItemsInCart));
      window.dispatchEvent(new Event("storageCart"));
    };
    validateAndHydrateCart();
    return () => {
      isMounted = false;
    };
  }, [productList, userData]);

  useEffect(() => {
    if (!cartItems?.length) return;
    if (!productList?.length) return;
    if (!specialOffers) return;

    const hasIntent = sessionStorage.getItem("checkout_intent");
    if (!hasIntent) return;

    const signature = buildCartSignature(cartItems);
    const lastSignature = sessionStorage.getItem("checkout_cart_signature");

    if (signature === lastSignature) return;

    const content_ids = [...new Set(cartItems.map((item) => item.productId))];
    const totalQuantity = cartItems.reduce((sum, i) => sum + i.selectedQuantity, 0);

    const subtotal = calculateSubtotal(productList, cartItems, specialOffers);
    const specialOfferDiscount = calculateTotalSpecialOfferDiscount(
      productList,
      cartItems,
      specialOffers,
    );
    const cartValue = subtotal - specialOfferDiscount;

    fbq.event("InitiateCheckout", {
      content_type: "product",
      content_ids,
      num_items: totalQuantity,
      value: cartValue,
      currency: "BDT",
    });

    sessionStorage.setItem("checkout_cart_signature", signature);
    sessionStorage.removeItem("checkout_intent");

  }, [cartItems, productList, specialOffers]);

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
      {cartItems === null ? (
        <div className="min-h-[50vh]" />
      ) : cartItems.length > 0 ? (
        <CheckoutForm
          userData={userData}
          productList={productList}
          specialOffers={specialOffers}
          shippingZones={shippingZones}
          cartItems={cartItems}
          legalPolicyPdfLinks={legalPolicyPdfLinks}
          cities={cities}
          thanas={thanas}
        />
      ) : (
        <CheckoutEmpty />
      )}
    </main>
  );
}
