import { formatIsoDateTime } from "@/app/utils/formatIsoDateTime";
import TrackingCode from "../TrackingCode";

export default function OrderShipmentDetails({ shipment, isDeliveryDone }) {
  return (
    <div className="mb-4 h-fit w-full rounded-[4px] border-2 border-neutral-200 p-3.5 text-sm xl:p-5">
      <h2 className="mb-3 text-sm font-semibold md:text-base">
        Shipment Details
      </h2>
      <div className="space-y-1 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 sm:[&>div]:gap-10 xl:[&>div]:gap-20 [&_h4]:font-semibold sm:[&_h4]:text-nowrap">
        <div>
          <h4>Courier</h4>
          <p className="text-right">
            {shipment?.shipmentHandler?.name || "--"}
          </p>
        </div>
        <div>
          <h4>Shipped at</h4>
          <p className="text-right">
            {shipment?.shipped_at
              ? formatIsoDateTime(shipment?.shipped_at)
              : "--"}
          </p>
        </div>
        {!!shipment?.tracking_number && !isDeliveryDone && (
          <TrackingCode trackingCode={shipment?.tracking_number} />
        )}
      </div>
    </div>
  );
}
