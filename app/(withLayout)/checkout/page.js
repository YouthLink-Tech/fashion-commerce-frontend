import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { extractData } from "@/app/lib/extractData";
import { authOptions } from "@/app/utils/authOptions";
import CheckoutContents from "@/app/components/checkout/CheckoutContents";
import { Suspense } from "react";

export default async function Checkout() {
  const session = await getServerSession(authOptions);

  const promises = [
    session?.user?.email
      ? tokenizedFetch(`/api/customer/single/${session?.user?.email}`)
      : Promise.resolve(null),
    rawFetch("/api/products/all?limit=200"),
    rawFetch("/api/special-offer/all"),
    rawFetch("/api/shipping-zone/public-options"),
    rawFetch("/api/policy-pdf/all", {
      next: {
        revalidate: 604800, // 7 days — legal documents rarely change
        tags: ['policy-pdf']
      }
    }
    ),
    rawFetch("/api/city/public-options"),
    rawFetch("/api/thana/all", { next: { revalidate: 3600 } }),
  ];

  const [
    userDataRes,
    productsRes,
    offersRes,
    shippingZonesRes,
    legalPolicyPdfLinksRes,
    cityRes,
    thanaRes,
  ] = await Promise.allSettled(promises);

  const [
    userData,
    productList,
    specialOffers,
    shippingZones,
    legalPolicyPdfLinks,
    cities,
    thanas,
  ] = [
      extractData(userDataRes, null, "checkout/userData"),
      extractData(productsRes, { items: [] }, "checkout/products")?.items ?? [],
      extractData(offersRes, [], "checkout/specialOffers"),
      extractData(shippingZonesRes, {}, "checkout/shippingZones"),
      extractData(legalPolicyPdfLinksRes, {}, "checkout/legalPdfLinks"),
      extractData(cityRes, [], "checkout/city"),
      extractData(thanaRes, [], "checkout/thanas"),
    ];

  return (
    <Suspense fallback={null}>
      <CheckoutContents
        userData={userData}
        productList={productList}
        specialOffers={specialOffers}
        shippingZones={shippingZones}
        legalPolicyPdfLinks={legalPolicyPdfLinks}
        cities={cities}
        thanas={thanas}
      />
    </Suspense>
  );
}
