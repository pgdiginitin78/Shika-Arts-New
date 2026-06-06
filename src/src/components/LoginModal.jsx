import { useState } from "react";
import {
  Dialog,
  DialogContent,
  IconButton,
  Box,
  Typography,
  Button,
  Divider,
  CircularProgress,
  TextField,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import GoogleIcon from "@mui/icons-material/Google";
import EmailIcon from "@mui/icons-material/MailOutlined";
import LockIcon from "@mui/icons-material/LockOutlined";
import { customerLogin, fetchCustomerByToken } from "@/lib/shopifyCustomerAuth";
// import { initiateLogin } from "@/lib/shopifyAuth";

import { useCustomerAuthStore } from "@/stores/customerAuthStore";

export function LoginModal({ isOpen, onClose }) {
  const [view, setView] = useState("main"); // "main" | "email"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const login = useCustomerAuthStore((s) => s.login);

  const handleClose = () => {
    setView("main");
    setEmail("");
    setPassword("");
    setError("");
    onClose();
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const { accessToken } = await customerLogin(email, password);
      const customer = await fetchCustomerByToken(accessToken);
      login(accessToken, customer, null);
      handleClose();
    } catch (err) {
      console.error("[LoginModal] Email login error:", err);
      setError(err.message || "Login failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // const handleEmailLogin = async (e) => {
  // e.preventDefault();

  //   try {
  //     await initiateLogin();
  //   } catch (err) {
  //     setError(err.message || "Login failed");
  //   }
  // };

  const handleGoogleLogin = () => {
    
    const returnUrl = encodeURIComponent(window.location.href);
    window.location.href = `https://shika-arts-premium-gifts-jmx4i.myshopify.com/account/login?return_url=${returnUrl}`;
  };

//   const handleGoogleLogin = async () => {
//   try {
//     await initiateLogin();
//   } catch (err) {
//     setError(err.message || "Login failed");
//   }
// };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: { borderRadius: fullScreen ? 0 : 2, overflow: "hidden" },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box className="relative bg-white p-6 sm:p-8">
          <IconButton
            onClick={handleClose}
            aria-label="Close"
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Header */}
          <Box className="flex flex-col items-center text-center mb-6">
            <h2 className="font-serif text-2xl font-semibold text-[#7A1F3D] tracking-wider italic">
              Welcome To Shika-Arts
            </h2>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              Sign in to access your orders, wishlist &amp; saved gifts.
            </Typography>
          </Box>

          {/* Error banner */}
          {error && (
            <Box
              className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </Box>
          )}

          {/* ── Main view ── */}
          {view === "main" && (
            <Box className="flex flex-col gap-3">
              <Button
                fullWidth
                variant="outlined"
                size="large"
                startIcon={<GoogleIcon sx={{ color: "#EA4335" }} />}
                onClick={handleGoogleLogin}
                sx={{
                  py: 1.4,
                  borderColor: "rgba(0,0,0,0.18)",
                  color: "#0f1716",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": {
                    borderColor: "#0f1716",
                    backgroundColor: "rgba(0,0,0,0.02)",
                  },
                }}
              >
                Continue with Google
              </Button>

              <Box className="flex items-center gap-3 my-1">
                <Divider sx={{ flex: 1 }} />
                <Typography
                  variant="caption"
                  sx={{
                    color: "text.secondary",
                    textTransform: "uppercase",
                    letterSpacing: "0.18em",
                    fontSize: 10,
                  }}
                >
                  or
                </Typography>
                <Divider sx={{ flex: 1 }} />
              </Box>

              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={<EmailIcon />}
                onClick={() => {
                  setError("");
                  setView("email");
                }}
                sx={{
                  py: 1.4,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "#7A1F3D",
                  "&:hover": { backgroundColor: "#5e1730" },
                }}
              >
                Continue with Email
              </Button>
            </Box>
          )}

          {/* ── Email / password form ── */}
          {view === "email" && (
            <Box component="form" onSubmit={handleEmailLogin} className="flex flex-col gap-3">
              <TextField
                label="Email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                fullWidth
                size="small"
                autoFocus
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                  ),
                }}
              />
              <TextField
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                fullWidth
                size="small"
                autoComplete="current-password"
                InputProps={{
                  startAdornment: (
                    <LockIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} sx={{ color: "white" }} /> : null}
                sx={{
                  mt: 0.5,
                  py: 1.4,
                  textTransform: "none",
                  fontWeight: 600,
                  backgroundColor: "#7A1F3D",
                  "&:hover": { backgroundColor: "#5e1730" },
                }}
              >
                {loading ? "Signing in…" : "Sign In"}
              </Button>

              <Button
                fullWidth
                variant="text"
                size="small"
                onClick={() => {
                  setView("main");
                  setError("");
                }}
                sx={{ textTransform: "none", color: "text.secondary" }}
              >
                ← Back
              </Button>
            </Box>
          )}

          <Typography
            variant="caption"
            sx={{
              display: "block",
              mt: 3,
              textAlign: "center",
              color: "text.secondary",
              lineHeight: 1.5,
            }}
          >
            By continuing you agree to our Terms of Service and acknowledge our Privacy Policy.
          </Typography>
        </Box>
      </DialogContent>
    </Dialog>
  );
}

export default LoginModal;
