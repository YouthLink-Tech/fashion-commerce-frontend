import {
  checkIfProductIsLimitedStock,
  CheckIfProductIsOutOfStock,
} from "@/app/utils/productSkuCalculation";
import {
  checkIfSpecialOfferIsAvailable,
  getProductSpecialOffer,
} from "@/app/utils/orderCalculations";
import { getImageSetsByColor } from "@/app/utils/getImageSetsBasedOnColors";
import ProductBadges from "../ui/badges/ProductBadges";
import CardProductThumbnail from "./CardProductThumbnail";
import CardProductInfo from "./CardProductInfo";
import CardButtons from "./CardButtons";
import { getDiscountInfo } from "../product/ProductDiscountInfos";

export default function ProductCard({
  userData,
  product,
  specialOffers,
  isAddToCartModalOpen,
  setIsAddToCartModalOpen,
  setSelectedAddToCartProduct,
  shouldBeHidden,
  isAllowedToShowLimitedStock,
}) {

  const isProductOutOfStock = product.is_out_of_stock;
  const isProductLimitedStock = isAllowedToShowLimitedStock && product.is_limited_stock;
  const imageSets = getImageSetsByColor(product.variants);

  const { hasDiscount, discount } = getDiscountInfo(product);

  return (
    <div
      className={`relative ${shouldBeHidden ? "max-lg:hidden" : ""} ${!isAddToCartModalOpen ? "[&>div>a_img]:hover:scale-110 [&_:is(#card-buttons,#color-select)]:hover:opacity-100" : ""} ${isProductOutOfStock ? "[&>div]:hover:translate-x-0" : "[&_#card-buttons]:hover:translate-x-0 [&_#color-select]:hover:translate-y-0"}`}
    >
      <CardProductThumbnail
        productTitle={product.title}
        slug={product.slug}
        productColors={product.colors}
        isProductOutOfStock={isProductOutOfStock}
        thumbnail={product.thumbnail}
        imageSets={imageSets}
      />
      <CardProductInfo
        product={product}
        specialOffers={specialOffers}
        isProductOutOfStock={isProductOutOfStock}
        isProductLimitedStock={isProductLimitedStock}
      />
      <ProductBadges
        isTrending={!!product.is_trending}
        isNewArrival={!!product.is_new_arrival}
        hasSpecialOffer={checkIfSpecialOfferIsAvailable(product, specialOffers)}
        specialOffer={getProductSpecialOffer(product, specialOffers, "NA")}
        hasDiscount={hasDiscount}
        discount={discount}
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
