export default function getImageSetsBasedOnColors(productVariants) {
  if (!productVariants?.length) return;

  const colorImageMap = {};

  productVariants.forEach(({ color, imageUrls }) => {
    const colorId = color._id;

    if (!colorImageMap[colorId]) {
      colorImageMap[colorId] = {
        color: color,
        images: new Set(imageUrls),
      };
    } else {
      imageUrls.forEach((url) => colorImageMap[colorId].images.add(url));
    }
  });

  return Object.values(colorImageMap).map(({ color, images }) => ({
    color,
    images: Array.from(images),
  }));
}

export const getImageSetsByColor = (variants) => {
  if (!variants?.length) return [];

  const colorImageMap = new Map();

  variants.forEach(({ color, media }) => {
    if (!colorImageMap.has(color.id)) {
      colorImageMap.set(color.id, { color, images: new Map() });
    }
    const entry = colorImageMap.get(color.id);
    (media ?? []).forEach((m) => entry.images.set(m.id, m.public_id));
  });

  return [...colorImageMap.values()].map(({ color, images }) => ({
    color,
    images: [...images.values()],
  }));
};