const STORAGE_KEY = "poshax_checkout_intent";

// Must match backend TTL exactly
const SESSION_TTL_MS = 15 * 60 * 1000;

/**
 * Builds a deterministic hash from cart contents.
 * Sorted so item order doesn't matter.
 * Includes userId so two users with identical carts get different keys.
 */

export function buildCartSignature(cartItems = []) {
  if (!cartItems?.length) return "";
  return [...cartItems]
    .sort((a, b) => {
      const idA = a.variant_id || "";
      const idB = b.variant_id || "";
      return idA.localeCompare(idB);
    })
    .map((i) => {
      const variantId = i.variant_id || "";
      const quantity = Number(i.selectedQuantity ?? 1);
      return `${variantId}:${quantity}`;
    })
    .join("|");
}

function buildCartHash(userId, cartItems, formDraft, promoCode) {
  if (!cartItems?.length) return "";

  const cartPart = buildCartSignature(cartItems);

  // Order info portion — only fields stored in the checkout session
  // Normalize with || "" so undefined and empty string are treated the same
  const formPart = [
    formDraft?.name || "",
    formDraft?.email || "",
    formDraft?.phoneNumber || "",
    formDraft?.altPhoneNumber || "",
    formDraft?.hometownId || "",
    formDraft?.addressLineOne || "",
    formDraft?.cityId || "",
    formDraft?.thanaId || "",
    formDraft?.postalCode || "",
    formDraft?.note || "",
    formDraft?.deliveryType || "",
    formDraft?.paymentMethod || "",
    promoCode || "",
  ].join("~");

  // btoa is fine — this is a change detector, not a security primitive
  return btoa(`${userId}::${cartPart}::${formPart}`);
}

function readStorage() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function writeStorage(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function issueNewKey(cartHash) {
  const key = crypto.randomUUID();
  writeStorage({
    idempotencyKey: key,
    cartHash,
    createdAt: Date.now(),
    sessionExpiresAt: Date.now() + SESSION_TTL_MS,
    status: "active",
  });
  return key;
}

/**
 * Core function. Call this in onSubmit, right before the API call.
 * Returns the same key for retries/reloads/re-clicks on the same cart.
 * Returns a new key when cart changes, session expires, or payment completed.
 */
export function resolveIdempotencyKey(userId, cartItems, formDraft, promoCode) {
  if (!userId || !cartItems?.length) return crypto.randomUUID();

  const currentCartHash = buildCartHash(userId, cartItems, formDraft, promoCode);
  const stored = readStorage();
  const now = Date.now();

  // No stored session → first checkout attempt
  if (!stored) {
    return issueNewKey(currentCartHash);
  }

  // Payment already succeeded → new purchase = new intent
  if (stored.status === "completed") {
    return issueNewKey(currentCartHash);
  }

  // Cart contents changed → new intent
  if (stored.cartHash !== currentCartHash) {
    return issueNewKey(currentCartHash);
  }

  // Frontend TTL expired → new session needed
  // By the time frontend TTL fires, the backend cron has had time to
  // release reserved stock (assuming cron runs every ≤2 min)
  if (now > stored.sessionExpiresAt) {
    return issueNewKey(currentCartHash);
  }

  // All good — same cart, same session, still active
  // Handles: reloads, re-clicks, retries, network failures
  return stored.idempotencyKey;
}

/**
 * Call this when backend returns SESSION_EXPIRED.
 * Forces a fresh key on the next submit attempt.
 */
export function invalidateCheckoutIntent() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Call this on /order-confirmed page load after successful payment.
 * Marks the intent as completed so a future checkout starts fresh.
 */
export function markCheckoutCompleted() {
  const stored = readStorage();
  if (!stored) return;
  writeStorage({ ...stored, status: "completed" });
}

/**
 * Call this when cart items are modified (add/remove/qty change).
 * The next resolveIdempotencyKey call will detect the hash change anyway,
 * but calling this eagerly gives a cleaner UX.
 */
export function clearCheckoutIntent() {
  localStorage.removeItem(STORAGE_KEY);
}