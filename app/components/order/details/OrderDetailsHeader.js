import getOrderStatusWithColor from "@/app/utils/getOrderStatusColor";
import formatOrderDateTime from "@/app/utils/formatOrderDateTime";

export default function OrderDetailsHeader({ order }) {
  const orderStatus = getOrderStatusWithColor(order?.order_status);
  const {
    orderMonthFirstThreeLetters,
    orderMonthRestOfLetters,
    orderDayAndYear,
    orderTime,
  } = formatOrderDateTime(order?.placed_at);

  return (
    <div className="mb-7 items-start justify-between gap-2 max-sm:space-y-2 sm:flex">
      <div>
        <h1 className="mb-1 text-lg font-bold md:text-xl">
          Order #{order?.order_number}
        </h1>
        <p className="text-xs lg:text-[13px]">
          {orderMonthFirstThreeLetters}
          <span className="max-sm:hidden">{orderMonthRestOfLetters}</span>
          {" " + orderDayAndYear}, {orderTime}
        </p>
      </div>
      <div
        className={`h-fit w-fit cursor-default text-nowrap rounded-[3px] px-3 py-2 text-xs font-semibold max-sm:ml-auto ${orderStatus?.bgColor} ${orderStatus?.textColor}`}
      >
        {orderStatus?.text}
      </div>
    </div>
  );
}
