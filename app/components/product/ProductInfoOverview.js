import Image from "next/image";
import { useState } from "react";
import { LuBadge } from "react-icons/lu";
import { TiStarOutline } from "react-icons/ti";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import {
  calculateFinalPrice,
  checkIfOnlyRegularDiscountIsAvailable,
} from "@/app/utils/orderCalculations";
import { getProductVariantSku } from "@/app/utils/productSkuCalculation";
import thunderShape from "@/public/shapes/thunder-with-stroke.svg";
import getImageSetsBasedOnColors from "@/app/utils/getImageSetsBasedOnColors";
import ProductSizeSelection from "./ProductSizeSelection";
import ProductColorSelection from "./ProductColorSelection";
import ProductQuantitySelection from "./ProductQuantitySelection";
import ProductCartButton from "./ProductCartButton";
import ProductWishlistButton from "./ProductWishlistButton";
import ProductSizeGuideButton from "./ProductSizeGuideButton";
import ProductSpecialOfferButton from "./ProductSpecialOfferButton";
import DiscountTooptip from "../ui/DiscountTooltip";
import NotifyMeButton from "../shop/cart/NotifyMeButton";

export default function ProductInfoOverview({
  userData,
  product,
  specialOffers,
  primaryLocation,
  selectedOptions,
  setSelectedOptions,
  setActiveImageIndex,
  setNumOfTimesThumbnailsMoved,
  hasSpecialOffer,
  specialOffer,
  notifyVariants,
  randomViewers,
}) {
  const [isNotifyMeModalOpen, setIsNotifyMeModalOpen] = useState(false);
  const productVariantSku = getProductVariantSku(
    product?.productVariants,
    primaryLocation,
    selectedOptions?.color?._id,
    selectedOptions?.size,
  );
  const isOnlyRegularDiscountAvailable = checkIfOnlyRegularDiscountIsAvailable(
    product,
    specialOffers,
  );

  return (
    <section>
      {/* Product Title (with a shape/SVG) */}
      <h1 className="relative mb-2.5 w-fit text-2xl font-bold sm:text-3xl">
        {product?.productTitle}
        {/* Shape/SVG (thunder) */}
        <div className="absolute -right-1.5 bottom-1/4 aspect-square w-8 translate-x-full rotate-[26deg] lg:w-9">
          <Image
            src={thunderShape}
            alt="Thunder shape"
            className="object-contain"
            height={0}
            width={0}
            sizes="25vw"
          />
        </div>
      </h1>
      {/* Product Price */}
      <div className="relative mb-6 flex items-center gap-x-3 text-lg font-bold sm:text-xl">
        {/* Regular Price (with strikethrough, if discount is applicable) */}
        <p
          className={
            isOnlyRegularDiscountAvailable
              ? "relative text-neutral-400 before:absolute before:left-0 before:right-0 before:top-1/2 before:h-0.5 before:w-full before:-translate-y-1/2 before:bg-neutral-400 before:content-['']"
              : "text-neutral-600"
          }
        >
          ৳ {Number(product?.regularPrice).toLocaleString()}
        </p>
        {/* Discounted Price (if available) */}
        {isOnlyRegularDiscountAvailable && (
          <p className="text-neutral-600">
            ৳ {calculateFinalPrice(product, specialOffers).toLocaleString()}
          </p>
        )}
        {hasSpecialOffer && (
          <>
            <ProductSpecialOfferButton
              discountTitle={specialOffer?.offerTitle}
              discountAmount={
                specialOffer?.offerDiscountType === "Percentage"
                  ? specialOffer?.offerDiscountValue + "%"
                  : "৳ " + specialOffer?.offerDiscountValue
              }
              discountMinAmount={Number(specialOffer?.minAmount)}
              discountMaxAmount={Number(specialOffer?.maxAmount)}
            />
            <div className="max-xl:hidden">
              <DiscountTooptip
                discountTitle={specialOffer?.offerTitle}
                discountAmount={
                  specialOffer?.offerDiscountType === "Percentage"
                    ? specialOffer?.offerDiscountValue + "%"
                    : "৳ " + specialOffer?.offerDiscountValue
                }
                discountMinAmount={Number(specialOffer?.minAmount)}
                discountMaxAmount={Number(specialOffer?.maxAmount)}
              >
                <div className="flex h-9 cursor-default items-center gap-1.5 rounded-[4px] bg-[#a138b1] px-2 font-semibold text-white shadow-[1px_1px_12px_0_rgba(0,0,0,0.1)] transition-[background-color] duration-300 ease-in-out">
                  <div className="relative h-9 w-6">
                    <LuBadge className="h-full w-full object-contain" />
                    <TiStarOutline className="absolute left-1/2 top-1/2 h-full w-2/3 -translate-x-1/2 -translate-y-1/2 object-contain" />
                  </div>
                  <p className="text-nowrap text-[13px]">
                    Special Offer Available!
                  </p>
                </div>
              </DiscountTooptip>
            </div>
          </>
        )}
      </div>
      <ProductSizeSelection
        productSizes={product?.allSizes}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        productVariantSku={productVariantSku}
        showSku={!!selectedOptions?.size && product?.isInventoryShown}
      />
      <ProductColorSelection
        productColors={getImageSetsBasedOnColors(product?.productVariants)?.map(
          (imgSet) => imgSet.color,
        )}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        setActiveImageIndex={setActiveImageIndex}
        setNumOfTimesThumbnailsMoved={setNumOfTimesThumbnailsMoved}
      />
      <ProductQuantitySelection
        productVariantSku={productVariantSku}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
      />
      {/* Random Viewer Count */}
      <div className="mb-6 flex items-center gap-1">
        <MdOutlineRemoveRedEye className="size-[18px] text-[var(--color-primary-900)]" />
        <p className="text-[13px]/[1] text-neutral-600">
          <span className="font-semibold text-[var(--color-primary-900)]">
            {randomViewers}
          </span>{" "}
          people viewing this product now
        </p>
      </div>
      {/* Call to Action Buttons */}
      <div className="flex gap-2 max-lg:flex-wrap [&>button>svg]:text-lg [&>button]:rounded-[4px] [&>button]:px-5 [&>button]:py-6 [&>button]:text-sm [&>button]:font-semibold [&>button]:text-neutral-600 [&>button]:duration-300 hover:[&>button]:opacity-100">
        <ProductCartButton
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
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          product={product}
          specialOffers={specialOffers}
        />
        <ProductWishlistButton
          userData={userData}
          productId={product?._id}
          productTitle={product?.productTitle}
          productImg={product?.productVariants[0]?.imageUrls[0]}
          variantSizes={[
            ...new Set(product.productVariants.map((variant) => variant.size)),
          ]}
          variantColors={product.availableColors}
        />
        <ProductSizeGuideButton
          sizeGuideImageUrl={product?.sizeGuideImageUrl}
        />
      </div>
      {/* Stock Message */}
      {!!selectedOptions?.size && !productVariantSku && (
        <div className="mt-3.5 flex items-center gap-4">
          <p className="font-semibold text-red-600">Out of Stock*</p>
          <NotifyMeButton
            userEmail={userData?.email}
            notifyVariants={notifyVariants}
            productId={product?._id}
            productVariantSku={productVariantSku}
            selectedOptions={selectedOptions}
            isNotifyMeModalOpen={isNotifyMeModalOpen}
            setIsNotifyMeModalOpen={setIsNotifyMeModalOpen}
          />
        </div>
      )}
    </section>
  );
}
