import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { CgHeart, CgShoppingCart } from "react-icons/cg";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import ProductToast from "../toast/ProductToast";
import { getColors, getSizesForColor } from "@/app/utils/productSkuCalculation";

export default function CardButtons({
  userData,
  product,
  isProductOutOfStock,
  setSelectedAddToCartProduct,
  setIsAddToCartModalOpen,
}) {
  const router = useRouter();

  const handleAddToWishlist = async (product) => {
    const currentWishlist =
      JSON.parse(localStorage.getItem("wishlistItems")) || [];

    if (!currentWishlist.some((item) => item.id === product.id)) {
      const updatedWishlist = [...currentWishlist, { id: product.id }];

      // Save item in local wishlist
      localStorage.setItem("wishlistItems", JSON.stringify(updatedWishlist));

      const variantColors = getColors(product.variants);
      const variantSizes = getSizesForColor(
        product.variants,
        variantColors[0]?.id,
      );
      const productImg =
        product.variants?.[0]?.media?.[0]?.public_id ||
        product.thumbnail?.public_id;

      // Save item in server wishlist if user is logged in
      if (userData) {
        try {
          const result = await routeFetch("/api/wishlist", {
            method: "POST",
            body: JSON.stringify({ product_id: product.id }),
          });

          if (result.ok) {
            toast.custom(
              (t) => (
                <ProductToast
                  defaultToast={t}
                  isSuccess={true}
                  message="Item added to wishlist"
                  productTitle={product?.title}
                  productImg={productImg}
                  variantColors={variantColors}
                  variantSizes={variantSizes}
                />
              ),
              {
                position: "top-right",
              },
            );
            router.refresh();
          } else {
            console.error(
              "UpdateError (cardButtons):",
              result.message || "Failed to update the wishlist on server.",
            );
            toast.error(
              result.message || "Failed to update the wishlist on server.",
            );
          }
        } catch (error) {
          console.error("UpdateError (cardButtons):", error);
          toast.error("Failed to update the wishlist on server.");
        }
      } else {
        // Display toast notification for guest user
        toast.custom(
          (t) => (
            <ProductToast
              defaultToast={t}
              isSuccess={true}
              message="Item added to wishlist"
              productTitle={product?.title}
              productImg={productImg}
              variantColors={variantColors}
              variantSizes={variantSizes}
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
    <div
      id="card-buttons"
      className="absolute right-3 top-3 flex -translate-x-4 flex-col items-end space-y-1.5 opacity-0 transition-[transform,opacity] duration-300 ease-in-out [&>button]:rounded-[3px] [&>button]:font-semibold [&>button]:text-neutral-700 [&>button]:shadow-[3px_3px_20px_0_rgba(0,0,0,0.25)] hover:[&>button]:opacity-100"
    >
      {!isProductOutOfStock && (
        <button
          className="relative h-8 w-8 overflow-hidden bg-[var(--color-secondary-500)] transition-[background-color,width] hover:w-[calc(32px+68px+6px)] hover:bg-[var(--color-secondary-600)]"
          onClick={() => {
            setSelectedAddToCartProduct(product);
            setIsAddToCartModalOpen(true);
          }}
        >
          <CgShoppingCart className="mx-2 h-8 w-4 object-contain" />
          <p className="absolute left-8 top-1/2 -translate-y-1/2 text-nowrap text-xs">
            Add to Cart
          </p>
        </button>
      )}
      <button
        className="relative h-8 w-8 overflow-hidden bg-[var(--color-primary-500)] transition-[background-color,width] hover:w-[calc(32px+90px+6px)] hover:bg-[var(--color-primary-700)]"
        onClick={() => handleAddToWishlist(product)}
      >
        <CgHeart className="mx-2 h-8 w-4 object-contain" />
        <p className="absolute left-8 top-1/2 -translate-y-1/2 text-nowrap text-xs">
          Add to Wishlist
        </p>
      </button>
    </div>
  );
}
