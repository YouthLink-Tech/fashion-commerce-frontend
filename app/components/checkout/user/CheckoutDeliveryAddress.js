import { Controller } from "react-hook-form";
import {
  Autocomplete,
  AutocompleteItem,
  Tooltip,
} from "@nextui-org/react";
import { getAvailableDeliveryTypes, getEstimatedDeliveryTime, isDeliveryTypeChoiceNeeded } from "@/app/utils/orderCalculations";
import CheckoutSelectDeliveryAddress from "../cart/CheckoutSelectDeliveryAddress";
import { useEffect, useRef } from "react";

export default function CheckoutDeliveryAddress({
  register,
  control,
  reset,
  errors,
  setValue,
  deliveryAddresses,
  selectedCityId,
  thanas,
  selectedDeliveryType,
  shippingZones,
  cities,
}) {

  const availableTypes = getAvailableDeliveryTypes(selectedCityId, shippingZones);
  const needsChoice = isDeliveryTypeChoiceNeeded(selectedCityId, shippingZones);

  const isFirstRun = useRef(true);

  useEffect(() => {
    if (isFirstRun.current) {
      // On initial mount (e.g. restoring a draft with a city already set),
      // don't blow away a deliveryType the user already had saved.
      isFirstRun.current = false;
      if (selectedCityId && availableTypes.length === 1 && !selectedDeliveryType) {
        setValue('deliveryType', availableTypes[0]);
      }
      return;
    }

    if (!selectedCityId) {
      setValue('deliveryType', '');
      return;
    }

    if (availableTypes.length === 1) {
      setValue('deliveryType', availableTypes[0]);
    } else if (availableTypes.length > 1 && !availableTypes.includes(selectedDeliveryType)) {
      setValue('deliveryType', '');
    } else if (availableTypes.length === 0) {
      setValue('deliveryType', '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCityId, availableTypes.join(',')]);

  return (
    <section className="w-full space-y-4 rounded-md border-2 border-neutral-50/20 bg-white/40 p-5 shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold md:text-lg">Delivery Address</h2>
        {!!deliveryAddresses?.length && (
          <CheckoutSelectDeliveryAddress
            deliveryAddresses={deliveryAddresses}
            reset={reset}
          />
        )}
      </div>
      <div className="space-y-4">
        <div className="max-sm:space-y-4 sm:flex sm:gap-x-4">
          <div className="w-full space-y-2 font-semibold">
            <label htmlFor="address-one">Detailed Address</label>
            <input
              id="address-one"
              type="text"
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
              placeholder="House 123, Road 45, Block Z"
              {...register("addressLineOne", {
                required: {
                  value: true,
                  message: "Detailed Address is required.",
                },
              })}
              required
            />
            {errors.addressLineOne && (
              <p className="text-xs font-semibold text-red-500">
                {errors.addressLineOne?.message}
              </p>
            )}
          </div>
          <div className="w-full space-y-2 font-semibold">
            <Controller
              name="cityId"
              control={control}
              rules={{
                required: "City is required.",
              }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  isRequired
                  labelPlacement="outside"
                  label="City"
                  placeholder="Select city"
                  size="sm"
                  variant="bordered"
                  selectedKey={value}
                  onSelectionChange={onChange}
                  className="select-with-search [&:has(input:focus)_[data-slot='input-wrapper']]:border-[var(--color-secondary-500)] [&_[data-slot='input-wrapper']]:rounded-[4px] [&_[data-slot='input-wrapper']]:bg-white/20 [&_[data-slot='input-wrapper']]:hover:border-[var(--color-secondary-500)] [&_label]:!text-neutral-500"
                >
                  {cities.map((city) => {
                    return (
                      <AutocompleteItem key={city.id}>{city.name}</AutocompleteItem>
                    );
                  })}
                </Autocomplete>
              )}
            />
            {errors.cityId && (
              <p className="text-xs font-semibold text-red-500">
                {errors.cityId?.message}
              </p>
            )}
          </div>
        </div>
        <div className="max-sm:space-y-4 sm:flex sm:gap-x-4">
          <div className="w-full space-y-2 font-semibold">
            <Controller
              name="thanaId"
              control={control}
              rules={{
                required: selectedCityId ? "Thana is required." : false,
              }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  isDisabled={!selectedCityId}
                  isRequired={!!selectedCityId}
                  labelPlacement="outside"
                  label="Thana"
                  placeholder={selectedCityId ? "Select thana" : "Select city first"}
                  size="sm"
                  variant="bordered"
                  selectedKey={value}
                  onSelectionChange={onChange}
                  className={`select-with-search-thana [&:has(input:focus)_[data-slot='input-wrapper']]:border-[var(--color-secondary-500)] [&_[data-slot='input-wrapper']]:rounded-[4px] [&_[data-slot='input-wrapper']]:bg-white/20 [&_[data-slot='input-wrapper']]:hover:border-[var(--color-secondary-500)] [&_label]:!text-neutral-500 ${!selectedCityId ? "pointer-events-none" : ""}`}
                >
                  {thanas.map((thana) => (
                    <AutocompleteItem key={thana.id}>{thana.name}</AutocompleteItem>
                  ))}
                </Autocomplete>
              )}
            />

            {errors.thanaId && (
              <p className="text-xs font-semibold text-red-500">
                {errors.thanaId.message}
              </p>
            )}
          </div>
          <div className="w-full space-y-2 font-semibold [&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none [&_input]:[-moz-appearance:textfield]">
            <label htmlFor="postal-code">Post Code</label>
            <input
              id="postal-code"
              type="number"
              {...register("postalCode", {
                pattern: {
                  value: /^\d{4}$/,
                  message: "Postal code must contain 4 numeric digits.",
                },
                required: {
                  value: true,
                  message: "Postal code is required.",
                },
              })}
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
              placeholder="1230"
              required
            />
            {errors.postalCode && (
              <p className="text-xs font-semibold text-red-500">
                {errors.postalCode?.message}
              </p>
            )}
          </div>
        </div>
        <div className="w-full space-y-2 font-semibold">
          <label htmlFor="note">Note to Seller (If Any)</label>
          <textarea
            id="note"
            {...register("note")}
            rows={1}
            className="w-full resize-none rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 py-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
          ></textarea>
          {errors.note && (
            <p className="text-xs font-semibold text-red-500">
              {errors.note?.message}
            </p>
          )}
        </div>
        {needsChoice && (
          <div className="w-full space-y-2 font-semibold">
            <p>Select Delivery Type</p>
            <div className="payment-methods max-sm:space-y-4 sm:flex sm:gap-x-4">
              <Tooltip
                classNames={{
                  base: [
                    "max-w-[66.66dvw] min-[1200px]:max-w-[calc(((1200px*55/100)-16px-20px-20px)/2)]",
                  ],
                  content: [
                    "p-5 rounded-[4px] shadow-[1px_1px_20px_0_rgba(0,0,0,0.15)]",
                  ],
                }}
                motionProps={{
                  variants: {
                    exit: {
                      opacity: 0,
                      transition: {
                        duration: 0.3,
                        ease: "easeIn",
                      },
                    },
                    enter: {
                      opacity: 1,
                      transition: {
                        duration: 0.3,
                        ease: "easeOut",
                      },
                    },
                  },
                }}
                shouldFlip
                showArrow={true}
                content={`After confirmation, you will get the delivery within ${getEstimatedDeliveryTime(selectedCityId, "standard", shippingZones)} days.`}
              >
                <input
                  className="!h-12 before:border-2 before:!border-neutral-900 before:!bg-[#020202] before:grayscale before:invert before:backdrop-blur-2xl before:transition-all before:duration-300 before:ease-in-out checked:before:!bg-[#383804] checked:before:grayscale-0 hover:before:!border-transparent hover:before:!bg-[#383804] hover:before:grayscale-0"
                  style={{
                    "--img-url":
                      "url('/delivery-partners/standard-delivery.webp')",
                  }}
                  type="radio"
                  {...register("deliveryType", {
                    required: {
                      value: true,
                      message: "Select one of the delivery types.",
                    },
                  })}
                  id="standard"
                  value="standard"
                  required
                />
              </Tooltip>
              <Tooltip
                classNames={{
                  base: [
                    "max-w-[66.66dvw] min-[1200px]:max-w-[calc(((1200px*55/100)-16px-20px-20px)/2)]",
                  ],
                  content: [
                    "p-5 rounded-[4px] shadow-[1px_1px_20px_0_rgba(0,0,0,0.15)]",
                  ],
                }}
                motionProps={{
                  variants: {
                    exit: {
                      opacity: 0,
                      transition: {
                        duration: 0.3,
                        ease: "easeIn",
                      },
                    },
                    enter: {
                      opacity: 1,
                      transition: {
                        duration: 0.3,
                        ease: "easeOut",
                      },
                    },
                  },
                }}
                shouldFlip
                showArrow={true}
                content={`After confirmation, you will get the delivery within ${getEstimatedDeliveryTime(selectedCityId, "express", shippingZones)} hours.`}
              >
                <input
                  className="!h-12 before:border-2 before:!border-neutral-900 before:!bg-[#020202] before:grayscale before:invert before:backdrop-blur-2xl before:transition-[background-color,filter] before:duration-300 before:ease-in-out checked:before:!bg-[#383804] checked:before:grayscale-0 hover:before:!border-transparent hover:before:!bg-[#383804] hover:before:grayscale-0"
                  style={{
                    "--img-url":
                      "url('/delivery-partners/express-delivery.webp')",
                  }}
                  type="radio"
                  {...register("deliveryType", {
                    required: {
                      value: true,
                      message: "Select one of the delivery types.",
                    },
                  })}
                  id="express"
                  value="express"
                  required
                />
              </Tooltip>
            </div>
            {errors.deliveryType && (
              <p className="text-xs font-semibold text-red-500">
                {errors.deliveryType?.message}
              </p>
            )}
          </div>
        )}
        {!!selectedCityId && !!selectedDeliveryType && (
          <p className="text-xs lg:text-sm">
            After confirmation, you will get the delivery within{" "}
            {getEstimatedDeliveryTime(
              selectedCityId,
              selectedDeliveryType,
              shippingZones,
            )}{" "}
            {selectedDeliveryType === "express" ? "hours" : "days"}.
          </p>
        )}
      </div>
    </section>
  );
}
