import checkIfPromoCodeIsValid from "./isPromoCodeValid";

export const checkIfAnyDiscountIsAvailable = (product, specialOffers) => {
  const now = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date()),
  );

  return (
    !!(parseFloat(product?.discountValue) || 0) > 0 ||
    specialOffers?.some((offer) => {
      const expiryDate = new Date(`${offer?.expiryDate}T23:59:59+06:00`);

      return (
        offer.offerStatus === true &&
        (offer.selectedProductIds?.includes(product?.productId) ||
          offer.selectedCategories?.includes(product?.category)) &&
        now <= expiryDate
      );
    })
  );
};

export const checkIfOnlyRegularDiscountIsAvailable = (
  product,
  specialOffers,
) => {
  return (
    !!(parseFloat(product?.discountValue) || 0) > 0 &&
    !checkIfSpecialOfferIsAvailable(product, specialOffers)
  );
};

export const checkIfSpecialOfferIsAvailable = (product, specialOffers) => {
  const now = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date()),
  );

  return specialOffers?.some((offer) => {
    const expiryDate = new Date(`${offer?.expiryDate}T23:59:59+06:00`);

    return (
      offer.offerStatus === true &&
      now <= expiryDate &&
      (offer.selectedProductIds?.includes(product?.productId) ||
        offer.selectedCategories?.includes(product?.category))
    );
  });
};

export const getProductSpecialOffer = (
  product,
  specialOffers,
  cartSubtotal,
) => {
  const now = new Date(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "Asia/Dhaka",
      hour12: false,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date()),
  );
  return specialOffers?.find((offer) => {
    const expiryDate = new Date(`${offer?.expiryDate}T23:59:59+06:00`);
    const minAmount = parseFloat(offer?.minAmount) || 0;
    return (
      offer.offerStatus === true &&
      (offer.selectedProductIds?.includes(product?.productId) ||
        offer.selectedCategories?.includes(product?.category)) &&
      now <= expiryDate &&
      (cartSubtotal === "NA" || cartSubtotal >= minAmount)
    );
  });
};

export const calculateFinalPrice = (product, specialOffers) => {
  const regularPrice = parseFloat(product?.regularPrice) || 0;
  const isSpecialOfferAvailable = checkIfSpecialOfferIsAvailable(
    product,
    specialOffers,
  );
  const discountValue = parseFloat(product?.discountValue) || 0;

  if (isSpecialOfferAvailable || discountValue === 0) {
    return regularPrice;
  }

  if (product?.discountType === "Percentage") {
    return regularPrice - (regularPrice * discountValue) / 100;
  } else if (product?.discountType === "Flat") {
    return regularPrice - discountValue;
  } else {
    return regularPrice;
  }
};

export const calculateSubtotal = (productList, cartItems, specialOffers) => {
  if (!cartItems?.length) return 0;

  return cartItems.reduce((accumulator, cartItem) => {
    const product = productList?.find(
      (product) => product._id === cartItem?._id,
    );
    const quantity = parseFloat(cartItem?.selectedQuantity) || 0;
    return calculateFinalPrice(product, specialOffers) * quantity + accumulator;
  }, 0);
};

export const calculatePromoDiscount = (
  productList,
  cartItems,
  userPromoCode,
  specialOffers,
) => {
  if (
    !cartItems?.length ||
    !checkIfPromoCodeIsValid(
      userPromoCode,
      calculateSubtotal(productList, cartItems, specialOffers),
    )
  )
    return 0;

  let promoDiscount;
  const promoDiscountValue = parseFloat(userPromoCode?.promoDiscountValue) || 0;
  if (userPromoCode?.promoDiscountType === "Amount") {
    promoDiscount = promoDiscountValue;
  } else {
    promoDiscount =
      (promoDiscountValue / 100) * calculateSubtotal(productList, cartItems);
  }

  const promoMaxAmount = parseFloat(userPromoCode?.maxAmount) || 0;

  if (promoMaxAmount > 0 && promoDiscount > promoMaxAmount) {
    promoDiscount = promoMaxAmount;
  }

  return promoDiscount;
};

export const calculateProductSpecialOfferDiscount = (
  product,
  cartItem,
  specialOffer,
) => {
  const regularPrice = parseFloat(product?.regularPrice) || 0;
  const quantity = parseFloat(cartItem?.selectedQuantity) || 0;
  const totalProductPrice = regularPrice * quantity;
  const offerDiscountValue = parseFloat(specialOffer?.offerDiscountValue) || 0;

  if (!offerDiscountValue) return 0;

  let specialDiscount = 0;

  if (specialOffer.offerDiscountType === "Percentage") {
    specialDiscount = (totalProductPrice * offerDiscountValue) / 100;
  } else if (specialOffer.offerDiscountType === "Amount") {
    specialDiscount = offerDiscountValue;
  }

  const offerMaxAmount = parseFloat(specialOffer?.maxAmount) || 0;

  if (offerMaxAmount > 0 && specialDiscount > offerMaxAmount) {
    specialDiscount = offerMaxAmount;
  }

  return specialDiscount;
};

export const calculateTotalSpecialOfferDiscount = (
  productList,
  cartItems,
  specialOffers,
) => {
  if (!cartItems?.length) return 0;

  return cartItems.reduce((accumulator, cartItem) => {
    const product = productList?.find(
      (product) => product._id === cartItem?._id,
    );
    const specialOffer = getProductSpecialOffer(
      product,
      specialOffers,
      calculateSubtotal(productList, cartItems, specialOffers),
    );
    const discount = !specialOffer
      ? 0
      : calculateProductSpecialOfferDiscount(product, cartItem, specialOffer);

    return discount + accumulator;
  }, 0);
};

export const calculateShippingCharge = (
  selectedCity,
  selectedDeliveryType,
  shippingZones,
) => {
  if (!selectedCity || (selectedCity === "Dhaka" && !selectedDeliveryType)) {
    return 0;
  } else {
    const shippingZone = shippingZones?.find((shippingZone) =>
      shippingZone?.selectedCity.includes(selectedCity),
    );

    return parseFloat(
      shippingZone?.shippingCharges[selectedDeliveryType || "STANDARD"] || 0,
    );
  }
};

export const getTotalItemCount = (cartItems) => {
  if (!cartItems?.length) return 0;

  return cartItems.reduce(
    (accumulator, item) => (parseFloat(item.selectedQuantity) || 0) + accumulator,
    0,
  );
};

export const getEstimatedDeliveryTime = (
  selectedCity,
  selectedDeliveryType,
  shippingZones,
) => {
  if (!selectedCity || (selectedCity === "Dhaka" && !selectedDeliveryType)) {
    return null;
  } else {
    const shippingZone = shippingZones?.find((shippingZone) =>
      shippingZone?.selectedCity.includes(selectedCity),
    );

    return (
      shippingZone?.shippingDurations[selectedDeliveryType || "STANDARD"] ||
      null
    );
  }
};

export const getExpectedDeliveryDate = (
  orderDateTime,
  deliveryMethod,
  estimatedTime,
) => {
  // Parse the order date and time string into a JavaScript Date object
  const [datePart, timePart] = orderDateTime.split(" | ");
  const [day, month, year] = datePart.split("-").map(Number);
  const [hour, minute] = timePart.split(":").map(Number);
  const orderDate = new Date(year + 2000, month - 1, day, hour, minute); // Convert year to full year

  // Parse the estimated duration
  let maxTime; // Maximum time in the duration range
  if (estimatedTime.includes("-")) {
    // If duration is a range (e.g., "2-3"), pick the maximum value
    maxTime = Math.max(...estimatedTime.split("-").map(Number));
  } else {
    // Otherwise, it's a single value
    maxTime = Number(estimatedTime);
  }

  // Calculate the delivery time based on the delivery method
  if (deliveryMethod === "STANDARD") {
    // For STANDARD, add maxTime days to the order date
    orderDate.setDate(orderDate.getDate() + maxTime);
  } else if (deliveryMethod === "EXPRESS") {
    // For EXPRESS, add maxTime hours to the order date
    orderDate.setHours(orderDate.getHours() + maxTime);
  }

  // Format the result to "Month DD, YYYY"
  const options = { year: "numeric", month: "long", day: "numeric" };
  return orderDate.toLocaleDateString("en-US", options);
};
