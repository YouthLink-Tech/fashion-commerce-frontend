"use client";
import { useEffect, useRef } from "react";
import * as fbq from "@/app/lib/fpixel";
import CheckoutConfirmation from "@/app/components/checkout/CheckoutConfirmation";
import { markCheckoutCompleted } from "@/app/utils/idempotency";

export default function OrderConfirmedContents({ order }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Clear localStorage cart
    markCheckoutCompleted();
    localStorage.removeItem("cartItems");
    localStorage.removeItem("checkoutFormDraft");
    localStorage.removeItem("checkout_payment_pending");
    window.dispatchEvent(new Event("storageCart"));

    // Update wishlist — remove items that were ordered
    const orderedIds = new Set(order.productInformation.map((p) => p._id));
    const currentWishlist = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
    const updatedWishlist = currentWishlist.filter(
      (item) => !orderedIds.has(item._id)
    );
    localStorage.setItem("wishlistItems", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("storageWishlist"));
  }, [order.productInformation]);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    fbq.event("Purchase", {
      event_id: order.orderNumber,
      content_type: "product",
      content_ids: order.productInformation.map((p) => p._id),
      num_items: order.productInformation.reduce((sum, p) => sum + p.sku, 0),
      value: order.total,
      currency: "BDT",
    });
  }, [order.orderNumber, order.productInformation, order.total]);

  // Map order fields to what CheckoutConfirmation expects
  const orderDetails = {
    orderNumber: order.orderNumber,
    phoneNumber: order.customerInfo.phoneNumber,
    totalAmount: order.total,
    address1: order.deliveryInfo.address1,
    city: order.deliveryInfo.city,
    thana: order.deliveryInfo.thana,
    postalCode: order.deliveryInfo.postalCode,
  };

  return <CheckoutConfirmation orderDetails={orderDetails} />;
}