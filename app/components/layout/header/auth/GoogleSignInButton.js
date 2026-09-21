"use client";

import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { LuCheck } from "react-icons/lu";
import { FcGoogle } from "react-icons/fc";
import { useLoading } from "@/app/contexts/loading";
import { COMPANY_NAME } from "@/app/config/company";

export default function GoogleSignInButton({
  isLinkedWithGoogle,
  ctaText,
  isAuthModalOpen,
  setIsAuthModalOpen,
}) {
  const router = useRouter();
  const { setIsPageLoading } = useLoading();

  const popupCenter = (url, title) => {
    const dualScreenLeft = window.screenLeft ?? window.screenX;
    const dualScreenTop = window.screenTop ?? window.screenY;

    const width =
      window.innerWidth ?? document.documentElement.clientWidth ?? screen.width;

    const height =
      window.innerHeight ??
      document.documentElement.clientHeight ??
      screen.height;

    const systemZoom = width / window.screen.availWidth;

    const left = (width - 500) / 2 / systemZoom + dualScreenLeft;
    const top = (height - 550) / 2 / systemZoom + dualScreenTop;

    const newWindow = window.open(
      url,
      title,
      `width=${500 / systemZoom},
      height=${550 / systemZoom},
      top=${top},
      left=${left}`,
    );

    newWindow?.focus();
    return newWindow;
  };

  const handleGoogleSignIn = () => {
    setIsPageLoading(true);

    window.isLoginSuccessful = null;

    const popup = popupCenter("/login/google", `${COMPANY_NAME} | ` + ctaText);

    const interval = setInterval(async () => {
      if (!popup || popup.closed) {
        clearInterval(interval);

        if (window.isLoginSuccessful) {
          toast.success(
            ctaText.toLowerCase().includes("connect")
              ? "Successfully connected to Google."
              : "Successfully logged in."
          );
          if (isAuthModalOpen) setIsAuthModalOpen(false);
          router.refresh();
        } else {
          toast.error(
            ctaText.toLowerCase().includes("connect")
              ? "Failed to connect Google account. Please try again."
              : `Failed to ${ctaText.toLowerCase()}. Please try again.`
          );
        }

        delete window.isLoginSuccessful;
        setIsPageLoading(false);
      }
    }, 500);
  };

  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-2 rounded-[4px] bg-neutral-100 py-2.5 text-xs font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-neutral-200"
      onClick={() =>
        isLinkedWithGoogle
          ? toast.success("Already connected to a Google account.")
          : handleGoogleSignIn()
      }
    >
      <FcGoogle size={20} />
      {ctaText}
      {isLinkedWithGoogle && <LuCheck className="size-5 text-green-600" />}
    </button>
  );
}
