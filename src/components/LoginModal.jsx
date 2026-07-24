import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/LockOutlined";
import EmailIcon from "@mui/icons-material/MailOutlined";
import PersonIcon from "@mui/icons-material/PersonOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  Divider,
  IconButton,
  InputAdornment,
  Tab,
  Tabs,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useEffect, useRef, useState } from "react";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { customerLogin, getCurrentUser, registerCustomer } from "../services/LoginServices";
import { toast } from "sonner";
import { ForgotPasswordModal } from "./ForgotPasswordModal";
import { notifyUserChanged } from "./UserMenu";

const clientId = "548183815340-krdtfufu7sevl4019h8i7170q3934iba.apps.googleusercontent.com";

export function LoginModal({ isOpen, onClose }) {
  const [tab, setTab] = useState(0);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [googleBtnWidth, setGoogleBtnWidth] = useState(0);
  const [forgotOpen, setForgotOpen] = useState(false);

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const googleBtnContainerRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const el = googleBtnContainerRef.current;
    if (!el) return;

    const updateWidth = () => setGoogleBtnWidth(el.offsetWidth);
    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(el);
    return () => observer.disconnect();
  }, [isOpen]);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setShowPassword(false);
    setError("");
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

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await customerLogin(email, password);
      const customerData = await getCurrentUser(res.token);
      useCustomerAuthStore.getState().setCustomer(customerData);
      localStorage.setItem("customerData", JSON.stringify(customerData));
      notifyUserChanged(); // re-sync UserMenu & App.jsx isSuperAdmin immediately
      toast.success("Login successful!");
      setLoading(false);
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (err) {
      const errorCode = err?.response?.data?.code;

      const errorMessage = errorCode
        ?.replace("[jwt_auth]", "")
        ?.replace(/_/g, " ")
        ?.replace(/\b\w/g, (c) => c.toUpperCase());
      toast.error(errorMessage || "Login failed.");
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    if (!firstName || !lastName || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const payload = { firstName, lastName, email, password };
      await registerCustomer(payload);
      toast.success("Account created successfully! You can now sign in.");
      resetFormKeepSuccess();
      setTimeout(() => {
        setTab(0);
      }, 2000);
    } catch (err) {
      toast.error(
        err?.response?.data?.message || err?.message || "Registration failed. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const resetFormKeepSuccess = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setShowPassword(false);
  };

  const fieldSx = { size: "small", fullWidth: true };

  const handleSuccess = async (credentialResponse) => {
    const idToken = credentialResponse.credential;
    if (!idToken) {
      toast.error("Google sign-in failed. Please try again.");
      return;
    }
    setLoading(true);

    try {
      const response = await fetch(
        "https://api.shikaarts.com/wp-json/custom-auth/v1/google-login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token: idToken }),
        },
      );
      const data = await response.json();
      if (!response.ok || !data.token) {
        throw new Error(data.message || "Google login failed.");
      }
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("customerData", JSON.stringify(data.user));
      useCustomerAuthStore.getState().login(data.token, data.user, null);
      toast.success("Login successful!");
      setLoading(false);
      setTimeout(() => {
        handleClose();
      }, 1200);
    } catch (error) {
      setLoading(false);
      toast.error(error.message || "Google sign-in failed. Please try again.");
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={handleClose}
        fullScreen={fullScreen}
        maxWidth="xs"
        fullWidth
        keepMounted
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

            {error && (
              <Box
                className="mb-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
                role="alert"
              >
                {error}
              </Box>
            )}

            {tab === 0 && (
              <Box
                component="form"
                onSubmit={handleEmailLogin}
                autoComplete="off"
                className="flex flex-col gap-3"
              >
                <TextField
                  {...fieldSx}
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  autoComplete="off"
                  name="shika_login_user"
                  id="shika_login_user"
                  slotProps={{
                    htmlInput: {
                      autoComplete: "off",
                      "data-lpignore": "true",
                      "data-1p-ignore": "true",
                      "data-form-type": "other",
                    },
                    input: {
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                      ),
                    },
                  }}
                />
                <TextField
                  {...fieldSx}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  name="shika_login_pass"
                  id="shika_login_pass"
                  slotProps={{
                    htmlInput: {
                      autoComplete: "new-password",
                      "data-lpignore": "true",
                      "data-1p-ignore": "true",
                      "data-form-type": "other",
                    },
                    input: {
                      startAdornment: (
                        <LockIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            size="small"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <VisibilityOffIcon
                                fontSize="small"
                                sx={{ color: "text.secondary" }}
                              />
                            ) : (
                              <VisibilityIcon fontSize="small" sx={{ color: "text.secondary" }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& input::-ms-reveal, & input::-ms-clear": { display: "none" },
                  }}
                />
                <div className="flex justify-end -mt-1">
                  <button
                    type="button"
                    id="forgot-password-link"
                    onClick={() => {
                      handleClose();
                      setForgotOpen(true);
                    }}
                    className="text-xs cursor-pointer font-semibold hover:underline underline-offset-2 transition-colors"
                    style={{ color: "#7A1F3D" }}
                  >
                    Forgot password?
                  </button>
                </div>
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={18} sx={{ color: "white" }} /> : null
                  }
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
                    slotProps={{
                      input: {
                        startAdornment: (
                          <PersonIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                        ),
                      },
                    }}
                  />
                  <TextField
                    {...fieldSx}
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    autoComplete="family-name"
                    slotProps={{
                      input: {
                        startAdornment: (
                          <PersonIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                        ),
                      },
                    }}
                  />
                </Box>
                <TextField
                  {...fieldSx}
                  label="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <EmailIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                      ),
                    },
                  }}
                />
                <TextField
                  {...fieldSx}
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  slotProps={{
                    input: {
                      startAdornment: (
                        <LockIcon sx={{ mr: 1, fontSize: 18, color: "text.secondary" }} />
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton
                            aria-label={showPassword ? "Hide password" : "Show password"}
                            onClick={() => setShowPassword((prev) => !prev)}
                            edge="end"
                            size="small"
                            tabIndex={-1}
                          >
                            {showPassword ? (
                              <VisibilityOffIcon
                                fontSize="small"
                                sx={{ color: "text.secondary" }}
                              />
                            ) : (
                              <VisibilityIcon fontSize="small" sx={{ color: "text.secondary" }} />
                            )}
                          </IconButton>
                        </InputAdornment>
                      ),
                    },
                  }}
                  sx={{
                    "& input::-ms-reveal, & input::-ms-clear": { display: "none" },
                  }}
                />
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={
                    loading ? <CircularProgress size={18} sx={{ color: "white" }} /> : null
                  }
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

            <div className="mt-3 mb-2">
              <Divider sx={{ mb: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  OR
                </Typography>
              </Divider>

              <div ref={googleBtnContainerRef} className="relative w-full h-11">
                <div className="absolute inset-0 flex items-center justify-center gap-2 rounded-lg border border-[#7A1F3D] bg-white text-[#7A1F3D] font-semibold text-sm pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" className="w-5 h-5">
                    <path
                      fill="#7A1F3D"
                      d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                    />
                    <path
                      fill="#7A1F3D"
                      d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                    />
                    <path
                      fill="#7A1F3D"
                      d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                    />
                    <path
                      fill="#7A1F3D"
                      d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                    />
                  </svg>

                  <span>Continue with Google</span>
                </div>
                {googleBtnWidth > 0 && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center opacity-[0.01] cursor-pointer">
                    <GoogleOAuthProvider clientId={clientId}>
                      <GoogleLogin
                        width={googleBtnWidth}
                        onSuccess={handleSuccess}
                        onError={() => toast.error("Google sign-in failed. Please try again.")}
                      />
                    </GoogleOAuthProvider>
                  </div>
                )}
              </div>
            </div>
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

      <ForgotPasswordModal isOpen={forgotOpen} onClose={() => setForgotOpen(false)} />
    </>
  );
}

export default LoginModal;
