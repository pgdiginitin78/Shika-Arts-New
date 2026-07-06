import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";

export function useCartSync() {
  const syncCart = useCartStore(s => s.syncCart);
  const token = useCustomerAuthStore(s => s.token);

  useEffect(() => {
    if (!token) return;
    
    syncCart();
    
    const handler = () => {
      if (document.visibilityState === "visible" && token) syncCart();
    };
    
    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [syncCart, token]);
}