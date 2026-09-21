export const getTodayDateString = () =>
  new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date());

export const isExpired = (expiryDate) => {
  if (!expiryDate) return false;
  const d =
    expiryDate instanceof Date
      ? expiryDate.toISOString().slice(0, 10)
      : String(expiryDate).slice(0, 10);
  return d < getTodayDateString();
};

export default function checkIfPromoCodeIsValid(userPromoCode, cartSubtotal) {
  if (!userPromoCode) return false;

  const minAmount = Number(userPromoCode.min_amount) || 0;
  const isNotExpired = !isExpired(userPromoCode.expiry_date);

  return (
    userPromoCode.is_active === true &&
    isNotExpired &&
    cartSubtotal >= minAmount
  );
}