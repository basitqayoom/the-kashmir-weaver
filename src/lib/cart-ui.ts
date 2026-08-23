"use client";

/**
 * Minimal cross-component pub/sub for cart UI state — no state library needed
 * for this small a surface (drawer open/closed + the cart data it shows).
 * Fetching happens here (triggered by explicit actions), never reactively in
 * a component effect.
 */
import type { Cart } from "./shopify/types";

type Listener = () => void;
type Snapshot = { isOpen: boolean; cart: Cart | null; loading: boolean };

let state: Snapshot = { isOpen: false, cart: null, loading: false };
const listeners = new Set<Listener>();

function setState(next: Partial<Snapshot>) {
  state = { ...state, ...next };
  listeners.forEach((fn) => fn());
}

export function subscribeCartUi(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getCartUiSnapshot(): Snapshot {
  return state;
}

// Stable reference for useSyncExternalStore's getServerSnapshot — must NOT
// read the live, module-mutated `state` (the client-only warm-up fetch below
// flips `loading` before hydration's first client render runs, which would
// otherwise mismatch the server-rendered "loading: false" markup).
const INITIAL_SNAPSHOT: Snapshot = {
  isOpen: false,
  cart: null,
  loading: false,
};

export function getCartUiServerSnapshot(): Snapshot {
  return INITIAL_SNAPSHOT;
}

async function fetchCart(): Promise<void> {
  setState({ loading: true });
  try {
    const res = await fetch("/api/cart", { cache: "no-store" });
    const data = await res.json();
    setState({ cart: data.cart ?? null, loading: false });
  } catch {
    setState({ loading: false });
  }
}

export function openCartDrawer() {
  setState({ isOpen: true });
  void fetchCart();
}

export function closeCartDrawer() {
  setState({ isOpen: false });
}

/** Cart lines changed elsewhere (e.g. PDP add-to-cart) — refetch immediately. */
export function notifyCartUpdated() {
  void fetchCart();
}

// Warm the cart quantity once per browser session so the header badge and
// FAB reflect reality before the user ever opens the drawer.
if (typeof window !== "undefined") {
  void fetchCart();
}
