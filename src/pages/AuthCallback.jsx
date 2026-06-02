import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { exchangeCodeForToken, fetchCustomerProfile, SHOPIFY_CLIENT_ID } from "@/lib/shopifyAuth";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";

export default function AuthCallback() {
  const navigate = useNavigate();
  const login = useCustomerAuthStore((s) => s.login);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    const state = params.get("state");
    const storedState = sessionStorage.getItem("shopify_oauth_state");

    // Validate state to prevent CSRF
    if (!code || state !== storedState) {
      navigate("/");
      return;
    }

    async function handleCallback() {
      try {
        const tokens = await exchangeCodeForToken(SHOPIFY_CLIENT_ID, code);
        const customer = await fetchCustomerProfile(tokens.access_token);
        login(tokens.access_token, customer, tokens.id_token);
        navigate("/");
      } catch (err) {
        console.error("Auth callback failed:", err);
        navigate("/");
      }
    }

    handleCallback();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="w-10 h-10 border-2 border-destructive border-t-transparent rounded-full animate-spin" />
        <p className="text-muted-foreground font-serif text-lg">Signing you in...</p>
      </div>
    </div>
  );
}
