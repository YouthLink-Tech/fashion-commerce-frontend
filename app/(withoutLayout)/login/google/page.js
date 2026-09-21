"use client";

import { Suspense, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";

function GoogleSignInContent() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const isCallback = searchParams.get("callback") === "true";
  const authError = searchParams.get("error");

  useEffect(() => {
    const sendResult = (isSuccessful) => {
      if (window.opener) {
        window.opener.isLoginSuccessful = isSuccessful;
        window.close();
      }
    };

    if (authError) {
      console.error("LoginError (googleWindow/authError):", authError);
      sendResult(false);
      return;
    }

    const handleGoogleLogin = async () => {
      try {
        await signIn(
          "google",
          { callbackUrl: "/login/google?callback=true" },
          { prompt: "select_account" },
        );
      } catch (error) {
        console.error(
          "LoginError (googleWindow/catch):",
          error.message || error,
        );
        sendResult(false);
      }
    };

    // If not a callback yet, initiate Google sign-in even if a credentials session exists
    if (!isCallback) {
      handleGoogleLogin();
    } else if (status !== "loading") {
      // Returned from Google OAuth redirect
      if (session) {
        sendResult(true);
      } else {
        sendResult(false);
      }
    }
  }, [session, status, isCallback, authError]);

  return <div className="flex min-h-screen items-center justify-center bg-white"></div>;
}

export default function GoogleSignInWindow() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white"></div>}>
      <GoogleSignInContent />
    </Suspense>
  );
}