"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useFieldArray, useForm } from "react-hook-form";
import OrderCard from "./OrderCard";
import TrackOrderModal from "./TrackOrderModal";
import ReturnOrderModal from "./ReturnOrderModal";
import ReturnInfoModal from "./ReturnInfoModal";

export default function OrderHistory({
  orders,
  orderToTrack,
  legalPolicyPdfLinks,
}) {
  const router = useRouter();
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(!!orderToTrack);
  const [activeTrackOrder, setActiveTrackOrder] = useState(orderToTrack);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReturnInfoModalOpen, setIsReturnInfoModalOpen] = useState(false);
  const [activeReturnOrder, setActiveReturnOrder] = useState(null);

  const {
    register,
    watch,
    control,
    handleSubmit,
    setValue,
    reset,
    trigger,
    formState: { errors },
  } = useForm({
    defaultValues: {
      items: [],
      description: "",
      images: [],
    },
    mode: "onBlur",
  });

  useFieldArray({
    control,
    name: "items",
  });

  useEffect(() => {
    router.replace("/user/orders", undefined, {
      shallow: true,
      scroll: false,
    });
  }, [router]);

  console.log(activeReturnOrder, "activeReturnOrder");

  return (
    <section className="grow auto-rows-max rounded-md border-2 border-neutral-50/20 bg-white/60 p-3.5 shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur-2xl xl:p-5 [&_img]:pointer-events-none">
      <h1 className="mb-5 text-lg font-bold uppercase md:text-xl">
        Order History
      </h1>
      <div className="max-xl:space-y-4 xl:grid xl:grid-cols-2 xl:gap-4">
        {orders.map((order) => {
          return (
            <OrderCard
              key={order?.id}
              order={order}
              setValue={setValue}
              setIsTrackModalOpen={setIsTrackModalOpen}
              setActiveTrackOrder={setActiveTrackOrder}
              setIsReturnModalOpen={setIsReturnModalOpen}
              setIsReturnInfoModalOpen={setIsReturnInfoModalOpen}
              setActiveReturnOrder={setActiveReturnOrder}
            />
          );
        })}
        <TrackOrderModal
          isTrackModalOpen={isTrackModalOpen}
          setIsTrackModalOpen={setIsTrackModalOpen}
          activeTrackOrder={activeTrackOrder}
        />
        <ReturnOrderModal
          isReturnModalOpen={isReturnModalOpen}
          setIsReturnModalOpen={setIsReturnModalOpen}
          activeReturnOrder={activeReturnOrder}
          legalPolicyPdfLinks={legalPolicyPdfLinks}
          register={register}
          watch={watch}
          control={control}
          handleSubmit={handleSubmit}
          setValue={setValue}
          reset={reset}
          trigger={trigger}
          errors={errors}
        />
        <ReturnInfoModal
          isReturnInfoModalOpen={isReturnInfoModalOpen}
          setIsReturnInfoModalOpen={setIsReturnInfoModalOpen}
          activeReturnOrder={activeReturnOrder}
        />
      </div>
    </section>
  );
}
