import { useEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import thunderShape from "@/public/shapes/thunder-with-stroke.svg";
import Shapes from "./Shapes";
import ProductCard from "../../product-card/ProductCard";
import AddToCartModal from "../cart/AddToCartModal";

// Define allowed column options per breakpoint
const MOBILE_OPTIONS = [1, 2];
const TABLET_OPTIONS = [2, 3];
const DESKTOP_OPTIONS = [2, 3, 4];

// Define column numbers per breakpoint
const MOBILE_DEFAULT_COL = 1;
const TABLET_DEFAULT_COL = 2;
const DESKTOP_DEFAULT_COL = 3;

// Column options used in buttons for user to click
const colOptions = [
  { number: 1, svg: "/shop/grid-cols-1.svg" },
  { number: 2, svg: "/shop/grid-cols-2.svg" },
  { number: 3, svg: "/shop/grid-cols-3.svg" },
  { number: 4, svg: "/shop/grid-cols-4.svg" },
];

const getAllowedColsByWidth = (width) => {
  if (width < 640) return MOBILE_OPTIONS;
  if (width < 1024) return TABLET_OPTIONS;
  return DESKTOP_OPTIONS;
};

const getDefaultColByWidth = (width) => {
  if (width < 640) return MOBILE_DEFAULT_COL;
  if (width < 1024) return TABLET_DEFAULT_COL;
  return DESKTOP_DEFAULT_COL;
};

export default function ShopCards({
  userData,
  isSearchedOrFiltered,
  filteredProducts,
  filteredProductCount,
  selectedFilterOptions,
  calculateFinalPrice,
  specialOffers,
  primaryLocation,
  notifyVariants,
}) {
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedAddToCartProduct, setSelectedAddToCartProduct] =
    useState(null);
  const [cardHeight, setCardHeight] = useState(null);
  const [rows, setRows] = useState(null);
  const [cols, setCols] = useState(null);
  const [visibleCount, setVisibleCount] = useState(10);
  const [userSelectedCols, setUserSelectedCols] = useState(null);
  const observerRef = useRef();

  const isProductWithinPriceRange = (product) =>
    (!selectedFilterOptions.price.min ||
      selectedFilterOptions.price.min <=
      calculateFinalPrice(product, specialOffers)) &&
    (!selectedFilterOptions.price.max ||
      selectedFilterOptions.price.max >=
      calculateFinalPrice(product, specialOffers))

  const handleColChange = (number) => {
    setUserSelectedCols(number);
    setCols(number);
    setRows(Math.max(0, Math.ceil(filteredProductCount / number)));
    sessionStorage.setItem("shopCols", String(number));
  };

  useEffect(() => {
    const handleResize = () => {
      const allowedCols = getAllowedColsByWidth(window.innerWidth);

      let updatedCols;

      if (userSelectedCols && allowedCols.includes(userSelectedCols)) {
        updatedCols = userSelectedCols;
      } else {
        // Use the defined default number for this screen if current selection is invalid
        updatedCols = getDefaultColByWidth(window.innerWidth);
        setUserSelectedCols(updatedCols);
      }

      setCols(updatedCols);
      setRows(Math.max(0, Math.ceil(filteredProductCount / updatedCols)));

      setCardHeight(document.querySelector(".product-card")?.clientHeight);
    };

    handleResize(); // Call once on mount
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [filteredProductCount, userSelectedCols]);

  // Restore userSelectedCols from sessionStorage after mount
  useEffect(() => {
    const saved = sessionStorage.getItem("shopCols");
    if (saved) {
      const parsed = parseInt(saved, 10);
      if (!isNaN(parsed)) {
        setUserSelectedCols(parsed);
      }
    }
  }, []);

  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        // Check if the element is intersecting AND if there are more items to load
        if (
          entries[0].isIntersecting &&
          visibleCount < filteredProducts.length
        ) {
          setVisibleCount((prev) =>
            Math.min(prev + cols * 2, filteredProducts.length),
          );
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [filteredProducts, visibleCount, cols],
  );

  return (
    <>
      <div className="flex">
        {/* Product Count Text */}
        {isSearchedOrFiltered && (
          <p className="relative w-fit">
            {filteredProductCount || "No"} thread
            {filteredProductCount > 1 && "z"} found
            {/* Shape (Thunder) */}
            <span className="absolute -right-1 bottom-1/4 block aspect-square w-7 translate-x-full rotate-[26deg] max-sm:hidden">
              <Image
                src={thunderShape}
                alt="Thunder shape"
                className="object-contain"
                height={0}
                width={0}
                sizes="25vw"
                fill
              />
            </span>
          </p>
        )}
        {/* Column selection buttons */}
        <div className="ml-auto flex gap-2">
          {colOptions.map((option) => (
            <button
              key={"grid-layout-option-" + option.number}
              onClick={() => handleColChange(option.number)}
              className={`rounded-[3px] border p-1.5 transition-[background-color,border-color] duration-300 ease-in-out hover:border-[var(--color-secondary-600)] hover:bg-[var(--color-secondary-500)] ${cols === option.number ? "border-[var(--color-secondary-600)] bg-[var(--color-secondary-500)]" : "border-neutral-200 bg-neutral-100"} ${option.number === 1 ? "sm:hidden" : option.number === 3 ? "max-sm:hidden" : option.number !== 2 ? "max-lg:hidden" : ""}`}
            >
              <Image
                src={option.svg}
                alt={"grid-layout-option-" + option.number}
                height={0}
                width={0}
                className="size-4"
              />
            </button>
          ))}
        </div>
      </div>
      <section
        className="relative grid gap-x-4 gap-y-12 pb-7"
        style={{
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        <Shapes cardHeight={cardHeight} rows={rows} />
        {filteredProducts
          ?.slice(0, visibleCount)
          .map(
            (filteredProduct) =>
              isProductWithinPriceRange(filteredProduct) && (
                <ProductCard
                  key={"filtered-product-" + filteredProduct._id}
                  userData={userData}
                  product={filteredProduct}
                  specialOffers={specialOffers}
                  primaryLocation={primaryLocation}
                  isAddToCartModalOpen={isAddToCartModalOpen}
                  setIsAddToCartModalOpen={setIsAddToCartModalOpen}
                  setSelectedAddToCartProduct={setSelectedAddToCartProduct}
                  isAllowedToShowLimitedStock={true}
                />
              ),
          )}
        {/* Load More trigger if there are more items to load */}
        {visibleCount < filteredProducts?.length && (
          <div
            ref={loadMoreRef}
            className="col-span-full flex justify-center py-8"
          >
            <span className="animate-pulse text-gray-500">
              Loading products...
            </span>
          </div>
        )}
        <AddToCartModal
          userData={userData}
          isAddToCartModalOpen={isAddToCartModalOpen}
          setIsAddToCartModalOpen={setIsAddToCartModalOpen}
          product={selectedAddToCartProduct}
          specialOffers={specialOffers}
          primaryLocation={primaryLocation}
          notifyVariants={notifyVariants}
        />
      </section>
    </>
  );
}
