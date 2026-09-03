const SORT_MAP = {
  Newest: "newest",
  "Price (Low to High)": "price_asc",
  "Price (High to Low)": "price_desc",
};

const SORT_MAP_REVERSE = Object.fromEntries(
  Object.entries(SORT_MAP).map(([k, v]) => [v, k]),
);

export const PAGE_SIZE = 10;

const FILTER_MAP = {
  Popular: "popular",
  "New Arrivals": "new_arrivals",
  "In Stock": "in_stock",
  "Special Offers": "special_offers",
  "On Sale": "on_sale",
};

export const FILTER_MAP_REVERSE = Object.fromEntries(
  Object.entries(FILTER_MAP).map(([k, v]) => [v, k]),
);

export function parseFiltersFromSearchParams(searchParams, initialCategory) {
  const sortParam = searchParams.get("sort");
  const filterByParam = searchParams.get("filterBy");

  return {
    sortBy: new Set(sortParam ? [SORT_MAP_REVERSE[sortParam] ?? "Newest"] : []),
    filterBy: new Set(
      filterByParam
        ? filterByParam.split(",").map((v) => FILTER_MAP_REVERSE[v] ?? v)
        : [],
    ),
    // category: initialCategory ? [initialCategory] : [],
    category: new Set(initialCategory ? [initialCategory] : []),
    sizes: new Set(searchParams.get("size_ids")?.split(",").filter(Boolean) ?? []),
    colors: new Set(searchParams.get("color_ids")?.split(",").filter(Boolean) ?? []),
    price: {
      min: searchParams.get("price_min") ? Number(searchParams.get("price_min")) : undefined,
      max: searchParams.get("price_max") ? Number(searchParams.get("price_max")) : undefined,
    },
  };
}

// Takes the *next* filter object (shape matches selectedFilterOptions) and the
// current URLSearchParams string, returns a new URLSearchParams with filter
// keys replaced, everything else (search, page, etc.) preserved unless noted.
export function filtersToParams(nextFilters, currentSearchParamsString) {
  const params = new URLSearchParams(currentSearchParamsString);

  const sortLabel = Array.from(nextFilters.sortBy ?? [])[0];
  sortLabel && SORT_MAP[sortLabel]
    ? params.set("sort", SORT_MAP[sortLabel])
    : params.delete("sort");

  const filterByArr = Array.from(nextFilters.filterBy ?? []).map((v) => FILTER_MAP[v] ?? v);
  filterByArr.length ? params.set("filterBy", filterByArr.join(",")) : params.delete("filterBy");

  const sizesArr = Array.from(nextFilters.sizes ?? []);
  sizesArr.length ? params.set("size_ids", sizesArr.join(",")) : params.delete("size_ids");

  const colorsArr = Array.from(nextFilters.colors ?? []);
  colorsArr.length ? params.set("color_ids", colorsArr.join(",")) : params.delete("color_ids");

  nextFilters.price?.min != null
    ? params.set("price_min", nextFilters.price.min)
    : params.delete("price_min");
  nextFilters.price?.max != null
    ? params.set("price_max", nextFilters.price.max)
    : params.delete("price_max");

  params.delete("page"); // any filter change resets pagination
  return params;
}

// Builds the products-listing query string directly from a URLSearchParams
// (or anything URLSearchParams-constructible) — used by SSR (page.js) so
// the server fetch and the client's buildQuery in ShopContents can never
// drift apart. category comes from the route segment, not the query string,
// so it's passed separately.
export function buildListingQueryFromSearchParams(searchParams, categorySlug, { page = 1, limit = PAGE_SIZE } = {}) {
  const parsed = parseFiltersFromSearchParams(searchParams, categorySlug);
  const params = filtersToParams(parsed, "");
  params.set("page", page);
  params.set("limit", limit);
  if (categorySlug) params.set("category_slug", categorySlug);

  const keyword = searchParams.get("search");
  if (keyword) params.set("search", keyword);

  // filtersToParams writes the internal "filterBy" URL param
  // (Popular,New Arrivals,...) — translate to the actual backend flags
  // getProductListing expects, same mapping ShopContents.buildQuery uses.
  const filterByArr = Array.from(parsed.filterBy);
  if (filterByArr.includes("Popular")) params.set("is_trending", "true");
  if (filterByArr.includes("New Arrivals")) params.set("new_arrivals_only", "true");
  if (filterByArr.includes("In Stock")) params.set("in_stock", "true");
  if (filterByArr.includes("On Sale")) params.set("on_sale", "true");
  params.delete("filterBy"); // internal UI param, not a backend param

  const sortLabel = Array.from(parsed.sortBy)[0];
  params.set("sort", sortLabel === "Price (Low to High)" ? "price_asc" : sortLabel === "Price (High to Low)" ? "price_desc" : "newest");

  return params.toString();
}

export function buildFilterFacetsQueryFromSearchParams(searchParams, categorySlug) {
  const parsed = parseFiltersFromSearchParams(searchParams, categorySlug);
  const params = new URLSearchParams();
  if (categorySlug) params.set("category_slug", categorySlug);

  const keyword = searchParams.get("search");
  if (keyword) params.set("search", keyword);

  const filterByArr = Array.from(parsed.filterBy);
  if (filterByArr.includes("Popular")) params.set("is_trending", "true");
  if (filterByArr.includes("New Arrivals")) params.set("new_arrivals_only", "true");
  if (filterByArr.includes("In Stock")) params.set("in_stock", "true");
  if (filterByArr.includes("On Sale")) params.set("on_sale", "true");

  return params.toString();
}

// Next's searchParams prop gives { key: string | string[] } — repeated keys
// become arrays. new URLSearchParams(obj) does NOT handle arrays correctly;
// it stringifies them (['1','2'] -> "1,2" under one key), silently merging
// what should be multiple values. This preserves them properly.
export function toURLSearchParams(searchParams) {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams ?? {})) {
    if (value == null) continue;
    if (Array.isArray(value)) {
      value.forEach((v) => params.append(key, v));
    } else {
      params.set(key, value);
    }
  }
  return params;
}