import { Controller } from "react-hook-form";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";

export default function CheckoutPersonalInfo({
  register,
  control,
  errors,
  isUserLoggedIn,
  userHometown,
  cities,
}) {
  return (
    <section className="w-full space-y-4 rounded-md border-2 border-neutral-50/20 bg-white/40 p-5 shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur-2xl transition-[height] duration-300 ease-in-out">
      <h2 className="text-base font-semibold md:text-lg">
        Personal Information
      </h2>
      <div className="space-y-4 read-only:[&_input]:border-0 read-only:[&_input]:bg-neutral-50 read-only:[&_input]:text-neutral-400">
        {!!isUserLoggedIn && (
          <div className="max-sm:space-y-4 sm:flex sm:gap-x-4">
            <div className="w-full space-y-2 font-semibold">
              <label htmlFor="name">Full Name</label>
              <input
                id="name"
                {...register("name", {
                  readOnly: true,
                  required: {
                    value: true,
                    message: "Name is required.",
                  },
                })}
                className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
                readOnly
                required
              />
              {errors.name && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.name?.message}
                </p>
              )}
            </div>
            <div className="w-full space-y-2 font-semibold">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                {...register("email", {
                  readOnly: true,
                  required: {
                    value: true,
                    message: "Email is required.",
                  },
                })}
                className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
                readOnly
                required
              />
              {errors.email && (
                <p className="text-xs font-semibold text-red-500">
                  {errors.email?.message}
                </p>
              )}
            </div>
          </div>
        )}
        <div className="max-sm:space-y-4 sm:flex sm:gap-x-4">
          <div className="w-full space-y-2 font-semibold">
            <label htmlFor="primary-mobile">Mobile Number</label>
            <input
              id="primary-mobile"
              type="tel"
              {...register("phoneNumber", {
                pattern: {
                  value: /^01\d{9}$/,
                  message: "Mobile number is invalid.",
                },
                required: {
                  value: true,
                  message: "Primary mobile number is required.",
                },
              })}
              onInput={(event) =>
                (event.target.value = event.target.value.replace(/\D/g, ""))
              }
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
              placeholder="01XXXXXXXXX"
              required
            />
            {errors.phoneNumber && (
              <p className="text-xs font-semibold text-red-500">
                {errors.phoneNumber?.message}
              </p>
            )}
          </div>
          <div className="w-full space-y-2 font-semibold">
            <label htmlFor="alt-mobile">Alternative Mobile Number</label>
            <input
              id="alt-mobile"
              type="tel"
              {...register("altPhoneNumber", {
                pattern: {
                  value: /^01\d{9}$/,
                  message: "Mobile number is invalid.",
                },
              })}
              onInput={(event) =>
                (event.target.value = event.target.value.replace(/\D/g, ""))
              }
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
              placeholder="01XXXXXXXXX"
            />
            {errors.altPhoneNumber && (
              <p className="text-xs font-semibold text-red-500">
                {errors.altPhoneNumber?.message}
              </p>
            )}
          </div>
        </div>
        {!userHometown && (
          <div className="w-full space-y-2 font-semibold sm:w-[calc(50%-0.5rem)]">
            <Controller
              name="hometownId"
              control={control}
              rules={{
                required: "Hometown is required.",
              }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  isRequired
                  labelPlacement="outside"
                  label="Hometown"
                  placeholder="Select hometown"
                  size="sm"
                  variant="bordered"
                  selectedKey={value}
                  onSelectionChange={onChange}
                  isDisabled={!!userHometown}
                  className="select-with-search [&:has(input:disabled)_input]:px-4 [&:has(input:focus)_[data-slot='input-wrapper']]:border-[var(--color-secondary-500)] [&_[data-disabled='true']]:opacity-100 [&_[data-disabled='true']_[data-slot='inner-wrapper']]:opacity-50 [&_[data-slot='inner-wrapper']]:transition-opacity [&_[data-slot='inner-wrapper']]:duration-300 [&_[data-slot='inner-wrapper']]:ease-in-out [&_[data-slot='input-wrapper']]:rounded-[4px] [&_[data-slot='input-wrapper']]:bg-white/20 [&_[data-slot='input-wrapper']]:hover:border-[var(--color-secondary-500)] [&_label]:!text-neutral-500"
                >
                  {cities.map((hometown) => {
                    return (
                      <AutocompleteItem key={hometown.id}>
                        {hometown.name}
                      </AutocompleteItem>
                    );
                  })}
                </Autocomplete>
              )}
            />
            {errors.hometownId && (
              <p className="text-xs font-semibold text-red-500">
                {errors.hometownId?.message}
              </p>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
