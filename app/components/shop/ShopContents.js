"use client";

import { useState, useEffect, useCallback, useRef, useMemo, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { HiOutlineAdjustmentsHorizontal } from "react-icons/hi2";
import { useLoading } from "@/app/contexts/loading";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import { parseFiltersFromSearchParams, filtersToParams, buildListingQueryFromSearchParams, PAGE_SIZE } from "@/app/lib/shop/filterUrl";
import Filter from "@/app/components/shop/Filter";
import EmptyShopProducts from "@/app/components/shop/EmptyShopProducts";
import ShopCards from "@/app/components/shop/cards/ShopCards";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";

export default function ShopContents({
  userData,
  categories,
  specialOffers,
  notifyVariants,
  initialCategory,
  initialProducts,
  initialTotal,
  initialFilters,
  ssrFailed,
  initialCols,
}) {
  const { setIsPageLoading } = useLoading();
  const [isFilterButtonClicked, setIsFilterButtonClicked] = useState(false);
  const [products, setProducts] = useState(initialProducts ?? []);
  const [total, setTotal] = useState(initialTotal ?? 0);
  const [page, setPage] = useState(1);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [filters, setFilters] = useState(initialFilters ?? null);

  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [, startTransition] = useTransition();

  const isFirstRun = useRef(true);
  // The exact query string SSR fetched with — used to decide whether client
  // trust of SSR data is still valid on mount.
  const initialQueryKeyRef = useRef(buildListingQueryFromSearchParams(searchParams, initialCategory, { page: 1, limit: PAGE_SIZE }));

  // ---- URL is the single source of truth for filters/keyword ----
  const selectedFilterOptions = useMemo(
    () => parseFiltersFromSearchParams(searchParams, initialCategory),
    [searchParams, initialCategory],
  );
  const keyword = searchParams.get("search") || "";

  // Drop-in shim: Filter.jsx and EmptyShopProducts call this exactly like
  // useState's setter (supports both object patches and updater functions),
  // but under the hood it rewrites the URL instead of local state.
  const setSelectedFilterOptions = useCallback(
    (update) => {
      const next =
        typeof update === "function" ? update(selectedFilterOptions) : { ...selectedFilterOptions, ...update };
      const params = filtersToParams(next, searchParams.toString());
      startTransition(() => {
        router.replace(`${pathname}?${params.toString()}`, { scroll: false });
      });
    },
    [selectedFilterOptions, searchParams, pathname, router],
  );

  const sortParam = (() => {
    const s = Array.from(selectedFilterOptions.sortBy)[0];
    if (s === "Price (Low to High)") return "price_asc";
    if (s === "Price (High to Low)") return "price_desc";
    return "newest";
  })();

  const buildQuery = useCallback(
    (pageNum) => {
      const filterByArr = Array.from(selectedFilterOptions.filterBy);
      const params = new URLSearchParams();
      params.set("page", pageNum);
      params.set("limit", PAGE_SIZE);
      params.set("sort", sortParam);
      if (initialCategory) params.set("category_slug", initialCategory);
      if (keyword) params.set("search", keyword);
      if (filterByArr.includes("Popular")) params.set("is_trending", "true");
      if (filterByArr.includes("New Arrivals")) params.set("new_arrivals_only", "true");
      if (filterByArr.includes("In Stock")) params.set("in_stock", "true");
      if (filterByArr.includes("On Sale")) params.set("on_sale", "true");
      if (selectedFilterOptions.sizes.size) params.set("size_ids", Array.from(selectedFilterOptions.sizes).join(","));
      if (selectedFilterOptions.colors.size) params.set("color_ids", Array.from(selectedFilterOptions.colors).join(","));
      if (selectedFilterOptions.price.min != null) params.set("price_min", selectedFilterOptions.price.min);
      if (selectedFilterOptions.price.max != null) params.set("price_max", selectedFilterOptions.price.max);
      return params.toString();
    },
    [initialCategory, keyword, selectedFilterOptions, sortParam],
  );

  const buildFilterQuery = useCallback(() => {
    const filterByArr = Array.from(selectedFilterOptions.filterBy);
    const params = new URLSearchParams();
    if (initialCategory) params.set("category_slug", initialCategory);
    if (keyword) params.set("search", keyword);
    if (filterByArr.includes("Popular")) params.set("is_trending", "true");
    if (filterByArr.includes("New Arrivals")) params.set("new_arrivals_only", "true");
    if (filterByArr.includes("In Stock")) params.set("in_stock", "true");
    if (filterByArr.includes("On Sale")) params.set("on_sale", "true");
    if (selectedFilterOptions.sizes.size) params.set("size_ids", Array.from(selectedFilterOptions.sizes).join(","));
    if (selectedFilterOptions.colors.size) params.set("color_ids", Array.from(selectedFilterOptions.colors).join(","));
    if (selectedFilterOptions.price.min != null) params.set("price_min", selectedFilterOptions.price.min);
    if (selectedFilterOptions.price.max != null) params.set("price_max", selectedFilterOptions.price.max);
    return params.toString();
  }, [initialCategory, keyword, selectedFilterOptions]);

  // ---- Fetch on URL change; trust SSR only on true first mount w/ matching query ----
  useEffect(() => {
    const currentKey = buildListingQueryFromSearchParams(searchParams, initialCategory, { page: 1, limit: PAGE_SIZE });

    if (isFirstRun.current) {
      isFirstRun.current = false;
      if (currentKey === initialQueryKeyRef.current && !ssrFailed) {
        setIsPageLoading(false);
        return;
      }
      // URL doesn't match what SSR fetched (e.g. stale filterState changed it)
      // or SSR itself failed — fall through and do a real client fetch.
    }

    const controller = new AbortController();

    const fetchData = async () => {
      setIsLoadingProducts(true);
      try {
        const [productsResult, filtersResult] = await Promise.all([
          routeFetch(`/api/products/all?${buildQuery(1)}`, { signal: controller.signal }),
          routeFetch(`/api/products/filters?${buildFilterQuery()}`, { signal: controller.signal }),
        ]);
        if (productsResult.ok !== false) {
          setProducts(productsResult.items ?? productsResult.data?.items ?? []);
          setTotal(productsResult.total ?? productsResult.data?.total ?? 0);
          setPage(1);
        }
        if (filtersResult.ok !== false) {
          setFilters(filtersResult.data ?? filtersResult);
        }
      } catch (err) {
        if (err.name !== "AbortError") console.error("Shop fetch failed:", err);
      } finally {
        setIsLoadingProducts(false);
        setIsPageLoading(false);
      }
    };

    fetchData();
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.toString(), buildQuery, buildFilterQuery, ssrFailed]);

  const loadMore = useCallback(async () => {
    if (isLoadingMore || products.length >= total) return;
    setIsLoadingMore(true);
    const nextPage = page + 1;
    try {
      const result = await routeFetch(`/api/products/all?${buildQuery(nextPage)}`);
      const items = result.items ?? result.data?.items ?? [];
      setProducts((prev) => [...prev, ...items]);
      setPage(nextPage);
    } catch (err) {
      console.error("Load more failed:", err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [buildQuery, isLoadingMore, page, products.length, total]);

  // ---- Filter panel open/closed — pure UI state, sessionStorage is fine here ----
  useEffect(() => {
    if (sessionStorage.getItem("filterOpen") === "true") setIsFilterButtonClicked(true);
  }, []);

  useEffect(() => {
    if (isFilterButtonClicked) sessionStorage.setItem("filterOpen", "true");
    else sessionStorage.removeItem("filterOpen");
  }, [isFilterButtonClicked]);

  const handleClearAll = () => {
    setIsFilterButtonClicked(false);
    startTransition(() => {
      router.replace("/shop", { scroll: false });
    });
  };

  // category is a route segment (/shop/[slug]), not a query param — navigate,
  // carrying over any other active filters in the query string.
  const handleCategoryChange = (newKeys) => {
    const keysArray = Array.from(newKeys);
    const cleared = keysArray.includes("Clear") || keysArray.length === 0;
    const qs = searchParams.toString();
    const suffix = qs ? `?${qs}` : "";

    sessionStorage.setItem("filterOpen", "true");
    startTransition(() => {
      router.push(cleared ? `/shop${suffix}` : `/shop/${keysArray[0]}${suffix}`);
    });
  };

  const isNoFilterOptionSelected = useMemo(
    () =>
      Object.entries(selectedFilterOptions).every(([key, value]) => {
        if (key === "price") return value.min == null && value.max == null;
        if (value instanceof Set) return value.size === 0;
        if (Array.isArray(value)) return value.length === 0;
        return true;
      }),
    [selectedFilterOptions],
  );

  return (
    <div className="flex min-h-full grow flex-col gap-y-7 px-5 sm:px-8 lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0">
      <button
        className={`relative z-[1] flex w-fit items-center gap-x-3 rounded-[4px] bg-[var(--color-secondary-500)] px-[18px] py-3 transition-colors duration-300 ease-in-out hover:bg-[var(--color-secondary-600)] ${isFilterButtonClicked ? "hidden" : "block"}`}
        onClick={() => setIsFilterButtonClicked(true)}
      >
        <p className="font-semibold">Filter</p>
        <HiOutlineAdjustmentsHorizontal size={20} />
      </button>

      <Filter
        isFilterButtonClicked={isFilterButtonClicked}
        categories={categories}
        filters={filters}
        selectedFilterOptions={selectedFilterOptions}
        setSelectedFilterOptions={setSelectedFilterOptions}
        isNoFilterOptionSelected={isNoFilterOptionSelected}
        onClearAll={handleClearAll}
        onCategoryChange={handleCategoryChange}
      />

      <section
        className={`flex grow flex-col gap-y-7 ${isLoadingProducts ? "opacity-60 transition-opacity pointer-events-none" : ""
          }`}
      >
        {!products.length && !isLoadingProducts ? (
          <EmptyShopProducts
            keyword={keyword}
            isNoFilterOptionSelected={isNoFilterOptionSelected}
            setSelectedFilterOptions={setSelectedFilterOptions}
          />
        ) : !products.length && isLoadingProducts ? (
          <LoadingSpinner />
        ) : (
          <ShopCards
            userData={userData}
            isSearchedOrFiltered={!isNoFilterOptionSelected || !!keyword?.length}
            products={products}
            total={total}
            isLoadingMore={isLoadingMore}
            onLoadMore={loadMore}
            specialOffers={specialOffers}
            notifyVariants={notifyVariants}
            initialCols={initialCols}
          />
        )}
      </section>
    </div>
  );
}