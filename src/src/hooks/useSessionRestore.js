import { useEffect } from "react";
// import { restoreSession } from "@/lib/shopifyCustomerAuthOld.js";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";

/**
 * Validates the stored access token on app load.
 * If valid → keeps the user logged in.
 * If expired/invalid → clears auth state.
 */
export function useSessionRestore() {
  const token = useCustomerAuthStore((s) => s.token);
  const login = useCustomerAuthStore((s) => s.login);
  const logout = useCustomerAuthStore((s) => s.logout);
  const setRestoring = useCustomerAuthStore((s) => s.setRestoring);

  useEffect(() => {
    if (!token) {
      setRestoring(false);
      return;
    }

    setRestoring(true);
    restoreSession()
      .then((session) => {
        if (session) {
          login(session.token, session.customer, null);
        } else {
          logout();
        }
      })
      .catch(() => logout())
      .finally(() => setRestoring(false));
    // Only run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
}
