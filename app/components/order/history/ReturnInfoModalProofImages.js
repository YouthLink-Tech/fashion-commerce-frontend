import { useState } from "react";
import Image from "next/image";
import { CgArrowsExpandRight } from "react-icons/cg";
import ExpandedImagesModal from "../../shared/ExpandedImageModal";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function ReturnInfoModalProofImages({ returnProofImgUrls }) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  return (
    <>
      <h2 className="mt-6 text-sm font-semibold uppercase md:text-[15px]/[1]">
        Images Provided as Proof
      </h2>
      <div className="flex flex-wrap gap-x-3 gap-y-5">
        {returnProofImgUrls?.map((imgUrl, index) => (
          <div
            key={"provided-proof" + imgUrl + index}
            className="group relative cursor-pointer"
            onClick={() => {
              setActiveImageIndex(index);
              setIsImageExpanded(true);
            }}
          >
            <Image
              // src={imgUrl}
              src={getImage(imgUrl, 400)}
              alt={`Provided image as proof ${index + 1}`}
              className="size-28 rounded-[4px] border border-neutral-200 object-cover"
              height={0}
              width={0}
              sizes="240px"
            />
            <button className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-black bg-opacity-50 p-2.5 text-white opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-100">
              <CgArrowsExpandRight size={20} />
            </button>
          </div>
        ))}
        {isImageExpanded && (
          <ExpandedImagesModal
            modalFor="proof"
            expandedImgUrl={returnProofImgUrls?.[activeImageIndex]}
            totalImages={returnProofImgUrls?.length}
            activeImageIndex={activeImageIndex}
            setActiveImageIndex={setActiveImageIndex}
            isImageExpanded={isImageExpanded}
            setIsImageExpanded={setIsImageExpanded}
          />
        )}
      </div>
    </>
  );
}
