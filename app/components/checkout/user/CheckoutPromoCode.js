import { rawFetch } from "@/app/lib/fetcher/rawFetch";
import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { isExpired } from "@/app/utils/isPromoCodeValid";

export default function CheckoutPromoCode({
  userPromoCode,
  setUserPromoCode,
  cartItems,
  cartSubtotal,
  customerId,
  customerEmail,
}) {
  const [promoMessage, setPromoMessage] = useState("");
  const [apiErrorMessage, setApiErrorMessage] = useState("");

  useEffect(() => {
    if (!userPromoCode) {
      setPromoMessage("Invalid promo code.");
      return;
    }

    const isNotExpired = !isExpired(userPromoCode.expiry_date);
    const minAmount = Number(userPromoCode.min_amount) || 0;

    const updatedPromoMessage =
      userPromoCode.is_active !== true || !isNotExpired
        ? "This promo code has expired."
        : cartSubtotal < minAmount
          ? `Valid for a minimum order of ৳ ${minAmount.toLocaleString()}.`
          : "Promo code applied.";

    setPromoMessage(updatedPromoMessage);
    setApiErrorMessage("");
  }, [userPromoCode, cartItems, cartSubtotal]);

  // Automatically re-validate promo code when customer logs in or email changes
  useEffect(() => {
    // Only re-validate if a promo code is already applied and customerId is now present
    if (!userPromoCode?.code || !customerId) return;

    let isMounted = true;

    const revalidateOnAuth = async () => {
      try {
        const params = new URLSearchParams();
        if (customerId) params.append("customerId", customerId);
        if (customerEmail) params.append("email", customerEmail);
        const query = params.toString() ? `?${params.toString()}` : "";

        const result = await rawFetch(
          `/api/promo-code/single-by-code/${encodeURIComponent(userPromoCode.code)}${query}`,
        );

        if (!isMounted) return;

        // If the customer already used this promo code on an earlier order:
        if (!result.ok || !result.data) {
          const errorMsg =
            result.errorCode === "PROMO_ALREADY_USED" ||
              result.message?.toLowerCase().includes("already used")
              ? `You have already used promo code "${userPromoCode.code}".`
              : result.message || "Promo code is no longer applicable.";

          // 1. Remove promo code from checkout state
          setUserPromoCode(null);
          // 2. Display red error message under the promo input box
          setApiErrorMessage(errorMsg);

          const promoCodeMessageElement = document.querySelector("#promo-code-message");
          const sectionElement =
            promoCodeMessageElement?.parentElement?.parentElement?.parentElement;

          if (promoCodeMessageElement && sectionElement) {
            promoCodeMessageElement.style.opacity = "1";
            promoCodeMessageElement.style.transform = "scale(1)";
            sectionElement.style.paddingBottom = "52px";
          }
        }
      } catch (error) {
        console.error("FetchError (revalidatePromoCode):", error.message);
      }
    };

    revalidateOnAuth();

    return () => {
      isMounted = false;
    };
  }, [customerId, customerEmail, setUserPromoCode, userPromoCode?.code]);

  const handlePromoCodeValidation = async () => {
    const inputElement = document.querySelector("#promo-code");
    const enteredPromoCode = inputElement?.value?.trim();
    if (!enteredPromoCode) return;

    let correspondingPromo = null;
    let errorMessage = "";

    try {
      const params = new URLSearchParams();
      if (customerId) params.append("customerId", customerId);
      if (customerEmail) params.append("email", customerEmail);
      const query = params.toString() ? `?${params.toString()}` : "";

      const result = await rawFetch(
        `/api/promo-code/single-by-code/${encodeURIComponent(enteredPromoCode)}${query}`,
      );

      if (result.ok && result.data) {
        correspondingPromo = result.data;
      } else {
        errorMessage = result.message || "Promo code not found.";
      }
    } catch (error) {
      console.error("FetchError (checkoutPromoCode):", error.message);
      errorMessage = error.message || "Failed to validate promo code.";
    }

    const promoCodeMessageElement = document.querySelector("#promo-code-message");
    const sectionElement =
      promoCodeMessageElement?.parentElement?.parentElement?.parentElement;

    if (promoCodeMessageElement && sectionElement) {
      promoCodeMessageElement.style.opacity = "1";
      promoCodeMessageElement.style.transform = "scale(1)";
      sectionElement.style.paddingBottom = "52px";
    }

    setApiErrorMessage(errorMessage);
    setUserPromoCode(correspondingPromo);
  };

  const displayMessage = apiErrorMessage || promoMessage;
  const isApplied = !apiErrorMessage && promoMessage === "Promo code applied.";

  return (
    <section className="w-full space-y-4 rounded-md border-2 border-neutral-50/20 bg-white/40 p-5 shadow-[0_0_20px_0_rgba(0,0,0,0.05)] backdrop-blur-2xl transition-[padding-bottom] duration-300 ease-in-out">
      <h2 className="text-base font-semibold md:text-lg">Promo Code</h2>
      <div className="flex gap-x-4">
        <div className="relative w-full space-y-2">
          <label className="text-nowrap" htmlFor="promo-code">
            Have any promo code to apply?
          </label>
          <div className="relative">
            <input
              id="promo-code"
              name="promoCode"
              type="text"
              autoComplete="off"
              className="h-10 w-full rounded-[4px] border-2 border-neutral-200 bg-white/20 px-3 text-xs uppercase text-neutral-700 outline-none backdrop-blur-2xl transition-[background-color,border-color] duration-300 ease-in-out placeholder:text-neutral-400 focus:border-[var(--color-secondary-500)] focus:bg-white/75 md:text-[13px]"
              onChange={(event) => {
                const promoCodeCloseButton = document.getElementById(
                  "promo-code-close-btn",
                );
                if (promoCodeCloseButton) {
                  promoCodeCloseButton.style.opacity = !event.target.value
                    ? "0"
                    : "1";
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  handlePromoCodeValidation();
                } else {
                  const promoCodeMessageElement = document.querySelector(
                    "#promo-code-message",
                  );
                  const sectionElement =
                    promoCodeMessageElement?.parentElement?.parentElement
                      ?.parentElement;

                  if (promoCodeMessageElement && sectionElement) {
                    promoCodeMessageElement.style.opacity = "0";
                    promoCodeMessageElement.style.transform = "scale(0)";
                    sectionElement.style.paddingBottom = "20px";
                  }

                  setApiErrorMessage("");
                  setUserPromoCode(undefined);
                }
              }}
            />
            <button
              id="promo-code-close-btn"
              className="absolute right-3 top-1/2 z-[1] flex size-5 -translate-y-1/2 items-center justify-center rounded-full bg-neutral-200 opacity-0 transition-[background-color,opacity] duration-300 ease-in-out hover:bg-neutral-300 [&>svg]:hover:text-neutral-800"
              type="button"
              onClick={() => {
                const input = document.querySelector("#promo-code");
                if (input) input.value = "";
                const promoCodeCloseButton = document.getElementById(
                  "promo-code-close-btn",
                );
                if (promoCodeCloseButton) promoCodeCloseButton.style.opacity = "0";

                const promoCodeMessageElement = document.querySelector(
                  "#promo-code-message",
                );
                const sectionElement =
                  promoCodeMessageElement?.parentElement?.parentElement
                    ?.parentElement;

                if (promoCodeMessageElement && sectionElement) {
                  promoCodeMessageElement.style.opacity = "0";
                  promoCodeMessageElement.style.transform = "scale(0)";
                  sectionElement.style.paddingBottom = "20px";
                }

                setApiErrorMessage("");
                setUserPromoCode(undefined);
              }}
            >
              <IoClose className="size-4 text-neutral-500 transition-[color] duration-300 ease-in-out" />
            </button>
          </div>
          <p
            id="promo-code-message"
            className={`pointer-events-none absolute -bottom-6 left-0 scale-0 text-nowrap text-xs font-semibold opacity-0 transition-[transform,opacity] ${isApplied ? "text-green-600" : "text-red-600"
              }`}
          >
            {displayMessage}
          </p>
        </div>
        <button
          type="button"
          onClick={handlePromoCodeValidation}
          className="block h-fit w-full self-end rounded-[4px] bg-[var(--color-primary-500)] py-2.5 text-center text-sm font-semibold text-neutral-700 transition-[background-color] duration-300 hover:bg-[var(--color-primary-700)]"
        >
          Apply
        </button>
      </div>
    </section>
  );
}