import Image from "next/image";
import { Suspense } from "react";
import { COMPANY_NAME } from "@/app/config/company";
import TransitionLink from "@/app/components/ui/TransitionLink";
import Drawer from "@/app/components/shared/Drawer";
import MenuSection from "./MenuSection";
import OrderSection from "./OrderSection";
import AccountSection from "./AccountSection";
import LoadingSpinner from "@/app/components/shared/LoadingSpinner";
import { getImage } from "@/app/lib/cloudinaryUtils";

export default function NavMenu({
  isLoggedIn,
  isNavMenuOpen,
  setIsNavMenuOpen,
  logoWithTextSrc,
  legalPolicyPdfLinks,
}) {
  return (
    <Drawer
      isDrawerOpen={isNavMenuOpen}
      setIsDrawerOpen={setIsNavMenuOpen}
      drawerBgId="nav-menu-bg"
      drawerResponsiveWidths="w-2/3 min-[480px]:w-1/2 sm:w-2/5"
    >
      <nav className="mobile space-y-7">
        {/* Logo */}
        <TransitionLink
          className="inline-block"
          href="/"
          hasDrawer={true}
          setIsDrawerOpen={setIsNavMenuOpen}
        >
          <Image
            className="h-8 w-auto"
            // src={logoWithTextSrc}
            src={getImage(logoWithTextSrc, 400)}
            alt={`${COMPANY_NAME} logo`}
            height={0}
            width={0}
            sizes="150px"
          />
        </TransitionLink>
        <Suspense fallback={<LoadingSpinner />}>
          <MenuSection setIsNavMenuOpen={setIsNavMenuOpen} />
        </Suspense>
        <OrderSection
          isLoggedIn={isLoggedIn}
          setIsNavMenuOpen={setIsNavMenuOpen}
        />
        <AccountSection
          isLoggedIn={isLoggedIn}
          setIsNavMenuOpen={setIsNavMenuOpen}
          legalPolicyPdfLinks={legalPolicyPdfLinks}
        />
      </nav>
    </Drawer>
  );
}
