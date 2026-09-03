import { getServerSession } from "next-auth";
import { tokenizedFetch } from "../lib/fetcher/tokenizedFetch";
import { rawFetch } from "../lib/fetcher/rawFetch";
import { extractData } from "../lib/extractData";
import { authOptions } from "../utils/authOptions";
import { CheckIfProductIsOutOfStock } from "@/app/utils/productSkuCalculation";
import HomeHero from "../components/home/HomeHero";
import HomeCategories from "../components/home/HomeCategories";
import HomeTrending from "../components/home/HomeTrending";
import HomeNewArrival from "../components/home/HomeNewArrival";
import HomeFeatures from "../components/home/HomeFeatures";
import { COMPANY_NAME } from "../config/company";
import { FRONTEND_URL } from "../config/site";

export const metadata = {
  title: `${COMPANY_NAME} | Fashion & Comfort`,
  description:
    `Shop the latest men's fashion at ${COMPANY_NAME}. Discover trending styles, new arrivals, polo shirts, formal wear and more. Fast delivery across Bangladesh.`,
  keywords: [COMPANY_NAME, "men's fashion", "clothing Bangladesh", "polo shirts", "new arrivals"],
  alternates: { canonical: FRONTEND_URL },
  openGraph: {
    title: `Fashion & Comfort | ${COMPANY_NAME}`,
    description: `Shop the latest men's fashion at ${COMPANY_NAME}.`,
    url: FRONTEND_URL,
    type: "website",
    images: [
      {
        url: `${FRONTEND_URL}/logo/logo.png`,
        width: 1200,
        height: 630,
        alt: `${COMPANY_NAME} Fashion Store`,
      },
    ],
  },
}

export default async function Home() {
  const session = await getServerSession(authOptions);

  const promises = [
    session?.user?.email
      ? tokenizedFetch(`/api/customer/single/${session.user.email}`)
      : Promise.resolve(null),
    rawFetch("/api/products/all?is_trending=true&limit=4", {
      next: { revalidate: 7200, tags: ['all-products'] }
    }),
    rawFetch("/api/products/all?new_arrivals_only=true&limit=4", {
      next: { revalidate: 7200, tags: ['all-products'] }
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
      }
    }),
  ];

  const [
    userDataRes,
    trendingRes,
    newArrivalRes,
    offersRes,
    notifyVariantsRes,
  ] = await Promise.allSettled(promises);

  const [userData, trendingProducts, newlyArrivedProducts, specialOffers, notifyVariants] = [
    extractData(userDataRes, null, "home/userData"),
    extractData(trendingRes, { items: [] }, "home/trending")?.items ?? [],
    extractData(newArrivalRes, { items: [] }, "home/newArrivals")?.items ?? [],
    extractData(offersRes, [], "home/specialOffers"),
    extractData(notifyVariantsRes, [], "home/notifyVariants"),
  ];

  const orgJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: COMPANY_NAME,
    url: FRONTEND_URL,
    logo: `${FRONTEND_URL}/logo/logo.png`,
    sameAs: [
      "https://facebook.com/poshax",
      "https://instagram.com/poshax",
    ],
  };

  const safeJsonLd = JSON.stringify(orgJsonLd).replace(/</g, "\\u003c");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd }}
      />
      <main className="[&_img]:pointer-events-none">
        <HomeHero />
        <HomeCategories />
        <HomeTrending
          userData={userData}
          trendingProducts={trendingProducts}
          specialOffers={specialOffers}
          notifyVariants={notifyVariants}
        />
        <HomeNewArrival
          userData={userData}
          isAnyTrendingProductAvailable={trendingProducts?.length}
          newlyArrivedProducts={newlyArrivedProducts}
          specialOffers={specialOffers}
          notifyVariants={notifyVariants}
        />
        <HomeFeatures
          isAnyTrendingProductAvailable={trendingProducts?.length}
          isAnyNewProductAvailable={newlyArrivedProducts?.length}
        />
      </main>
    </>
  );
}
