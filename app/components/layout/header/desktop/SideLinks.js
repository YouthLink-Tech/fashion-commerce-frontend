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
    rawFetch("/api/policy-pdf/all", {
      next: {
        revalidate: 604800, // 7 days — legal documents rarely change
        tags: ['policy-pdf']
      }
    }
    ),
  ];

  const [
    userDataRes,
    productsRes,
    offersRes,
    legalPolicyPdfLinksRes,
  ] = await Promise.allSettled(promises);

  const [
    userData,
    productList,
    specialOffers,
    legalPolicyPdfLinks,
  ] = [
      extractData(userDataRes, null, "desktopNav/userData"),
      extractData(productsRes, [], "desktopNav/productList"),
      extractData(offersRes, [], "desktopNav/specialOffers"),
      extractData(legalPolicyPdfLinksRes, {}, "desktopNav/legalPdfLinks"),
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
          />
        </Suspense>
        <UserDropdown
          isLoggedIn={!!userData}
          userEmail={userData?.email}
          userName={userData?.name}
          legalPolicyPdfLinks={legalPolicyPdfLinks}
        />
      </ul>
    </div>
  );
}
