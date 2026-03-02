import Image from "next/image";
import { CgArrowsExpandRight } from "react-icons/cg";
import ProductBadges from "../ui/badges/ProductBadges";

export default function ProductMainImage({
  productTitle,
  selectedColorLabel,
  activeImageIndex,
  setIsImageExpanded,
  activeImageUrl,
  isTrending,
  isNewArrival,
  hasDiscount,
  discount,
  hasSpecialOffer,
  specialOffer,
}) {
  const handleImgMagnification = (event) => {
    const imageWrapperElement = event.target.parentElement;
    const imageZoomedElement = document.getElementById("img-zoomed");

    let pointer = {
      x: (event.nativeEvent.offsetX * 100) / imageWrapperElement.offsetWidth,
      y: (event.nativeEvent.offsetY * 100) / imageWrapperElement.offsetHeight,
    };

    imageZoomedElement.style.display = "block";
    imageZoomedElement.style.backgroundPosition = `${parseInt(pointer.x)}% ${parseInt(pointer.y)}%`;
  };

  const disableImgMagnification = () =>
    (document.getElementById("img-zoomed").style.display = "none");

  return (
    <div
      className="relative h-[50vh] overflow-hidden rounded-[4px] bg-[var(--product-default)] p-5 max-xl:grow sm:h-[40vh] md:w-80 lg:h-[35vh] lg:w-[424px] xl:h-full xl:w-[525px] min-[1800px]:w-[650px]"
      onMouseEnter={(event) => {
        event.currentTarget.querySelector("img").style.pointerEvents = "auto";
      }}
    >
      <ProductBadges
        isTrending={isTrending}
        isNewArrival={isNewArrival}
        hasDiscount={hasDiscount}
        discount={discount}
        hasSpecialOffer={hasSpecialOffer}
        specialOffer={specialOffer}
      />
      {/* Expand Image Button */}
      <button
        className="absolute right-3 top-3 z-[3] grid place-content-center rounded-[3px] bg-white p-2 shadow-[2px_2px_16px_0_rgba(0,0,0,0.1)]"
        onClick={() => setIsImageExpanded(true)}
      >
        <CgArrowsExpandRight />
      </button>
      {/* Static Image (not hovered) */}
      {!!activeImageUrl && (
        <Image
          src={activeImageUrl}
          alt={`${productTitle} ${selectedColorLabel} ${activeImageIndex + 1}`}
          className="h-full w-full select-none object-cover"
          sizes="50vw"
          fill
          onContextMenu={(event) => event.preventDefault()}
          onMouseDown={(event) => event.preventDefault()}
          onMouseMove={handleImgMagnification}
          onMouseOut={disableImgMagnification}
        />
      )}
      {/* Zoomed Image (on hover) */}
      <div
        id="img-zoomed"
        className="pointer-events-none absolute inset-0 z-[2] hidden h-full w-full bg-[var(--product-default)] bg-no-repeat"
        style={{
          backgroundImage: `url("${encodeURI(activeImageUrl)}")`,
          backgroundSize: "200%",
          backgroundPosition: "0% 0%",
        }}
      />
    </div>
  );
}
