import { LuFileText, LuTruck } from "react-icons/lu";
import { IoReturnDownBack } from "react-icons/io5";
import getOrderStatusWithColor from "@/app/utils/getOrderStatusColor";
import formatOrderDateTime from "@/app/utils/formatOrderDateTime";
import isOrderReturnable from "@/app/utils/isOrderReturnable";
import TransitionLink from "@/app/components/ui/TransitionLink";

export default function OrderCard({
  order,
  setValue,
  setIsTrackModalOpen,
  setActiveTrackOrder,
  setIsReturnModalOpen,
  setIsReturnInfoModalOpen,
  setActiveReturnOrder,
}) {
  const orderStatus = getOrderStatusWithColor(order?.order_status);
  const {
    orderMonthFirstThreeLetters,
    orderMonthRestOfLetters,
    orderDayAndYear,
    orderTime,
  } = formatOrderDateTime(order?.placed_at);

  const isOrderTrackable =
    orderStatus?.text == "Processing" ||
    orderStatus?.text == "Confirmed" ||
    orderStatus?.text == "On Its Way" ||
    orderStatus?.text == "On Hold";
  const isReturnRequested =
    order?.order_status === "processed" ||
    order?.order_status === "return_requested" ||
    order?.order_status === "declined" ||
    order?.order_status === "return_initiated" ||
    order?.order_status === "refunded" ||
    !!order?.return;

  return (
    <div className="h-fit w-full rounded-[4px] border-2 border-neutral-300 p-3.5 text-sm xl:p-5">
      <div className="mb-4 items-start justify-between gap-2 max-sm:space-y-2 sm:flex">
        <h2 className="text-sm font-semibold md:text-base">
          Order #{order?.order_number}
        </h2>
        <div
          className={`w-fit cursor-default text-nowrap rounded-[3px] px-2 py-1.5 text-xs font-semibold max-sm:ml-auto ${orderStatus?.bgColor} ${orderStatus?.textColor}`}
        >
          {orderStatus?.text}
        </div>
      </div>
      <div className="space-y-2 [&>div]:flex [&>div]:justify-between [&>div]:gap-4 sm:[&>div]:gap-10 xl:[&>div]:gap-20 [&_h4]:font-semibold sm:[&_h4]:text-nowrap">
        <div>
          <h4>Date & Time</h4>
          <p className="text-right">
            {orderMonthFirstThreeLetters}
            <span className="max-sm:hidden">{orderMonthRestOfLetters}</span>
            {" " + orderDayAndYear}, {orderTime}
          </p>
        </div>
        <div>
          <h4>Payment Method</h4>
          <p className="text-right">{order?.payment?.payment_method || "--"}</p>
        </div>
        <div>
          <h4>Paid Amount</h4>
          <p className="text-right">৳ {Number(order?.total || 0).toLocaleString()}</p>
        </div>
      </div>
      <div className="mt-8 flex flex-wrap gap-2.5">
        <TransitionLink
          href={`/user/orders/${order?.order_number?.toLowerCase()}`}
          className="flex items-center gap-2 rounded-[4px] bg-[var(--color-secondary-500)] px-4 py-2.5 text-center text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-secondary-600)] max-sm:w-full max-sm:justify-center"
        >
          Order Details
          <LuFileText size={14} />
        </TransitionLink>
        {isOrderTrackable && (
          <button
            className="flex items-center gap-2 rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-center text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)] max-sm:w-full max-sm:justify-center"
            onClick={() => {
              setActiveTrackOrder(order);
              setIsTrackModalOpen(true);
            }}
          >
            Track Order
            <LuTruck size={14} />
          </button>
        )}
        {isOrderReturnable(
          order?.order_status,
          order?.delivered_at,
        ) &&
          orderStatus?.text !== "Return Requested" && (
            <button
              className="flex items-center gap-2 rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-center text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)] max-sm:w-full max-sm:justify-center"
              onClick={() => {
                setValue(
                  "items",
                  Array.from(order?.items || [], () => ({
                    isRequested: false,
                    quantity: 0,
                    issues: [],
                  })),
                );

                setActiveReturnOrder(order);
                setIsReturnModalOpen(true);
              }}
            >
              Return Request
              <IoReturnDownBack size={14} />
            </button>
          )}
        {isReturnRequested && (
          <button
            className="flex items-center gap-2 rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-center text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)] max-sm:w-full max-sm:justify-center"
            onClick={() => {
              setActiveReturnOrder(order);
              setIsReturnInfoModalOpen(true);
            }}
          >
            Return Info
            <LuFileText size={14} />
          </button>
        )}
      </div>
    </div>
  );
}
