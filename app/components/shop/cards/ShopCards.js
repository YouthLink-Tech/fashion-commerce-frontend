import { useEffect, useLayoutEffect, useState, useRef, useCallback } from "react";
import Image from "next/image";
import thunderShape from "@/public/shapes/thunder-with-stroke.svg";
import Shapes from "./Shapes";
import ProductCard from "../../product-card/ProductCard";
import AddToCartModal from "../cart/AddToCartModal";

const MOBILE_OPTIONS = [1, 2];
const TABLET_OPTIONS = [2, 3];
const DESKTOP_OPTIONS = [2, 3, 4];

const MOBILE_DEFAULT_COL = 1;
const TABLET_DEFAULT_COL = 2;
const DESKTOP_DEFAULT_COL = 3;

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
  products,
  total,
  isLoadingMore,
  onLoadMore,
  specialOffers,
  notifyVariants,
  initialCols,
}) {
  const [isAddToCartModalOpen, setIsAddToCartModalOpen] = useState(false);
  const [selectedAddToCartProduct, setSelectedAddToCartProduct] = useState(null);
  const [cardHeight, setCardHeight] = useState(null);
  // Seeded from the cookie value the server read (initialCols) — this is
  // now the single source of truth, not sessionStorage.
  const [userSelectedCols, setUserSelectedCols] = useState(initialCols ?? null);
  const observerRef = useRef();

  const cols =
    userSelectedCols ??
    getDefaultColByWidth(typeof window !== "undefined" ? window.innerWidth : 1024);
  const rows = Math.max(0, Math.ceil(products.length / cols));

  const handleColChange = (number) => {
    setUserSelectedCols(number);
    document.cookie = `shopCols=${number}; path=/; max-age=31536000; SameSite=Lax`;
  };

  // Only validates the SSR-provided initialCols against the *actual*
  // viewport width (unknown to the server) — does NOT re-read any storage,
  // since initialCols/cookie is already the source of truth. This was
  // previously reading sessionStorage here, which no longer gets written
  // to (handleColChange only sets the cookie now), so it was always
  // overwriting the correct SSR value with the breakpoint default.
  useLayoutEffect(() => {
    const width = window.innerWidth;
    const allowedCols = getAllowedColsByWidth(width);

    setUserSelectedCols((prev) =>
      prev && allowedCols.includes(prev) ? prev : getDefaultColByWidth(width),
    );
    setCardHeight(document.querySelector(".product-card")?.clientHeight);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const allowedCols = getAllowedColsByWidth(window.innerWidth);
      setUserSelectedCols((prev) => {
        if (prev && allowedCols.includes(prev)) return prev;
        return getDefaultColByWidth(window.innerWidth);
      });
      setCardHeight(document.querySelector(".product-card")?.clientHeight);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [products.length]);

  const loadMoreRef = useCallback(
    (node) => {
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) onLoadMore();
      });

      if (node) observerRef.current.observe(node);
    },
    [onLoadMore],
  );

  return (
    <>
      <div className="flex">
        {isSearchedOrFiltered && total > 0 && (
          <p className="relative w-fit">
            {total} thread
            {total > 1 && "z"} found
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
        className={`relative grid gap-x-4 gap-y-12 pb-7 ${!userSelectedCols ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" : ""
          }`}
        style={userSelectedCols ? { gridTemplateColumns: `repeat(${userSelectedCols}, minmax(0, 1fr))` } : undefined}
      >
        <Shapes cardHeight={cardHeight} rows={rows} />
        {products.map((product) => (
          <ProductCard
            key={"filtered-product-" + product.id}
            userData={userData}
            product={product}
            specialOffers={specialOffers}
            isAddToCartModalOpen={isAddToCartModalOpen}
            setIsAddToCartModalOpen={setIsAddToCartModalOpen}
            setSelectedAddToCartProduct={setSelectedAddToCartProduct}
            isAllowedToShowLimitedStock={true}
          />
        ))}
        {products.length < total && (
          <div ref={loadMoreRef} className="col-span-full flex justify-center py-8">
            <span className="animate-pulse text-gray-500">
              {isLoadingMore ? "Loading products..." : ""}
            </span>
          </div>
        )}
        <AddToCartModal
          userData={userData}
          isAddToCartModalOpen={isAddToCartModalOpen}
          setIsAddToCartModalOpen={setIsAddToCartModalOpen}
          product={selectedAddToCartProduct}
          specialOffers={specialOffers}
          notifyVariants={notifyVariants}
        />
      </section>
    </>
  );
}