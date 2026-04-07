"use client";

import { useEffect, useState } from "react";
import SimilarProducts from "@/app/components/product/SimilarProducts";
import CompleteOutfitProducts from "@/app/components/product/CompleteOutfitProducts";
import RecentlyViewedProducts from "@/app/components/product/RecentlyViewedProducts";
import AddToCartModal from "../shop/cart/AddToCartModal";

export default function ProductRelatedContents({
  userData,
  products,
  product,
  specialOffers,
  primaryLocation,
  notifyVariants,
}) {
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedAddToCartProduct, setSelectedAddToCartProduct] =
    useState(null);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);

  // Load recently viewed products
  useEffect(() => {
    if (products?.length && !!product) {
      let recentlyViewedProductIds =
        JSON.parse(localStorage.getItem("recentlyViewedProducts")) || [];

      recentlyViewedProductIds = !recentlyViewedProductIds?.includes(
        product?._id,
      )
        ? recentlyViewedProductIds
        : recentlyViewedProductIds?.filter(
          (recentlyViewedProductId) =>
            recentlyViewedProductId !== product?._id,
        );

      setRecentlyViewedProducts(
        products
          ?.filter(
            (availableProduct) =>
              availableProduct.status === "active" &&
              recentlyViewedProductIds?.some(
                (recentlyViewedProductId) =>
                  availableProduct._id === recentlyViewedProductId,
              ),
          )
          .slice(0, 8),
      );
      recentlyViewedProductIds?.unshift(product?._id);
      if (recentlyViewedProductIds?.length === 10)
        recentlyViewedProductIds?.pop();
      localStorage.setItem(
        "recentlyViewedProducts",
        JSON.stringify(recentlyViewedProductIds),
      );
    }
  }, [product, products]);

  // const completeOutfitProducts = products
  //   ?.filter((availableProduct) =>
  //     product?.restOfOutfit.some(
  //       (linkedProduct) =>
  //         availableProduct._id === linkedProduct.id &&
  //         availableProduct.status === "active",
  //     ),
  //   )
  //   .slice(0, 8);

  const completeOutfitProducts = products
    ?.filter((availableProduct) =>
      product?.restOfOutfit.includes(availableProduct._id) &&
      availableProduct.status === "active"
    )
    .slice(0, 8);

  const similarProducts = products
    ?.filter(
      (availableProduct) =>
        availableProduct.category === product?.category &&
        availableProduct._id !== product?._id &&
        availableProduct.status === "active",
    )
    .slice(0, 8);

  return (
    <>
      {/* Complete Your Outfit Section */}
      {!!completeOutfitProducts?.length && (
        <CompleteOutfitProducts
          userData={userData}
          completeOutfitProducts={completeOutfitProducts}
          specialOffers={specialOffers}
          primaryLocation={primaryLocation}
          isAddToCartModalOpen={isAddToCartModalOpen}
          setIsAddToCartModalOpen={setIsAddToCartModalOpen}
          setSelectedAddToCartProduct={setSelectedAddToCartProduct}
        />
      )}
      {/* Similar Products Section */}
      {!!similarProducts?.length && (
        <SimilarProducts
          userData={userData}
          similarProducts={similarProducts}
          hasCompleteOutfitSection={!!completeOutfitProducts?.length}
          hasRecentlyViewedSection={!!recentlyViewedProducts?.length}
          specialOffers={specialOffers}
          primaryLocation={primaryLocation}
          isAddToCartModalOpen={isAddToCartModalOpen}
          setIsAddToCartModalOpen={setIsAddToCartModalOpen}
          setSelectedAddToCartProduct={setSelectedAddToCartProduct}
        />
      )}
      {/* Recently Viewed Products Section */}
      {!!recentlyViewedProducts?.length && (
        <RecentlyViewedProducts
          userData={userData}
          recentlyViewedProducts={recentlyViewedProducts}
          hasCompleteOutfitSection={!!completeOutfitProducts?.length}
          hasSimilarSection={!!similarProducts?.length}
          specialOffers={specialOffers}
          primaryLocation={primaryLocation}
          isAddToCartModalOpen={isAddToCartModalOpen}
          setIsAddToCartModalOpen={setIsAddToCartModalOpen}
          setSelectedAddToCartProduct={setSelectedAddToCartProduct}
        />
      )}
      <AddToCartModal
        userData={userData}
        isAddToCartModalOpen={isAddToCartModalOpen}
        setIsAddToCartModalOpen={setIsAddToCartModalOpen}
        product={selectedAddToCartProduct}
        specialOffers={specialOffers}
        primaryLocation={primaryLocation}
        notifyVariants={notifyVariants}
      />
    </>
  );
}
