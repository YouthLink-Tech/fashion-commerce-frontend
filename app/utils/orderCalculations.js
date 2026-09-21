import checkIfPromoCodeIsValid, { isExpired } from "./isPromoCodeValid";

const roundToTwo = (num) => {
  const n = Number(num);
  return isNaN(n) ? 0 : Math.round(n * 100) / 100;
};

// Helper to check if a product matches an Offer by products or categories scope
export const isProductInOffer = (product, offer) => {
  if (!product || !offer) return false;
  const productId = product.id;
  const categoryId = product.category_id ?? product.category?.id;
  if (offer.scope_type === "products") {
    return (
      Array.isArray(offer.products) &&
      offer.products.some((p) => p.product_id === productId)
    );
  }
  if (offer.scope_type === "categories") {
    return (
      Array.isArray(offer.categories) &&
      offer.categories.some((c) => c.category_id === categoryId)
    );
  }
  return false;
};

export const checkIfSpecialOfferIsAvailable = (product, specialOffers) => {
  if (!product || !specialOffers?.length) return false;
  return specialOffers.some((offer) => {
    return (
      offer.is_active === true &&
      !isExpired(offer.expiry_date) &&
      isProductInOffer(product, offer)
    );
  });
};

export const checkIfAnyDiscountIsAvailable = (product, specialOffers) => {
  return (
    (Number(product?.discount_value) || 0) > 0 ||
    checkIfSpecialOfferIsAvailable(product, specialOffers)
  );
};

export const checkIfOnlyRegularDiscountIsAvailable = (
  product,
  specialOffers,
) => {
  return (
    (Number(product?.discount_value) || 0) > 0 &&
    !checkIfSpecialOfferIsAvailable(product, specialOffers)
  );
};

export const getProductSpecialOffer = (
  product,
  specialOffers,
  cartSubtotal = "NA",
) => {
  if (!product || !specialOffers?.length) return null;
  const eligibleOffers = specialOffers.filter((offer) => {
    const minAmount = Number(offer?.min_amount) || 0;
    return (
      offer.is_active === true &&
      !isExpired(offer.expiry_date) &&
      (cartSubtotal === "NA" || cartSubtotal >= minAmount)
    );
  });

  // Check product-scoped offers first
  const productScopedOffer = eligibleOffers.find(
    (offer) =>
      offer.scope_type === "products" &&
      Array.isArray(offer.products) &&
      offer.products.some((p) => p.product_id === product.id),
  );
  if (productScopedOffer) return productScopedOffer;
  // Check category-scoped offers second
  const categoryId = product.category_id ?? product.category?.id;
  return (
    eligibleOffers.find(
      (offer) =>
        offer.scope_type === "categories" &&
        Array.isArray(offer.categories) &&
        offer.categories.some((c) => c.category_id === categoryId),
    ) || null
  );
};

export const calculateFinalPrice = (product, specialOffers = []) => {
  const regularPrice = Number(product?.regular_price) || 0;
  const discountValue = Number(product?.discount_value) || 0;
  const discountType = (product?.discount_type || "").toLowerCase();
  const isSpecialOfferAvailable = checkIfSpecialOfferIsAvailable(
    product,
    specialOffers,
  );
  // If a special offer applies, the regular price is used as the base item price
  if (isSpecialOfferAvailable || discountValue <= 0) {
    return roundToTwo(regularPrice);
  }
  let finalPrice = regularPrice;
  if (discountType === "percentage") {
    finalPrice = regularPrice - (regularPrice * discountValue) / 100;
  } else if (discountType === "flat") {
    finalPrice = Math.max(0, regularPrice - discountValue);
  }
  return isNaN(finalPrice) ? 0 : roundToTwo(finalPrice);
};

export const getProductPricing = (product, specialOffers = []) => {
  const regularPrice = Number(product?.regular_price) || 0;
  const finalPrice = calculateFinalPrice(product, specialOffers);
  const hasDiscount = finalPrice < regularPrice;
  return {
    price: finalPrice,
    regularPrice,
    originalPrice: hasDiscount ? regularPrice : null,
    hasDiscount,
  };
};

export const calculateSubtotal = (productList, cartItems, specialOffers = []) => {
  if (!cartItems?.length) return 0;
  const products = Array.isArray(productList)
    ? productList
    : productList?.items || [];
  const subtotal = cartItems.reduce((accumulator, cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    if (!product) return accumulator;
    const quantity = Number(cartItem.selectedQuantity) || 0;
    const price = calculateFinalPrice(product, specialOffers) || 0;
    const itemTotal = price * quantity;
    return isNaN(itemTotal) ? accumulator : accumulator + itemTotal;
  }, 0);
  return isNaN(subtotal) ? 0 : roundToTwo(subtotal);
};

export const calculatePromoDiscount = (
  productList,
  cartItems,
  userPromoCode,
  specialOffers = [],
) => {
  if (!cartItems?.length || !userPromoCode) return 0;
  const products = Array.isArray(productList)
    ? productList
    : productList?.items || [];
  // Rule: Special Offer and Promo Code are mutually exclusive.
  // If ANY item in the cart is eligible for an active special offer, promo cannot be applied.
  const hasSpecialOfferItem = cartItems.some((cartItem) => {
    const product = products.find((p) => p.id === cartItem.productId);
    return checkIfSpecialOfferIsAvailable(product, specialOffers);
  });
  if (hasSpecialOfferItem) return 0;
  // Calculate subtotal WITHOUT specialOffers
  const subtotal = calculateSubtotal(products, cartItems);
  if (!checkIfPromoCodeIsValid(userPromoCode, subtotal)) {
    return 0;
  }
  let promoDiscount = 0;
  const promoDiscountValue = Number(userPromoCode.discount_value) || 0;
  const discountType = (userPromoCode.discount_type || "").toLowerCase();
  if (discountType === "amount") {
    promoDiscount = promoDiscountValue;
  } else if (discountType === "percentage") {
    if (!Number.isFinite(subtotal)) return 0;
    promoDiscount = (promoDiscountValue / 100) * subtotal;
  }
  const promoMaxAmount = Number(userPromoCode.max_amount) || 0;
  if (promoMaxAmount > 0 && promoDiscount > promoMaxAmount) {
    promoDiscount = promoMaxAmount;
  }
  return roundToTwo(promoDiscount);
};

export const calculateProductSpecialOfferDiscount = (
  product,
  cartItem,
  specialOffer,
  cartItems = [],
  productList = [],
) => {
  if (!product || !cartItem || !specialOffer) return 0;

  const regularPrice = Number(product?.regular_price) || 0;
  const quantity = Number(cartItem.selectedQuantity ?? cartItem.quantity) || 0;
  const itemTotal = regularPrice * quantity;

  const offerDiscountValue = Number(specialOffer?.discount_value) || 0;
  if (!offerDiscountValue || itemTotal <= 0) return 0;

  const discountType = (specialOffer?.discount_type || "").toLowerCase();
  const offerMaxAmount = Number(specialOffer?.max_amount) || 0;

  // When cart context is passed, compute this item's proportional share of the offer-level cap
  if (cartItems?.length && productList?.length) {
    const products = Array.isArray(productList)
      ? productList
      : productList?.items || [];

    const offerId = specialOffer.id;

    const groupItems = [];
    for (const ci of cartItems) {
      const pid = ci.productId ?? ci.product_id;
      const p = products.find((prod) => prod.id === pid);
      if (!p) continue;

      const offer = getProductSpecialOffer(p, [specialOffer], "NA");
      if (offer && offer.id === offerId) {
        const pPrice = Number(p.regular_price) || 0;
        const pQty = Number(ci.selectedQuantity ?? ci.quantity) || 0;
        groupItems.push({
          itemTotal: pPrice * pQty,
        });
      }
    }

    const groupTotal = groupItems.reduce((sum, it) => sum + it.itemTotal, 0);
    if (groupTotal <= 0) return 0;

    let groupDiscount = 0;
    if (discountType === "percentage") {
      groupDiscount = (groupTotal * offerDiscountValue) / 100;
    } else if (discountType === "amount") {
      groupDiscount = Math.min(offerDiscountValue, groupTotal);
    }

    if (offerMaxAmount > 0 && groupDiscount > offerMaxAmount) {
      groupDiscount = offerMaxAmount;
    }

    return roundToTwo((itemTotal / groupTotal) * groupDiscount);
  }

  // Standalone fallback (single item calculation)
  let specialDiscount = 0;
  if (discountType === "percentage") {
    specialDiscount = (itemTotal * offerDiscountValue) / 100;
  } else if (discountType === "amount") {
    specialDiscount = Math.min(offerDiscountValue, itemTotal);
  }

  if (offerMaxAmount > 0 && specialDiscount > offerMaxAmount) {
    specialDiscount = offerMaxAmount;
  }

  return roundToTwo(specialDiscount);
};

export const calculateTotalSpecialOfferDiscount = (
  productList,
  cartItems,
  specialOffers = [],
) => {
  if (!cartItems?.length || !specialOffers?.length) return 0;

  const products = Array.isArray(productList)
    ? productList
    : productList?.items || [];

  const cartSubtotal = calculateSubtotal(products, cartItems, specialOffers);

  // Group qualifying items by offer ID
  const offerGroups = new Map();

  for (const cartItem of cartItems) {
    const productId = cartItem.productId ?? cartItem.product_id;
    const product = products.find((p) => p.id === productId);
    if (!product) continue;

    const specialOffer = getProductSpecialOffer(
      product,
      specialOffers,
      cartSubtotal,
    );
    if (!specialOffer) continue;

    const offerId = specialOffer.id;
    if (!offerGroups.has(offerId)) {
      offerGroups.set(offerId, {
        offer: specialOffer,
        items: [],
      });
    }

    const regularPrice = Number(product.regular_price) || 0;
    const quantity = Number(cartItem.selectedQuantity ?? cartItem.quantity) || 0;
    const itemTotal = regularPrice * quantity;

    offerGroups.get(offerId).items.push({ itemTotal });
  }

  let totalDiscount = 0;

  for (const { offer, items } of offerGroups.values()) {
    const groupTotal = items.reduce((sum, it) => sum + it.itemTotal, 0);
    const offerDiscountValue = Number(offer.discount_value) || 0;
    if (!offerDiscountValue || groupTotal <= 0) continue;

    let groupDiscount = 0;
    const discountType = (offer.discount_type || "").toLowerCase();

    if (discountType === "percentage") {
      groupDiscount = (groupTotal * offerDiscountValue) / 100;
    } else if (discountType === "amount") {
      groupDiscount = Math.min(offerDiscountValue, groupTotal);
    }

    const offerMaxAmount = Number(offer.max_amount) || 0;
    if (offerMaxAmount > 0 && groupDiscount > offerMaxAmount) {
      groupDiscount = offerMaxAmount;
    }

    totalDiscount += groupDiscount;
  }

  return roundToTwo(totalDiscount);
};

const findShippingOption = (selectedCityId, selectedDeliveryType, shippingOptionsByCity) => {
  if (!selectedCityId || !selectedDeliveryType) return null;
  const cityEntry = shippingOptionsByCity?.[selectedCityId];
  if (!cityEntry) return null;
  return cityEntry.options.find((o) => o.delivery_type === selectedDeliveryType) || null;
};

export const getEstimatedDeliveryTime = (
  selectedCityId,
  selectedDeliveryType,
  shippingOptionsByCity,
) => {
  const option = findShippingOption(selectedCityId, selectedDeliveryType, shippingOptionsByCity);
  if (!option) return null;

  return option.duration_max
    ? `${option.duration_min}–${option.duration_max}`
    : `${option.duration_min}`;
};

export const calculateShippingCharge = (
  selectedCityId,
  selectedDeliveryType,
  shippingOptionsByCity,
) => {
  const option = findShippingOption(selectedCityId, selectedDeliveryType, shippingOptionsByCity);
  if (!option) return 0;
  return roundToTwo(Number(option.charge));
};

export const getTotalItemCount = (cartItems) => {
  if (!cartItems?.length) return 0;

  return cartItems.reduce(
    (accumulator, item) => (item.selectedQuantity || 0) + accumulator,
    0,
  );
};

export const getAvailableDeliveryTypes = (selectedCityId, shippingOptionsByCity) => {
  const cityEntry = shippingOptionsByCity?.[selectedCityId];
  return cityEntry?.options?.map((o) => o.delivery_type) ?? [];
};

export const isDeliveryTypeChoiceNeeded = (selectedCityId, shippingOptionsByCity) => {
  return getAvailableDeliveryTypes(selectedCityId, shippingOptionsByCity).length > 1;
};

export const isDeliveryFree = (selectedCityId, selectedDeliveryType, shippingOptionsByCity) => {
  const cityEntry = shippingOptionsByCity?.[selectedCityId];
  const option = cityEntry?.options?.find((o) => o.delivery_type === selectedDeliveryType);
  return option ? Number(option.charge) === 0 : false;
};

export const getExpectedDeliveryDate = (
  orderDateTime,
  deliveryMethod,
  estimatedTime,
) => {
  if (!estimatedTime || !orderDateTime) return null;
  const [datePart, timePart] = orderDateTime.split(" | ");
  const [day, month, year] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const orderDate = new Date(year + 2000, month - 1, day, hour, minute);
  let maxTime;
  if (
    String(estimatedTime).includes("-") ||
    String(estimatedTime).includes("–")
  ) {
    maxTime = Math.max(...String(estimatedTime).split(/[-–]/).map(Number));
  } else {
    maxTime = Number(estimatedTime);
  }
  if (isNaN(maxTime)) return null;
  if (deliveryMethod === "STANDARD") {
    orderDate.setDate(orderDate.getDate() + maxTime);
  } else if (deliveryMethod === "EXPRESS") {
    orderDate.setHours(orderDate.getHours() + maxTime);
  }
  const options = { year: "numeric", month: "long", day: "numeric" };
  return orderDate.toLocaleDateString("en-US", options);
};
