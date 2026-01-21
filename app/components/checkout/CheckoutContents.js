"use client";

import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import getImageSetsBasedOnColors from "@/app/utils/getImageSetsBasedOnColors";
import ProductToast from "../toast/ProductToast";
import CheckoutConfirmation from "@/app/components/checkout/CheckoutConfirmation";
import CheckoutForm from "./CheckoutForm";
import CheckoutEmpty from "./CheckoutEmpty";
import * as fbq from "@/app/lib/fpixel";

export default function CheckoutContents({
  userData,
  productList,
  specialOffers,
  shippingZones,
  primaryLocation,
  legalPolicyPdfLinks,
}) {
  const [cartItems, setCartItems] = useState(null);
  const [orderDetails, setOrderDetails] = useState(null);
  const [isPaymentStepDone, setIsPaymentStepDone] = useState(false);
  const [resolvedCart, setResolvedCart] = useState([]);
  const hasTrackedCheckout = useRef(false);
  const hasTrackedPurchase = useRef(false);

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
    if (productList?.length) {
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
  }, [primaryLocation, productList, userData]);

  useEffect(() => {
    if (!cartItems?.length) return;
    if (hasTrackedCheckout.current) return;

    const content_ids = [...new Set(cartItems.map(item => item._id))];
    const totalQuantity = cartItems.reduce((sum, i) => sum + i.selectedQuantity, 0);

    fbq.event("InitiateCheckout", {
      content_type: "product",
      content_ids,
      num_items: totalQuantity,
    });

    hasTrackedCheckout.current = true;
  }, [cartItems]);

  useEffect(() => {
    if (!isPaymentStepDone || !orderDetails || !resolvedCart?.length) return;
    if (hasTrackedPurchase.current) return;

    const eventId = orderDetails.orderNumber;
    const totalOrderPrice = orderDetails.totalAmount;

    const contentIds = resolvedCart.map(item => item._id);
    const totalQuantity = resolvedCart.reduce((sum, item) => sum + item.selectedQuantity, 0);

    fbq.event("Purchase", {
      event_id: eventId,
      content_type: "product",
      content_ids: contentIds,
      num_items: totalQuantity,
      value: totalOrderPrice,
      currency: "BDT",
    });

    hasTrackedPurchase.current = true;
  }, [isPaymentStepDone, orderDetails, resolvedCart]);

  if (isPaymentStepDone)
    return (
      <CheckoutConfirmation
        orderDetails={orderDetails}
        isPaymentStepDone={isPaymentStepDone}
      />
    );

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
          setIsPaymentStepDone={setIsPaymentStepDone}
          setResolvedCart={setResolvedCart}
          cartItems={cartItems}
          setCartItems={setCartItems}
          setOrderDetails={setOrderDetails}
          legalPolicyPdfLinks={legalPolicyPdfLinks}
        />
      ) : (
        <CheckoutEmpty />
      )}
    </main>
  );
}
