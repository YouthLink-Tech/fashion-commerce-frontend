"use client";

import { useEffect, useState } from "react";
import { IoHeartOutline } from "react-icons/io5";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import WishlistHeader from "./WishlistHeader";
import WishlistItems from "./WishlistItems";
import WishlistFooter from "./WishlistFooter";
import EmptyWishlistContent from "./EmptyWishlistContent";

export default function WishlistButton({
  userData,
  productList,
  specialOffers,
}) {
  const [wishlistItems, setWishlistItems] = useState(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    const handleStorageUpdate = () => {
      const updatedWishlist = JSON.parse(localStorage.getItem("wishlistItems"));
      setWishlistItems(updatedWishlist);
    };

    window.addEventListener("storageWishlist", handleStorageUpdate);
    handleStorageUpdate();

    return () => {
      window.removeEventListener("storageWishlist", handleStorageUpdate);
    };
  }, []);

  // One-time sync on login only (never on page refresh)
  useEffect(() => {
    if (!userData?.id) {
      sessionStorage.removeItem("wishlist_synced_user");
      return;
    }

    // Check if this user session was already synced in this tab
    const alreadySynced = sessionStorage.getItem("wishlist_synced_user") === userData.id;

    if (alreadySynced) {
      // PAGE REFRESH: User was already logged in. Do NOT sync!
      const localWishlist = JSON.parse(localStorage.getItem("wishlistItems")) || [];
      if (!localWishlist.length) {
        routeFetch("/api/wishlist")
          .then((res) => {
            if (res.ok && res.data?.items?.length) {
              const formattedWishlist = res.data.items.map((i) => ({
                id: i.product_id,
              }));
              localStorage.setItem("wishlistItems", JSON.stringify(formattedWishlist));
              window.dispatchEvent(new Event("storageWishlist"));
            }
          })
          .catch((err) => console.error("WishlistHydrateError:", err));
      }
      return;
    }

    // FRESH LOGIN DETECTED: Mark this user as synced immediately
    sessionStorage.setItem("wishlist_synced_user", userData.id);

    const localWishlist = JSON.parse(localStorage.getItem("wishlistItems")) || [];
    const productIdsToSync = localWishlist
      .map((item) => item.id)
      .filter(Boolean);

    const syncOrHydrateWishlist = async () => {
      try {
        if (productIdsToSync.length > 0) {
          // Items were added as guest: clear old account wishlist so guest items REPLACE the account wishlist
          await routeFetch("/api/wishlist", { method: "DELETE" });

          const res = await routeFetch("/api/wishlist/sync", {
            method: "POST",
            body: JSON.stringify({ product_ids: productIdsToSync }),
          });

          if (res.ok && res.data?.items) {
            // Preserve original guest serial/order
            const orderMap = new Map(
              productIdsToSync.map((id, idx) => [id, idx]),
            );

            const formattedWishlist = res.data.items
              .map((i) => ({
                id: i.product_id,
              }))
              .sort(
                (a, b) =>
                  (orderMap.get(a.id) ?? 999) - (orderMap.get(b.id) ?? 999),
              );

            localStorage.setItem("wishlistItems", JSON.stringify(formattedWishlist));
            window.dispatchEvent(new Event("storageWishlist"));
          }
        } else {
          // No guest items: restore user's saved server wishlist
          const res = await routeFetch("/api/wishlist");
          if (res.ok && res.data?.items?.length) {
            const formattedWishlist = res.data.items.map((i) => ({
              id: i.product_id,
            }));
            localStorage.setItem("wishlistItems", JSON.stringify(formattedWishlist));
            window.dispatchEvent(new Event("storageWishlist"));
          }
        }
      } catch (err) {
        console.error("WishlistSyncError:", err);
      }
    };

    syncOrHydrateWishlist();
  }, [userData?.id]);

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
        {/* Wishlist button */}
        <li
          className="relative my-auto cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new Event("storageWishlist"));
          }}
        >
          {/* Wishlist icon */}
          <IoHeartOutline className="size-[18px] text-neutral-600 lg:size-[22px]" />
          {/* Badge (to display total wishlist items) */}
          <span
            className={`absolute right-0 top-0 flex size-3.5 -translate-y-1/2 translate-x-1/2 select-none items-center justify-center rounded-full bg-red-500 text-[8px] font-semibold text-white ${!wishlistItems?.length ? "hidden" : ""}`}
          >
            {wishlistItems?.length || 0}
          </span>
        </li>
      </DropdownTrigger>
      <DropdownMenu aria-label="cart-dropdown" variant="flat">
        <DropdownItem
          key="cart-dropdown"
          isReadOnly
          textValue="Cart Dropdown"
          className="flex min-h-full cursor-default flex-col justify-between p-0 text-sm text-neutral-500 md:text-base max-sm:[&>span]:min-w-[calc(100dvw-20px*2)] sm:[&>span]:w-[350px]"
        >
          <div className="max-h-[50svh] overflow-y-auto px-2 pt-2 font-semibold [&::-webkit-scrollbar]:[-webkit-appearance:scrollbarthumb-vertical]">
            <WishlistHeader
              userData={userData}
              itemCount={wishlistItems?.length || 0}
            />
            {/* Drawer Body */}
            {!!wishlistItems?.length ? (
              <>
                <WishlistItems
                  userData={userData}
                  wishlistItems={wishlistItems}
                  productList={productList}
                  setIsDropdownOpen={setIsDropdownOpen}
                  specialOffers={specialOffers}
                />
                <WishlistFooter setIsDropdownOpen={setIsDropdownOpen} />
              </>
            ) : (
              <EmptyWishlistContent setIsDropdownOpen={setIsDropdownOpen} />
            )}
          </div>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
