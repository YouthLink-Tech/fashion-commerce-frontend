import { useEffect, useState } from "react";
import { getProductVariantSku } from "@/app/utils/productSkuCalculation";
import getImageSetsBasedOnColors from "@/app/utils/getImageSetsBasedOnColors";
import CartModalContents from "./CartModalContents";
import CartModalButtons from "./CartModalButtons";

export default function AddToCartModal({
  userData,
  isAddToCartModalOpen,
  setIsAddToCartModalOpen,
  product,
  specialOffers,
  primaryLocation,
  notifyVariants,
}) {
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [productVariantSku, setProductVariantSku] = useState(null);
  const [isNotifyMeModalOpen, setIsNotifyMeModalOpen] = useState(false);

  useEffect(() => {
    if (!!product)
      setSelectedOptions({
        color: product.availableColors[Object.keys(product.availableColors)[0]],
        size: undefined,
        quantity: 1,
      });
  }, [product]);

  useEffect(() => {
    setProductVariantSku(
      !product || !selectedOptions?.size
        ? null
        : getProductVariantSku(
          product?.productVariants,
          primaryLocation,
          selectedOptions.color._id,
          selectedOptions.size,
        ),
    );
  }, [
    primaryLocation,
    product,
    selectedOptions?.color?._id,
    selectedOptions?.size,
  ]);

  useEffect(() => {
    document.body.style.overflow = isAddToCartModalOpen ? "hidden" : "unset";
  }, [isAddToCartModalOpen]);

  return (
    <div
      className={`fixed inset-0 z-[6] flex h-svh w-dvw items-center justify-center overflow-y-auto overflow-x-hidden text-sm font-semibold transition-[opacity,background-color] duration-500 ease-in-out md:text-base [&::-webkit-scrollbar]:[-webkit-appearance:scrollbarthumb-vertical] [&_:is(h1,h2,h3,h4,h5)]:text-neutral-700 ${isAddToCartModalOpen ? "pointer-events-auto bg-neutral-700/60 opacity-100 delay-0" : "pointer-events-none bg-neutral-700/0 opacity-0 delay-100"}`}
      id="add-to-cart-bg"
      onClick={(event) => {
        if (event.target.id === "add-to-cart-bg") {
          setIsAddToCartModalOpen(false);
          setSelectedOptions({
            color:
              product.availableColors[Object.keys(product.availableColors)[0]],
            size: undefined,
            quantity: 1,
          });
        }
      }}
    >
      <div
        className={`rounded-md bg-neutral-50 p-5 text-neutral-500 transition-[transform,opacity] duration-300 ease-in-out max-md:pt-14 ${isAddToCartModalOpen && !isNotifyMeModalOpen ? "translate-y-0 opacity-100 delay-200" : "translate-y-20 opacity-0 delay-0"}`}
      >
        <CartModalContents
          userEmail={userData?.email}
          product={product}
          specialOffers={specialOffers}
          productVariantSku={productVariantSku}
          imageSets={getImageSetsBasedOnColors(product?.productVariants)}
          setIsAddToCartModalOpen={setIsAddToCartModalOpen}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          notifyVariants={notifyVariants}
          isNotifyMeModalOpen={isNotifyMeModalOpen}
          setIsNotifyMeModalOpen={setIsNotifyMeModalOpen}
        />
        <hr className="mb-5 mt-10 h-0.5 bg-neutral-100 md:my-5" />
        <CartModalButtons
          userData={userData}
          productId={product?._id}
          productTitle={product?.productTitle}
          productImg={
            getImageSetsBasedOnColors(product?.productVariants)?.find(
              (imgSet) =>
                imgSet?.color?.label === selectedOptions?.color?.label,
            )?.images[0]
          }
          defaultColor={
            product?.availableColors[Object.keys(product?.availableColors)[0]]
          }
          productVariantSku={productVariantSku}
          productPageLink={`/product/${product?.slug}`}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          setIsAddToCartModalOpen={setIsAddToCartModalOpen}
          product={product}
          specialOffers={specialOffers}
        />
      </div>
    </div>
  );
}
