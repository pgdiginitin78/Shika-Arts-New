import { useEffect } from "react";
import { useCartStore } from "@/stores/cartStore";
import { useAuth } from "@/context/AuthContext";

// Tracks the token we last synced for — module-level so it survives StrictMode
// completely unmounting and remounting the App component.
let lastSyncedTokenGlobal = null;

export function useCartSync() {
  const syncCart = useCartStore((s) => s.syncCart);
  const { token } = useAuth();

  useEffect(() => {
    if (!token) {
      lastSyncedTokenGlobal = null;
      return;
    }

    // StrictMode mounts → unmounts → mounts with the same token.
    // The global var persists across that fake unmount, so the second mount is skipped.
    if (lastSyncedTokenGlobal === token) return;
    lastSyncedTokenGlobal = token;

    syncCart();

    const handler = () => {
      if (document.visibilityState === "visible" && token) {
        syncCart();
      }
    };

    document.addEventListener("visibilitychange", handler);
    return () => document.removeEventListener("visibilitychange", handler);
  }, [syncCart, token]);
}
