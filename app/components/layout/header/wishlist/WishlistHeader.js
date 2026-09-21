import { useRouter } from "next/navigation";
import { CgTrash } from "react-icons/cg";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import toast from "react-hot-toast";

export default function WishlistHeader({ userData, itemCount }) {
  const router = useRouter();

  const removeAllItems = async () => {
    // Remove all items from local wishlist
    localStorage.removeItem("wishlistItems");
    // Remove all wishlist items from server wishlist, if user is logged in
    if (userData) {
      try {
        const result = await routeFetch("/api/wishlist", {
          method: "DELETE",
        });
        if (!result.ok) {
          console.error(
            "UpdateError (wishlistHeader):",
            result.message || "Failed to update the wishlist on server.",
          );
          toast.error(
            result.message || "Failed to update the wishlist on server.",
          );
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error("UpdateError (wishlistHeader):", error.message || error);
        toast.error("Failed to update the wishlist on server.");
      }
    }
    window.dispatchEvent(new Event("storageWishlist"));
  };

  return (
    <div className="mb-[22px] flex items-center justify-between">
      <h3 className="text-base font-semibold md:text-lg">
        Wishlist ({itemCount})
      </h3>
      <div
        className={`flex w-fit cursor-pointer items-center justify-between gap-x-1.5 text-xs font-semibold text-red-500 md:text-sm ${!itemCount ? "hidden" : ""}`}
        onClick={() => removeAllItems()}
      >
        <CgTrash size={15} />
        Remove All
      </div>
    </div>
  );
}
