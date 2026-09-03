"use client";

import { useEffect, useState } from "react";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import SimilarProducts from "@/app/components/product/SimilarProducts";
import CompleteOutfitProducts from "@/app/components/product/CompleteOutfitProducts";
import RecentlyViewedProducts from "@/app/components/product/RecentlyViewedProducts";
import AddToCartModal from "../shop/cart/AddToCartModal";

const RECENTLY_VIEWED_KEY = "recentlyViewedProductIds";
const RECENTLY_VIEWED_MAX = 10;

export default function ProductRelatedContents({
  userData,
  product,
  specialOffers,
  notifyVariants,
}) {
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedAddToCartProduct, setSelectedAddToCartProduct] =
    useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [recentlyViewedProducts, setRecentlyViewedProducts] = useState([]);
  const [completeOutfitProducts, setCompleteOutfitProducts] = useState([]);

  useEffect(() => {
    if (!product?.id) return;
    let ids = JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]");
    ids = ids.filter((id) => id !== product.id);
    ids.unshift(product.id);
    ids = ids.slice(0, RECENTLY_VIEWED_MAX);
    localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(ids));
  }, [product?.id]);

  useEffect(() => {
    if (!product?.category?.id) return;
    const params = new URLSearchParams({
      category_id: product.category.id,
      exclude_id: product.id,
      limit: "8",
      sort: "newest",
    });
    routeFetch(`/api/products/all?${params.toString()}`).then((result) => {
      setSimilarProducts(result.items ?? result.data?.items ?? []);
    });
  }, [product?.category?.id, product?.id]);

  useEffect(() => {
    if (!product?.outfit_product_ids?.length) return;
    const params = new URLSearchParams({ ids: product.outfit_product_ids.join(",") });
    routeFetch(`/api/products/by-ids?${params.toString()}`).then((result) => {
      setCompleteOutfitProducts(result.items ?? result.data?.items ?? []);
    });
  }, [product?.outfit_product_ids]);

  useEffect(() => {
    if (!product?.id) return;
    const ids = (JSON.parse(localStorage.getItem(RECENTLY_VIEWED_KEY) || "[]")).filter((id) => id !== product.id);
    if (!ids.length) {
      setRecentlyViewedProducts([]);
      return;
    }
    const params = new URLSearchParams({ ids: ids.join(",") });
    routeFetch(`/api/products/by-ids?${params.toString()}`).then((result) => {
      setRecentlyViewedProducts(result.items ?? result.data?.items ?? []);
    });
  }, [product?.id]);

  return (
    <>
      {/* Complete Your Outfit Section */}
      {!!completeOutfitProducts?.length && (
        <CompleteOutfitProducts
          userData={userData}
          completeOutfitProducts={completeOutfitProducts}
          specialOffers={specialOffers}
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
        notifyVariants={notifyVariants}
      />
    </>
  );
}
