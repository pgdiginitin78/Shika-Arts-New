import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";

export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("Signing you in with Google...");
  const { login } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("google_token");
    const refreshToken = params.get("refresh_token");
    const email = params.get("user_email");
    const name = params.get("display_name");
    const userId = params.get("user_id");
    const error = params.get("error");

    if (error) {
      setStatus("Google sign-in failed. Redirecting...");
      setTimeout(() => navigate("/"), 2000);
      return;
    }

    if (token) {
      const userData = {
        token,
        email,
        display_name: name,
        id: userId,
        user_email: email,
      };

      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
      }

      login(token, userData);

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