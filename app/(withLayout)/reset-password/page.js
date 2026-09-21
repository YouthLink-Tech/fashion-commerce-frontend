import { TbLockExclamation } from "react-icons/tb";
import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import TransitionLink from "@/app/components/ui/TransitionLink";
import ResetPasswordForm from "@/app/components/reset/ResetPasswordForm";

export const dynamic = "force-dynamic";

export default async function ResetPassword({ searchParams }) {
  const token = searchParams?.token;
  let isTokenValid = false;
  let email = null;
  let validationMessage = "Unable to validate token.";

  if (token) {
    try {
      const result = await rawFetch("/api/customer/validate-reset-token", {
        method: "PUT",
        body: JSON.stringify({ token }),
        cache: "no-store",
      });

      isTokenValid = result.ok;
      email = result.data?.email;
      validationMessage = result.message || "Token validated successfully.";
    } catch (error) {
      console.error("ValidationError:", error.message || error);

      isTokenValid = false;
      email = null;
      validationMessage = error.message || "Unable to validate token.";
    }
  }

  return (
    <main
      className={`relative -mt-[calc(256*4px)] text-sm text-neutral-500 max-sm:-mt-[calc(256*2px)] md:text-base [&_h2]:uppercase [&_h2]:text-neutral-700 ${isTokenValid ? "bg-neutral-50" : "bg-white font-semibold"}`}
    >
      {/* Left Mesh Gradient */}
      <div
        className={`sticky left-[5%] top-1/2 animate-blob bg-[var(--color-moving-bubble-secondary)] max-sm:hidden ${!isTokenValid ? "opacity-0" : "opacity-100"}`}
      />
      {/* Middle-Left Mesh Gradient */}
      <div
        className={`sticky left-[30%] top-[20%] animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:1.5s] max-sm:left-[5%] ${!isTokenValid ? "opacity-0" : "opacity-100"}`}
      />
      {/* Middle-Right Mesh Gradient */}
      <div
        className={`sticky left-[55%] top-[60%] animate-blob bg-[var(--color-moving-bubble-secondary)] [animation-delay:0.5s] max-sm:left-3/4 ${!isTokenValid ? "opacity-0" : "opacity-100"}`}
      />
      {/* Right Mesh Gradient */}
      <div
        className={`sticky left-[80%] top-1/3 animate-blob bg-[var(--color-moving-bubble-primary)] [animation-delay:2s] max-sm:hidden ${!isTokenValid ? "opacity-0" : "opacity-100"}`}
      />
      {isTokenValid ? (
        <div className="pt-header-h-full-section-pb relative flex min-h-svh w-full items-center justify-center px-5 pb-[var(--section-padding)] sm:px-8 lg:px-12 xl:mx-auto xl:max-w-[1200px] xl:px-0">
          <section className="w-full max-w-md rounded-md border-2 border-neutral-50/20 bg-white/40 p-5 shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur-2xl transition-[height] duration-300 ease-in-out">
            <h2 className="text-base font-semibold md:text-lg">
              Reset Your Password
            </h2>
            <p className="mb-8 mt-2 text-sm">
              Please fill in the form below to reset your password.
            </p>
            <ResetPasswordForm token={token} email={email} />
          </section>
        </div>
      ) : (
        <div className="pt-header-h-full-section-pb flex min-h-svh flex-col items-center justify-center pb-[var(--section-padding)] [&>*]:w-fit">
          <TbLockExclamation className="size-24 text-[var(--color-secondary-500)]" />
          <p className="mt-2 text-neutral-400">{validationMessage}</p>
          <TransitionLink
            href="/"
            className="mt-9 block rounded-[4px] bg-[var(--color-primary-500)] px-4 py-2.5 text-center text-sm text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
          >
            Return to Home
          </TransitionLink>
        </div>
      )}
    </main>
  );
}
