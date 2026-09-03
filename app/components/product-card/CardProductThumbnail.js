import Image from "next/image";
import { useEffect, useState, useMemo, useRef } from "react";
import TransitionLink from "../ui/TransitionLink";
import CardOutOfStockBanner from "./CardOutOfStockBanner";
import CardColorSelectionTool from "./CardColorSelectionTool";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function CardProductThumbnail({
  productTitle,
  slug,
  productColors,
  isProductOutOfStock,
  thumbnail,
  imageSets,
}) {
  const [activeColorIndex, setActiveColorIndex] = useState(null);
  const containerRef = useRef(null);

  const allImages = useMemo(() => {
    if (!thumbnail?.public_id || !imageSets) return [];
    return [thumbnail.public_id, ...imageSets.flatMap((set) => set.images)];
  }, [thumbnail, imageSets]);

  useEffect(() => {
    const imageContainers = containerRef.current?.querySelectorAll(".img-container") ?? [];
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
  }, [activeColorIndex]);

  return (
    <div ref={containerRef} className="product-card relative aspect-[4/5.5] w-full overflow-hidden rounded-md bg-[var(--product-default)] max-xl:aspect-[4/5] sm:min-h-[350px] lg:min-h-[400px] xl:min-h-[450px]">
      <TransitionLink
        href={`/product/${slug}`}
      >
        {activeColorIndex === null ? (
          // RENDER STATE 1: No color selected.
          // Shows the main thumbnail and cycles through all images on hover.
          <div
            // data-product-title={productTitle} // Unique identifier for the useEffect selector
            className="img-container absolute aspect-[4/5.5] w-full rounded-md transition-opacity duration-300 ease-in-out max-xl:aspect-[4/5] sm:min-h-[350px] lg:min-h-[400px] xl:min-h-[450px]"
          >
            {allImages.map((imgPublicId, imgIndex) => (
              <Image
                key={`card-thumbnail-all-img-${slug}-${imgIndex}`}
                className={`absolute h-full w-full object-cover transition-[transform,opacity] duration-300 ease-in-out ${imgIndex === 0 ? "opacity-100" : "opacity-0"
                  }`}
                src={getImage(imgPublicId, 650)}
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
              key={`card-thumbnail-img-${slug}-${imgSet.color.id}-${imgSetIndex}`}
              // data-product-title={productTitle}
              className="img-container absolute aspect-[4/5.5] w-full rounded-md transition-opacity duration-300 ease-in-out max-xl:aspect-[4/5] sm:min-h-[350px] lg:min-h-[400px] xl:min-h-[450px]"
              style={{
                opacity: activeColorIndex === imgSetIndex ? "1" : "0",
                pointerEvents:
                  activeColorIndex === imgSetIndex ? "auto" : "none",
              }}
            >
              {imgSet.images.map((imgPublicId, imgIndex) => (
                <Image
                  key={`card-thumbnail-sub-img-${slug}-${imgSet.color.id}-${imgPublicId}-${imgIndex}`}
                  className={`h-full w-full object-cover transition-[transform,opacity] duration-300 ease-in-out ${imgIndex === 0 ? "opacity-100" : "opacity-0"
                    }`}
                  src={getImage(imgPublicId, 650)}
                  alt={`${productTitle} ${imgSet.color.name} image ${imgIndex + 1
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
