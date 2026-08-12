import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useAuth } from "@/context/AuthContext";

/**
 * Keeps the wishlist count in sync with the server.
 * - Fetches once on mount (if user is logged in).
 * - Re-fetches whenever the tab becomes visible again.
 * - Count is product-based (one entry per unique product), NOT quantity-based.
 */
let lastFetchedTokenGlobal = null;

export function useWishlistSync() {
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      lastFetchedTokenGlobal = null;
      return;
    }

    // StrictMode mounts → unmounts → mounts with the same token.
    // The global var persists across that fake unmount, so the second mount is skipped.
    if (lastFetchedTokenGlobal === token) return;
    lastFetchedTokenGlobal = token;

    fetchWishlist();

    const handler = () => {
      if (document.visibilityState === "visible" && token) {
        fetchWishlist();
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [fetchWishlist, token]);
}
