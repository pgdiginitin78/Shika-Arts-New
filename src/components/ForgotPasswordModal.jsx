import CloseIcon from "@mui/icons-material/Close";
import EmailIcon from "@mui/icons-material/MailOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import { CircularProgress, Modal } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../services/http-common";

export function ForgotPasswordModal({ isOpen, onClose }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [sentEmail, setSentEmail] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const handleClose = () => {
    reset();
    setSent(false);
    setSentEmail("");
    onClose();
  };

  const onSubmit = async ({ email }) => {
    setLoading(true);
    try {
      await api.post("/wp-json/custom/v1/forgot-password", { email });
      setSentEmail(email);
      setSent(true);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to send reset email. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="forgot-password-title"
      sx={{ display: "flex", alignItems: { xs: "flex-end", sm: "center" }, justifyContent: "center", p: { xs: 0, sm: 2 } }}
    >
      <div className="relative w-full sm:max-w-md bg-white outline-none rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #7A1F3D, #0f1716)" }}
        />

        <div className="px-5 py-5 sm:px-8 sm:py-7">
          <button
            onClick={handleClose}
            aria-label="Close forgot password modal"
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#717171] hover:bg-[#f1e9db] hover:text-[#0f1716] transition-colors cursor-pointer"
          >
            <CloseIcon fontSize="small" />
          </button>

          {!sent ? (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "linear-gradient(135deg, #7A1F3D18, #7A1F3D33)" }}
                >
                  <EmailIcon style={{ color: "#7A1F3D", fontSize: 22 }} />
                </div>
                <h2
                  id="forgot-password-title"
                  className="font-serif text-xl sm:text-2xl font-semibold tracking-wider italic"
                  style={{ color: "#7A1F3D" }}
                >
                  Forgot Password?
                </h2>
                <p className="text-xs sm:text-sm mt-1.5 text-[#717171] max-w-xs leading-relaxed">
                  Enter your registered email address and we'll send you a link to reset your password.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
                className="flex flex-col gap-4"
              >
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="fp-email"
                    className="text-xs font-semibold uppercase tracking-widest text-[#0f1716]"
                  >
                    Email Address
                  </label>
                  <div
                    className={`flex items-center border rounded-lg px-3 py-2.5 sm:py-3 gap-2 transition-colors ${
                      errors.email
                        ? "border-red-400 bg-red-50"
                        : "border-[#e5d5b8] bg-[#f8f5f2] focus-within:border-[#7A1F3D]"
                    }`}
                  >
                    <EmailIcon style={{ fontSize: 17, color: "#717171", flexShrink: 0 }} />
                    <input
                      id="fp-email"
                      type="email"
                      placeholder="Enter your email address"
                      autoComplete="off"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      className="flex-1 bg-transparent text-sm text-[#0f1716] outline-none placeholder:text-[#a1a1aa] min-w-0"
                      {...register("email", {
                        required: "Email address is required",
                        pattern: {
                          value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                          message: "Please enter a valid email address",
                        },
                      })}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.email.message}
                    </p>
                  )}
                </div>

                <div className="mt-1">
                  <button
                    id="fp-send-link-btn"
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-2 py-3 sm:py-3.5 rounded-lg font-semibold text-sm sm:text-base tracking-wide transition-all duration-200 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed shine-effect cursor-pointer"
                    style={{
                      background: "linear-gradient(135deg, #7A1F3D, #5e1730)",
                      color: "#e5d5b8",
                      boxShadow: "0 4px 16px rgba(122,31,61,0.25)",
                    }}
                  >
                    {loading && <CircularProgress size={16} sx={{ color: "#e5d5b8" }} />}
                    {loading ? "Sending…" : "Send Reset Link"}
                  </button>
                </div>

                <p className="text-center text-xs text-[#717171]">
                  Remember your password?{" "}
                  <button
                    type="button"
                    onClick={handleClose}
                    className="font-semibold hover:underline underline-offset-2 transition-colors cursor-pointer"
                    style={{ color: "#7A1F3D" }}
                  >
                    Sign in
                  </button>
                </p>
              </form>
            </>
          ) : (
            <div className="flex flex-col items-center text-center py-4 sm:py-6">
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4"
                style={{ background: "linear-gradient(135deg, #0f171618, #0f171633)" }}
              >
                <CheckCircleOutlineIcon style={{ color: "#0f1716", fontSize: 30 }} />
              </div>
              <h2
                className="font-serif text-xl sm:text-2xl font-semibold tracking-wider italic mb-2"
                style={{ color: "#7A1F3D" }}
              >
                Check Your Email
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] max-w-xs leading-relaxed mb-1">
                We've sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-[#0f1716] mb-4 break-all">{sentEmail}</p>
              <p className="text-xs text-[#a1a1aa] leading-relaxed max-w-xs mb-6">
                Click the link in the email to reset your password. If you don't see it, check your spam folder.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 rounded-lg font-semibold text-sm tracking-wide transition-all duration-200 active:scale-[0.98] cursor-pointer"
                style={{
                  background: "linear-gradient(135deg, #7A1F3D, #5e1730)",
                  color: "#e5d5b8",
                  boxShadow: "0 4px 16px rgba(122,31,61,0.20)",
                }}
              >
                Got it, close
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ForgotPasswordModal;
