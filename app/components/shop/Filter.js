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
import { HiOutlineLightningBolt } from "react-icons/hi";
import { HiChevronDown } from "react-icons/hi2";
import { LuBadge } from "react-icons/lu";
import { TbGift, TbRosetteDiscount } from "react-icons/tb";
import { TiStarOutline } from "react-icons/ti";

export default function Filter({
  isFilterButtonClicked,
  setIsFilterButtonClicked,
  unfilteredProducts,
  filteredProducts,
  selectedFilterOptions,
  setSelectedFilterOptions,
  isNoFilterOptionSelected,
  calculateFinalPrice,
  specialOffers,
}) {
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
      options: [
        ...new Set(unfilteredProducts?.flatMap((product) => product.category)),
        "Clear",
      ],
    },
    {
      label: "Sizes",
      arrayKey: "sizes",
      selectionMode: "multiple",
      type: "select",
      options: !filteredProducts?.length
        ? []
        : [
          ...new Set(
            filteredProducts?.flatMap((product) => product.allSizes),
          ),
          "Clear",
        ],
    },
    {
      label: "Colors",
      arrayKey: "colors",
      selectionMode: "multiple",
      type: "select",
      options: !filteredProducts?.length
        ? []
        : [
          ...[
            ...new Set(
              filteredProducts
                ?.flatMap((product) => product.availableColors)
                .map(JSON.stringify),
            ),
          ].map(JSON.parse),
          "Clear",
        ],
    },
    {
      label: "Price",
      arrayKey: "price",
      selectionMode: "single",
      type: "range",
      options: [
        {
          min: !filteredProducts?.length
            ? 0
            : Math.min(
              ...filteredProducts?.map((product) =>
                calculateFinalPrice(product, specialOffers),
              ),
            ),
          max: !filteredProducts?.length
            ? 0
            : Math.max(
              ...filteredProducts?.map((product) =>
                calculateFinalPrice(product, specialOffers),
              ),
            ),
        },
      ],
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
            className={`w-fit [&_[data-slot="content"]]:rounded-[4px] ${selectedFilterOptions[filterOption.arrayKey].length ? "order-first" : "order-last"}`}
            label={
              <>
                {filterOption.label}
                {!!selectedFilterOptions[filterOption.arrayKey].length && (
                  <span
                    className={`text-black ${filterOption.selectionMode === "multiple" ? "ml-2 rounded-[3px] bg-[var(--color-secondary-900)] px-2 py-1 text-[10px] text-white" : ""}`}
                  >
                    {filterOption.selectionMode === "single"
                      ? ": " +
                      selectedFilterOptions[filterOption.arrayKey].toString()
                      : selectedFilterOptions[filterOption.arrayKey].length}
                  </span>
                )}
              </>
            }
            selectionMode={filterOption.selectionMode}
            size="sm"
            defaultSelectedKeys=""
            selectedKeys={selectedFilterOptions[filterOption.arrayKey]}
            onSelectionChange={(newSelectedKeys) => {
              setSelectedFilterOptions((prevSelectedValues) => ({
                ...prevSelectedValues,
                [filterOption.arrayKey]: Array.from(newSelectedKeys).includes(
                  "Clear",
                )
                  ? new Set([])
                  : Array.from(newSelectedKeys),
              }));
            }}
            disabled={!filterOption.options.length}
            classNames={{
              mainWrapper: [
                `z-[1] text-neutral-700 [&>button]:px-4 [&>button]:rounded-[4px] [&>button]:duration-300 ${!selectedFilterOptions[filterOption.arrayKey].length ? "[&>button]:bg-[var(--color-secondary-500)] hover:[&>button]:bg-[var(--color-secondary-600)]" : "[&>button]:bg-[var(--color-secondary-600)] hover:[&>button]:bg-[var(--color-secondary-600)]"} ${!filterOption.options.length ? (!selectedFilterOptions[filterOption.arrayKey].length ? "[&>button]:opacity-50 hover:[&>button]:bg-[var(--color-secondary-500)]" : "[&>button]:opacity-40 hover:[&>button]:bg-[var(--color-secondary-600)]") : ""}`,
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
                    ? option.label
                    : option
                }
                textValue={
                  filterOption.label === "Colors" && option !== "Clear"
                    ? option.label
                    : option
                }
                startContent={
                  filterOption.label === "Colors" &&
                  option !== "Clear" && (
                    <div
                      className="pointer-events-none size-5 rounded-[3px] ring-1 ring-neutral-300"
                      style={{
                        background:
                          option.label !== "Multicolor"
                            ? option.color
                            : "linear-gradient(90deg, blue 0%, red 40%, green 80%)",
                      }}
                    />
                  )
                }
              >
                {filterOption.label === "Colors" && option !== "Clear"
                  ? option.label
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

              popoverButtonIcon.style.transform = `rotate(${isOpen ? 180 : 0}deg)`;
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
                >{`: ৳ ${selectedFilterOptions.price.min?.toLocaleString()} - ৳ ${selectedFilterOptions.price.max?.toLocaleString()}`}</span>
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
                  min={filterOption.options[0].min / 100}
                  max={filterOption.options[0].max * 100}
                  isInvalid={
                    selectedFilterOptions.price?.min <
                    filterOption.options[0].min ||
                    selectedFilterOptions.price?.min >
                    selectedFilterOptions.price?.max
                  }
                  value={
                    selectedFilterOptions.price?.min ||
                    filterOption.options[0].min
                  }
                  onValueChange={(value) => {
                    setSelectedFilterOptions((prevOptions) => ({
                      ...prevOptions,
                      price: {
                        min: Number(value),
                        max: Number(
                          prevOptions.price?.max || filterOption.options[0].max,
                        ),
                      },
                    }));
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
                  min={filterOption.options[0].min / 100}
                  max={filterOption.options[0].max * 100}
                  isInvalid={
                    selectedFilterOptions.price?.max >
                    filterOption.options[0].max ||
                    selectedFilterOptions.price?.max <
                    selectedFilterOptions.price?.min
                  }
                  value={
                    selectedFilterOptions.price?.max ||
                    filterOption.options[0].max
                  }
                  onValueChange={(value) => {
                    setSelectedFilterOptions((prevOptions) => ({
                      ...prevOptions,
                      price: {
                        min: Number(
                          prevOptions.price?.min || filterOption.options[0].min,
                        ),
                        max: Number(value),
                      },
                    }));
                  }}
                />
              </div>
              <Slider
                label="Price Range"
                aria-label="Price Range"
                step={100}
                minValue={filterOption.options[0].min}
                maxValue={filterOption.options[0].max}
                value={[
                  selectedFilterOptions.price?.min ||
                  filterOption.options[0].min,
                  selectedFilterOptions.price?.max ||
                  filterOption.options[0].max,
                ]}
                onChange={([min, max] = values) => {
                  setSelectedFilterOptions((prevOptions) => ({
                    ...prevOptions,
                    price: {
                      min: min,
                      max: max,
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
                onClick={() =>
                  setSelectedFilterOptions((prevOptions) => ({
                    ...prevOptions,
                    price: {
                      min: undefined,
                      max: undefined,
                    },
                  }))
                }
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
          onClick={() => {
            setSelectedFilterOptions({
              sortBy: new Set([]),
              filterBy: new Set([]),
              category: new Set([]),
              sizes: new Set([]),
              colors: new Set([]),
              price: {
                min: undefined,
                max: undefined,
              },
            });
            setIsFilterButtonClicked(false);
          }}
        >
          Clear All
        </Button>
      )}
    </section>
  );
}
