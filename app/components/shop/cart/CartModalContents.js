import Image from "next/image";
import { useState } from "react";
import { Button, Input } from "@nextui-org/react";
import { CgClose } from "react-icons/cg";
import { HiChevronLeft, HiChevronRight } from "react-icons/hi2";
import {
  calculateFinalPrice,
  checkIfOnlyRegularDiscountIsAvailable,
} from "@/app/utils/orderCalculations";
import NotifyMeButton from "./NotifyMeButton";
import ColorButtonWithTooltip from "../../ui/ColorButtonWithTooltip";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function CartModalContents({
  userEmail,
  product,
  specialOffers,
  productVariantSku,
  imageSets,
  setIsAddToCartModalOpen,
  selectedOptions,
  setSelectedOptions,
  isNotifyMeModalOpen,
  setIsNotifyMeModalOpen,
  notifyVariants,
}) {
  const [isUserSubscribed, setIsUserSubscribed] = useState(false);
  const isOnlyRegularDiscountAvailable = checkIfOnlyRegularDiscountIsAvailable(
    product,
    specialOffers,
  );
  const imgUrl = imageSets?.find(
    (imageSet) => imageSet?.color?.label === selectedOptions?.color?.label,
  )?.images[0];

  return (
    <div className="relative h-fit md:flex md:gap-x-10">
      <div className="relative min-h-full overflow-hidden rounded-[4px] bg-[var(--product-default)] p-5 max-md:h-[35vh] max-md:w-[60dvw] max-sm:w-[80dvw] md:w-60">
        {!!imgUrl && (
          <Image
            // src={imgUrl}
            src={getImage(imgUrl, 400)}
            alt={`${product?.productTitle} ${selectedOptions?.color.label}`}
            className="h-full w-full select-none object-cover"
            sizes="50vw"
            fill
          />
        )}
      </div>
      <div className="relative mt-4 md:mt-0 md:min-w-80 lg:min-w-96">
        <h1 className="mb-2.5 w-fit text-xl font-bold sm:text-2xl">
          {product?.productTitle}
        </h1>
        <div className="relative mb-6 flex gap-x-3 text-base font-bold sm:text-lg">
          <p
            className={
              isOnlyRegularDiscountAvailable
                ? "relative text-neutral-400 before:absolute before:left-0 before:right-0 before:top-1/2 before:h-0.5 before:w-full before:-translate-y-1/2 before:bg-neutral-400 before:content-['']"
                : "text-neutral-600"
            }
          >
            ৳ {Number(product?.regularPrice).toLocaleString()}
          </p>
          {isOnlyRegularDiscountAvailable && (
            <p className="text-neutral-600">
              ৳ {calculateFinalPrice(product, specialOffers).toLocaleString()}
            </p>
          )}
        </div>
        <div className="mb-3.5 flex items-center gap-x-2.5">
          <h4 className="font-semibold text-neutral-600">Sizes:</h4>
          <div className="flex flex-wrap gap-x-1.5">
            {product?.allSizes.map((size) => {
              return (
                <span
                  key={"add-to-cart-size-" + size}
                  className={`h-9 w-12 cursor-pointer content-center rounded-[4px] text-center text-sm font-semibold transition-[background-color,color] duration-300 ease-in-out ${selectedOptions?.size === size ? "bg-[var(--color-secondary-600)] text-neutral-700" : "bg-neutral-100 text-neutral-500 hover:bg-[var(--color-secondary-500)] hover:text-neutral-600"}`}
                  onClick={() =>
                    setSelectedOptions((prevOptions) => ({
                      ...prevOptions,
                      size: size,
                      quantity: 1,
                    }))
                  }
                >
                  {size}
                </span>
              );
            })}
          </div>
          {!!selectedOptions?.size && product?.isInventoryShown && (
            <p className="font-normal text-neutral-600">
              ({productVariantSku} available)
            </p>
          )}
        </div>
        <div className="mb-3.5 flex items-center gap-x-2.5">
          <h4 className="font-semibold text-neutral-600">Colors:</h4>
          <div className="flex flex-wrap gap-x-1.5">
            {product?.availableColors.map((color) => {
              return (
                <ColorButtonWithTooltip
                  key={"add-to-cart-color-" + color._id}
                  color={color}
                  toolLocation="modal"
                  selectedOptions={selectedOptions}
                  setSelectedOptions={setSelectedOptions}
                />
              );
            })}
          </div>
        </div>
        <div
          className={`flex items-center gap-x-2.5 transition-[opacity] duration-300 ease-in-out ${!!selectedOptions?.size && !!productVariantSku ? /*"pointer-events-auto opacity-100" : "pointer-events-none opacity-40"*/ "" : "hidden"}`}
        >
          <h4 className="font-semibold text-neutral-600">Quantity:</h4>
          <div className="flex gap-x-1.5 [&>*]:rounded-[4px] [&>button]:bg-neutral-100 hover:[&>button]:bg-[var(--color-secondary-500)]">
            <Button
              isIconOnly
              startContent={<HiChevronLeft />}
              onClick={() =>
                setSelectedOptions((prevOptions) => ({
                  ...prevOptions,
                  quantity:
                    prevOptions.quantity !== 1
                      ? prevOptions.quantity - 1
                      : prevOptions.quantity,
                }))
              }
            ></Button>
            <Input
              className="w-[54px] font-semibold [&_[data-slot='input-wrapper']]:rounded-[4px] hover:[&_[data-slot='input-wrapper']]:bg-[var(--color-secondary-500)] [&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none [&_input]:text-center [&_input]:[-moz-appearance:textfield]"
              type="number"
              arial-label="Quantity"
              min={1}
              max={!productVariantSku ? 1 : productVariantSku}
              value={selectedOptions?.quantity || ""}
              onValueChange={(value) => {
                setSelectedOptions((prevOptions) => ({
                  ...prevOptions,
                  quantity:
                    value < 1
                      ? 1
                      : value > productVariantSku
                        ? productVariantSku
                        : value,
                }));
              }}
            />
            <Button
              isIconOnly
              startContent={<HiChevronRight />}
              onClick={() =>
                setSelectedOptions((prevOptions) => ({
                  ...prevOptions,
                  quantity:
                    prevOptions.quantity !== productVariantSku
                      ? Number(prevOptions.quantity) + 1
                      : prevOptions.quantity,
                }))
              }
            ></Button>
          </div>
        </div>
        {!!selectedOptions?.size && productVariantSku === 0 && (
          <div className="mt-1 flex items-center gap-4">
            <p className="text-sm font-semibold text-red-600">Out of Stock*</p>
            <NotifyMeButton
              userEmail={userEmail}
              notifyVariants={notifyVariants}
              productId={product?._id}
              productVariantSku={productVariantSku}
              selectedOptions={selectedOptions}
              isNotifyMeModalOpen={isNotifyMeModalOpen}
              setIsNotifyMeModalOpen={setIsNotifyMeModalOpen}
              isUserSubscribed={isUserSubscribed}
              setIsUserSubscribed={setIsUserSubscribed}
            />
          </div>
        )}
      </div>
      <CgClose
        className="absolute right-0 top-0 cursor-pointer transition-[color] duration-300 ease-in-out hover:text-neutral-900 max-md:-translate-y-[calc(100%+12px)]"
        size={24}
        onClick={() => {
          setIsAddToCartModalOpen(false);
          setSelectedOptions({
            color:
              product?.availableColors[
              Object.keys(product?.availableColors)[0]
              ],
            size: undefined,
            quantity: 1,
          });
        }}
      />
    </div>
  );
}
