import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { extractData } from "@/app/lib/extractData";
import { authOptions } from "@/app/utils/authOptions";
import ShopContents from "@/app/components/shop/ShopContents";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";

export async function generateMetadata({ params }) {
  const { category } = params;

  const result = await rawFetch("/api/category/all", {
    next: { revalidate: 7200, tags: ["categories"] },
  });
  const categories = result?.data ?? [];
  const matched = categories.find((c) => c.categorySlug === category);

  // Fall back to humanizing the slug only if category not found in DB
  const label = matched?.label ?? category.replace(/-/g, " ");

  return {
    title: `${label} | Poshax`,
    description: `Shop ${label} at Poshax. Browse the latest styles and best prices.`,
    alternates: { canonical: `${process.env.FRONTEND_URL}/shop/${category}` },
    openGraph: {
      title: `${label} | Shop at Poshax`,
      description: `Browse our ${label} collection at Poshax.`,
      url: `${process.env.FRONTEND_URL}/shop/${category}`,
      siteName: "Poshax",
      type: "website",
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
    categories.find((c) => c.categorySlug === category)?.label ?? null;

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