import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { Autocomplete, AutocompleteItem } from "@nextui-org/react";
import toast from "react-hot-toast";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import FormEditorButtons from "./FormEditorButtons";
import { cities } from "@/app/data/cities";

export default function DeliveryAddress({
  type,
  address,
  addressNumber,
  userData,
  userEmail,
  setUserData,
  setIsAddingNewAddress,
  isAddressListEmpty,
}) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();
  const [isEditingForm, setIsEditingForm] = useState(false);
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nickname: "",
      address1: "",
      city: "",
      thana: "",
      postalCode: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    if (type === "new") {
      reset({
        nickname: "",
        address1: "",
        city: "",
        thana: "",
        postalCode: "",
      });
    } else {
      reset({
        nickname:
          (address?.nickname || "") +
          (address?.isPrimary
            ? (!isEditingForm && !!address?.nickname ? " " : "") +
            (isEditingForm ? "" : "(Primary)")
            : ""),
        address1: address?.address1,
        city: address?.city,
        thana: address?.thana,
        postalCode: address?.postalCode,
      });
    }
  }, [
    address?.address1,
    address?.city,
    address?.thana,
    address?.isPrimary,
    address?.nickname,
    address?.postalCode,
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
    let updatedUserData;
    setIsPageLoading(true);

    if (type === "new") {
      updatedUserData = {
        ...userData,
        userInfo: {
          ...userData.userInfo,
          deliveryAddresses: [
            ...userData.userInfo.deliveryAddresses,
            {
              id: `${userEmail}-${Date.now()}-${Math.random().toString(16).slice(2)}`,
              nickname: data.nickname,
              address1: data.address1,
              city: data.city,
              thana: data.thana,
              postalCode: data.postalCode,
              isPrimary: isAddressListEmpty,
            },
          ],
        },
      };
    } else {
      if (
        address?.nickname === data.nickname &&
        address?.address1 === data.address1 &&
        address?.city === data.city &&
        address?.thana === data.thana &&
        address?.postalCode === data.postalCode
      ) {
        toast.error("Not saved as no changes were made.");
        setIsPageLoading(false);
        return setIsEditingForm(false);
      }

      updatedUserData = {
        ...userData,
        userInfo: {
          ...userData.userInfo,
          deliveryAddresses: userData.userInfo.deliveryAddresses.map(
            (availableAddress) =>
              availableAddress.id === address?.id
                ? {
                  ...availableAddress,
                  nickname: data.nickname,
                  address1: data.address1,
                  city: data.city,
                  thana: data.thana,
                  postalCode: data.postalCode,
                }
                : availableAddress,
          ),
        },
      };
    }

    setUserData(updatedUserData);

    try {
      const result = await routeFetch(`/api/user-data/${userData?._id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUserData),
      });

      if (result.ok) {
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
    }

    if (type === "new") setIsAddingNewAddress(false);
    setIsEditingForm(false);
    setIsPageLoading(false);
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

    const updatedUserData = {
      ...userData,
      userInfo: {
        ...userData.userInfo,
        deliveryAddresses: userData.userInfo.deliveryAddresses.map(
          (availableAddress) => ({
            ...availableAddress,
            isPrimary: availableAddress.id === address?.id ? true : false,
          }),
        ),
      },
    };

    setUserData(updatedUserData);

    try {
      const result = await routeFetch(`/api/user-data/${userData?._id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUserData),
      });

      if (result.ok) {
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
        result.message || "Failed to update data on server.",
      );
      toast.error(result.message || "Failed to update data on server.");
    }

    setIsPageLoading(false);
  };

  const handleAddressDelete = async () => {
    setIsPageLoading(true);

    const updatedUserData = {
      ...userData,
      userInfo: {
        ...userData.userInfo,
        deliveryAddresses: userData.userInfo.deliveryAddresses.filter(
          (availableAddress) => availableAddress.id !== address?.id,
        ),
      },
    };

    setUserData(updatedUserData);

    try {
      const result = await routeFetch(`/api/user-data/${userData?._id}`, {
        method: "PUT",
        body: JSON.stringify(updatedUserData),
      });

      if (result.ok) {
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
        result.message || "Failed to update data on server.",
      );
      toast.error(result.message || "Failed to update data on server.");
    }

    setIsPageLoading(false);
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
                isPrimary={address?.isPrimary}
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
            isPrimary={address?.isPrimary}
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
              name="city"
              control={control}
              rules={{
                required: "City is required.",
              }}
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
                  onSelectionChange={onChange}
                  className="select-with-search w-full [&:has(input:focus)_[data-slot='input-wrapper']]:border-[var(--color-secondary-500)] [&:has(input:focus)_[data-slot='input-wrapper']]:bg-white/75 [&>div]:opacity-100 [&_[data-slot='input-wrapper']]:rounded-[4px] [&_[data-slot='input-wrapper']]:bg-white/20 [&_[data-slot='input-wrapper']]:shadow-none [&_[data-slot='input-wrapper']]:backdrop-blur-2xl [&_[data-slot='input-wrapper']]:backdrop-opacity-100 [&_[data-slot='input-wrapper']]:hover:border-[var(--color-secondary-500)] [&_label]:!text-neutral-500"
                >
                  {cities.map((city) => {
                    return (
                      <AutocompleteItem key={city}>{city}</AutocompleteItem>
                    );
                  })}
                </Autocomplete>
              )}
            />
            {errors.city && (
              <p className="text-xs font-semibold text-red-500">
                {errors.city?.message}
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
