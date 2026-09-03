export default function ProductSizeSelection({
  productSizes,
  selectedOptions,
  setSelectedOptions,
  productVariantSku,
  showSku,
}) {
  return (
    <div className="mb-3.5 flex items-center gap-x-2.5">
      <h4 className="font-semibold text-neutral-600">Sizes:</h4>
      <div className="flex flex-wrap gap-x-1.5">
        {productSizes?.map((size) => {
          const isSelected = selectedOptions?.size?.id === size.id;
          return (
            <span
              key={"product-size-" + size.id}
              className={`h-9 w-12 cursor-pointer content-center rounded-[4px] text-center text-sm font-semibold text-neutral-500 transition-[background-color] duration-300 ease-in-out ${isSelected ? "bg-[var(--color-secondary-500)] text-neutral-700" : "bg-neutral-100 hover:bg-[var(--color-secondary-500)]"}`}
              onClick={() => {
                setSelectedOptions((prev) => ({ ...prev, size, quantity: 1 }));
              }}
            >
              {size.name}
            </span>
          );
        })}
      </div>
      {showSku && (
        <p className="text-neutral-600">({productVariantSku} available)</p>
      )}
    </div>
  );
}
