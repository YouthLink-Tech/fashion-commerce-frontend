import { getImage } from "@/app/lib/cloudinaryUtils";
import Image from "next/image";
import { useEffect, useState } from "react";
import {
  CgArrowLeft,
  CgArrowRight,
  CgClose,
  CgMathPlus,
  CgMathMinus,
} from "react-icons/cg";

const zoomScales = [100, 125, 150, 175, 200]; // 100-200%

export default function ExpandedImagesModal({
  modalFor,
  productTitle,
  selectedColorLabel,
  expandedImgUrl,
  totalImages,
  activeImageIndex,
  setActiveImageIndex,
  isImageExpanded,
  setIsImageExpanded,
}) {
  const [zoomLevel, setZoomLevel] = useState(0); // 0-4 zoom levels

  const handleZoomIn = () => {
    if (zoomLevel < 4) {
      setZoomLevel(zoomLevel + 1);
    }
  };

  const handleZoomOut = () => {
    if (zoomLevel > 0) {
      setZoomLevel(zoomLevel - 1);
    }
  };

  useEffect(() => {
    if (modalFor === "products") {
      document.body.style.overflow = isImageExpanded ? "hidden" : "unset";
    }

    // Reset zoom when modal opens/closes or image changes
    if (!isImageExpanded) {
      setZoomLevel(0);
    }
  }, [isImageExpanded, modalFor]);

  // Reset zoom when switching images
  useEffect(() => {
    setZoomLevel(0);
  }, [activeImageIndex]);

  // Keyboard navigation and close
  useEffect(() => {
    if (!isImageExpanded) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsImageExpanded(false);
      } else if (event.key === "ArrowLeft") {
        if (activeImageIndex > 0) {
          setActiveImageIndex(activeImageIndex - 1);
        }
      } else if (event.key === "ArrowRight") {
        if (activeImageIndex < totalImages - 1) {
          setActiveImageIndex(activeImageIndex + 1);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    activeImageIndex,
    isImageExpanded,
    setActiveImageIndex,
    setIsImageExpanded,
    totalImages,
  ]);

  return (
    <div
      className={`fixed inset-0 z-[6] flex h-svh w-dvw items-center justify-center bg-black bg-opacity-80 text-neutral-300 backdrop-blur ${isImageExpanded ? "" : "hidden"}`}
      id="expanded-img-bg"
      onClick={(event) =>
        event.target.id === "expanded-img-bg" && setIsImageExpanded(false)
      }
    >
      {/* Text that displays the number of current active image */}
      <p className="absolute left-5 top-5 text-sm">
        {activeImageIndex + 1}/{totalImages}
      </p>
      {/* Modal Close Button */}
      <button className="absolute right-0 top-0 p-5 transition-[color] duration-300 ease-in-out hover:text-white">
        <CgClose size={24} onClick={() => setIsImageExpanded(false)} />
      </button>
      {/* Zoom Controls - Only on mobile and tablet */}
      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2 xl:hidden">
        {/* Zoom Out Button */}
        <button
          onClick={handleZoomOut}
          disabled={zoomLevel === 0}
          className={`flex size-10 items-center justify-center rounded-[4px] bg-neutral-800 bg-opacity-50 backdrop-blur transition-opacity duration-300 ${zoomLevel === 0 ? "pointer-events-none opacity-30" : ""
            }`}
        >
          <CgMathMinus size={20} />
        </button>
        {/* Zoom Level Indicator */}
        <div className="flex h-10 items-center justify-center rounded-[4px] bg-neutral-800 bg-opacity-50 px-4 backdrop-blur">
          <span className="text-sm font-medium">{zoomScales[zoomLevel]}%</span>
        </div>
        {/* Zoom In Button */}
        <button
          onClick={handleZoomIn}
          disabled={zoomLevel === 4}
          className={`flex size-10 items-center justify-center rounded-[4px] bg-neutral-800 bg-opacity-50 backdrop-blur transition-opacity duration-300 ${zoomLevel === 4 ? "pointer-events-none opacity-30" : ""
            }`}
        >
          <CgMathPlus size={20} />
        </button>
      </div>
      {/* Left Nav Button */}
      <button
        className={`absolute bottom-0 left-0 top-14 flex items-center justify-center px-2.5 transition-[opacity,color] duration-300 ease-in-out sm:px-5 ${activeImageIndex === 0 ? "opacity-30" : "hover:text-white"}`}
        onClick={() =>
          activeImageIndex !== 0 && setActiveImageIndex(activeImageIndex - 1)
        }
      >
        <CgArrowLeft className="size-5 sm:size-6" />
      </button>
      {/* Right Nav Button */}
      <button
        className={`absolute bottom-0 right-0 top-14 flex items-center justify-center px-2.5 transition-[opacity,color] duration-300 ease-in-out sm:px-5 ${activeImageIndex === totalImages - 1 ? "opacity-30" : "hover:text-white"}`}
        onClick={() =>
          activeImageIndex !== totalImages - 1 &&
          setActiveImageIndex(activeImageIndex + 1)
        }
      >
        <CgArrowRight className="size-5 sm:size-6" />
      </button>
      {/* Image Container with Zoom */}
      <div className="overflow-hidden">
        {!!expandedImgUrl && (
          <Image
            // src={expandedImgUrl}
            src={getImage(expandedImgUrl, 850)}
            alt={
              modalFor === "products"
                ? `${productTitle} ${selectedColorLabel} ${activeImageIndex + 1} Expanded`
                : `Provided proof image ${activeImageIndex + 1} Expanded`
            }
            height={0}
            width={0}
            className="bg-[var(--product-default)] object-contain transition-transform duration-300 ease-in-out portrait:h-auto portrait:max-h-[calc(100svh-20*2*2px-40*2px)] portrait:w-[calc(100dvw-10*4px-20px*2)] portrait:sm:w-[calc(100dvw-20*4px-24px*2)] portrait:md:max-h-[calc(100svh-20*2*2px-40*2px-60px)] landscape:h-[90vh] landscape:w-auto"
            sizes="90vh"
            style={{
              transform: `scale(${zoomScales[zoomLevel] / 100})`,
            }}
          />
        )}
      </div>
    </div>
  );
}
