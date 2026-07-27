import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import { useEffect, useState, useRef } from "react";
import { verifyEmailOtp, resendOtp } from "../services/LoginServices";
import { toast } from "sonner";

export function OtpVerificationModal({ isOpen, onClose, email, onSuccess }) {
  const [otpArray, setOtpArray] = useState(Array(6).fill(""));
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [timer, setTimer] = useState(20);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down("sm"));
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (isOpen && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isOpen, timer]);

  useEffect(() => {
    if (isOpen) {
      setOtpArray(Array(6).fill(""));
      setTimer(30);
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    }
  }, [isOpen]);

  const handleOtpChange = (e, index) => {
    const value = e.target.value;
    if (isNaN(value)) return;

    const newOtpArray = [...otpArray];
    newOtpArray[index] = value.substring(value.length - 1);
    setOtpArray(newOtpArray);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otpArray[index] && index > 0) {
        const newOtpArray = [...otpArray];
        newOtpArray[index - 1] = "";
        setOtpArray(newOtpArray);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pasteData)) return;

    const newOtpArray = [...otpArray];
    for (let i = 0; i < pasteData.length && i < 6; i++) {
      newOtpArray[i] = pasteData[i];
    }
    setOtpArray(newOtpArray);

    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex].focus();
  };

  const currentOtp = otpArray.join("");

  const handleVerify = async (e) => {
    e.preventDefault();
    if (currentOtp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }
    setLoading(true);
    try {
      await verifyEmailOtp({ email, otp: currentOtp });
      toast.success("Email verified successfully!");
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Verification failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      await resendOtp({ email });
      toast.success("OTP sent successfully!");
      setTimer(30);
      setOtpArray(Array(6).fill(""));
      setTimeout(() => {
        if (inputRefs.current[0]) inputRefs.current[0].focus();
      }, 100);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to resend OTP.");
    } finally {
      setResendLoading(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullScreen={fullScreen}
      maxWidth="xs"
      fullWidth
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: fullScreen ? 0 : 5,
          overflow: "hidden",
          backgroundColor: "#F7F8F9",
        },
      }}
    >
      <DialogContent sx={{ p: 0 }}>
        <Box className="relative p-8 pt-12 pb-10 flex flex-col items-center">
          <IconButton
            onClick={onClose}
            sx={{ position: "absolute", top: 12, right: 12, color: "#9E9E9E" }}
          >
            <CloseIcon />
          </IconButton>

          <Box sx={{ mb: 3 }}>
            <svg
              width="84"
              height="96"
              viewBox="0 0 84 96"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <rect x="18" y="42" width="48" height="42" rx="6" fill="#7A1F3D" />
              <path
                d="M28 42V28C28 20.268 34.268 14 42 14C49.732 14 56 20.268 56 28V42"
                stroke="#7A1F3D"
                strokeWidth="6"
                strokeLinecap="round"
              />
              <circle cx="42" cy="58" r="5" fill="white" />
              <rect x="40" y="60" width="4" height="10" fill="white" />
              <path
                d="M68 28C68 31.3137 65.3137 34 62 34C58.6863 34 56 31.3137 56 28C56 24.6863 58.6863 22 62 22C65.3137 22 68 24.6863 68 28Z"
                stroke="#7A1F3D"
                strokeWidth="4"
                fill="#b85575"
              />
              <path d="M68 31L75 38V45H71V41H68V31Z" fill="#b85575" />
            </svg>
          </Box>

          <Typography
            variant="h5"
            sx={{ fontWeight: 700, color: "#333", mb: 1, fontFamily: "sans-serif" }}
          >
            Enter OTP Code
          </Typography>

          <Typography
            variant="body2"
            sx={{
              color: "#8B8B8B",
              textAlign: "center",
              mb: 4,
              px: 2,
              fontSize: "0.8rem",
              lineHeight: 1.5,
            }}
          >
            We have sent a 6-digit code to {email}. Enter it below to verify your account.
          </Typography>

          <Box
            component="form"
            onSubmit={handleVerify}
            className="flex flex-col items-center w-full"
          >
            <Box className="flex justify-between w-full mb-6 gap-2">
              {otpArray.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength="1"
                  value={data}
                  onChange={(e) => handleOtpChange(e, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  onPaste={handlePaste}
                  ref={(el) => (inputRefs.current[index] = el)}
                  className="w-12 h-14 text-center text-xl font-semibold bg-[#E4E4E4] rounded-lg border-none focus:outline-none focus:ring-2 focus:ring-[#7A1F3D] transition-all"
                  style={{ MozAppearance: "textfield" }}
                />
              ))}
            </Box>

            {timer > 0 && (
              <Typography
                variant="body2"
                sx={{ color: "#7A1F3D", fontWeight: 700, mb: 1, fontSize: "1rem" }}
              >
                00:{timer.toString().padStart(2, "0")}
              </Typography>
            )}

            <Button
              onClick={handleResend}
              disabled={timer > 0 || resendLoading}
              disableRipple
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#6B6B6B",
                textDecoration: "underline",
                textUnderlineOffset: "4px",
                mb: timer > 0 ? 3 : 4,
                "&:hover": {
                  backgroundColor: "transparent",
                  color: "#333",
                },
                "&.Mui-disabled": {
                  color: "#A0A0A0",
                },
              }}
            >
              {resendLoading ? (
                <CircularProgress size={14} sx={{ mr: 1, color: "inherit" }} />
              ) : null}
              Resend Code
            </Button>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading || currentOtp.length !== 6}
              startIcon={loading ? <CircularProgress size={18} sx={{ color: "white" }} /> : null}
              sx={{
                py: 1.5,
                borderRadius: "30px",
                textTransform: "none",
                fontSize: "1rem",
                fontWeight: 600,
                backgroundColor: "#7A1F3D",
                color: "white",
                boxShadow: "none",
                "&:hover": { backgroundColor: "#5e1730", boxShadow: "none" },
                "&.Mui-disabled": {
                  backgroundColor: "#d69bb0",
                  color: "white",
                },
              }}
            >
              {loading ? "Verifying..." : "Verify Code"}
            </Button>
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
