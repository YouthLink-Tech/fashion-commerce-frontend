import ColorButtonWithTooltip from "../ui/ColorButtonWithTooltip";

export default function ProductColorSelection({
  productColors,
  selectedOptions,
  setSelectedOptions,
  setActiveImageIndex,
  setNumOfTimesThumbnailsMoved,
}) {
  return (
    <div className="mb-3.5 flex items-center gap-x-2.5">
      <h4 className="font-semibold text-neutral-600">Colors:</h4>
      <div className="flex flex-wrap gap-x-1.5">
        {productColors?.map((color) => {
          return (
            <ColorButtonWithTooltip
              key={"product-color-" + color.id}
              color={color}
              toolLocation="page"
              selectedOptions={selectedOptions}
              setSelectedOptions={setSelectedOptions}
              setActiveImageIndex={setActiveImageIndex}
              setNumOfTimesThumbnailsMoved={setNumOfTimesThumbnailsMoved}
            />
          );
        })}
      </div>
    </div>
  );
}
