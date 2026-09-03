"use client";

import { useState } from "react";
import ProductCard from "../product-card/ProductCard";
import AddToCartModal from "../shop/cart/AddToCartModal";

export default function HomeNewArrivalCards({
  userData,
  newlyArrivedProducts,
  specialOffers,
  notifyVariants,
}) {
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedAddToCartProduct, setSelectedAddToCartProduct] =
    useState(null);

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-12 sm:grid-cols-3 lg:grid-cols-4 sm:max-lg:[&>div:last-child]:hidden">
      {newlyArrivedProducts.map((newlyArrivedProduct) => (
        <ProductCard
          key={"home-new-arrival-product-" + newlyArrivedProduct.id}
          userData={userData}
          product={newlyArrivedProduct}
          specialOffers={specialOffers}
          isAddToCartModalOpen={isAddToCartModalOpen}
          setIsAddToCartModalOpen={setIsAddToCartModalOpen}
          setSelectedAddToCartProduct={setSelectedAddToCartProduct}
        />
      ))}
      <AddToCartModal
        userData={userData}
        isAddToCartModalOpen={isAddToCartModalOpen}
        setIsAddToCartModalOpen={setIsAddToCartModalOpen}
        product={selectedAddToCartProduct}
        specialOffers={specialOffers}
        notifyVariants={notifyVariants}
      />
    </div>
  );
}
