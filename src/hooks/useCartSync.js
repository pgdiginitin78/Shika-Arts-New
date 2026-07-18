import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";

export function useCartSync() {
  const syncCart = useCartStore(s => s.syncCart);
  const token = useCustomerAuthStore(s => s.token);

  useEffect(() => {
    // Only attempt server sync if the user is logged in
    // (Cart-Token based session is unreliable without server Expose-Headers fix)
    // localStorage keeps the cart alive across refreshes regardless
    if (!token) return;

    syncCart();

    const handler = () => {
      if (document.visibilityState === "visible" && useCustomerAuthStore.getState().token) {
        syncCart();
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [syncCart, token]);
}