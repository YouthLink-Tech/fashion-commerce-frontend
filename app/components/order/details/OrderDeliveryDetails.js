import { formatIsoDateTime } from "@/app/utils/formatIsoDateTime";

export default function OrderDeliveryDetails({ delivery }) {
  const fullAddress = [
    delivery?.address1?.trim(),
    delivery?.thana?.trim(),
    delivery?.city?.trim(),
    delivery?.postalCode?.trim()
  ].filter(Boolean).join(", ");

  const capitalizeFirstLetter = (text) => {
    return text?.charAt(0)?.toUpperCase() + text?.slice(1)?.toLowerCase();
  };

  return (
    <div className="mb-4 h-fit w-full rounded-[4px] border-2 border-neutral-200 p-3.5 text-sm xl:p-5">
      <h2 className="mb-3 text-sm font-semibold md:text-base">
        Delivery Details
      </h2>
      <div className="space-y-1 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 sm:[&>div]:gap-10 xl:[&>div]:gap-20 [&_h4]:font-semibold sm:[&_h4]:text-nowrap">
        <div>
          <h4>Address</h4>
          <p className="text-right">{fullAddress}</p>
        </div>
        <div>
          <h4>Delivery Method</h4>
          <p className="text-right">
            {capitalizeFirstLetter(delivery?.deliveryMethod)}
          </p>
        </div>
        <div>
          <h4>Note to Seller</h4>
          <p className="text-right">
            {!delivery?.noteToSeller ? "--" : `"${delivery.noteToSeller}"`}
          </p>
        </div>
        <div>
          <h4>
            {!delivery?.deliveredAt ? "Delivery Expected at" : "Delivered at"}
          </h4>
          <p className="text-right">
            {!delivery?.deliveredAt
              ? delivery?.expectedDeliveryDate || "--"
              : `${formatIsoDateTime(delivery?.deliveredAt)}`}
          </p>
        </div>
      </div>
    </div>
  );
}
