export default function formatOrderDateTime(placedAt) {
  if (!placedAt) {
    return {
      orderMonthFirstThreeLetters: "",
      orderMonthRestOfLetters: "",
      orderDayAndYear: "",
      orderTime: "",
      dateTime: "",
    };
  }

  const d = new Date(placedAt);
  if (isNaN(d.getTime())) {
    return {
      orderMonthFirstThreeLetters: "",
      orderMonthRestOfLetters: "",
      orderDayAndYear: "",
      orderTime: "",
      dateTime: "",
    };
  }

  // Parse in Asia/Dhaka (UTC+6)
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);

  const get = (type) => parts.find((p) => p.type === type)?.value || "00";
  const day = get("day");
  const monthNum = parseInt(get("month"), 10);
  const year2Digit = get("year");
  const fullYear = 2000 + parseInt(year2Digit, 10);
  const hour24 = parseInt(get("hour"), 10);
  const minute = get("minute");

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  const monthFull = months[monthNum - 1] || "";

  // 12-hour AM/PM format for website UI
  const amPm = hour24 >= 12 ? "PM" : "AM";
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const formattedHour = String(hour12).padStart(2, "0");
  const orderTime = `${formattedHour}:${minute} ${amPm}`;

  // Exact "11-06-26 | 19:05" format for PDF and raw displays
  const dateTime = `${day}-${get("month")}-${year2Digit} | ${get("hour")}:${minute}`;

  return {
    orderMonthFirstThreeLetters: monthFull.slice(0, 3), // e.g. "Jun"
    orderMonthRestOfLetters: monthFull.slice(3),        // e.g. "e"
    orderDayAndYear: `${day} ${fullYear}`,             // e.g. "11 2026"
    orderTime,                                         // e.g. "07:05 PM"
    dateTime,                                          // e.g. "11-06-26 | 19:05"
  };
}