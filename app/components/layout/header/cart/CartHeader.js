import { useRouter } from "next/navigation";
import { CgTrash } from "react-icons/cg";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import toast from "react-hot-toast";

export default function CartHeader({ userData, totalItems }) {
  const router = useRouter();

  const removeAllItems = async () => {
    // Remove all items from local cart
    localStorage.removeItem("cartItems");

    // Remove all cart items from server cart, if user is logged in
    if (userData) {
      try {
        const result = await routeFetch(`/api/cart`, {
          method: "DELETE",
        });

        if (!result.ok) {
          console.error(
            "UpdateError (cartHeader):",
            result.message || "Failed to update the cart on server.",
          );
          toast.error(result.message || "Failed to update the cart on server.");
        } else {
          router.refresh();
        }
      } catch (error) {
        console.error("UpdateError (cartHeader):", error.message || error);
        toast.error("Failed to update the cart on server.");
      }
    }

    window.dispatchEvent(new Event("storageCart"));
  };

  return (
    <div className="mb-[22px] flex items-center justify-between">
      <h3 className="text-base font-semibold md:text-lg">
        Shopping Cart ({totalItems})
      </h3>
      <div
        className={`flex w-fit cursor-pointer items-center justify-between gap-x-1.5 text-xs font-semibold text-red-500 md:text-sm ${!totalItems ? "hidden" : ""}`}
        onClick={() => removeAllItems()}
      >
        <CgTrash size={15} />
        Remove All
      </div>
    </div>
  );
}
