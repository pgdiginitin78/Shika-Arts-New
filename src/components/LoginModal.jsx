import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/MailOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useTheme } from "@mui/material/styles";
import { useState } from "react";

import { customerLogin, getCurrentUser, registerCustomer } from "../services/LoginServices";

export function LoginModal({ isOpen, onClose }) {
  const [tab, setTab] = useState(0); // 0 = Sign In, 1 = Create Account
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setError("");
    setSuccessMsg("");
  };

  const handleClose = () => {
    setTab(0);
    resetForm();
    onClose();
  };

  const handleTabChange = (_, newValue) => {
    setTab(newValue);
    resetForm();
  };

  // ── Sign In ──────────────────────────────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await customerLogin(email, password);
      const customerData = await getCurrentUser(res.token);
      localStorage.setItem("customerData", JSON.stringify(customerData));
      handleClose();
    } catch (err) {
      console.error("[LoginModal] Email login error:", err);
      setError(
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Register ─────────────────────────────────────────────────────────────
  const handleRegister = async (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const payload = { firstName, lastName, email, password };
      await registerCustomer(payload);
      setSuccessMsg("Account created! You can now sign in.");
      resetForm();
      // Switch to Sign In tab after short delay so user sees the message
      setTimeout(() => {
        setSuccessMsg("");
        setTab(0);
      }, 2000);
    } catch (err) {
      console.error("[LoginModal] Register error:", err);
      setError(
        err?.response?.data?.message || err?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // ── Shared field props ───────────────────────────────────────────────────
  const fieldSx = { size: "small", fullWidth: true };

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
          {/* Close button */}
          <IconButton
            onClick={handleClose}
            aria-label="Close"
            sx={{ position: "absolute", top: 8, right: 8 }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>

          {/* Header */}
          <Box className="flex flex-col items-center text-center mb-4">
            <h2 className="font-serif text-2xl font-semibold text-[#7A1F3D] tracking-wider italic">
              Welcome To Shika-Arts
            </h2>
            <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
              {tab === 0
                ? "Sign in to access your orders, wishlist & saved gifts."
                : "Create an account to get started."}
            </Typography>
          </Box>

          {/* Tabs */}
          <Tabs
            value={tab}
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{
              mb: 3,
              "& .MuiTabs-indicator": { backgroundColor: "#7A1F3D" },
              "& .MuiTab-root": { textTransform: "none", fontWeight: 600, fontSize: 14 },
              "& .Mui-selected": { color: "#7A1F3D !important" },
            }}
          >
            <Tab label="Sign In" />
            <Tab label="Create Account" />
          </Tabs>

          {/* Error banner */}
          {error && (
            <Box
              className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
              role="alert"
            >
              {error}
            </Box>
          )}

          {/* Success banner */}
          {successMsg && (
            <Box
              className="mb-4 rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700"
              role="status"
            >
              {successMsg}
            </Box>
          )}

          {/* ── Sign In Form ── */}
          {tab === 0 && (
            <Box component="form" onSubmit={handleEmailLogin} className="flex flex-col gap-3">
              <TextField
                {...fieldSx}
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                  ),
                }}
              />
              <TextField
                {...fieldSx}
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
            </Box>
          )}

          {/* ── Register Form ── */}
          {tab === 1 && (
            <Box component="form" onSubmit={handleRegister} className="flex flex-col gap-3">
              <Box className="flex gap-3">
                <TextField
                  {...fieldSx}
                  label="First Name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  autoFocus
                  autoComplete="given-name"
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                    ),
                  }}
                />
                <TextField
                  {...fieldSx}
                  label="Last Name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  autoComplete="family-name"
                  InputProps={{
                    startAdornment: (
                      <PersonIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                    ),
                  }}
                />
              </Box>
              <TextField
                {...fieldSx}
                label="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                InputProps={{
                  startAdornment: (
                    <EmailIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                  ),
                }}
              />
              <TextField
                {...fieldSx}
                label="Password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
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
                {loading ? "Creating account…" : "Create Account"}
              </Button>
            </Box>
          )}

          <Box sx={{ mt: 3, mb: 1 }}>
            <Divider sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                OR
              </Typography>
            </Divider>
            <Button
              fullWidth
              variant="outlined"
              size="large"
              startIcon={<GoogleIcon />}
              onClick={() => {
                const returnUrl = "https://shikaarts.com/";
                window.location.href = `https://lawngreen-marten-717862.hostingersite.com/wp-login.php?loginSocial=google&redirect_to=${encodeURIComponent(returnUrl)}`;
              }}
              sx={{
                py: 1.2,
                textTransform: "none",
                fontWeight: 600,
                color: "text.primary",
                borderColor: "divider",
                "&:hover": { backgroundColor: "action.hover", borderColor: "text.secondary" },
              }}
            >
              Continue with Google
            </Button>
          </Box>

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
