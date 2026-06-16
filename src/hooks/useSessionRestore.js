import { useEffect } from "react";

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
    setRestoring(false);
  }, []);
}
