export default function formatExpectedDeliveryDate(dateInput, fallback = "--") {
  if (!dateInput) return fallback;

  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return fallback;

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Dhaka",
    month: "long",
    day: "2-digit",
    year: "numeric",
  }).format(date);
}