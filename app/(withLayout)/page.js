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

export default async function Home() {
  const session = await getServerSession(authOptions);

  const promises = [
    session?.user?.email
      ? tokenizedFetch(`/api/customer/single/${session.user.email}`)
      : Promise.resolve(null),
    rawFetch("/api/products/all", {
      next: {
        revalidate: 7200,
        tags: ['all-products']
      }
    }),
    rawFetch("/api/special-offer/all"),
    rawFetch("/api/location/primary"),
    rawFetch("/api/notifications/all"),
  ];

  const [
    userDataRes,
    productsRes,
    offersRes,
    primaryLocationRes,
    notifyVariantsRes,
  ] = await Promise.allSettled(promises);

  const [userData, products, specialOffers, primaryLocation, notifyVariants] = [
    extractData(userDataRes, null, "home/userData"),
    extractData(productsRes, [], "home/products"),
    extractData(offersRes, [], "home/specialOffers"),
    extractData(
      primaryLocationRes,
      null,
      "home/primaryLocation",
      "primaryLocation",
    ),
    extractData(notifyVariantsRes, [], "home/notifyVariants"),
  ];

  const trendingProducts = products
    ?.filter(
      (product) =>
        product?.status === "active" &&
        product?.trending === "Yes" &&
        !CheckIfProductIsOutOfStock(product?.productVariants, primaryLocation),
    )
    ?.slice(0, 4);
  const newlyArrivedProducts = products
    ?.filter(
      (product) =>
        product?.status === "active" &&
        product?.newArrival === "Yes" &&
        !CheckIfProductIsOutOfStock(product?.productVariants, primaryLocation),
    )
    ?.slice(0, 4);

  return (
    <main className="[&_img]:pointer-events-none">
      <HomeHero />
      <HomeCategories />
      <HomeTrending
        userData={userData}
        trendingProducts={trendingProducts}
        specialOffers={specialOffers}
        primaryLocation={primaryLocation}
        notifyVariants={notifyVariants}
      />
      <HomeNewArrival
        userData={userData}
        isAnyTrendingProductAvailable={trendingProducts?.length}
        newlyArrivedProducts={newlyArrivedProducts}
        specialOffers={specialOffers}
        primaryLocation={primaryLocation}
        notifyVariants={notifyVariants}
      />
      <HomeFeatures
        isAnyTrendingProductAvailable={trendingProducts?.length}
        isAnyNewProductAvailable={newlyArrivedProducts?.length}
      />
    </main>
  );
}
