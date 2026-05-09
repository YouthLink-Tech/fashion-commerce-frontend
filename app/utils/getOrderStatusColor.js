export default function getOrderStatusWithColor(orderStatus) {
  switch (orderStatus) {
    case "Pending":
    case "Processing":
      return {
        text: orderStatus === "Pending" ? "Processing" : "Confirmed",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
      };
    case "Shipped":
    case "On Hold":
    case "Return Initiated":
    case "Processed":
      return {
        text: orderStatus === "Shipped" ? "On Its Way" : orderStatus,
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
      };
    case "Return Requested":
    case "Declined":
      return {
        text: orderStatus,
        bgColor: "bg-red-100",
        textColor: "text-red-600",
      };
    case "Cancelled":
      return {
        text: "Cancelled",
        bgColor: "bg-neutral-100",
        textColor: "text-neutral-600",
      };
    default:
      return {
        text: orderStatus,
        bgColor: "bg-green-100",
        textColor: "text-green-600",
      };
  }
}
