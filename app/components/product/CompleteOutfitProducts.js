import { useState } from "react";
import { Button } from "@nextui-org/react";
import { CgChevronRight, CgChevronLeft } from "react-icons/cg";
import ProductCard from "../product-card/ProductCard";

export default function CompleteOutfitProducts({
  userData,
  completeOutfitProducts,
  specialOffers,
  isAddToCartModalOpen,
  setIsAddToCartModalOpen,
  setSelectedAddToCartProduct,
}) {
  const [isCompleteOutfitProductsSlid, setIsCompleteOutfitProductsSlid] =
    useState(false);

  return (
    <section className="relative mt-8 bg-[var(--color-secondary-100)] py-8 md:mt-12">
      <div
        className={`absolute inset-0 flex h-full w-full items-center justify-between space-y-5 px-5 sm:px-8 lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0 ${completeOutfitProducts?.length > 3 ? "sm:max-lg:flex" : "sm:max-lg:hidden"} ${completeOutfitProducts?.length > 4 ? "lg:flex" : "lg:hidden"}`}
      >
        <Button
          className={`z-[1] size-10 rounded-[3px] bg-white p-0 text-xl shadow-[0_0_12px_0_rgba(0,0,0,0.15)] transition-[background-color,opacity] duration-300 ease-in-out hover:bg-[var(--color-secondary-500)] max-sm:hidden md:block md:-translate-x-1/2 [&>svg]:mx-auto ${!isCompleteOutfitProductsSlid ? "pointer-events-none !opacity-0" : "pointer-events-auto !opacity-100"}`}
          isIconOnly
          disableRipple
          startContent={<CgChevronLeft />}
          onClick={() => setIsCompleteOutfitProductsSlid(false)}
        ></Button>
        <Button
          className={`z-[1] size-10 rounded-[3px] bg-white p-0 text-xl shadow-[0_0_12px_0_rgba(0,0,0,0.15)] transition-[background-color,opacity] duration-300 ease-in-out hover:bg-[var(--color-secondary-500)] max-sm:hidden md:translate-x-1/2 [&>svg]:mx-auto ${isCompleteOutfitProductsSlid ? "pointer-events-none !opacity-0" : "pointer-events-auto !opacity-100"}`}
          isIconOnly
          disableRipple
          startContent={<CgChevronRight />}
          onClick={() => setIsCompleteOutfitProductsSlid(true)}
        ></Button>
      </div>
      <div className="space-y-5 px-5 sm:px-8 lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0">
        <div>
          <h2 className="text-lg font-bold md:text-xl lg:text-2xl">
            Complete Your Outfit
          </h2>
        </div>
        <div
          className={`grid-cols-2 gap-x-4 gap-y-12 max-sm:grid ${completeOutfitProducts?.length > 3 ? "sm:max-lg:flex sm:max-lg:flex-nowrap sm:max-lg:transition-transform sm:max-lg:duration-300 sm:max-lg:ease-in-out sm:max-lg:[&>div]:min-w-[calc(33.33%-16px*2/3)]" : "sm:max-lg:grid sm:max-lg:grid-cols-3"} ${completeOutfitProducts?.length > 4 ? "lg:flex lg:flex-nowrap lg:transition-transform lg:duration-300 lg:ease-in-out lg:[&>div]:min-w-[calc(25%-16px*3/4)]" : "lg:grid lg:grid-cols-4"} ${isCompleteOutfitProductsSlid ? "-translate-x-[calc(100%+16px)]" : "-translate-x-0"}`}
        >
          {completeOutfitProducts.map((completeOutfitProduct, index) => (
            <ProductCard
              key={"product-complete-outfit-" + completeOutfitProduct.id}
              userData={userData}
              product={completeOutfitProduct}
              specialOffers={specialOffers}
              isAddToCartModalOpen={isAddToCartModalOpen}
              setIsAddToCartModalOpen={setIsAddToCartModalOpen}
              setSelectedAddToCartProduct={setSelectedAddToCartProduct}
              shouldBeHidden={index > 5}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
