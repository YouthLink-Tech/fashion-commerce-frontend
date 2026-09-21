"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import {
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
} from "@nextui-org/react";
import {
  PiSignInLight,
  PiSignOutLight,
  PiPackageLight,
  PiUserLight,
  PiUserCirclePlusLight,
} from "react-icons/pi";
import { IoPersonOutline } from "react-icons/io5";
import { removeRefreshToken } from "@/app/actions/auth";
import { useLoading } from "@/app/contexts/loading";
import TransitionLink from "@/app/components/ui/TransitionLink";
import {
  forgotPasswordContent,
  loginContent,
  registerContent,
} from "@/app/data/authContents";
import AuthModal from "../auth/AuthModal";

export default function UserDropdown({
  isLoggedIn,
  userEmail,
  userName,
  legalPolicyPdfLinks,
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { setIsPageLoading } = useLoading();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState("login");

  const handleSignOut = async () => {
    setIsPageLoading(true);

    try {
      await signOut({ redirect: false });
      await removeRefreshToken();
      router.refresh();
      if (pathname.includes("user") || pathname.includes("checkout"))
        router.push("/");
      localStorage.removeItem("checkoutFormDraft");
      localStorage.removeItem("cartItems");
      window.dispatchEvent(new Event("storageCart"));
      localStorage.removeItem("wishlistItems");
      window.dispatchEvent(new Event("storageWishlist"));
      sessionStorage.removeItem("cart_synced_user");
      sessionStorage.removeItem("wishlist_synced_user");
      toast.success("Successfully logged out.");
    } catch (error) {
      toast.error("SignOutError:", error.message);
    }

    setIsPageLoading(false);
  };

  return (
    <>
      <Dropdown
        placement="bottom-end"
        className="mt-5 rounded-md pb-0 sm:mt-6 xl:mt-7"
        motionProps={{
          initial: { opacity: 0, scale: 0.95 },
          animate: {
            opacity: 1,
            scale: 1,
            transition: {
              duration: 0.25,
              ease: "easeInOut",
            },
          },
          exit: {
            opacity: 0,
            scale: 0.95,
            transition: {
              duration: 0.25,
              ease: "easeInOut",
            },
          },
        }}
      >
        <DropdownTrigger className="z-[0]">
          <span className="cursor-pointer">
            <IoPersonOutline className="size-[18px] text-neutral-600 lg:size-[22px]" />
          </span>
        </DropdownTrigger>
        <DropdownMenu aria-label="Profile Actions" variant="flat">
          {isLoggedIn && (
            <DropdownSection title="You're signed in as" showDivider>
              <DropdownItem
                key="profile"
                isReadOnly
                className="cursor-default rounded-[4px] [&_*]:w-fit [&_*]:cursor-text [&_*]:font-semibold"
              >
                <h5 className="text-sm text-neutral-600">{userName}</h5>
                <p className="-mt-0.5 text-[11px] text-neutral-500">
                  {userEmail}
                </p>
              </DropdownItem>
            </DropdownSection>
          )}
          {isLoggedIn && (
            <DropdownSection title="Order">
              <DropdownItem
                key="orders"
                textValue="orders"
                startContent={<PiPackageLight />}
                className="relative rounded-[4px]"
              >
                Order History
                <TransitionLink
                  className="absolute inset-0"
                  href="/user/orders"
                ></TransitionLink>
              </DropdownItem>
            </DropdownSection>
          )}
          <DropdownSection title="User">
            {isLoggedIn && (
              <DropdownItem
                key="profile"
                textValue="profile"
                startContent={<PiUserLight />}
                className="relative rounded-[4px]"
              >
                User Profile
                <TransitionLink
                  className="absolute inset-0"
                  href="/user/profile"
                ></TransitionLink>
              </DropdownItem>
            )}
            {!isLoggedIn && (
              <DropdownItem
                key="login"
                textValue="login"
                startContent={<PiSignInLight />}
                onClick={() => {
                  setModalContent("login");
                  setIsAuthModalOpen(true);
                }}
                className="rounded-[4px]"
              >
                Sign In
              </DropdownItem>
            )}
            {!isLoggedIn && (
              <DropdownItem
                key="register"
                textValue="register"
                startContent={<PiUserCirclePlusLight />}
                onClick={() => {
                  setModalContent("register");
                  setIsAuthModalOpen(true);
                }}
                className="rounded-[4px]"
              >
                Sign Up
              </DropdownItem>
            )}
            {isLoggedIn && (
              <DropdownItem
                startContent={<PiSignOutLight />}
                key="logout"
                textValue="logout"
                color="danger"
                onClick={handleSignOut}
                className="rounded-[4px]"
              >
                Sign Out
              </DropdownItem>
            )}
          </DropdownSection>
        </DropdownMenu>
      </Dropdown>
      <AuthModal
        {...(modalContent === "login"
          ? loginContent
          : modalContent === "register"
            ? registerContent
            : forgotPasswordContent)}
        isAuthModalOpen={isAuthModalOpen}
        setIsAuthModalOpen={setIsAuthModalOpen}
        modalContent={modalContent}
        setModalContent={setModalContent}
        legalPolicyPdfLinks={legalPolicyPdfLinks}
      />
    </>
  );
}
