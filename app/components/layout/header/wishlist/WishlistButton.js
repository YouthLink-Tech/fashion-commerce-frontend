"use client";

import { useEffect, useState } from "react";
import { IoHeartOutline } from "react-icons/io5";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
} from "@nextui-org/react";
import toast from "react-hot-toast";
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
    const handleStorageUpdate = () =>
      setWishlistItems(JSON.parse(localStorage.getItem("wishlistItems")));

    window.addEventListener("storageWishlist", handleStorageUpdate);
    handleStorageUpdate();

    return () => {
      window.removeEventListener("storageWishlist", handleStorageUpdate);
    };
  }, []);

  useEffect(() => {
    if (productList?.length) {
      const localWishlist = JSON.parse(localStorage.getItem("wishlistItems"));
      const storedWishlistItems = localWishlist?.length
        ? localWishlist
        : userData?.wishlistItems?.length
          ? userData.wishlistItems
          : [];
      const activeItemsInWishlist = storedWishlistItems.filter((storedItem) =>
        productList?.some(
          (product) =>
            product?._id === storedItem?._id && product?.status === "active",
        ),
      );

      const updateServerWishlist = async () => {
        const updatedUserData = {
          ...userData,
          wishlistItems: activeItemsInWishlist,
        };

        try {
          const result = await routeFetch(`/api/user-data/${userData?._id}`, {
            method: "PUT",
            body: JSON.stringify(updatedUserData),
          });

          if (!result.ok) {
            console.error(
              "UpdateError (wishlistButton):",
              result.message || "Failed to update the wishlist on server.",
            );
            toast.error(
              result.message || "Failed to update the wishlist on server.",
            );
          }
        } catch (error) {
          console.error(
            "UpdateError (wishlistButton):",
            error.message || error,
          );
          toast.error("Failed to update the wishlist on server.");
        }
      };

      // If there are wishlist items in local storage and user just logged in,
      // update the server wishlist with the newly added items
      // if (localWishlist?.length && userData) updateServerWishlist();
      if (localWishlist?.length && userData && !localStorage.getItem("checkout_payment_pending")) updateServerWishlist();

      setWishlistItems(activeItemsInWishlist);
      localStorage.setItem(
        "wishlistItems",
        JSON.stringify(activeItemsInWishlist),
      );
      window.dispatchEvent(new Event("storageWishlist"));
    }
  }, [productList, userData]);

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
            {wishlistItems?.reduce((accumulator, item) => accumulator + 1, 0)}
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
