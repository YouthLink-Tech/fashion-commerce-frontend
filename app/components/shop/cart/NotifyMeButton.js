"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { FaRegBell } from "react-icons/fa6";
import { LuCheckCircle2 } from "react-icons/lu";
import { routeFetch } from "@/app/lib/fetcher/routeFetch";
import NotifyMeModal from "./NotifyMeModal";

let subsCache = { email: null, promise: null, at: 0 };
const SUBS_TTL_MS = 30 * 1000;

function loadMySubscriptions(email) {
  const fresh =
    subsCache.promise &&
    subsCache.email === email &&
    Date.now() - subsCache.at < SUBS_TTL_MS;
  if (fresh) return subsCache.promise;
  const promise = routeFetch("/api/notifications/my-subscriptions")
    .then((res) => res?.data?.variantIds || res?.variantIds || [])
    .catch(() => {
      subsCache = { email: null, promise: null, at: 0 };
      return [];
    });
  subsCache = { email, promise, at: Date.now() };
  return promise;
}

export function invalidateSubsCache() {
  subsCache = { email: null, promise: null, at: 0 };
}

export default function NotifyMeButton({
  userEmail,
  productVariantSku,
  selectedOptions,
  variants = [],
  isNotifyMeModalOpen,
  setIsNotifyMeModalOpen,
}) {

  const [subscribedVariantIds, setSubscribedVariantIds] = useState([]);
  const [justSubscribedVariantId, setJustSubscribedVariantId] = useState(null);

  // Resolve the active variant based on selected color & size
  const activeVariant = useMemo(() => {
    if (!selectedOptions?.size || !selectedOptions?.color) return null;
    return (variants ?? []).find(
      (v) =>
        (v.color?.id === selectedOptions.color?.id ||
          v.color?.hex === selectedOptions.color?.hex) &&
        (v.size?.id === selectedOptions.size?.id ||
          v.size?.name === selectedOptions.size?.name),
    );
  }, [variants, selectedOptions]);

  // Fetch subscriptions for logged-in user
  useEffect(() => {
    let isMounted = true;
    if (!userEmail) {
      setSubscribedVariantIds([]);
      return;
    }
    loadMySubscriptions(userEmail).then((ids) => {
      if (isMounted && Array.isArray(ids)) {
        setSubscribedVariantIds(ids);
      }
    });
    return () => {
      isMounted = false;
    };
  }, [userEmail]);

  // Handle successful modal submission
  const handleSubscribedSuccess = useCallback((variantId) => {
    setJustSubscribedVariantId(variantId);
    setSubscribedVariantIds((prev) =>
      prev.includes(variantId) ? prev : [...prev, variantId],
    );
    invalidateSubsCache();
  }, []);

  // 2. EARLY RETURN PLACED AFTER ALL HOOKS
  if (!selectedOptions?.size || productVariantSku !== 0) {
    return null;
  }

  // 3. RENDER LOGIC
  const isUserSubscribed =
    Boolean(activeVariant?.id) &&
    (subscribedVariantIds.includes(activeVariant.id) ||
      justSubscribedVariantId === activeVariant.id);

  return (
    <>
      {!isUserSubscribed ? (
        <button
          onClick={() => setIsNotifyMeModalOpen(true)}
          className="flex items-center gap-1.5 rounded-[4px] bg-[var(--color-tertiary-500)] px-3 py-2.5 text-[13px]/[1] font-semibold text-neutral-600 transition-[background-color] duration-300 hover:bg-[var(--color-tertiary-600)]"
        // alternative bg colors: normal:ededed, hover:neutral-200
        >
          Notify Me
          <FaRegBell size={13} />
        </button>
      ) : (
        <div className="flex w-fit items-center gap-1 font-semibold text-[#45963a]">
          <LuCheckCircle2 size={20} />
          <p className="text-xs">You&apos;ll be notified upon availability</p>
        </div>
      )}
      {activeVariant?.id && (
        <NotifyMeModal
          userEmail={userEmail}
          variantId={activeVariant.id}
          isNotifyMeModalOpen={isNotifyMeModalOpen}
          setIsNotifyMeModalOpen={setIsNotifyMeModalOpen}
          onSubscribed={() => handleSubscribedSuccess(activeVariant.id)}
        />
      )}
    </>
  );
}
