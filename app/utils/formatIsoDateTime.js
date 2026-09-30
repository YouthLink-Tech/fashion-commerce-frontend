export function formatIsoDateTime(dateIsoString, fallback = "--") {
  if (!dateIsoString) return fallback;
  const date = new Date(dateIsoString);
  if (isNaN(date.getTime())) return fallback;
  // Format the date part (e.g., "September 28 2026")
  const datePart = date
    .toLocaleDateString("en-US", {
      timeZone: "Asia/Dhaka",
      month: "long",
      day: "2-digit",
      year: "numeric",
    })
    .replace(",", ""); // Remove the comma after day
  // Format the time part (e.g., "04:40 PM")
  const timePart = date.toLocaleTimeString("en-US", {
    timeZone: "Asia/Dhaka",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
  return `${datePart}, ${timePart}`;
}
