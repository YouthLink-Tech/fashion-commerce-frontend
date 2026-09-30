function formatStatusText(str) {
  if (!str) return "--";
  return str
    .replace(/[-_]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default function getOrderStatusWithColor(orderStatus) {
  const status = (orderStatus || "").toLowerCase();

  switch (status) {
    case "pending":
      return {
        text: "Processing",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
      };
    case "processing":
      return {
        text: "Confirmed",
        bgColor: "bg-yellow-100",
        textColor: "text-yellow-600",
      };
    case "shipped":
      return {
        text: "On Its Way",
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
      };
    case "on_hold":
    case "return_initiated":
    case "processed":
      return {
        text: formatStatusText(status),
        bgColor: "bg-blue-100",
        textColor: "text-blue-600",
      };
    case "return_requested":
    case "declined":
      return {
        text: formatStatusText(status),
        bgColor: "bg-red-100",
        textColor: "text-red-600",
      };
    case "cancelled":
      return {
        text: "Cancelled",
        bgColor: "bg-neutral-100",
        textColor: "text-neutral-600",
      };
    case "delivered":
    case "refunded":
      return {
        text: formatStatusText(status),
        bgColor: "bg-green-100",
        textColor: "text-green-600",
      };
    default:
      return {
        text: formatStatusText(status),
        bgColor: "bg-neutral-100",
        textColor: "text-neutral-600",
      };
  }
}