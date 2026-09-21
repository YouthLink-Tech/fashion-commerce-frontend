"use client";

import { useEffect, useState } from "react";
import { RiAddLine, RiMapPinFill } from "react-icons/ri";
import DeliveryAddress from "./DeliveryAddress";

export default function DeliveryAddresses({ serverUserData, userEmail, cities, thanas }) {
  const [userData, setUserData] = useState(serverUserData || {});
  const deliveryAddresses = userData?.addresses || [];
  const [isAddingNewAddress, setIsAddingNewAddress] = useState(false);

  // Syncs local state when server data updates (e.g. after router.refresh())
  useEffect(() => {
    if (serverUserData) {
      setUserData(serverUserData);
    }
  }, [serverUserData]);

  useEffect(() => {
    const newAddressForm = document.getElementById("new-adddress-form");

    if (isAddingNewAddress && newAddressForm)
      newAddressForm.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
  }, [isAddingNewAddress]);

  return (
    <section className="w-full space-y-4 rounded-[4px] border-2 border-[#eeeeee] p-3.5 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-[17px] font-semibold uppercase sm:text-lg md:text-xl">
          Delivery Address
        </h2>
        <button
          className="flex items-center gap-1.5 rounded-[4px] bg-[var(--color-primary-500)] p-2.5 text-xs font-semibold text-neutral-700 transition-[transform,color,background-color] duration-300 ease-in-out hover:bg-[var(--color-primary-700)] max-md:[&_p]:hidden max-md:[&_svg]:size-4"
          onClick={() => setIsAddingNewAddress(true)}
        >
          <RiAddLine className="text-base" />
          <p>Add</p>
        </button>
      </div>
      {!deliveryAddresses?.length ? (
        <div
          className={`!mt-7 [&>*]:mx-auto [&>*]:w-fit ${isAddingNewAddress ? "hidden" : ""}`}
        >
          <RiMapPinFill className="size-20 text-[var(--color-secondary-500)]" />
          <p className="mt-3 text-neutral-500">
            You have not given any address yet.
          </p>
          <button
            onClick={() => setIsAddingNewAddress(true)}
            className="mt-5 block rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-center text-sm font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
          >
            Add Your Address
          </button>
        </div>
      ) : (
        deliveryAddresses.map((address, addressIndex) => {
          return (
            <DeliveryAddress
              key={address.id}
              type="update"
              address={address}
              addressNumber={addressIndex + 1}
              setUserData={setUserData}
              setIsAddingNewAddress={setIsAddingNewAddress}
              cities={cities}
              thanas={thanas}
            />
          );
        })
      )}
      {isAddingNewAddress && (
        <DeliveryAddress
          type="new"
          addressNumber={deliveryAddresses.length + 1}
          userData={userData}
          userEmail={userEmail}
          setUserData={setUserData}
          setIsAddingNewAddress={setIsAddingNewAddress}
          cities={cities}
          thanas={thanas}
        />
      )}
    </section>
  );
}
