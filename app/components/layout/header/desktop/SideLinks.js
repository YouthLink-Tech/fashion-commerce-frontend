import { Suspense } from "react";
import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { extractData } from "@/app/lib/extractData";
import { authOptions } from "@/app/utils/authOptions";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import WishlistButton from "../wishlist/WishlistButton";
import CartButton from "../cart/CartButton";
import UserDropdown from "./UserDropdown";

export default async function SideLinks() {
  const session = await getServerSession(authOptions);

  const promises = [
    session?.user?.email
      ? tokenizedFetch(`/customerDetailsViaEmail/${session?.user?.email}`)
      : Promise.resolve(null),
    rawFetch("/allProducts"),
    rawFetch("/allOffers"),
    rawFetch("/api/location/primary"),
    rawFetch("/get-all-policy-pdfs"),
  ];

  const [
    userDataRes,
    productsRes,
    offersRes,
    primaryLocationRes,
    legalPolicyPdfLinksRes,
  ] = await Promise.allSettled(promises);

  const [
    userData,
    productList,
    specialOffers,
    primaryLocation,
    [legalPolicyPdfLinks],
  ] = [
      extractData(userDataRes, null, "desktopNav/userData"),
      extractData(productsRes, [], "desktopNav/productList"),
      extractData(offersRes, [], "desktopNav/specialOffers"),
      extractData(
        primaryLocationRes,
        null,
        "desktopNav/primaryLocation",
        "primaryLocation",
      ),
      extractData(legalPolicyPdfLinksRes, null, "desktopNav/legalPdfLinks"),
    ];

  return (
    <div className="text-neutral-600">
      <ul className="flex items-center gap-x-6 text-xs xl:gap-x-7">
        <WishlistButton
          userData={userData}
          productList={productList}
          specialOffers={specialOffers}
        />
        <Suspense fallback={<LoadingSpinner />}>
          <CartButton
            userData={userData}
            productList={productList}
            specialOffers={specialOffers}
            primaryLocation={primaryLocation}
          />
        </Suspense>
        <UserDropdown
          isLoggedIn={!!userData}
          userEmail={userData?.email}
          userName={userData?.userInfo?.personalInfo?.customerName}
          legalPolicyPdfLinks={legalPolicyPdfLinks}
        />
      </ul>
    </div>
  );
}
