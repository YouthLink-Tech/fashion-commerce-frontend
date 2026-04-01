import {
  checkIfProductIsLimitedStock,
  CheckIfProductIsOutOfStock,
} from "@/app/utils/productSkuCalculation";
import {
  checkIfSpecialOfferIsAvailable,
  getProductSpecialOffer,
} from "@/app/utils/orderCalculations";
import getImageSetsBasedOnColors from "@/app/utils/getImageSetsBasedOnColors";
import ProductBadges from "../ui/badges/ProductBadges";
import CardProductThumbnail from "./CardProductThumbnail";
import CardProductInfo from "./CardProductInfo";
import CardButtons from "./CardButtons";

export default function ProductCard({
  userData,
  product,
  specialOffers,
  primaryLocation,
  isAddToCartModalOpen,
  setIsAddToCartModalOpen,
  setSelectedAddToCartProduct,
  shouldBeHidden,
  isAllowedToShowLimitedStock,
}) {
  const isProductOutOfStock = CheckIfProductIsOutOfStock(
    product?.productVariants,
    primaryLocation,
  );
  const isProductLimitedStock = checkIfProductIsLimitedStock(
    product?.productVariants,
    primaryLocation,
  );

  return (
    <div
      className={`relative ${shouldBeHidden ? "max-lg:hidden" : ""} ${!isAddToCartModalOpen ? "[&>div>a_img]:hover:scale-110 [&_:is(#card-buttons,#color-select)]:hover:opacity-100" : ""} ${isProductOutOfStock ? "[&>div]:hover:translate-x-0" : "[&_#card-buttons]:hover:translate-x-0 [&_#color-select]:hover:translate-y-0"}`}
    >
      <CardProductThumbnail
        productTitle={product.productTitle}
        slug={product.slug}
        productColors={product.availableColors}
        isProductOutOfStock={isProductOutOfStock}
        thumbnailImageUrl={product.thumbnailImageUrl}
        imageSets={getImageSetsBasedOnColors(product.productVariants)}
      />
      <CardProductInfo
        product={product}
        specialOffers={specialOffers}
        isProductOutOfStock={isProductOutOfStock}
        isProductLimitedStock={
          isAllowedToShowLimitedStock && isProductLimitedStock
        }
      />
      <ProductBadges
        hasSpecialOffer={checkIfSpecialOfferIsAvailable(product, specialOffers)}
        specialOffer={getProductSpecialOffer(product, specialOffers, "NA")}
        hasDiscount={!!Number(product.discountValue)}
        discount={{
          type: product.discountType,
          text:
            product.discountType === "Percentage"
              ? `${product.discountValue}%`
              : `৳ ${product.discountValue}`,
        }}
      />
      <CardButtons
        userData={userData}
        product={product}
        isProductOutOfStock={isProductOutOfStock}
        setIsAddToCartModalOpen={setIsAddToCartModalOpen}
        setSelectedAddToCartProduct={setSelectedAddToCartProduct}
      />
    </div>
  );
}
