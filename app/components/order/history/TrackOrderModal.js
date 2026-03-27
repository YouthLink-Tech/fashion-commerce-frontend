import Image from "next/image";
import Link from "next/link";
import { Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { LuBox } from "react-icons/lu";
import { IoCheckmarkCircle } from "react-icons/io5";
import TrackingCode from "../TrackingCode";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function TrackOrderModal({
  isTrackModalOpen,
  setIsTrackModalOpen,
  activeTrackOrder,
}) {
  const { orderStatus, deliveryInfo, shipmentInfo } = activeTrackOrder || {};

  const getUpdatedOrderStatus = () => {
    switch (orderStatus) {
      case "Pending":
        return "Processing";
      case "Processing":
        return "Confirmed";
      case "Shipped":
        return "On Its Way";
      default:
        return orderStatus;
    }
  };

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
                    className={`relative flex size-full items-center justify-center text-[#60d251] after:absolute after:right-[2px] after:top-1/2 after:h-0.5 after:w-[calc(50%-24px/2)] after:-translate-y-1/2 after:border-t-[2px] after:border-dotted after:content-[''] ${orderStatus === "Shipped" || orderStatus === "On Hold" ? "after:border-[#60d251]" : "after:border-neutral-400"}`}
                  >
                    {orderStatus === "Pending" ||
                      orderStatus === "Processing" ||
                      orderStatus === "Shipped" ||
                      orderStatus === "On Hold" ||
                      orderStatus === "Delivered" ? (
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
                    className={`relative flex size-full items-center justify-center text-[#60d251] before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-[calc(50%-24px/2)] before:-translate-y-1/2 before:border-t-[2px] before:border-dotted before:border-[#60d251] before:content-[''] after:absolute after:right-[2px] after:top-1/2 after:h-0.5 after:w-[calc(50%-24px/2)] after:-translate-y-1/2 after:border-t-[2px] after:border-dotted after:border-[#60d251] after:content-[''] ${orderStatus === "Shipped" || orderStatus === "On Hold" ? "before:border-[#60d251]" : "before:border-neutral-400"} ${orderStatus === "Delivered" ? "after:border-[#60d251]" : "after:border-neutral-400"}`}
                  >
                    {orderStatus === "Shipped" ||
                      orderStatus === "On Hold" ||
                      orderStatus === "Delivered" ? (
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
                    className={`relative flex size-full items-center justify-center text-[#60d251] before:absolute before:left-0 before:top-1/2 before:h-0.5 before:w-[calc(50%-24px/2)] before:-translate-y-1/2 before:border-t-[2px] before:border-dotted before:border-[#60d251] before:content-[''] ${orderStatus === "Delivered" ? "before:border-[#60d251]" : "before:border-neutral-400"}`}
                  >
                    {orderStatus === "Delivered" ? (
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
                    {deliveryInfo?.expectedDeliveryDate || "--"}
                  </p>
                </div>
                <TrackingCode trackingCode={shipmentInfo?.trackingNumber} />
              </div>
              {!!shipmentInfo?.trackingNumber && !!shipmentInfo?.imageUrl && (
                <Image
                  // src={shipmentInfo?.imageUrl}
                  src={getImage(shipmentInfo?.imageUrl, 500)}
                  alt={shipmentInfo?.selectedShipmentHandlerName}
                  width={0}
                  height={0}
                  className="mx-auto !mt-9 flex h-12 w-fit select-none object-contain"
                  sizes="75vw"
                />
              )}
              {!!shipmentInfo?.trackingNumber && (
                <a
                  href={
                    `${shipmentInfo?.trackingUrl}${shipmentInfo?.trackingNumber}` ||
                    "#"
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
