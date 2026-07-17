import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Signing you in with Google...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token    = params.get("google_token");
    const email    = params.get("user_email");
    const name     = params.get("display_name");
    const userId   = params.get("user_id");
    const error    = params.get("error");

    if (error) {
      setStatus("Google sign-in failed. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    if (token) {
      // Build the same shape your regular login uses
      const userData = {
        token,
        email,
        display_name: name,
        id: userId,
        user_email: email,
      };

      // Store exactly like customerLogin does
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("customerData", JSON.stringify(userData));

      // Update Zustand store
      useCustomerAuthStore.getState().login(token, userData, null);

      setStatus("Signed in! Redirecting...");
      setTimeout(() => navigate("/"), 500);
    } else {
      setStatus("Something went wrong. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
    }
  }, [navigate]);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "60vh",
        gap: "16px",
        fontFamily: "sans-serif",
        color: "#555",
      }}
    >
      {/* Spinner */}
      <div
        style={{
          width: 40,
          height: 40,
          border: "4px solid #e0e0e0",
          borderTop: "4px solid #4285F4",
          borderRadius: "50%",
          animation: "spin 0.8s linear infinite",
        }}
      />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <p style={{ fontSize: 16 }}>{status}</p>
    </div>
  );
}
