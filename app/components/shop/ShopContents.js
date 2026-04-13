"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { useLoading } from "@/app/contexts/loading";
import {
  calculateFinalPrice,
  checkIfOnlyRegularDiscountIsAvailable,
  checkIfSpecialOfferIsAvailable,
} from "@/app/utils/orderCalculations";
import { CheckIfProductIsOutOfStock } from "@/app/utils/productSkuCalculation";
import Filter from "@/app/components/shop/Filter";
import EmptyShopProducts from "@/app/components/shop/EmptyShopProducts";
import ShopCards from "@/app/components/shop/cards/ShopCards";
import { generateSlug } from "./generateSlug";

export default function ShopContents({
  userData,
  products,
  specialOffers,
  primaryLocation,
  notifyVariants,
  initialCategory
}) {
  const { setIsPageLoading } = useLoading();
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false);
  const [selectedFilterOptions, setSelectedFilterOptions] = useState({
    sortBy: new Set([]),
    filterBy: new Set([]),
    category: new Set([]),
    sizes: new Set([]),
    colors: new Set([]),
    price: {
      min: undefined,
      max: undefined,
    },
  });
  const [filteredProducts, setFilteredProducts] = useState(null);
  const [keyword, setKeyword] = useState("");
  const searchParams = useSearchParams();
  const isLoading = !products || !specialOffers || !primaryLocation;
  const router = useRouter();
  const pathname = usePathname();

  const isProductWithinPriceRange = (product) =>
    (!selectedFilterOptions.price.min ||
      selectedFilterOptions.price.min <=
      calculateFinalPrice(product, specialOffers)) &&
    (!selectedFilterOptions.price.max ||
      selectedFilterOptions.price.max >=
      calculateFinalPrice(product, specialOffers));

  const isNoFilterOptionSelected = Object.values(selectedFilterOptions).every(
    (value) => {
      if (Array.isArray(value)) {
        return value.length === 0;
      } else {
        return !value.min || !value.max;
      }
    },
  );

  const filteredProductCount = filteredProducts?.reduce(
    (accumulator, product) =>
      accumulator + (isProductWithinPriceRange(product) ? 1 : 0),
    0,
  );

  const handleClearAll = () => {
    setSelectedFilterOptions({
      sortBy: new Set([]),
      filterBy: new Set([]),
      category: new Set([]),
      sizes: new Set([]),
      colors: new Set([]),
      price: {
        min: undefined,
        max: undefined,
      },
    });
    setIsFilterButtonClicked(false);
    sessionStorage.removeItem("filterState");
    if (pathname !== "/shop") router.push("/shop");
  };

  const handleCategoryChange = (newKeys) => {
    const keysArray = Array.from(newKeys);
    const cleared = keysArray.includes("Clear") || keysArray.length === 0;

    if (cleared) {
      setSelectedFilterOptions((prev) => ({ ...prev, category: new Set([]) }));

      // Save other filter state before navigating to /shop
      const stateToSave = {
        sortBy: Array.from(selectedFilterOptions.sortBy),
        filterBy: Array.from(selectedFilterOptions.filterBy),
        sizes: Array.from(selectedFilterOptions.sizes),
        colors: Array.from(selectedFilterOptions.colors),
        price: selectedFilterOptions.price,
      };
      sessionStorage.setItem("filterState", JSON.stringify(stateToSave));

      if (pathname !== "/shop") router.push("/shop");
      return;
    }

    const selectedLabel = keysArray[0];
    const selectedSlug = generateSlug(selectedLabel);

    const stateToSave = {
      sortBy: Array.from(selectedFilterOptions.sortBy),
      filterBy: Array.from(selectedFilterOptions.filterBy),
      sizes: Array.from(selectedFilterOptions.sizes),
      colors: Array.from(selectedFilterOptions.colors),
      price: selectedFilterOptions.price,
    };
    sessionStorage.setItem("filterState", JSON.stringify(stateToSave));
    sessionStorage.setItem("filterOpen", "true");

    router.push(`/shop/${selectedSlug}`);
  };

  useEffect(() => {
    setKeyword(searchParams.get("search"));
    const filterByFromParam = searchParams.get("filterBy");

    // Restore saved filter state from sessionStorage (only on mount)
    let restoredState = null;
    const savedFilter = sessionStorage.getItem("filterState");
    if (savedFilter) {
      try {
        restoredState = JSON.parse(savedFilter);
      } catch (e) {
        // ignore
      }
      sessionStorage.removeItem("filterState");
    }

    setSelectedFilterOptions((prev) => ({
      ...prev,
      // filterBy: param takes priority, then restored state, then keep existing
      filterBy: filterByFromParam
        ? [filterByFromParam]
        : restoredState?.filterBy?.length
          ? restoredState.filterBy
          : new Set([]),
      // sortBy, sizes, colors, price: restore if available
      sortBy: restoredState?.sortBy?.length ? restoredState.sortBy : prev.sortBy,
      sizes: restoredState?.sizes?.length ? restoredState.sizes : prev.sizes,
      colors: restoredState?.colors?.length ? restoredState.colors : prev.colors,
      price: restoredState?.price?.min || restoredState?.price?.max
        ? restoredState.price
        : prev.price,
      // category: always from route, never from restored state
      category: !initialCategory ? new Set([]) : [initialCategory],
    }));

    setIsPageLoading(false);
  }, [searchParams, setIsPageLoading, initialCategory]);

  // Keep only filterOpen restore in mount effect
  useEffect(() => {
    if (sessionStorage.getItem("filterOpen") === "true") {
      setIsFilterButtonClicked(true);
    }
  }, []);

  // Sync filter state to sessionStorage whenever it changes
  useEffect(() => {
    if (isFilterButtonClicked) {
      sessionStorage.setItem("filterOpen", "true");
    } else {
      sessionStorage.removeItem("filterOpen");
    }
  }, [isFilterButtonClicked]);

  // Cleanup when leaving shop entirely
  useEffect(() => {
    return () => {
      if (!window.location.pathname.startsWith("/shop")) {
        sessionStorage.removeItem("filterOpen");
        sessionStorage.removeItem("filterState");
        sessionStorage.removeItem("shopCols");
      }
    };
  }, []);

  useEffect(() => {
    if (!isLoading)
      setFilteredProducts(
        products
          .filter((product) => {
            return (
              product.status === "active" &&
              (!keyword ||
                product.productTitle
                  .toLowerCase()
                  .includes(keyword.toLowerCase())) &&
              (!selectedFilterOptions.filterBy.length ||
                (selectedFilterOptions.filterBy.includes("Popular") &&
                  product.trending === "Yes") ||
                (selectedFilterOptions.filterBy.includes("New Arrivals") &&
                  product.newArrival === "Yes") ||
                (selectedFilterOptions.filterBy.includes("Special Offers") &&
                  checkIfSpecialOfferIsAvailable(product, specialOffers)) ||
                (selectedFilterOptions.filterBy.includes("In Stock") &&
                  !CheckIfProductIsOutOfStock(
                    product?.productVariants,
                    primaryLocation,
                  )) ||
                (selectedFilterOptions.filterBy.includes("On Sale") &&
                  checkIfOnlyRegularDiscountIsAvailable(
                    product,
                    specialOffers,
                  ))) &&
              (!selectedFilterOptions.category.length ||
                product.category ===
                selectedFilterOptions.category.toString()) &&
              (!selectedFilterOptions.sizes.length ||
                selectedFilterOptions.sizes.some((selectedSize) =>
                  product.allSizes.some(
                    (productSize) => productSize == selectedSize,
                  ),
                )) &&
              (!selectedFilterOptions.colors.length ||
                selectedFilterOptions.colors.some((selectedColor) =>
                  product.availableColors.some(
                    (productColor) => productColor.label === selectedColor,
                  ),
                ))
            );
          })
          .sort((productA, productB) => {
            const selectedSortByOption =
              selectedFilterOptions.sortBy.toString();

            if (selectedSortByOption === "Price (Low to High)")
              return (
                calculateFinalPrice(productA, specialOffers) -
                calculateFinalPrice(productB, specialOffers)
              );
            else if (selectedSortByOption === "Price (High to Low)")
              return (
                calculateFinalPrice(productB, specialOffers) -
                calculateFinalPrice(productA, specialOffers)
              );
            else if (selectedSortByOption === "Newest")
              return (
                new Date(productB.publishDate) - new Date(productA.publishDate)
              );
            else return 0;
          }),
      );
  }, [
    isLoading,
    specialOffers,
    products,
    primaryLocation,
    keyword,
    selectedFilterOptions.category,
    selectedFilterOptions.colors,
    selectedFilterOptions.filterBy,
    selectedFilterOptions.sizes,
    selectedFilterOptions.sortBy,
  ]);

  if (!isLoading)
    return (
      <div className="flex min-h-full grow flex-col gap-y-7 px-5 sm:px-8 lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0">
        {/* Filter Button */}
        <button
          className={`relative z-[1] flex w-fit items-center gap-x-3 rounded-[4px] bg-[var(--color-secondary-500)] px-[18px] py-3 transition-colors duration-300 ease-in-out hover:bg-[var(--color-secondary-600)] ${isFilterButtonClicked ? "hidden" : "block"}`}
          onClick={() => setIsFilterButtonClicked(true)}
        >
          <p className="font-semibold">Filter</p>
          <HiOutlineAdjustmentsHorizontal size={20} />
        </button>
        <Filter
          isFilterButtonClicked={isFilterButtonClicked}
          unfilteredProducts={products}
          filteredProducts={filteredProducts}
          selectedFilterOptions={selectedFilterOptions}
          setSelectedFilterOptions={setSelectedFilterOptions}
          isNoFilterOptionSelected={isNoFilterOptionSelected}
          calculateFinalPrice={calculateFinalPrice}
          specialOffers={specialOffers}
          onClearAll={handleClearAll}
          onCategoryChange={handleCategoryChange}
        />
        {!filteredProductCount ? (
          <EmptyShopProducts
            keyword={keyword}
            isNoFilterOptionSelected={isNoFilterOptionSelected}
            setSelectedFilterOptions={setSelectedFilterOptions}
          />
        ) : (
          <ShopCards
            userData={userData}
            isSearchedOrFiltered={
              keyword?.length ||
              Object.values(selectedFilterOptions).some(
                (selectedValue) => selectedValue.length,
              )
            }
            filteredProducts={filteredProducts}
            filteredProductCount={filteredProductCount}
            selectedFilterOptions={selectedFilterOptions}
            calculateFinalPrice={calculateFinalPrice}
            specialOffers={specialOffers}
            primaryLocation={primaryLocation}
            notifyVariants={notifyVariants}
          />
        )}
      </div>
    );
}
