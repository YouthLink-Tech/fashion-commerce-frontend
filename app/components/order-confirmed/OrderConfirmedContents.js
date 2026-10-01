"use client";
import { useEffect, useRef } from "react";
import * as fbq from "@/app/lib/fpixel";
import CheckoutConfirmation from "@/app/components/checkout/CheckoutConfirmation";
import { markCheckoutCompleted } from "@/app/utils/idempotency";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";

export default function OrderConfirmedContents({ order }) {
  const hasTracked = useRef(false);

  useEffect(() => {
    // Clear localStorage cart
    markCheckoutCompleted();
    localStorage.removeItem("cartItems");
    localStorage.removeItem("checkoutFormDraft");
    localStorage.removeItem("checkout_payment_pending");
    window.dispatchEvent(new Event("storageCart"));

    // Also clear server-side cart for the logged-in customer
    routeFetch("/api/cart", { method: "DELETE" }).catch(() => { });

    // Update wishlist — remove items that were ordered
    const orderedProductIds = (order?.items || []).map((p) => p.product_id);
    const orderedIds = new Set(orderedProductIds);
    const currentWishlist = JSON.parse(localStorage.getItem("wishlistItems") || "[]");
    const updatedWishlist = currentWishlist.filter(
      (item) => !orderedIds.has(item.id)
    );
    localStorage.setItem("wishlistItems", JSON.stringify(updatedWishlist));
    window.dispatchEvent(new Event("storageWishlist"));

    // Also tell the server to remove each ordered product from server wishlist
    orderedProductIds.forEach((pid) => {
      if (pid) {
        routeFetch(`/api/wishlist/${pid}`, { method: "DELETE" }).catch(() => { });
      }
    });
  }, [order?.items]);

  useEffect(() => {
    if (hasTracked.current) return;
    hasTracked.current = true;

    fbq.event(
      "Purchase",
      {
        content_type: "product",
        content_ids: order.items.map((p) => p.id),
        num_items: order.items.reduce((sum, p) => sum + (p.quantity || 1), 0),
        value: Number(order?.total || 0),
        currency: "BDT",
      },
      { eventID: `purchase_${order.order_number}`, });
  }, [order.order_number, order.items, order.total]);

  // Map order fields to what CheckoutConfirmation expects
  const orderDetails = {
    orderNumber: order?.order_number,
    phoneNumber: order?.phone_number,
    totalAmount: order.total,
    address1: order?.delivery_address1,
    city: order?.thana?.city?.name || "",
    thana: order?.thana?.name || "",
    postalCode: order?.delivery_postal_code,
  };

  return <CheckoutConfirmation orderDetails={orderDetails} />;
}