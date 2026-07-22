import CloseIcon from "@mui/icons-material/Close";
import LockIcon from "@mui/icons-material/LockOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutlined";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import { CircularProgress, Modal } from "@mui/material";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import api from "../services/http-common";

export function ResetPasswordModal({ isOpen, resetKey, loginName, onClose }) {
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm({ mode: "onChange" });

  const newPassword = watch("newPassword");

  const handleClose = () => {
    reset();
    setShowNew(false);
    setShowConfirm(false);
    setDone(false);
    const url = new URL(window.location.href);
    url.searchParams.delete("action");
    url.searchParams.delete("key");
    url.searchParams.delete("login");
    window.history.replaceState({}, document.title, url.pathname + (url.search || ""));
    onClose();
  };

  const onSubmit = async ({ newPassword: password }) => {
    setLoading(true);
    try {
      await api.post("/wp-json/custom/v1/reset-password", {
        key: resetKey,
        login: loginName,
        password,
      });
      setDone(true);
      toast.success("Password reset successfully!");
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        "Failed to reset password. The link may have expired. Please request a new one.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={isOpen}
      onClose={handleClose}
      aria-labelledby="reset-password-title"
      sx={{
        display: "flex",
        alignItems: { xs: "flex-end", sm: "center" },
        justifyContent: "center",
        p: { xs: 0, sm: 2 },
      }}
    >
      <div className="relative w-full sm:max-w-md bg-white outline-none rounded-t-2xl sm:rounded-2xl shadow-2xl overflow-hidden animate-fadeIn">
        <div
          className="h-1.5 w-full"
          style={{ background: "linear-gradient(90deg, #7A1F3D, #0f1716)" }}
        />

        <div className="px-5 py-5 sm:px-8 sm:py-7">
          <button
            onClick={handleClose}
            aria-label="Close reset password modal"
            className="absolute top-4 right-4 p-1.5 rounded-full text-[#717171] hover:bg-[#f1e9db] hover:text-[#0f1716] transition-colors cursor-pointer"
          >
            <CloseIcon fontSize="small" />
          </button>

          {!done ? (
            <>
              <div className="flex flex-col items-center text-center mb-6">
                <div
                  className="w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center mb-3"
                  style={{ background: "linear-gradient(135deg, #7A1F3D18, #7A1F3D33)" }}
                >
                  <LockIcon style={{ color: "#7A1F3D", fontSize: 22 }} />
                </div>
                <h2
                  id="reset-password-title"
                  className="font-serif text-xl sm:text-2xl font-semibold tracking-wider italic"
                  style={{ color: "#7A1F3D" }}
                >
                  Set New Password
                </h2>
                <p className="text-xs sm:text-sm mt-1.5 text-[#717171] max-w-xs leading-relaxed">
                  Choose a strong new password for your account.
                </p>
              </div>

              <form
                onSubmit={handleSubmit(onSubmit)}
                autoComplete="off"
                className="flex flex-col gap-4 sm:gap-5"
              >
                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="rp-new-password"
                    className="text-xs font-semibold uppercase tracking-widest text-[#0f1716]"
                  >
                    New Password
                  </label>
                  <div
                    className={`flex items-center border rounded-lg px-3 py-2.5 sm:py-3 gap-2 transition-colors ${
                      errors.newPassword
                        ? "border-red-400 bg-red-50"
                        : "border-[#e5d5b8] bg-[#f8f5f2] focus-within:border-[#7A1F3D]"
                    }`}
                  >
                    <LockIcon style={{ fontSize: 17, color: "#717171", flexShrink: 0 }} />
                    <input
                      id="rp-new-password"
                      type={showNew ? "text" : "password"}
                      placeholder="Enter new password"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      className="flex-1 bg-transparent text-sm text-[#0f1716] outline-none placeholder:text-[#a1a1aa] min-w-0"
                      {...register("newPassword", {
                        required: "New password is required",
                        minLength: {
                          value: 8,
                          message: "Password must be at least 8 characters",
                        },
                        pattern: {
                          value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
                          message: "Must include uppercase, lowercase, and a number",
                        },
                      })}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showNew ? "Hide new password" : "Show new password"}
                      onClick={() => setShowNew((p) => !p)}
                      className="text-[#717171] hover:text-[#0f1716] transition-colors flex-shrink-0 cursor-pointer"
                    >
                      {showNew ? (
                        <VisibilityOffIcon style={{ fontSize: 17 }} />
                      ) : (
                        <VisibilityIcon style={{ fontSize: 17 }} />
                      )}
                    </button>
                  </div>
                  {errors.newPassword && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    htmlFor="rp-confirm-password"
                    className="text-xs font-semibold uppercase tracking-widest text-[#0f1716]"
                  >
                    Re-enter New Password
                  </label>
                  <div
                    className={`flex items-center border rounded-lg px-3 py-2.5 sm:py-3 gap-2 transition-colors ${
                      errors.confirmPassword
                        ? "border-red-400 bg-red-50"
                        : "border-[#e5d5b8] bg-[#f8f5f2] focus-within:border-[#7A1F3D]"
                    }`}
                  >
                    <LockIcon style={{ fontSize: 17, color: "#717171", flexShrink: 0 }} />
                    <input
                      id="rp-confirm-password"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Re-enter new password"
                      autoComplete="new-password"
                      data-lpignore="true"
                      data-1p-ignore="true"
                      className="flex-1 bg-transparent text-sm text-[#0f1716] outline-none placeholder:text-[#a1a1aa] min-w-0"
                      {...register("confirmPassword", {
                        required: "Please re-enter your new password",
                        validate: (val) => val === newPassword || "Passwords do not match",
                      })}
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                      onClick={() => setShowConfirm((p) => !p)}
                      className="text-[#717171] hover:text-[#0f1716] transition-colors flex-shrink-0 cursor-pointer"
                    >
                      {showConfirm ? (
                        <VisibilityOffIcon style={{ fontSize: 17 }} />
                      ) : (
                        <VisibilityIcon style={{ fontSize: 17 }} />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-500 mt-0.5 flex items-center gap-1">
                      <span>⚠</span>
                      {errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <div className="mt-1">
                  <button
                    id="rp-save-btn"
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
                    {loading ? "Saving…" : "Save New Password"}
                  </button>
                </div>
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
                Password Reset!
              </h2>
              <p className="text-xs sm:text-sm text-[#717171] max-w-xs leading-relaxed mb-6">
                Your password has been updated successfully. You can now sign in with your new password.
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
                Back to Sign In
              </button>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default ResetPasswordModal;
