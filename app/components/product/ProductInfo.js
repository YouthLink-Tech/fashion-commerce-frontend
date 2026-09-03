import { useEffect, useState } from "react";
import Image from "next/image";
import circleWithStarShape from "@/public/shapes/circle-with-star.svg";
import ProductInfoOverview from "./ProductInfoOverview";
import ProductInfoDetails from "./ProductInfoDetails";
import ProductInfoFooter from "./ProductInfoFooter";

export default function ProductInfo({
  userData,
  product,
  specialOffers,
  selectedOptions,
  setSelectedOptions,
  setActiveImageIndex,
  setNumOfTimesThumbnailsMoved,
  hasSpecialOffer,
  specialOffer,
  notifyVariants,
  randomViewers,
}) {
  const [parsedSizeFit, setParsedSizeFit] = useState(null);

  useEffect(() => {
    if (!product?.product_measurement) return;

    const splitSizeFitIntoColumns = (htmlString) => {
      const parser = new DOMParser();
      const doc = parser.parseFromString(htmlString, "text/html");
      const items = Array.from(doc.querySelectorAll("li")).map(
        (li) => li.outerHTML,
      );
      const midIndex = Math.ceil(items.length / 2);

      return `
        <div class="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div class="space-y-1.5">${items.slice(0, midIndex).join("")}</div>
          <div class="space-y-1.5">${items.slice(midIndex).join("")}</div>
        </div>
      `;
    };

    const result = splitSizeFitIntoColumns(product.product_measurement);
    setParsedSizeFit(result);
  }, [product?.product_measurement]);

  return (
    <div className="relative mt-4 flex flex-col xl:mt-0 xl:h-[calc(100svh-(var(--header-height-lg)+var(--section-padding-double)))] xl:grow">
      {/* Shape/SVG (circle with star) */}
      <div className="absolute -right-16 top-10 z-[-1] aspect-square w-52 translate-x-1/2 opacity-85 sm:-right-10 sm:max-md:w-64 lg:-right-20 min-[1200px]:hidden">
        <Image
          src={circleWithStarShape}
          alt="circle with star shape"
          className="object-contain"
          height={0}
          width={0}
          sizes="25vw"
        />
      </div>
      {/* Overview Section */}
      <ProductInfoOverview
        userData={userData}
        product={product}
        specialOffers={specialOffers}
        selectedOptions={selectedOptions}
        setSelectedOptions={setSelectedOptions}
        setActiveImageIndex={setActiveImageIndex}
        setNumOfTimesThumbnailsMoved={setNumOfTimesThumbnailsMoved}
        hasSpecialOffer={hasSpecialOffer}
        specialOffer={specialOffer}
        notifyVariants={notifyVariants}
        randomViewers={randomViewers}
      />
      {/* Divider */}
      <hr className="mt-7 h-0.5 bg-neutral-100" />
      {/* Details Section */}
      <ProductInfoDetails
        productInfoDetails={{
          productDetails: product?.product_details,
          sizeFit: parsedSizeFit,
          materialCare: product?.product_material,
        }}
      />
      {/* Divider */}
      <hr className="mb-3 mt-auto h-0.5 bg-neutral-100" />
      {/* Product Info Footer */}
      <ProductInfoFooter
        productId={product?.product_code}
        productTitle={product?.title}
      />
    </div>
  );
}
