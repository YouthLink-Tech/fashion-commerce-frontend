import Image from "next/image";
import { Controller } from "react-hook-form";
import { Select, SelectItem } from "@nextui-org/react";
import { HiCheckCircle, HiChevronLeft, HiChevronRight } from "react-icons/hi2";

export default function ReturnItemsField({
  activeReturnOrder,
  register,
  control,
  setValue,
  errors,
  returnItems,
  orderAmount,
  calculateFinalPrice,
}) {
  const issues = [
    "Defective Fabric",
    "Color Fading",
    "Loose Threads/Stitching",
    "Damaged Zipper/Buttons",
    "Misalignment/Uneven Parts",
    "Wrong Product",
  ];

  return (
    <div className="w-full space-y-3 font-semibold">
      <div className="items-start justify-between gap-2 max-sm:space-y-2 sm:flex sm:items-center">
        <label>Select the Products with Issues</label>
        <p className="w-fit text-[13px] font-normal max-sm:ml-auto">
          Invoiced Amount: ৳ {orderAmount?.toLocaleString()}
        </p>
      </div>
      <div className="space-y-2">
        {activeReturnOrder?.productInformation.map((item, index) => {
          const returnItem = returnItems[index];

          return (
            <div
              key={"return-item-" + item?._id + item?.size + item?.color._id}
              className={`cursor-pointer rounded-[4px] border-2 p-2 transition-[border-color,background-color] duration-300 ease-in-out hover:border-[var(--color-primary-200)] hover:bg-[var(--color-primary-100)] ${returnItem.isRequested ? "border-[var(--color-primary-200)] bg-[var(--color-primary-100)]" : "border-neutral-100"}`}
            >
              <div
                className={`flex w-full items-stretch justify-between gap-x-2.5`}
                onClick={(event) => {
                  const tagName = event.target.tagName.toLowerCase();

                  if (
                    !(
                      tagName == "input" ||
                      tagName == "button" ||
                      tagName == "svg" ||
                      tagName == "path"
                    )
                  )
                    setValue(
                      `items.${index}.isRequested`,
                      !returnItem.isRequested,
                    );
                }}
              >
                <div className="relative min-h-full w-1/4 overflow-hidden rounded-[4px] bg-[var(--product-default)] max-sm:w-20">
                  {!!item?.thumbnailImgUrl && (
                    <Image
                      className="h-full w-full object-cover"
                      src={item?.thumbnailImgUrl}
                      alt={item?.productTitle}
                      fill
                      sizes="15vh"
                    />
                  )}
                </div>
                <div className="grow text-neutral-400">
                  <div className="flex items-stretch justify-between gap-x-5">
                    <div>
                      <h4 className="line-clamp-1 text-neutral-600">
                        {item?.productTitle}
                      </h4>
                      <div className="mt-1 flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Unit Price:</h5>
                        <span>
                          ৳ {calculateFinalPrice(item)?.toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-[3px] flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Size:</h5>
                        <span>{item?.size}</span>
                      </div>
                      <div className="mt-[3px] flex gap-x-1.5 text-xs md:text-[13px]">
                        <h5>Color:</h5>
                        <div className="flex items-center gap-x-1">
                          <div
                            style={{
                              backgroundColor: item?.color?.color,
                            }}
                            className="size-3.5 rounded-full"
                          />
                          {item?.color?.label}
                        </div>
                      </div>
                    </div>
                    <div className="flex min-h-full flex-col items-end justify-between">
                      <HiCheckCircle
                        className={`pointer-events-none size-7 text-[#60d251] transition-opacity duration-300 ease-in-out ${returnItem.isRequested ? "opacity-100" : "opacity-0"}`}
                      />
                      <div className="flex gap-x-1.5 text-neutral-500 [&>*]:!m-0 [&>*]:grid [&>*]:size-8 [&>*]:place-content-center [&>*]:rounded-[4px] [&>*]:border-2 [&>*]:border-neutral-200 [&>*]:!p-0 [&>*]:text-center [&>*]:transition-[background-color,border-color] [&>*]:duration-300 [&>*]:ease-in-out">
                        <button
                          className="transition-[background-color,border-color] hover:border-transparent hover:bg-[var(--color-secondary-500)]"
                          type="button"
                          onClick={() => {
                            setValue(
                              `items.${index}.quantity`,
                              Number(returnItem.quantity) !== 0
                                ? returnItem.quantity - 1
                                : returnItem.quantity,
                            );
                          }}
                        >
                          <HiChevronLeft />
                        </button>
                        <input
                          className="w-fit !bg-transparent text-center font-semibold outline-none transition-[border-color] [-moz-appearance:textfield] focus:border-[var(--color-secondary-500)] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                          type="number"
                          {...register(`items.${index}.quantity`, {
                            min: 0,
                            max: item?.sku,
                            onChange: (value) => {
                              setValue(
                                `items.${index}.quantity`,
                                value < 0
                                  ? 0
                                  : value > item?.sku
                                    ? item?.sku
                                    : value,
                                { shouldValidate: true },
                              );
                            },
                          })}
                        />
                        <button
                          className="transition-[background-color,border-color] hover:border-transparent hover:bg-[var(--color-secondary-500)]"
                          type="button"
                          onClick={() => {
                            setValue(
                              `items.${index}.quantity`,
                              Number(returnItem.quantity) !== Number(item?.sku)
                                ? Number(returnItem.quantity) + 1
                                : returnItem.quantity,
                            );
                          }}
                        >
                          <HiChevronRight />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <input
                  type="checkbox"
                  className="hidden"
                  {...register(`items.${index}.isRequested`, {
                    validate: {
                      notSelectedProperly: (value) =>
                        value ||
                          returnItems.some((returnItem) => returnItem.isRequested)
                          ? returnItems.every(
                            (returnItem) =>
                              !returnItem.isRequested ||
                              (returnItem.isRequested &&
                                returnItem.quantity > 0),
                          )
                            ? returnItems.every(
                              (returnItem) =>
                                !returnItem.isRequested ||
                                (returnItem.isRequested &&
                                  returnItem.issues.length),
                            ) ||
                            "At least one issue must be chosen for selected products."
                            : "Quantity must be at least 1 for selected products."
                          : "At least one product must be selected.",
                    },
                  })}
                />
              </div>
              {returnItem.isRequested && (
                <Controller
                  name={`items.${index}.issues`}
                  id={`items.${index}.issues`}
                  control={control}
                  render={({ field: { value } }) => (
                    <Select
                      selectionMode="multiple"
                      variant="bordered"
                      placeholder="Select the issue with this product"
                      aria-label="Select product issue"
                      className="select-without-search [&:not([data-has-value='true'])_span[data-slot='value']]:text-neutral-500 [&_button[data-focus='true']]:border-[var(--color-primary-700)] [&_button[data-hover='true']]:border-[var(--color-primary-700)] [&_button[data-open='true']]:border-[var(--color-primary-700)] [&_button]:rounded-[4px] [&_label]:!text-sm [&_label]:!text-neutral-700 [&_span[data-slot='value']]:text-xs"
                      classNames={{ popoverContent: ["rounded-md"] }}
                      selectedKeys={value}
                      onSelectionChange={(newSelectedKeys) => {
                        setValue(
                          `items.${index}.issues`,
                          Array.from(newSelectedKeys),
                        );
                      }}
                    >
                      {issues.map((issue) => (
                        <SelectItem className="rounded-[4px]" key={issue}>
                          {issue}
                        </SelectItem>
                      ))}
                    </Select>
                  )}
                />
              )}
            </div>
          );
        })}
        {errors.items && (
          <p className="text-xs font-semibold text-red-500">
            {errors.items[0].isRequested.message}
          </p>
        )}
      </div>
    </div>
  );
}
