import Image from "next/image";
import { useEffect, useState, useMemo } from "react";
import TransitionLink from "../ui/TransitionLink";
import CardOutOfStockBanner from "./CardOutOfStockBanner";
import CardColorSelectionTool from "./CardColorSelectionTool";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function CardProductThumbnail({
  productTitle,
  productColors,
  isProductOutOfStock,
  thumbnailImageUrl,
  imageSets,
}) {
  const [activeColorIndex, setActiveColorIndex] = useState(null);

  const allImages = useMemo(() => {
    if (!thumbnailImageUrl || !imageSets) return [];
    return [thumbnailImageUrl, ...imageSets.flatMap((set) => set.images)];
  }, [thumbnailImageUrl, imageSets]);

  useEffect(() => {
    const imageContainers = document.querySelectorAll(
      `.img-container[data-product-title="${productTitle}"]`,
    );
    let hoverTimer;

    const onMouseEnter = (event) => {
      let counter = 1,
        prevCount = 0;
      const images = event.currentTarget.querySelectorAll("img");

      if (images.length > 1) {
        hoverTimer = setInterval(() => {
          if (!!images[prevCount] && !!images[counter]) {
            images[prevCount].style.opacity = "0";
            images[counter].style.opacity = "1";
          }
          prevCount = counter;
          counter = (counter + 1) % images.length;
        }, 1000);
      }
    };

    const onMouseLeave = (event) => {
      clearInterval(hoverTimer);
      const images = event.currentTarget.querySelectorAll("img");
      images.forEach((image, imageIndex) => {
        image.style.opacity = imageIndex === 0 ? "1" : "0";
      });
    };

    imageContainers.forEach((imageContainer) => {
      imageContainer.addEventListener("mouseenter", onMouseEnter);
      imageContainer.addEventListener("mouseleave", onMouseLeave);
    });

    return () => {
      imageContainers.forEach((imageContainer) => {
        imageContainer.removeEventListener("mouseenter", onMouseEnter);
        imageContainer.removeEventListener("mouseleave", onMouseLeave);
      });
      if (hoverTimer) clearInterval(hoverTimer);
    };
  }, [activeColorIndex, productTitle]);

  return (
    <div className="product-card relative aspect-[4/5.5] w-full overflow-hidden rounded-md bg-[var(--product-default)] max-xl:aspect-[4/5] sm:min-h-[350px] lg:min-h-[400px] xl:min-h-[450px]">
      <TransitionLink
        href={`/product/${productTitle.split(" ").join("-").toLowerCase()}`}
      >
        {activeColorIndex === null ? (
          // RENDER STATE 1: No color selected.
          // Shows the main thumbnail and cycles through all images on hover.
          <div
            data-product-title={productTitle} // Unique identifier for the useEffect selector
            className="img-container absolute aspect-[4/5.5] w-full rounded-md transition-opacity duration-300 ease-in-out max-xl:aspect-[4/5] sm:min-h-[350px] lg:min-h-[400px] xl:min-h-[450px]"
          >
            {allImages.map((imgUrl, imgIndex) => (
              <Image
                key={`card-thumbnail-all-img-${productTitle}-${imgIndex}`}
                className={`absolute h-full w-full object-cover transition-[transform,opacity] duration-300 ease-in-out ${imgIndex === 0 ? "opacity-100" : "opacity-0"
                  }`}
                // src={imgUrl}
                src={getImage(imgUrl, 400)}
                alt={`${productTitle} showcase image ${imgIndex + 1}`}
                sizes="50vw"
                fill
              />
            ))}
          </div>
        ) : (
          // RENDER STATE 2: A color has been selected.
          // Doesn't show the main thumbnail and cycles through only the images of selected color on hover.
          imageSets.map((imgSet, imgSetIndex) => (
            <div
              key={`card-thumbnail-img-${productTitle}-${imgSet.color.label}-${imgSetIndex}`}
              data-product-title={productTitle}
              className="img-container absolute aspect-[4/5.5] w-full rounded-md transition-opacity duration-300 ease-in-out max-xl:aspect-[4/5] sm:min-h-[350px] lg:min-h-[400px] xl:min-h-[450px]"
              style={{
                opacity: activeColorIndex === imgSetIndex ? "1" : "0",
                pointerEvents:
                  activeColorIndex === imgSetIndex ? "auto" : "none",
              }}
            >
              {imgSet.images.map((imgUrl, imgIndex) => (
                <Image
                  key={`card-thumbnail-sub-img-${productTitle}-${imgSet.color.label}-${imgUrl}-${imgIndex}`}
                  className={`h-full w-full object-cover transition-[transform,opacity] duration-300 ease-in-out ${imgIndex === 0 ? "opacity-100" : "opacity-0"
                    }`}
                  // src={imgUrl}
                  src={getImage(imgUrl, 400)}
                  alt={`${productTitle} ${imgSet.color.label} image ${imgIndex + 1
                    }`}
                  sizes="50vw"
                  fill
                />
              ))}
            </div>
          ))
        )}
        {isProductOutOfStock && <CardOutOfStockBanner />}
      </TransitionLink>
      {!isProductOutOfStock && (
        <CardColorSelectionTool
          productTitle={productTitle}
          productColors={productColors}
          activeColorIndex={activeColorIndex}
          setActiveColorIndex={setActiveColorIndex}
        />
      )}
    </div>
  );
}
