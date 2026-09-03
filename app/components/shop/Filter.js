import {
  Select,
  SelectItem,
  Popover,
  PopoverTrigger,
  PopoverContent,
  Button,
  Input,
  Slider,
} from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";
import { HiChevronDown } from "react-icons/hi2";

export default function Filter({
  isFilterButtonClicked,
  categories,
  filters,
  selectedFilterOptions,
  setSelectedFilterOptions,
  isNoFilterOptionSelected,
  onClearAll,
  onCategoryChange,
}) {
  const priceMin = filters?.price?.min ?? 0;
  const priceMax = filters?.price?.max ?? 0;

  const sizeOf = (v) => (v instanceof Set ? v.size : 0);
  const firstOf = (v) => Array.from(v ?? [])[0];

  // Local state initialized with searchParams or default min/max limits
  const [localPrice, setLocalPrice] = useState({
    min: selectedFilterOptions.price?.min ?? priceMin,
    max: selectedFilterOptions.price?.max ?? priceMax,
  });

  const debounceRef = useRef(null);

  // Sync local price whenever incoming filters object change from URL (e.g. Clear All)
  useEffect(() => {
    setLocalPrice({
      min: selectedFilterOptions.price?.min ?? priceMin,
      max: selectedFilterOptions.price?.max ?? priceMax,
    });
  }, [selectedFilterOptions.price?.min, selectedFilterOptions.price?.max, priceMin, priceMax]);

  useEffect(() => {
    return () => clearTimeout(debounceRef.current);
  }, []);

  const commitPriceDebounced = (next) => {
    setLocalPrice(next);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSelectedFilterOptions((prevOptions) => ({
        ...prevOptions,
        price: {
          min: next.min === priceMin ? undefined : next.min,
          max: next.max === priceMax ? undefined : next.max,
        },
      }));
    }, 450);
  };

  const filterOptions = [
    {
      label: "Sort by",
      arrayKey: "sortBy",
      selectionMode: "single",
      type: "select",
      options: [
        "Newest",
        "Price (Low to High)",
        "Price (High to Low)",
        "Clear",
      ],
    },
    {
      label: "Filter by",
      arrayKey: "filterBy",
      selectionMode: "multiple",
      type: "select",
      options: [
        "Popular",
        "New Arrivals",
        "In Stock",
        "Special Offers",
        "On Sale",
        "Clear",
      ],
    },
    {
      label: "Category",
      arrayKey: "category",
      selectionMode: "single",
      type: "select",
      options: [...(categories ?? []).map((c) => c.slug), "Clear"],
      displayMap: Object.fromEntries((categories ?? []).map((c) => [c.slug, c.name])),
    },
    {
      label: "Sizes",
      arrayKey: "sizes",
      selectionMode: "multiple",
      type: "select",
      options: !filters?.sizes?.length ? [] : [...filters.sizes.map((s) => s.id), "Clear"],
      displayMap: Object.fromEntries((filters?.sizes ?? []).map((s) => [s.id, s.name])),
    },
    {
      label: "Colors",
      arrayKey: "colors",
      selectionMode: "multiple",
      type: "select",
      options: !filters?.colors?.length ? [] : [...filters.colors, "Clear"],
    },
    {
      label: "Price",
      arrayKey: "price",
      selectionMode: "single",
      type: "range",
      options: [{ min: priceMin, max: priceMax }],
    },
  ];

  return (
    <section
      className={
        !isFilterButtonClicked ? "hidden" : "filter-options relative z-[1] flex"
      }
    >
      {filterOptions.map((filterOption, filterOptionIndex) =>
        filterOption.type === "select" ? (
          <Select
            key={"filter-option-" + filterOption.label + filterOptionIndex}
            className={`w-fit [&_[data-slot="content"]]:rounded-[4px] ${sizeOf(selectedFilterOptions[filterOption.arrayKey]) ? "order-first" : "order-last"}`}
            label={
              <>
                {filterOption.label}
                {!!sizeOf(selectedFilterOptions[filterOption.arrayKey]) && (
                  <span
                    className={`text-black ${filterOption.selectionMode === "multiple" ? "ml-2 rounded-[3px] bg-[var(--color-secondary-900)] px-2 py-1 text-[10px] text-white" : ""}`}
                  >
                    {filterOption.selectionMode === "single"
                      ? ": " +
                      (filterOption.displayMap
                        ? (filterOption.displayMap[firstOf(selectedFilterOptions[filterOption.arrayKey])] ??
                          firstOf(selectedFilterOptions[filterOption.arrayKey]))
                        : firstOf(selectedFilterOptions[filterOption.arrayKey]))
                      : sizeOf(selectedFilterOptions[filterOption.arrayKey])}
                  </span>
                )}
              </>
            }
            selectionMode={filterOption.selectionMode}
            size="sm"
            defaultSelectedKeys=""
            selectedKeys={selectedFilterOptions[filterOption.arrayKey]}
            onSelectionChange={(newSelectedKeys) => {
              if (filterOption.arrayKey === "category") {
                onCategoryChange(newSelectedKeys);
              } else {
                setSelectedFilterOptions((prevSelectedValues) => ({
                  ...prevSelectedValues,
                  [filterOption.arrayKey]: Array.from(newSelectedKeys).includes("Clear")
                    ? new Set([])
                    : new Set(Array.from(newSelectedKeys)),
                }));
              }
            }}
            disabled={!filterOption.options.length}
            classNames={{
              mainWrapper: [
                `z-[1] text-neutral-700 [&>button]:px-4 [&>button]:rounded-[4px] [&>button]:duration-300 ${!sizeOf(selectedFilterOptions[filterOption.arrayKey]) ? "[&>button]:bg-[var(--color-secondary-500)] hover:[&>button]:bg-[var(--color-secondary-600)]" : "[&>button]:bg-[var(--color-secondary-600)] hover:[&>button]:bg-[var(--color-secondary-600)]"} ${!filterOption.options.length ? (!sizeOf(selectedFilterOptions[filterOption.arrayKey]) ? "[&>button]:opacity-50 hover:[&>button]:bg-[var(--color-secondary-500)]" : "[&>button]:opacity-40 hover:[&>button]:bg-[var(--color-secondary-600)]") : ""}`,
              ],
              base: ["rounded-[4px]"],
              label: [
                "text-neutral-700 static mr-4 group-data-[filled=true]:scale-100 group-data-[filled=true]:-translate-y-0",
              ],
              innerWrapper: ["hidden"],
              popoverContent: ["min-w-44 w-fit rounded-md"],
              listbox: [
                "[&_li:last-child]:mt-3.5 [&_li:last-child]:bg-[var(--color-secondary-600)] [&_li:last-child]:p-2.5 [&_li:last-child]:text-center [&_li:last-child>span]:font-semibold [&_li:last-child>span:has(svg)]:hidden hover:[&_li:last-child]:bg-neutral-700 hover:[&_li:last-child]:text-neutral-100",
              ],
            }}
          >
            {filterOption.options.map((option) => (
              <SelectItem
                className="rounded-[4px]"
                key={
                  filterOption.label === "Colors" && option !== "Clear"
                    ? option.id
                    : option
                }
                textValue={
                  filterOption.label === "Colors" && option !== "Clear"
                    ? option.name
                    : filterOption.displayMap && option !== "Clear"
                      ? filterOption.displayMap[option]
                      : option
                }
                startContent={
                  filterOption.label === "Colors" &&
                  option !== "Clear" && (
                    <div
                      className="pointer-events-none size-5 rounded-[3px] ring-1 ring-neutral-300"
                      style={{
                        background: option.name !== "Multicolor" ? option.hex : "linear-gradient(90deg, blue 0%, red 40%, green 80%)",
                      }}
                    />
                  )
                }
              >
                {filterOption.label === "Colors" && option !== "Clear"
                  ? option.name
                  : filterOption.displayMap && option !== "Clear"
                    ? filterOption.displayMap[option]
                    : option}
              </SelectItem>
            ))}
          </Select>
        ) : (
          <Popover
            classNames={{ content: ["rounded-md"] }}
            placement="bottom-start"
            key={"filter-option-" + filterOption.label + filterOptionIndex}
            offset={5}
            containerPadding={40}
            onOpenChange={(isOpen) => {
              const popoverButtonIcon = document.querySelector(
                ".popover-button svg",
              );
              if (popoverButtonIcon) {
                popoverButtonIcon.style.transform = `rotate(${isOpen ? 180 : 0}deg)`;
              }
            }}
          >
            <PopoverTrigger>
              <Button
                disableRipple
                endContent={<HiChevronDown />}
                className={`popover-button z-[1] h-12 w-auto min-w-fit !scale-100 gap-0 rounded-[4px] bg-[var(--color-secondary-500)] pl-4 pr-3 font-semibold text-neutral-700 !opacity-100 shadow-sm hover:bg-[var(--color-secondary-600)] [&>svg]:ml-3 [&>svg]:h-[13px] [&>svg]:rotate-0 [&>svg]:transition-[transform] [&>svg]:duration-100 ${selectedFilterOptions.price.min || selectedFilterOptions.price.max ? "order-first bg-[var(--color-secondary-600)]" : "order-last bg-[var(--color-secondary-500)]"}`}
              >
                {filterOption.label}
                <span
                  className={
                    selectedFilterOptions.price.min ||
                      selectedFilterOptions.price.max
                      ? "inline text-black"
                      : "hidden"
                  }
                >{`: ৳ ${(selectedFilterOptions.price.min ?? priceMin).toLocaleString()} - ৳ ${(selectedFilterOptions.price.max ?? priceMax).toLocaleString()}`}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="min-w-56 items-start gap-y-8 p-4">
              <div className="flex w-full gap-x-2.5">
                <Input
                  className="font-semibold [&_[data-slot='input-wrapper']]:rounded-[4px]"
                  type="number"
                  label="Min price:"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-small text-default-400">৳</span>
                    </div>
                  }
                  min={priceMin}
                  max={priceMax}
                  isInvalid={localPrice.min < priceMin || localPrice.min > localPrice.max}
                  value={String(localPrice.min)}
                  onValueChange={(val) => {
                    const numVal = val === "" ? priceMin : Number(val);
                    commitPriceDebounced({
                      min: numVal,
                      max: localPrice.max,
                    });
                  }}
                />
                <Input
                  className="font-semibold [&_[data-slot='input-wrapper']]:rounded-[4px]"
                  type="number"
                  label="Max price:"
                  labelPlacement="outside"
                  startContent={
                    <div className="pointer-events-none flex items-center">
                      <span className="text-small text-default-400">৳</span>
                    </div>
                  }
                  min={priceMin}
                  max={priceMax}
                  isInvalid={localPrice.max > priceMax || localPrice.max < localPrice.min}
                  value={String(localPrice.max)}
                  onValueChange={(val) => {
                    const numVal = val === "" ? priceMax : Number(val);
                    commitPriceDebounced({
                      min: localPrice.min,
                      max: numVal,
                    });
                  }}
                />
              </div>
              <Slider
                label="Price Range"
                aria-label="Price Range"
                step={1} // Step of 1 allows dragging precisely to exact max numbers like 4985
                minValue={priceMin}
                maxValue={priceMax}
                value={[localPrice.min, localPrice.max]}
                onChange={([min, max]) => setLocalPrice({ min, max })}
                onChangeEnd={([min, max]) => {
                  setSelectedFilterOptions((prevOptions) => ({
                    ...prevOptions,
                    price: {
                      min: min === priceMin ? undefined : min,
                      max: max === priceMax ? undefined : max,
                    },
                  }));
                }}
                formatOptions={{
                  style: "currency",
                  currency: "BDT",
                  maximumFractionDigits: 0,
                  minimumFractionDigits: 0,
                }}
                classNames={{
                  filler: ["bg-[var(--color-secondary-600)]"],
                  thumb: [
                    "bg-[var(--color-secondary-600)] hover:bg-[var(--color-secondary-800)] focus:bg-[var(--color-secondary-800)]",
                  ],
                  label: ["hidden"],
                  value: [
                    "before:content-['Showing_for:_'] before:font-semibold",
                  ],
                }}
              />
              <Button
                disableRipple
                className="mt-3.5 w-full !scale-100 rounded-[4px] bg-[var(--color-secondary-500)] p-2.5 font-semibold !opacity-100 hover:bg-neutral-700 hover:text-neutral-100"
                onClick={() => {
                  setLocalPrice({ min: priceMin, max: priceMax });
                  setSelectedFilterOptions((prevOptions) => ({
                    ...prevOptions,
                    price: { min: undefined, max: undefined },
                  }));
                }}
              >
                Clear
              </Button>
            </PopoverContent>
          </Popover>
        ),
      )}
      {!isNoFilterOptionSelected && (
        <Button
          disableRipple
          className="z-[1] order-last h-12 w-auto min-w-fit !scale-100 rounded-[4px] bg-[var(--color-primary-500)] px-4 font-semibold text-neutral-700 !opacity-100 shadow-sm hover:bg-[var(--color-primary-700)]"
          onClick={onClearAll}
        >
          Clear All
        </Button>
      )}
    </section>
  );
}