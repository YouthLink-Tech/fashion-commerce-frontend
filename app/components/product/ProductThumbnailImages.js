import { getImage } from "@/app/lib/cloudinaryUtils";
import Image from "next/image";
import {
  CgChevronDown,
  CgChevronLeft,
  CgChevronRight,
  CgChevronUp,
} from "react-icons/cg";

const MAX_THUMBNAILS_ALLOWED_TO_SHOW_DEFAULT = 4;
const MAX_THUMBNAILS_ALLOWED_TO_SHOW_SMALL_TABLET = 3;
const MAX_THUMBNAILS_ALLOWED_TO_SHOW_DESKTOP = 5;

export default function ProductThumbnailImages({
  productTitle,
  selectedColorLabel,
  activeImageSet,
  activeImageIndex,
  setActiveImageIndex,
  numOfTimesThumbnailsMoved,
  setNumOfTimesThumbnailsMoved,
}) {
  const totalImages = activeImageSet?.images?.length;
  const maxThumbnailsAllowedToMoveDefault =
    totalImages - MAX_THUMBNAILS_ALLOWED_TO_SHOW_DEFAULT;
  const maxThumbnailsAllowedToMoveSmallTablet =
    totalImages - MAX_THUMBNAILS_ALLOWED_TO_SHOW_SMALL_TABLET;
  const maxThumbnailsAllowedToMoveDesktop =
    totalImages - MAX_THUMBNAILS_ALLOWED_TO_SHOW_DESKTOP;
  const thumbnailGap = "8px";
  const thumbnailMoved = numOfTimesThumbnailsMoved * -1;

  return (
    <div className="relative sm:max-md:h-[40vh] md:w-80 lg:w-[424px] xl:w-auto xl:max-[1799px]:order-first xl:max-[1799px]:h-full min-[1800px]:w-[650px]">
      {/* Thumbnail Images */}
      <div
        className="relative flex w-full max-sm:overflow-x-auto sm:overflow-hidden sm:max-md:h-full sm:max-md:flex-col xl:max-[1799px]:h-full xl:max-[1799px]:flex-col"
        style={{
          gap: thumbnailGap,
        }}
      >
        {totalImages &&
          activeImageSet?.images?.map((imageURL, imageURLIndex) => {
            return (
              /* Thumbnail Image Wrapper */
              <div
                key={imageURL + "-thumbnail-" + imageURLIndex}
                className={`relative shrink-0 cursor-pointer overflow-hidden rounded-[4px] bg-[var(--product-default)] transition-[border-color,transform] duration-300 ease-in-out max-sm:aspect-[1/1.2] max-sm:w-[calc((100%-var(--thumbnail-gap)*var(--total-gaps-default))/var(--max-thumbnails-default))] max-sm:translate-x-[calc((100%+var(--thumbnail-gap))*var(--thumbnail-moved))] sm:max-md:aspect-[1/1.1] sm:max-md:h-[calc((100%-var(--thumbnail-gap)*var(--total-gaps-default))/var(--max-thumbnails-default))] sm:max-md:translate-y-[calc((100%+var(--thumbnail-gap))*var(--thumbnail-moved))] md:h-32 md:w-[calc((100%-var(--thumbnail-gap)*var(--total-gaps-small-tablet))/var(--max-thumbnails-small-tablet))] md:max-xl:translate-x-[calc((100%+var(--thumbnail-gap))*var(--thumbnail-moved))] lg:w-[calc((100%-var(--thumbnail-gap)*var(--total-gaps-default))/var(--max-thumbnails-default))] xl:max-[1799px]:aspect-[1/1.25] xl:max-[1799px]:h-[calc((100%-var(--thumbnail-gap)*var(--total-gaps-desktop))/var(--max-thumbnails-desktop))] xl:max-[1799px]:w-full xl:max-[1799px]:translate-y-[calc((100%+var(--thumbnail-gap))*var(--thumbnail-moved))] min-[1800px]:w-[calc((100%-var(--thumbnail-gap)*var(--total-gaps-desktop))/var(--max-thumbnails-desktop))] min-[1800px]:translate-x-[calc((100%+var(--thumbnail-gap))*var(--thumbnail-moved))] ${activeImageIndex === imageURLIndex ? "border-2 border-[var(--color-secondary-800)]" : ""}`}
                onClick={() => setActiveImageIndex(imageURLIndex)}
                style={{
                  "--max-thumbnails-default":
                    MAX_THUMBNAILS_ALLOWED_TO_SHOW_DEFAULT,
                  "--max-thumbnails-small-tablet":
                    MAX_THUMBNAILS_ALLOWED_TO_SHOW_SMALL_TABLET,
                  "--max-thumbnails-desktop":
                    MAX_THUMBNAILS_ALLOWED_TO_SHOW_DESKTOP,
                  "--total-gaps-default":
                    MAX_THUMBNAILS_ALLOWED_TO_SHOW_DEFAULT - 1,
                  "--total-gaps-small-tablet":
                    MAX_THUMBNAILS_ALLOWED_TO_SHOW_SMALL_TABLET - 1,
                  "--total-gaps-desktop":
                    MAX_THUMBNAILS_ALLOWED_TO_SHOW_DESKTOP - 1,
                  "--thumbnail-gap": thumbnailGap,
                  "--thumbnail-moved": thumbnailMoved,
                }}
              >
                {/* Thumbnail Image */}
                {!!imageURL && (
                  <Image
                    // src={imageURL}
                    src={getImage(imageURL, 400)}
                    alt={`${productTitle} ${selectedColorLabel} Thumbnail ${imageURLIndex + 1}`}
                    className="h-full w-full object-cover transition-[transform] duration-300 ease-in-out"
                    sizes="50vw"
                    fill
                  />
                )}
              </div>
            );
          })}
      </div>
      {/* Previous Nav Button */}
      <button
        className={`absolute flex size-10 items-center justify-center rounded-[3px] bg-white p-0 text-xl shadow-[0_0_12px_0_rgba(0,0,0,0.15)] transition-[background-color,opacity] duration-300 ease-in-out hover:bg-[var(--color-secondary-500)] max-sm:top-1/2 max-sm:hidden max-sm:-translate-x-2 max-sm:-translate-y-1/2 sm:max-md:left-1/2 sm:max-md:top-0 sm:max-md:-translate-x-1/2 sm:max-md:translate-y-2 md:max-xl:top-1/2 md:max-xl:-translate-x-1/2 md:max-xl:-translate-y-1/2 xl:max-[1799px]:left-1/2 xl:max-[1799px]:top-0 xl:max-[1799px]:-translate-x-1/2 xl:max-[1799px]:translate-y-2 min-[1800px]:top-1/2 min-[1800px]:-translate-x-1/2 min-[1800px]:-translate-y-1/2 [&>svg]:mx-auto ${numOfTimesThumbnailsMoved > 0 ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={() =>
          setNumOfTimesThumbnailsMoved((prevNumber) => prevNumber - 1)
        }
      >
        <CgChevronUp className="max-sm:hidden md:max-xl:hidden min-[1800px]:hidden" />
        <CgChevronLeft className="sm:max-md:hidden xl:hidden min-[1800px]:block" />
      </button>
      {/* Next Nav Button */}
      <button
        className={`absolute flex size-10 items-center justify-center rounded-[3px] bg-white p-0 text-xl shadow-[0_0_12px_0_rgba(0,0,0,0.15)] transition-[background-color,opacity] duration-300 ease-in-out hover:bg-[var(--color-secondary-500)] max-sm:right-0 max-sm:top-1/2 max-sm:hidden max-sm:-translate-y-1/2 max-sm:translate-x-2 sm:max-md:bottom-0 sm:max-md:left-1/2 sm:max-md:-translate-x-1/2 sm:max-md:-translate-y-2 md:max-xl:right-0 md:max-xl:top-1/2 md:max-xl:-translate-y-1/2 md:max-xl:translate-x-1/2 xl:max-[1799px]:bottom-0 xl:max-[1799px]:left-1/2 xl:max-[1799px]:-translate-x-1/2 xl:max-[1799px]:-translate-y-2 min-[1800px]:right-0 min-[1800px]:top-1/2 min-[1800px]:-translate-y-1/2 min-[1800px]:translate-x-2 [&>svg]:mx-auto ${maxThumbnailsAllowedToMoveDefault < 1 || numOfTimesThumbnailsMoved === maxThumbnailsAllowedToMoveDefault ? "pointer-events-none opacity-0 lg:pointer-events-none lg:opacity-0" : "pointer-events-auto opacity-100 lg:pointer-events-auto lg:opacity-100"} ${maxThumbnailsAllowedToMoveSmallTablet < 1 || numOfTimesThumbnailsMoved === maxThumbnailsAllowedToMoveSmallTablet ? "md:pointer-events-none md:opacity-0" : "md:pointer-events-auto md:opacity-100"} ${maxThumbnailsAllowedToMoveDesktop < 1 || numOfTimesThumbnailsMoved === maxThumbnailsAllowedToMoveDesktop ? "xl:pointer-events-none xl:opacity-0" : "xl:pointer-events-auto xl:opacity-100"}`}
        onClick={() =>
          setNumOfTimesThumbnailsMoved((prevNumber) => prevNumber + 1)
        }
      >
        <CgChevronDown className="max-sm:hidden md:max-xl:hidden min-[1800px]:hidden" />
        <CgChevronRight className="sm:max-md:hidden xl:hidden min-[1800px]:block" />
      </button>
    </div>
  );
}
