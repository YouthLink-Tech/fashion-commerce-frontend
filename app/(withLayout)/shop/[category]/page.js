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

export default async function CategoryShop({ params }) {
  const { category } = params;
  const session = await getServerSession(authOptions);

  const promises = [
    session?.user?.email
      ? tokenizedFetch(`/api/customer/single/${session?.user?.email}`)
      : Promise.resolve(null),
    rawFetch("/api/products/all", {
      next: {
        revalidate: 7200,
        tags: ['all-products']
      }
    }),
    rawFetch("/api/special-offer/all", {
      next: {
        revalidate: 3600, // 1 hour
        tags: ['special-offers']
      }
    }),
    rawFetch("/api/location/primary", {
      next: {
        revalidate: 7200,           // 2 hours fallback
        tags: ['primary-location']  // cleared when location changes
      }
    }),
    rawFetch("/api/notifications/all", {
      next: {
        revalidate: 3600, // 1 hour
        tags: ['notifications']
      },
    }),
    rawFetch("/api/category/all", {
      next: {
        revalidate: 7200,
        tags: ['categories']
      }
    }),
  ];

  const [
    userDataRes,
    productsRes,
    offersRes,
    primaryLocationRes,
    notifyVariantsRes,
    categoriesRes
  ] = await Promise.allSettled(promises);

  const [userData, products, specialOffers, primaryLocation, notifyVariants, categories] = [
    extractData(userDataRes, null, "checkout/userData"),
    extractData(productsRes, [], "shop/products"),
    extractData(offersRes, [], "shop/specialOffers"),
    extractData(
      primaryLocationRes,
      null,
      "shop/primaryLocation",
      "primaryLocation",
    ),
    extractData(notifyVariantsRes, [], "shop/notifyVariants"),
    extractData(categoriesRes, [], "shop/categories"),
  ];

  const resolvedCategory =
    categories.find((c) => c.slug === category)?.name ?? null;

  if (!resolvedCategory) redirect("/shop");

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
            products={products}
            specialOffers={specialOffers}
            primaryLocation={primaryLocation}
            notifyVariants={notifyVariants}
            initialCategory={resolvedCategory}
          />
        </Suspense>
      </div>
    </main>
  );
}