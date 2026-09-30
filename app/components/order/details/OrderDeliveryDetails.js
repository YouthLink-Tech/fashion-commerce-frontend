import formatExpectedDeliveryDate from "@/app/utils/formatExpectedDeliveryDate";
import { formatIsoDateTime } from "@/app/utils/formatIsoDateTime";

export default function OrderDeliveryDetails({ order }) {

  const fullAddress = [
    order?.delivery_address1?.trim(),
    order?.thana?.name?.trim(),
    order?.thana?.city?.name?.trim(),
    order?.delivery_postal_code?.trim(),
  ]
    .filter(Boolean)
    .join(", ");

  const capitalizeFirstLetter = (text) => {
    if (!text || typeof text !== "string") return "--";
    return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
  };

  return (
    <div className="mb-4 h-fit w-full rounded-[4px] border-2 border-neutral-200 p-3.5 text-sm xl:p-5">
      <h2 className="mb-3 text-sm font-semibold md:text-base">
        Delivery Details
      </h2>
      <div className="space-y-1 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 sm:[&>div]:gap-10 xl:[&>div]:gap-20 [&_h4]:font-semibold sm:[&_h4]:text-nowrap">
        <div>
          <h4>Address</h4>
          <p className="text-right">{fullAddress || "--"}</p>
        </div>
        <div>
          <h4>Delivery Method</h4>
          <p className="text-right">
            {capitalizeFirstLetter(order?.delivery_method)}
          </p>
        </div>
        <div>
          <h4>Note to Seller</h4>
          <p className="text-right">
            {!order?.delivery_note_to_seller
              ? "--"
              : `"${order.delivery_note_to_seller}"`}
          </p>
        </div>
        <div>
          <h4>
            {!order?.delivered_at ? "Delivery Expected at" : "Delivered at"}
          </h4>
          <p className="text-right">
            {!order?.delivered_at
              ? formatExpectedDeliveryDate(order?.expected_delivery_date)
              : `${formatIsoDateTime(order?.delivered_at)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
