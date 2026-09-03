export function getDiscountInfo(product) {
  const discountValue = Number(product?.discount_value) || 0;
  const hasDiscount = discountValue > 0;
  const discount = {
    type: product?.discount_type === "percentage" ? "Percentage" : "Flat",
    text:
      product?.discount_type === "percentage"
        ? `${product.discount_value}%`
        : `৳ ${product?.discount_value}`,
  };

  return {
    hasDiscount,
    discount,
  };
}