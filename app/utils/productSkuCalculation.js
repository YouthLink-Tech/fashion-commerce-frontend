/**
 * These utilities assume the backend has ALREADY resolved everything to the
 * primary location and computed availability server-side — nothing here
 * filters by location, and nothing here reads raw on_hand/reserved/committed
 * counters. Two response shapes exist, and each function is written for one:
 *
 * - LIST/CARD shape (getAllProducts, getNewArrivals, getTrendingProducts,
 *   the shared shop-listing endpoint): each product has a precomputed
 *   `is_out_of_stock` boolean. No per-variant availability numbers are sent
 *   here — nothing on a card needs them.
 *
 * - DETAIL shape (getSlugProduct, getSingleProduct): each variant has a
 *   precomputed `available_sku` number (on_hand - reserved - committed,
 *   already resolved to primary location, already computed server-side).
 *   This is the ONLY place that number should be read from.
 */

export const isProductOutOfStock = (product) => !!product?.is_out_of_stock;

/**
 * "Limited stock" badge — average available stock across purchasable
 * variants under a threshold. Same threshold (10) as the old Mongo-era
 * logic, now computed off the derived per-variant number instead of a
 * raw .sku field.
 */
export const isProductLimitedStock = (product, threshold = 10) => {
  if (typeof product?.is_limited_stock === "boolean") {
    return product.is_limited_stock;
  }
  // fallback if a caller only has the raw variants array, not the product
  const variants = product?.variants;
  if (!variants?.length) return false;
  const total = variants.reduce((sum, v) => sum + (v.available_sku ?? 0), 0);
  const average = total / variants.length;
  return average > 0 && average < threshold;
};

/**
 * Available stock for one (color, size) combination on the product detail
 * page. Returns 0 (not null/undefined) when the combination doesn't exist
 * or isn't purchasable, so callers can use it directly in comparisons
 * without an extra null check.
 */
export const getVariantAvailableSku = (variants, colorId, sizeId) => {
  const variant = variants?.find(
    (v) => v.color?.id === colorId && v.size?.id === sizeId,
  );
  return variant?.available_sku ?? 0;
};

/**
 * Whether ANY purchasable variant on the detail page has stock. Used for
 * the page-level "in stock" / "out of stock" indicator, not for gating a
 * specific size/color selection — use getVariantAvailableSku for that.
 */
export const isAnyVariantInStock = (variants) =>
  (variants ?? []).some((v) => (v.available_sku ?? 0) > 0);

export const isSizeInStockForColor = (variants, colorId, sizeId) =>
  getVariantAvailableSku(variants, colorId, sizeId) > 0;

export const getColors = (variants) => [
  ...new Map((variants ?? []).map((v) => [v.color.id, v.color])).values(),
];

export const getSizesForColor = (variants, colorId) =>
  (variants ?? []).filter((v) => v.color?.id === colorId).map((v) => v.size);

/**
 * Sizes that actually have stock for a given color, on the detail page's
 * size selector — disables/greys out sizes with zero availability for the
 * currently-selected color instead of letting the customer pick a
 * combination that can't be fulfilled.
 */
export const getAvailableSizesForColor = (variants, colorId) =>
  (variants ?? [])
    .filter((v) => v.color?.id === colorId && (v.available_sku ?? 0) > 0)
    .map((v) => v.size);

export const getProductVariantSku = (
  productVariants,
  primaryLocation,
  selectedColorId,
  selectedSize,
) => {
  return productVariants
    ?.filter(
      (variant) =>
        variant.color._id === selectedColorId &&
        variant.size === selectedSize &&
        variant.location === primaryLocation,
    )
    .reduce((acc, variant) => acc + Number(variant?.sku), 0);
};

const getProductTotalSku = (productVariants, primaryLocation) => {
  return productVariants
    ?.filter((variant) => variant?.location === primaryLocation)
    .reduce((acc, variant) => acc + Number(variant?.sku), 0);
};

export const CheckIfProductIsOutOfStock = (
  productVariants,
  primaryLocation,
) => {
  return !(getProductTotalSku(productVariants, primaryLocation) > 0);
};

export const checkIfProductIsLimitedStock = (
  productVariants,
  primaryLocation,
) => {
  const primaryLocationVariants = productVariants?.filter(
    (variant) => variant?.location === primaryLocation,
  );

  if (!primaryLocationVariants?.length) return false;

  const totalSku = primaryLocationVariants.reduce(
    (acc, variant) => acc + Number(variant?.sku),
    0,
  );

  const averageSku = totalSku / primaryLocationVariants.length;

  return averageSku < 10;
};
