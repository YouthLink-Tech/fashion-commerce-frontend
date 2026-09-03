import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { extractData } from "@/app/lib/extractData";
import { authOptions } from "@/app/utils/authOptions";
import ShopContents from "@/app/components/shop/ShopContents";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import { FRONTEND_URL } from "@/app/config/site";
import { redirect } from "next/navigation";
import { COMPANY_NAME } from "@/app/config/company";
import { buildFilterFacetsQueryFromSearchParams, buildListingQueryFromSearchParams, toURLSearchParams } from "@/app/lib/shop/filterUrl";
import { cookies } from "next/headers";

export async function generateMetadata({ params }) {
  const { category } = params;

  const result = await rawFetch("/api/category/all", {
    next: { revalidate: 7200, tags: ["categories"] },
  });
  const categories = result?.data ?? [];
  const matched = categories.find((c) => c.slug === category);
  const name = matched?.name ?? category.replace(/-/g, " ");

  if (!matched) {
    return {
      title: `Category Not Found`,
      robots: { index: false, follow: false },
    };
  }

  return {
    title: `${name}`,
    description: `Shop the latest ${name} collection at ${COMPANY_NAME}. Find the best styles, prices, and new arrivals in ${name}.`,
    keywords: [
      name,
      COMPANY_NAME,
      "men's clothing Bangladesh",
      "polo shirts",
      "formal shirts",
      "casual wear",
      "men's fashion",
      "fashion Bangladesh",
      "buy online",
    ],
    robots: { index: true, follow: true },
    alternates: { canonical: `${FRONTEND_URL}/shop/${category}` },
    openGraph: {
      title: `${name} | Shop at ${COMPANY_NAME}`,
      description: `Shop the latest ${name} collection at ${COMPANY_NAME}.`,
      url: `${FRONTEND_URL}/shop/${category}`,
      siteName: `${COMPANY_NAME}`,
      type: "website",
      images: [
        {
          url: `${FRONTEND_URL}/logo/logo.png`,
          width: 1200,
          height: 630,
          alt: `${name} collection at ${COMPANY_NAME}`,
        },
      ],
    },
  };
}

export default async function CategoryShop({ params, searchParams }) {
  const { category } = params;

  const sessionPromise = getServerSession(authOptions).catch((err) => {
    console.error("Session fetch failed:", err);
    return null;
  });

  let categories;
  try {
    const categoriesRes = await rawFetch("/api/category/all", {
      next: { revalidate: 7200, tags: ["categories"] },
    });

    if (!categoriesRes?.ok) {
      console.error("Categories fetch failed:", categoriesRes?.message || "Request failed");
      redirect("/shop");
    }

    categories = categoriesRes.data ?? [];
  } catch (err) {
    console.error("Categories fetch failed:", err?.message || err);
    redirect("/shop");
  }

  const categoryExists = categories.some((c) => c.slug === category);
  if (!categoryExists) redirect("/shop");

  const session = await sessionPromise;

  const searchParamsObj = toURLSearchParams(searchParams);
  const listingQuery = buildListingQueryFromSearchParams(searchParamsObj, category);
  const facetsQuery = buildFilterFacetsQueryFromSearchParams(searchParamsObj, category);

  const promises = [
    session?.user?.email
      ? tokenizedFetch(`/api/customer/single/${session?.user?.email}`)
      : Promise.resolve(null),
    rawFetch(`/api/products/all?${listingQuery}`
      , { next: { revalidate: 300, tags: ['all-products', `category-${category}`] } }
    ),
    rawFetch(`/api/products/filters?${facetsQuery}`
      , { next: { revalidate: 300, tags: ['all-products'] } }
    ),
    rawFetch("/api/category/all", {
      next: { revalidate: 7200, tags: ['categories'] }
    }),
    rawFetch("/api/special-offer/all", {
      next: {
        revalidate: 3600, // 1 hour
        tags: ['special-offers']
      }
    }),
    rawFetch("/api/notifications/all", {
      next: {
        revalidate: 3600, // 1 hour
        tags: ['notifications']
      },
    }),
  ];

  const [
    userDataRes,
    productsRes,
    filtersRes,
    offersRes,
    notifyVariantsRes,
  ] = await Promise.allSettled(promises);

  const productsFetchFailed = productsRes.status === "rejected";
  const filtersFetchFailed = filtersRes.status === "rejected";
  const ssrFailed = productsFetchFailed || filtersFetchFailed;

  const [userData, productsData, filtersData, specialOffers, notifyVariants,] = [
    extractData(userDataRes, null, "checkout/userData"),
    extractData(productsRes, { items: [], total: 0 }, "shop/products"),
    extractData(filtersRes, null, "shop/filters"),
    extractData(offersRes, [], "shop/specialOffers"),
    extractData(notifyVariantsRes, [], "shop/notifyVariants"),
  ];

  const savedCols = cookies().get("shopCols")?.value;
  const initialCols = savedCols ? parseInt(savedCols, 10) : null;

  return (
    <main>
      <div className="relative h-full w-full">
        <div className="fixed left-[5%] top-[60%] animate-blob bg-[var(--color-moving-bubble-secondary)] max-sm:hidden" />
        <div className="fixed left-[5%] top-[15%] animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:1.5s] sm:left-[30%] xl:top-[30%]" />
        <div className="fixed left-[55%] top-[70%] animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:0.5s] sm:bg-[var(--color-moving-bubble-primary)]" />
        <div className="fixed left-[80%] top-1/3 animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:2s] max-sm:hidden" />
      </div>
      <div className="pt-header-h-full-section-pb relative flex min-h-svh overflow-hidden pb-[var(--section-padding)] [&_img]:pointer-events-none">
        <Suspense fallback={<LoadingSpinner />}>
          <ShopContents
            userData={userData}
            categories={categories}
            specialOffers={specialOffers}
            notifyVariants={notifyVariants}
            initialCategory={category}
            initialProducts={productsData.items}
            initialTotal={productsData.total}
            initialFilters={filtersData}
            ssrFailed={ssrFailed}
            initialCols={initialCols}
          />
        </Suspense>
      </div>
    </main>
  );
}