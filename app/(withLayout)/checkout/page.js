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
    rawFetch("/api/products/all"),
    rawFetch("/api/special-offer/all"),
    rawFetch("/api/shipping-zone/all"),
    rawFetch("/api/location/primary"),
    rawFetch("/api/policy-pdf/all"),
  ];

  const [
    userDataRes,
    productsRes,
    offersRes,
    shippingZonesRes,
    primaryLocationRes,
    legalPolicyPdfLinksRes,
  ] = await Promise.allSettled(promises);

  const [
    userData,
    productList,
    specialOffers,
    shippingZones,
    primaryLocation,
    legalPolicyPdfLinks,
  ] = [
      extractData(userDataRes, null, "checkout/userData"),
      extractData(productsRes, [], "checkout/products"),
      extractData(offersRes, [], "checkout/specialOffers"),
      extractData(shippingZonesRes, [], "checkout/shippingZones"),
      extractData(
        primaryLocationRes,
        null,
        "checkout/primaryLocation",
        "primaryLocation",
      ),
      extractData(legalPolicyPdfLinksRes, null, "checkout/legalPdfLinks"),
    ];

  return (
    <Suspense fallback={null}>
      <CheckoutContents
        userData={userData}
        productList={productList}
        specialOffers={specialOffers}
        shippingZones={shippingZones}
        primaryLocation={primaryLocation}
        legalPolicyPdfLinks={legalPolicyPdfLinks}
      />
    </Suspense>
  );
}
