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

  const products = Array.isArray(productList)
    ? productList
    : productList?.items || [];

  const removeWishlistItem = async (productId) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => item.id !== productId,
    );
    // Save item in local wishlist
    localStorage.setItem("wishlistItems", JSON.stringify(updatedWishlist));
    // Remove item from server wishlist, if user is logged in
    if (userData && productId) {
      try {
        const result = await routeFetch(`/api/wishlist/${productId}`, {
          method: "DELETE",
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
        console.error("RemoveWishlistError (wishlistItems):", error);
        toast.error("Failed to remove item from server.");
      }
    }
    window.dispatchEvent(new Event("storageWishlist"));
  };

  return (
    <ul className="mb-4 space-y-[18px]">
      {wishlistItems.map((wishlistItemInfo) => {
        const wishlistItem = products.find(
          (product) => product.id === wishlistItemInfo.id,
        );

        const wishlistItemImg =
          wishlistItem?.thumbnail?.public_id ||
          wishlistItem?.variants?.[0]?.media?.[0]?.public_id;

        return (
          <li
            key={"wishlist-item-" + wishlistItemInfo?.id}
            className="flex w-full items-stretch justify-between gap-x-2.5"
          >
            {/* Wishlist Item Image (with link to product page) */}
            <TransitionLink
              href={`/product/${wishlistItem?.slug}`}
              className="relative min-h-full w-16 shrink-0 overflow-hidden rounded-[4px] bg-[var(--product-default)] sm:aspect-[1.1/1] sm:w-1/5"
              hasDrawer={true}
              setIsDrawerOpen={setIsDropdownOpen}
            >
              {!!wishlistItemImg && (
                <Image
                  className="h-full w-full object-cover"
                  src={getImage(wishlistItemImg, 400)}
                  alt={wishlistItem?.title || "Wishlist item"}
                  fill
                  sizes="15vh"
                />
              )}
            </TransitionLink>
            <div className="min-w-0 flex min-h-full grow flex-col justify-between text-neutral-400 gap-1.5">
              {/* Wishlist Item Title (with link to product page) */}
              <div className="flex justify-between gap-x-5">
                <div className="min-w-0">
                  <TransitionLink
                    href={`/product/${wishlistItem?.slug}`}
                    className="block underline-offset-1 hover:underline"
                    hasDrawer={true}
                    setIsDrawerOpen={setIsDropdownOpen}
                  >
                    <h4 className="text-neutral-600">
                      {wishlistItem?.title}
                    </h4>
                  </TransitionLink>
                </div>
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
                  onClick={() => removeWishlistItem(wishlistItemInfo.id)}
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
