"use client";

import { useEffect, useRef, useState } from "react";
import {
  calculateFinalPrice,
  checkIfSpecialOfferIsAvailable,
  getProductSpecialOffer,
} from "@/app/utils/orderCalculations";
import { getImageSetsByColor } from "@/app/utils/getImageSetsBasedOnColors";
import ProductImageGallery from "./ProductImageGallery";
import ExpandedImagesModal from "../shared/ExpandedImageModal";
import ProductInfo from "./ProductInfo";
import * as fbq from "@/app/lib/fpixel";
import { getColors } from "@/app/utils/productSkuCalculation";
import { getDiscountInfo } from "./ProductDiscountInfos";

export default function ProductContents({
  userData,
  product,
  specialOffers,
  notifyVariants,
  randomViewers,
}) {
  const [selectedOptions, setSelectedOptions] = useState(null);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [numOfTimesThumbnailsMoved, setNumOfTimesThumbnailsMoved] = useState(0);
  const isSpecialOfferIsAvailable = checkIfSpecialOfferIsAvailable(
    product,
    specialOffers,
  );
  const specialOffer = !isSpecialOfferIsAvailable
    ? null
    : getProductSpecialOffer(product, specialOffers, "NA");
  const imageSets = getImageSetsByColor(product?.variants);
  const activeImageSet = imageSets?.find(
    (imageSet) => imageSet?.color?.id === selectedOptions?.color?.id,
  );
  const activeImageUrl = activeImageSet?.images[activeImageIndex];
  const hasTrackedViewContent = useRef(false);

  useEffect(() => {
    if (!product) return;
    if (hasTrackedViewContent.current) return;

    const finalPrice = calculateFinalPrice(product, specialOffers);

    fbq.event("ViewContent", {
      content_type: "product",
      content_ids: [product.id],
      value: finalPrice,
      currency: "BDT",
    });

    hasTrackedViewContent.current = true;
  }, [product, specialOffers]);

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedOptions({
        color: getColors(product.variants)[0],
        size: undefined,
        quantity: 1,
      });
    }
  }, [product, setSelectedOptions]);

  const { hasDiscount, discount } = getDiscountInfo(product);

  return (
    <div className="px-5 pb-[var(--section-padding)] sm:px-8 lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0">
      <div className="relative md:flex md:gap-x-7">
        <ProductImageGallery
          productTitle={product?.title}
          activeImageSet={activeImageSet}
          activeImageUrl={activeImageUrl}
          selectedColorLabel={selectedOptions?.color?.name}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
          setIsImageExpanded={setIsImageExpanded}
          numOfTimesThumbnailsMoved={numOfTimesThumbnailsMoved}
          setNumOfTimesThumbnailsMoved={setNumOfTimesThumbnailsMoved}
          isTrending={!!product?.is_trending}
          isNewArrival={!!product?.is_new_arrival}
          hasDiscount={hasDiscount}
          discount={discount}
          hasSpecialOffer={isSpecialOfferIsAvailable}
          specialOffer={specialOffer}
        />
        <ExpandedImagesModal
          modalFor="products"
          productTitle={product?.title}
          selectedColorLabel={selectedOptions?.color?.name}
          expandedImgUrl={activeImageUrl}
          totalImages={activeImageSet?.images?.length}
          activeImageIndex={activeImageIndex}
          setActiveImageIndex={setActiveImageIndex}
          isImageExpanded={isImageExpanded}
          setIsImageExpanded={setIsImageExpanded}
        />
        <ProductInfo
          userData={userData}
          product={product}
          specialOffers={specialOffers}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
          setActiveImageIndex={setActiveImageIndex}
          setNumOfTimesThumbnailsMoved={setNumOfTimesThumbnailsMoved}
          hasSpecialOffer={isSpecialOfferIsAvailable}
          specialOffer={specialOffer}
          notifyVariants={notifyVariants}
          randomViewers={randomViewers}
        />
      </div>
    </div>
  );
}
