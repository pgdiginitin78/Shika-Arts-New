import { useEffect } from "react";
import { useWishlistStore } from "@/stores/wishlistStore";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";

/**
 * Keeps the wishlist count in sync with the server.
 * - Fetches once on mount (if user is logged in).
 * - Re-fetches whenever the tab becomes visible again.
 * - Count is product-based (one entry per unique product), NOT quantity-based.
 */
export function useWishlistSync() {
  const fetchWishlist = useWishlistStore((s) => s.fetchWishlist);
  const token = useCustomerAuthStore((s) => s.token);

  useEffect(() => {
    // Only sync if user has a valid token
    if (!token) return;

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
