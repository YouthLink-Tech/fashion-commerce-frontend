import ColorButtonWithTooltip from "../ui/ColorButtonWithTooltip";

export default function CardColorSelectionTool({
  productTitle,
  productColors,
  activeColorIndex,
  setActiveColorIndex,
}) {
  return (
    <div
      id="color-select"
      className="absolute bottom-0 left-1/2 flex w-full -translate-x-1/2 translate-y-5 items-center gap-x-1.5 border border-[var(--product-default)] bg-white bg-opacity-75 px-3 py-3 opacity-0 transition-[transform,opacity] duration-300 ease-in-out sm:gap-x-2.5"
    >
      <h5 className="text-[13px] font-semibold text-neutral-600">
        <span className="max-sm:hidden">Available </span>Colors:
      </h5>
      <div className="flex items-center justify-center sm:gap-x-1">
        {productColors.map((color, colorIndex) => {
          return (
            <ColorButtonWithTooltip
              key={productTitle + color.id}
              color={color}
              colorIndex={colorIndex}
              toolLocation="card"
              activeColorIndex={activeColorIndex}
              setActiveColorIndex={setActiveColorIndex}
            />
          );
        })}
      </div>
    </div>
  );
}
