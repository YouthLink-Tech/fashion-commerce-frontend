import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import toast from "react-hot-toast";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import FormEditorButtons from "./FormEditorButtons";

export default function DeliveryAddress({
  type,
  address,
  addressNumber,
  setUserData,
  setIsAddingNewAddress,
  cities,
  thanas,
}) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const [isEditingForm, setIsEditingForm] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nickname: "",
      address1: "",
      cityId: "",
      thanaId: "",
      postalCode: "",
    },
    mode: "onBlur",
  });

  const selectedCityId = watch("cityId");
  const thanasForSelectedCity = selectedCityId
    ? thanas.filter((t) => t.city_id === selectedCityId)
    : [];

  useEffect(() => {
    if (type === "new") {
      reset({
        nickname: "",
        address1: "",
        cityId: "",
        thanaId: "",
        postalCode: "",
      });
    } else {
      const isPrimary = address?.is_primary ?? false; // Reads is_primary
      reset({
        nickname:
          (address?.nickname || "") +
          (isPrimary
            ? (!isEditingForm && !!address?.nickname ? " " : "") +
            (isEditingForm ? "" : "(Primary)")
            : ""),
        address1: address?.address1,
        cityId: address?.thana?.city_id || "",
        thanaId: address?.thana_id || "",
        postalCode: address?.postal_code || "",
      });
    }
  }, [
    address?.address1,
    address?.thana?.city_id,
    address?.thana_id,
    address?.is_primary,
    address?.nickname,
    address?.postal_code,
    isEditingForm,
    reset,
    type,
  ]);

  useEffect(() => {
    if (!(type === "update" && !isEditingForm)) {
      const autocompleteElements = document.querySelectorAll(
        "[aria-autocomplete]",
      );

      const handleAutocompleteClick = (event) =>
        event.currentTarget.querySelector("input").focus();

      autocompleteElements.forEach((element) => {
        element
          .closest('[data-slot="base"]')
          .addEventListener("click", handleAutocompleteClick);
      });

      autocompleteElements.forEach((element) => {
        return () =>
          element
            .closest('[data-slot="base"]')
            .removeEventListener("click", handleAutocompleteClick);
      });
    }
  }, [type, isEditingForm]);

  const onSubmit = async (data) => {
    let payload;
    setIsPageLoading(true);

    if (type === "new") {
      // Payload for creating a new address
      payload = {
        nickname: data.nickname ? data.nickname.trim() : null,
        address1: data.address1.trim(),
        thana_id: data.thanaId,
        postal_code: data.postalCode.trim(),
        is_primary: false,
      };
    } else {
      if (
        (address?.nickname || "") === (data.nickname?.trim() || "") &&
        address?.address1 === data.address1?.trim() &&
        address?.thana?.city_id === data.cityId &&
        address?.thana_id === data.thanaId &&
        address?.postal_code === data.postalCode?.trim()
      ) {
        toast.error("Not saved as no changes were made.");
        setIsPageLoading(false);
        return setIsEditingForm(false);
      }

      // Payload for updating an existing address
      payload = {
        nickname: data.nickname ? data.nickname.trim() : null,
        address1: data.address1.trim(),
        thana_id: data.thanaId,
        postal_code: data.postalCode.trim(),
      };
    }

    try {
      // Atomic address endpoint (POST for new, PATCH for update)
      const result = await routeFetch(
        type === "new"
          ? "/api/customer/addresses"
          : `/api/customer/addresses/${address.id}`,
        {
          method: type === "new" ? "POST" : "PATCH",
          body: JSON.stringify(payload),
        },
      );

      if (result.ok || result.id) {
        const savedAddress = result.data || result;
        // Updates local userData.addresses array
        setUserData((prev) => ({
          ...prev,
          addresses:
            type === "new"
              ? [...(prev.addresses || []), savedAddress]
              : (prev.addresses || []).map((a) =>
                a.id === address.id ? { ...a, ...savedAddress } : a,
              ),
        }));

        toast.success(
          type === "new"
            ? "New delivery address added successfully."
            : "Delivery address updated successfully.",
        );
        router.refresh();
      } else {
        console.error(
          "UpdateError (deliveryAddress/onSubmit):",
          result.message || "Failed to update data on server.",
        );
        toast.error(result.message || "Failed to update data on server.");
      }
    } catch (error) {
      console.error(
        "UpdateError (deliveryAddress/onSubmit):",
        error.message || error,
      );
      toast.error("Failed to update data on server.");
    } finally {
      if (type === "new") setIsAddingNewAddress(false);
      setIsEditingForm(false);
      setIsPageLoading(false);
    }
  };

  const onError = (errors) => {
    const errorTypes = Object.values(errors).map((error) => error.type);

    if (errorTypes.includes("required"))
      toast.error("Please fill up the required fields.");
    else if (errorTypes.includes("pattern"))
      toast.error("Please provide valid information.");
    else toast.error("Something went wrong. Please try again.");
  };

  const handlePrimarySelection = async () => {
    setIsPageLoading(true);

    try {
      // Calls dedicated atomic PATCH primary route instead of PUT /api/user-data/:id
      const result = await routeFetch(`/api/customer/addresses/${address?.id}/primary`, {
        method: "PATCH",
      });

      if (result.ok || result.id) {
        // Updates local userData.addresses array: marks this address true, all others false
        setUserData((prev) => ({
          ...prev,
          addresses: (prev.addresses || []).map((a) => ({
            ...a,
            is_primary: a.id === address?.id,
          })),
        }));

        toast.success("Primary address updated.");
        router.refresh();
      } else {
        console.error(
          "UpdateError (deliveryAddress/primary):",
          result.message || "Failed to update data on server.",
        );
        toast.error(result.message || "Failed to update data on server.");
      }
    } catch (error) {
      console.error(
        "UpdateError (deliveryAddress/primary):",
        error.message || error || "Failed to update data on server.",
      );
      toast.error("Failed to update data on server.");
    } finally {
      setIsPageLoading(false);
    }
  };

  const handleAddressDelete = async () => {
    setIsPageLoading(true);

    try {
      // Calls dedicated atomic DELETE route instead of PUT /api/user-data/:id
      const result = await routeFetch(`/api/customer/addresses/${address?.id}`, {
        method: "DELETE",
      });

      if (result.ok || result.success) {
        // Filters out the deleted address from local userData.addresses array
        setUserData((prev) => ({
          ...prev,
          addresses: (prev.addresses || []).filter((a) => a.id !== address?.id),
        }));

        toast.success("Delivery address deleted successfully.");
        router.refresh();
      } else {
        console.error(
          "UpdateError (deliveryAddress/delete):",
          result.message || "Failed to update data on server.",
        );
        toast.error(result.message || "Failed to update data on server.");
      }
    } catch (error) {
      console.error(
        "UpdateError (deliveryAddress/delete):",
        error.message || error || "Failed to update data on server.",
      );
      toast.error("Failed to update data on server.");
    } finally {
      setIsPageLoading(false);
    }
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit, onError)}
      className="w-full space-y-4 rounded-md border-2 border-[#eeeeee] p-3.5 sm:p-5"
      id={type === "new" ? "new-adddress-form" : "update-address-form"}
    >
      <div className="flex justify-between gap-4 lg:items-center">
        <div className="flex w-full gap-2 text-base font-semibold max-lg:flex-col md:text-lg lg:items-center">
          <div className="flex items-end justify-between">
            {/* Address Number */}
            <label
              htmlFor="nickname"
              className="text-nowrap !text-[17px] lg:!text-lg"
            >
              Address #
              {`${addressNumber}${!!address?.nickname || isEditingForm || type === "new" ? ":" : ""}`}
            </label>
            {/* Form Editor Buttons (for mobile and small tablet devices) */}
            <div className="lg:hidden">
              <FormEditorButtons
                type={type}
                isEditingForm={isEditingForm}
                setIsEditingForm={setIsEditingForm}
                setIsAddingNewAddress={setIsAddingNewAddress}
                isPrimary={address?.is_primary}
                handlePrimarySelection={handlePrimarySelection}
                handleAddressDelete={handleAddressDelete}
              />
            </div>
          </div>
          {/* Address Nickname */}
          <input
            id="nickname"
            type="text"
            readOnly={type === "update" && !isEditingForm}
            {...register("nickname")}
            className="!text-[17px] lg:!text-lg"
            placeholder={
              type === "update" && !isEditingForm ? "" : "Address nickname"
            }
            autoComplete="off"
          />
        </div>
        {/* Form Editor Buttons (for large tablets and desktop devices) */}
        <div className="max-lg:hidden">
          <FormEditorButtons
            type={type}
            isEditingForm={isEditingForm}
            setIsEditingForm={setIsEditingForm}
            setIsAddingNewAddress={setIsAddingNewAddress}
            isPrimary={address?.is_primary}
            handlePrimarySelection={handlePrimarySelection}
            handleAddressDelete={handleAddressDelete}
          />
        </div>
      </div>
      <div className="space-y-8 max-lg:space-y-4">
        <div className="max-lg:space-y-4 lg:flex lg:gap-x-10">
          {/* Detailed Address Input with Label */}
          <div className="w-full space-y-2 font-semibold">
            <label htmlFor="address-one">Detailed Address</label>
            <input
              id="address-one"
              type="text"
              readOnly={type === "update" && !isEditingForm}
              placeholder="House 13, Road 10, Block A"
              {...register("address1", {
                required: {
                  value: true,
                  message: "Detailed Address is required.",
                },
              })}
            />
            {errors.address1 && (
              <p className="text-xs font-semibold text-red-500">
                {errors.address1?.message}
              </p>
            )}
          </div>
        </div>
        <div className="max-lg:space-y-4 lg:flex lg:gap-x-10">
          {/* City Input with Label */}
          <div className="w-full space-y-2 font-semibold">
            <Controller
              name="cityId"
              control={control}
              rules={{ required: "City is required." }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  isReadOnly={type === "update" && !isEditingForm}
                  isDisabled={type === "update" && !isEditingForm}
                  labelPlacement="outside"
                  label="City"
                  placeholder="Select city"
                  size="sm"
                  variant="bordered"
                  selectedKey={value}
                  onSelectionChange={(key) => {
                    onChange(key);
                    if (key !== value) {
                      setValue("thanaId", "", { shouldValidate: false });
                    }
                  }}
                  className="select-with-search w-full [&:has(input:focus)_[data-slot='input-wrapper']]:border-[var(--color-secondary-500)] [&:has(input:focus)_[data-slot='input-wrapper']]:bg-white/75 [&>div]:opacity-100 [&_[data-slot='input-wrapper']]:rounded-[4px] [&_[data-slot='input-wrapper']]:bg-white/20 [&_[data-slot='input-wrapper']]:shadow-none [&_[data-slot='input-wrapper']]:backdrop-blur-2xl [&_[data-slot='input-wrapper']]:backdrop-opacity-100 [&_[data-slot='input-wrapper']]:hover:border-[var(--color-secondary-500)] [&_label]:!text-neutral-500"
                >
                  {cities.map((city) => (
                    <AutocompleteItem key={city.id}>{city.name}</AutocompleteItem>
                  ))}
                </Autocomplete>
              )}
            />
            {errors.cityId && (
              <p className="text-xs font-semibold text-red-500">
                {errors.cityId?.message}
              </p>
            )}
          </div>
          <div className="w-full space-y-2 font-semibold">
            <Controller
              name="thanaId"
              control={control}
              rules={{
                required: selectedCityId ? "Thana is required." : false,
              }}
              render={({ field: { onChange, value } }) => (
                <Autocomplete
                  isReadOnly={type === "update" && !isEditingForm}
                  isDisabled={
                    (type === "update" && !isEditingForm) || !selectedCityId
                  }
                  isRequired={!!selectedCityId}
                  labelPlacement="outside"
                  label="Thana"
                  placeholder={selectedCityId ? "Select thana" : "Select city first"}
                  size="sm"
                  variant="bordered"
                  selectedKey={value}
                  onSelectionChange={onChange}
                  className={`select-with-search w-full [&:has(input:focus)_[data-slot='input-wrapper']]:border-[var(--color-secondary-500)] [&:has(input:focus)_[data-slot='input-wrapper']]:bg-white/75 [&>div]:opacity-100 [&_[data-slot='input-wrapper']]:rounded-[4px] [&_[data-slot='input-wrapper']]:bg-white/20 [&_[data-slot='input-wrapper']]:shadow-none [&_[data-slot='input-wrapper']]:backdrop-blur-2xl [&_[data-slot='input-wrapper']]:backdrop-opacity-100 [&_[data-slot='input-wrapper']]:hover:border-[var(--color-secondary-500)] [&_label]:!text-neutral-500 
                    ${!selectedCityId ? "pointer-events-none" : ""}`}
                >
                  {thanasForSelectedCity.map((thana) => (
                    <AutocompleteItem key={thana.id}>{thana.name}</AutocompleteItem>
                  ))}
                </Autocomplete>
              )}
            />
            {errors.thanaId && (
              <p className="text-xs font-semibold text-red-500">
                {errors.thanaId?.message}
              </p>
            )}
          </div>
          {/* Postal Code Input with Label */}
          <div className="w-full space-y-2 font-semibold [&_input::-webkit-inner-spin-button]:appearance-none [&_input::-webkit-outer-spin-button]:appearance-none [&_input]:[-moz-appearance:textfield]">
            <label htmlFor="postal-code">Postal Code</label>
            <input
              id="postal-code"
              type="number"
              readOnly={type === "update" && !isEditingForm}
              placeholder="1230"
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
            />
            {errors.postalCode && (
              <p className="text-xs font-semibold text-red-500">
                {errors.postalCode?.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </form>
  );
}
