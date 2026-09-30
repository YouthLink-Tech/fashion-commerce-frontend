import Image from "next/image";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { LuBox } from "react-icons/lu";
import { IoCheckmarkCircle } from "react-icons/io5";
import TrackingCode from "../TrackingCode";
import { getImage } from "@/app/lib/cloudinaryUtils";
import formatExpectedDeliveryDate from "@/app/utils/formatExpectedDeliveryDate";

export default function TrackOrderModal({
  isTrackModalOpen,
  setIsTrackModalOpen,
  activeTrackOrder,
}) {
  const { order_status, expected_delivery_date, shipment } = activeTrackOrder || {};

  const getUpdatedOrderStatus = () => {
    switch (order_status) {
      case "pending":
        return "Processing";
      case "processing":
        return "Confirmed";
      case "shipped":
        return "On Its Way";
      case "on_hold":
        return "On Hold";
      case "delivered":
        return "Delivered";
      default:
        return order_status || "--";
    }
  };

  const formattedExpectedDelivery = formatExpectedDeliveryDate(expected_delivery_date);

  const trackingNumber = shipment?.tracking_number;
  const trackingUrl =
    shipment?.tracking_url || shipment?.shipmentHandler?.tracking_url;
  const handlerName = shipment?.shipmentHandler?.name || "Courier";
  const handlerImgUrl =
    shipment?.shipmentHandler?.media?.url || shipment?.image_url;

  return (
    <Modal
      isOpen={isTrackModalOpen}
      onOpenChange={setIsTrackModalOpen}
      size="xl"
      className="rounded-md"
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader className="uppercase">
              Track Order Overview
            </ModalHeader>
            <ModalBody className="space-y-5 py-6">
              <div className="grid grid-cols-3">
                <div className="flex flex-col items-center [&>div]:mt-3 [&>p]:mt-1.5">
                  <Image
                    src="/order-tracking/processing.svg"
                    alt="Processing"
                    width={52}
                    height={52}
                  />
                  <div
                    className={`relative flex size-full items-center justify-center text-[#60d251] after:absolute after:right-[2px] after:top-1/2 after:h-0.5 after:w-[calc(50%-24px/2)] after:-translate-y-1/2 after:border-t-[2px] after:border-dotted after:content-[''] ${order_status === "shipped" || order_status === "on_hold" ? "after:border-[#60d251]" : "after:border-neutral-400"}`}
                  >
                    {[
                      "pending",
                      "processing",
                      "shipped",
                      "on_hold",
                      "delivered",
                    ].includes(order_status) ? (
                      <IoCheckmarkCircle className="size-6" />
                    ) : (
                      <div className="size-4 rounded-full ring-2 ring-neutral-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold">Processing</p>
                </div>
                <div className="flex flex-col items-center [&>div]:mt-3 [&>p]:mt-1.5">
                  <Image
                    src="/order-tracking/shipped.svg"
                    alt="Shipped"
                    width={52}
                    height={52}
                  />
                  <div
                    className={`relative flex size-full items-center justify-center text-[#60d251] before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-[calc(50%-24px/2)] before:-translate-y-1/2 before:border-t-[2px] before:border-dotted before:border-[#60d251] before:content-[''] after:absolute after:right-[2px] after:top-1/2 after:h-0.5 after:w-[calc(50%-24px/2)] after:-translate-y-1/2 after:border-t-[2px] after:border-dotted after:border-[#60d251] after:content-[''] ${order_status === "shipped" || order_status === "on_hold" ? "before:border-[#60d251]" : "before:border-neutral-400"} ${order_status === "delivered" ? "after:border-[#60d251]" : "after:border-neutral-400"}`}
                  >
                    {["shipped", "on_hold", "delivered"].includes(
                      order_status,
                    ) ? (
                      <IoCheckmarkCircle className="size-6" />
                    ) : (
                      <div className="size-4 rounded-full ring-2 ring-neutral-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold">In Transit</p>
                </div>
                <div className="flex flex-col items-center [&>div]:mt-3 [&>p]:mt-1.5">
                  <Image
                    src="/order-tracking/delivered.svg"
                    alt="Delivered"
                    width={52}
                    height={52}
                  />
                  <div
                    className={`relative flex size-full items-center justify-center text-[#60d251] before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-[calc(50%-24px/2)] before:-translate-y-1/2 before:border-t-[2px] before:border-dotted before:border-[#60d251] before:content-[''] ${order_status === "delivered" ? "before:border-[#60d251]" : "before:border-neutral-400"}`}
                  >
                    {order_status === "delivered" ? (
                      <IoCheckmarkCircle className="size-6" />
                    ) : (
                      <div className="size-4 rounded-full ring-2 ring-neutral-400" />
                    )}
                  </div>
                  <p className="text-xs font-semibold">Delivered</p>
                </div>
              </div>
              <div className="space-y-3 rounded-[4px] border-2 border-neutral-200 p-3 text-sm sm:px-5 sm:py-4 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 sm:[&>div]:gap-10 xl:[&>div]:gap-20 [&_h4]:font-semibold [&_h4]:text-neutral-600 sm:[&_h4]:text-nowrap">
                <div>
                  <h4>Current Status</h4>
                  <p className="text-right">{getUpdatedOrderStatus()}</p>
                </div>
                <div>
                  <h4>Expected Delivery</h4>
                  <p className="text-right">
                    {formattedExpectedDelivery}
                  </p>
                </div>
                <TrackingCode trackingCode={trackingNumber} />
              </div>
              {!!trackingNumber && !!handlerImgUrl && (
                <Image
                  src={getImage(handlerImgUrl, 500)}
                  alt={handlerName}
                  width={0}
                  height={0}
                  className="mx-auto !mt-9 flex h-12 w-fit select-none object-contain"
                  sizes="75vw"
                />
              )}
              {!!trackingNumber && (
                <a
                  href={
                    trackingUrl ? `${trackingUrl}${trackingNumber}` : "#"
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mx-auto !mt-3 mb-9 flex w-fit items-center gap-2 rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-center text-sm font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
                >
                  Track Your Package
                  <LuBox size={17} />
                </a>
              )}
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
