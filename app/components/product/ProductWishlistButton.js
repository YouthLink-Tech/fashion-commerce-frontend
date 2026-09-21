import { useRouter } from "next/navigation";
import { Button } from "@nextui-org/react";
import toast from "react-hot-toast";
import { CgHeart } from "react-icons/cg";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import ProductToast from "../toast/ProductToast";

export default function ProductWishlistButton({
  userData,
  productId,
  productTitle,
  productImg,
  variantSizes,
  variantColors,
}) {
  const router = useRouter();

  const handleAddToWishlist = async () => {
    const currentWishlist =
      JSON.parse(localStorage.getItem("wishlistItems")) || [];
    if (!currentWishlist.some((item) => item.id === productId)) {
      const updatedWishlist = [...currentWishlist, { id: productId }];
      // Save item in local wishlist
      localStorage.setItem("wishlistItems", JSON.stringify(updatedWishlist));
      // Save item in server wishlist, if user is logged in
      if (userData) {
        try {
          const result = await routeFetch("/api/wishlist", {
            method: "POST",
            body: JSON.stringify({ product_id: productId }),
          });
          if (result.ok) {
            toast.custom(
              (t) => (
                <ProductToast
                  defaultToast={t}
                  isSuccess={true}
                  message="Item added to wishlist"
                  productImg={productImg}
                  productTitle={productTitle}
                  variantSizes={variantSizes}
                  variantColors={variantColors}
                />
              ),
              {
                position: "top-right",
              },
            );
            router.refresh();
          } else {
            console.error(
              "UpdateError (productWishlistButton):",
              result.message || "Failed to update the wishlist on server.",
            );
            toast.error(
              result.message || "Failed to update the wishlist on server.",
            );
          }
        } catch (error) {
          console.error(
            "UpdateError (productWishlistButton):",
            error.message || error,
          );
          toast.error("Failed to update the wishlist on server.");
        }
      } else {
        // If saved only locally
        toast.custom(
          (t) => (
            <ProductToast
              defaultToast={t}
              isSuccess={true}
              message="Item added to wishlist"
              productImg={productImg}
              productTitle={productTitle}
              variantSizes={variantSizes}
              variantColors={variantColors}
            />
          ),
          {
            position: "top-right",
          },
        );
      }
    } else {
      toast.error("Item is already in the wishlist.");
    }

    window.dispatchEvent(new Event("storageWishlist"));
  };

  return (
    <Button
      endContent={<CgHeart />}
      disableRipple
      className="bg-[var(--color-primary-500)] hover:bg-[var(--color-primary-700)]"
      onClick={() => handleAddToWishlist()}
    >
      Add to Wishlist
    </Button>
  );
}
