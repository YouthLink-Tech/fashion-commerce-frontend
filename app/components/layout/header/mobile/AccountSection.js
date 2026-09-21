import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import toast from "react-hot-toast";
import { PiSignIn, PiSignOut, PiUser, PiUserCirclePlus } from "react-icons/pi";
import { removeRefreshToken } from "@/app/actions/auth";
import { useLoading } from "@/app/contexts/loading";
import TransitionLink from "@/app/components/ui/TransitionLink";
import {
  forgotPasswordContent,
  loginContent,
  registerContent,
} from "@/app/data/authContents";
import AuthModal from "../auth/AuthModal";

export default function AccountSection({
  isLoggedIn,
  setIsNavMenuOpen,
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
    <div>
      <h5 className="text-[10px] font-semibold text-neutral-500">ACCOUNT</h5>
      <hr className="my-2 h-0.5 w-full bg-neutral-100" />
      {!isLoggedIn ? (
        <ul className="space-y-2 text-xs md:text-[13px]">
          <li
            onClick={() => {
              setModalContent("login");
              setIsNavMenuOpen(false);
              setTimeout(() => setIsAuthModalOpen(true), 650);
            }}
          >
            <PiSignIn />
            Sign In
          </li>
          <li
            onClick={() => {
              setModalContent("register");
              setIsNavMenuOpen(false);
              setTimeout(() => setIsAuthModalOpen(true), 650);
            }}
          >
            <PiUserCirclePlus />
            Sign Up
          </li>
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
        </ul>
      ) : (
        <ul className="space-y-2 text-xs md:text-[13px]">
          <li>
            <TransitionLink
              href="/user/profile"
              hasDrawer={true}
              setIsDrawerOpen={setIsNavMenuOpen}
              className={pathname.includes("user/profile") ? "active" : ""}
            >
              <PiUser />
              User Profile
            </TransitionLink>
          </li>
          <li onClick={handleSignOut}>
            <PiSignOut />
            Sign Out
          </li>
        </ul>
      )}
    </div>
  );
}
