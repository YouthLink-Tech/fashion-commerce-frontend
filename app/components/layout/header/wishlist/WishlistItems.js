import Image from "next/image";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CgTrash } from "react-icons/cg";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import { calculateFinalPrice } from "@/app/utils/orderCalculations";
import TransitionLink from "@/app/components/ui/TransitionLink";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function WishlistItems({
  userData,
  wishlistItems,
  productList,
  setIsDropdownOpen,
  specialOffers,
}) {
  const router = useRouter();

  const removeWishlistItem = async (wishlistItemId) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => item._id !== wishlistItemId,
    );

    // Save item in local wishlist
    localStorage.setItem("wishlistItems", JSON.stringify(updatedWishlist));

    // Save item in server wishlist, if user is logged in
    if (userData) {
      const updatedUserData = {
        ...userData,
        wishlistItems: updatedWishlist,
      };

      try {
        const result = await routeFetch(`/api/user-data/${userData?._id}`, {
          method: "PUT",
          body: JSON.stringify(updatedUserData),
        });

        if (!result.ok) {
          console.error(
            "UpdateError (wishlistItems):",
            result.message || "Failed to update the wishlist on server.",
          );
          toast.error(
            result.message || "Failed to update the wishlist on server.",
          );
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error("UpdateError (wishlistItems):", error.message || error);
        toast.error("Failed to update the wishlist on server.");
      }
    }

    window.dispatchEvent(new Event("storageWishlist"));
  };

  return (
    <ul className="mb-4 space-y-[18px]">
      {wishlistItems.map((wishlistItemInfo) => {
        const wishlistItem = productList?.find(
          (product) => product._id === wishlistItemInfo._id,
        );

        return (
          <li
            key={"wishlist-item-" + wishlistItemInfo?._id}
            className="flex w-full items-stretch justify-between gap-x-2.5"
          >
            {/* Wishlist Item Image (with link to product page) */}
            <TransitionLink
              href={`/product/${wishlistItem?.slug}`}
              className="relative min-h-full w-16 overflow-hidden rounded-[4px] bg-[var(--product-default)] sm:aspect-[1.1/1] sm:w-1/5"
              hasDrawer={true}
              setIsDrawerOpen={setIsDropdownOpen}
            >
              {!!wishlistItem?.productVariants[0]?.imageUrls[0] && (
                <Image
                  className="h-full w-full object-cover"
                  // src={wishlistItem?.productVariants[0]?.imageUrls[0]}
                  src={getImage(wishlistItem?.productVariants[0]?.imageUrls[0], 400)}
                  alt={wishlistItem?.productTitle}
                  fill
                  sizes="15vh"
                />
              )}
            </TransitionLink>
            <div className="flex min-h-full grow flex-col justify-between text-neutral-400">
              {/* Wishlist Item Title (with link to product page) */}
              <div className="flex justify-between gap-x-5">
                <TransitionLink
                  href={`/product/${wishlistItem?.slug}`}
                  className="block underline-offset-1 hover:underline"
                  hasDrawer={true}
                  setIsDrawerOpen={setIsDropdownOpen}
                >
                  <h4 className="text-neutral-600">
                    {wishlistItem?.productTitle}
                  </h4>
                </TransitionLink>
                {/* Wishlist Item Price */}
                <span className="shrink-0 text-neutral-600">
                  ৳{" "}
                  {calculateFinalPrice(
                    wishlistItem,
                    specialOffers,
                  ).toLocaleString()}
                </span>
              </div>
              <div className="flex grow items-end justify-between">
                {/* Wishlist Item Remove Button */}
                <button
                  className="mt-auto flex w-fit cursor-pointer items-center justify-between gap-x-1 font-semibold transition-[color] duration-300 ease-in-out hover:text-red-500"
                  onClick={() => removeWishlistItem(wishlistItem?._id)}
                >
                  <CgTrash className="text-sm" />
                  <p className="text-xs">Remove</p>
                </button>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
