import { Suspense } from "react";
import Image from "next/image";
import { getServerSession } from "next-auth";
import { tokenizedFetch } from "@/app/lib/fetcher/tokenizedFetch";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { extractData } from "@/app/lib/extractData";
import { authOptions } from "@/app/utils/authOptions";
import { COMPANY_NAME } from "@/app/config/company";
import TransitionLink from "@/app/components/ui/TransitionLink";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import Search from "../Search";
import WishlistButton from "../wishlist/WishlistButton";
import CartButton from "../cart/CartButton";
import NavButton from "./NavButton";

export default async function MobileNavbar({
  logoWithoutTextSrc,
  logoWithTextSrc,
}) {
  const session = await getServerSession(authOptions);

  const promises = [
    session?.user?.email
      ? tokenizedFetch(`/customerDetailsViaEmail/${session.user.email}`)
      : Promise.resolve(null),
    rawFetch("/allProducts"),
    rawFetch("/api/special-offer/all"),
    rawFetch("/api/location/primary"),
    rawFetch("/api/policy-pdf/all"),
  ];

  const [userDataRes, productsRes, offersRes, primaryLocationRes, legalPdfRes] =
    await Promise.allSettled(promises);

  const userData = extractData(userDataRes, null, "mobileNav/userData");
  const productList = extractData(productsRes, [], "mobileNav/products");
  const specialOffers = extractData(offersRes, [], "mobileNav/specialOffers");
  const primaryLocation = extractData(
    primaryLocationRes,
    null,
    "mobileNav/primaryLocation",
    "primaryLocation",
  );
  const [legalPolicyPdfLinks] = extractData(
    legalPdfRes,
    [],
    "mobileNav/legalPdfLinks",
  );

  return (
    <nav className="relative h-full w-full text-sm lg:hidden">
      <div className="relative flex h-full w-full items-center justify-between bg-white">
        {/* Logo */}
        <TransitionLink href="/">
          <Image
            className="h-8 w-auto sm:hidden"
            src={logoWithoutTextSrc}
            alt={`${COMPANY_NAME} logo (no text)`}
            height={0}
            width={0}
            sizes="75px"
          />
          <Image
            className="h-8 w-auto max-sm:hidden"
            src={logoWithTextSrc}
            alt={`${COMPANY_NAME} logo`}
            height={0}
            width={0}
            sizes="150px"
          />
        </TransitionLink>
        <ul className="flex gap-x-4 sm:gap-x-6">
          {/* Search bar */}
          <li>
            <Suspense fallback={<LoadingSpinner />}>
              <Search />
            </Suspense>
          </li>
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
          {/* Navigation button */}
          <NavButton
            isLoggedIn={!!userData}
            logoWithTextSrc={logoWithTextSrc}
            legalPolicyPdfLinks={legalPolicyPdfLinks}
          />
        </ul>
      </div>
    </nav>
  );
}
