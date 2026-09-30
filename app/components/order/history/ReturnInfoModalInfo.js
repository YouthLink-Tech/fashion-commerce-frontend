import formatOrderDateTime from "@/app/utils/formatOrderDateTime";
import getOrderStatusWithColor from "@/app/utils/getOrderStatusColor";

export default function ReturnInfoModalInfo({ orderStatus, returnInfo }) {
  const {
    orderMonthFirstThreeLetters,
    orderMonthRestOfLetters,
    orderDayAndYear,
    orderTime,
  } = formatOrderDateTime(returnInfo?.requested_at);

  const statusDisplay = getOrderStatusWithColor(orderStatus)?.text || orderStatus;

  return (
    <>
      <h2 className="text-sm font-semibold uppercase md:text-[15px]/[1]">
        Return Information
      </h2>
      <div className="space-y-3 rounded-[4px] border-2 border-neutral-200 p-3 text-sm sm:px-5 sm:py-4 [&>div]:flex [&>div]:justify-between [&>div]:gap-3 sm:[&>div]:gap-10 xl:[&>div]:gap-20 [&_h4]:font-semibold [&_h4]:text-neutral-600 sm:[&_h4]:text-nowrap">
        <div>
          <h4>Return Requested at</h4>
          <p className="text-right">
            {orderMonthFirstThreeLetters}
            <span className="max-sm:hidden">{orderMonthRestOfLetters}</span>
            {" " + orderDayAndYear}, {orderTime}
          </p>
        </div>
        <div>
          <h4>Return Status</h4>
          <p className="text-right">{statusDisplay}</p>
        </div>
        <div>
          <h4>
            {orderStatus === "refunded" ? "Refunded" : "Expected Refund"} Amount
          </h4>
          <p className="text-right">
            ৳ {Number(returnInfo?.refund_amount || 0).toLocaleString()}
          </p>
        </div>
        {returnInfo?.description && (
          <div>
            <h4>Additional Note</h4>
            <p className="text-right">{returnInfo.description}</p>
          </div>
        )}
      </div>
    </>
  );
}
