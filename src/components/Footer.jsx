import { useState } from "react";
import { Facebook, Instagram, LinkedIn } from "@mui/icons-material";
import { Modal, Box, TextField, CircularProgress, IconButton } from "@mui/material";
import { Close, Download } from "@mui/icons-material";
import { Mail, Phone } from "lucide-react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { downloadBrochure } from "@/services/orderService";
import { toast } from "sonner";

const modalStyle = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: { xs: "92vw", sm: 480 },
  maxHeight: "90vh",
  overflowY: "auto",
  bgcolor: "#fff",
  borderRadius: "16px",
  boxShadow: "0 25px 60px rgba(0,0,0,0.18)",
  p: 0,
  outline: "none",
};

const fieldSx = {
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    fontSize: "14px",
    "& fieldset": { borderColor: "#e5e7eb" },
    "&:hover fieldset": { borderColor: "#c9a96e" },
    "&.Mui-focused fieldset": { borderColor: "#c9a96e", borderWidth: "1.5px" },
  },
  "& .MuiInputLabel-root.Mui-focused": { color: "#c9a96e" },
};

function BrochureModal({ open, onClose }) {
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({ mode: "onChange" });

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = async (values) => {
    setLoading(true);
    try {
      await downloadBrochure({
        first_name: values.firstName,
        last_name: values.lastName,
        mobile: values.mobile,
        email: values.email,
      });

      const pdfRes = await fetch("/brochure/ShikaArts-Brochure.pdf");
      if (!pdfRes.ok) throw new Error("PDF not found");
      const blob = await pdfRes.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "ShikaArts-Brochure.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => URL.revokeObjectURL(url), 5000);

      toast.success("Brochure downloaded successfully!");
      handleClose();
    } catch (err) {
      console.error("downloadBrochure error:", err);
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={!loading ? handleClose : undefined}
      aria-labelledby="brochure-modal-title"
    >
      <Box sx={modalStyle}>
        <Box
          sx={{
            background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
            borderRadius: "16px 16px 0 0",
            p: { xs: "24px 20px 20px", sm: "28px 32px 24px" },
            position: "relative",
          }}
        >
          <IconButton
            onClick={handleClose}
            disabled={loading}
            size="small"
            sx={{
              position: "absolute",
              top: 12,
              right: 12,
              color: "rgba(255,255,255,0.6)",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
            }}
          >
            <Close fontSize="small" />
          </IconButton>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.75 }}>
            <Download sx={{ color: "#c9a96e", fontSize: 22 }} />
            <p
              id="brochure-modal-title"
              style={{
                margin: 0,
                fontSize: "18px",
                fontWeight: 700,
                color: "#fff",
                letterSpacing: "-0.02em",
              }}
            >
              Download Brochure
            </p>
          </Box>
          <p
            style={{
              margin: 0,
              fontSize: "13px",
              color: "rgba(255,255,255,0.55)",
              lineHeight: 1.5,
            }}
          >
            Fill in your details to receive our exclusive brochure.
          </p>
        </Box>

        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          sx={{ p: { xs: "24px 20px", sm: "28px 32px" } }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
              gap: 2,
              mb: 2,
            }}
          >
            <TextField
              label="First Name"
              fullWidth
              size="small"
              autoComplete="given-name"
              sx={fieldSx}
              error={!!errors.firstName}
              helperText={errors.firstName?.message}
              {...register("firstName", {
                required: "First name is required",
                minLength: { value: 2, message: "Minimum 2 characters" },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Only letters allowed",
                },
              })}
            />
            <TextField
              label="Last Name"
              fullWidth
              size="small"
              autoComplete="family-name"
              sx={fieldSx}
              error={!!errors.lastName}
              helperText={errors.lastName?.message}
              {...register("lastName", {
                required: "Last name is required",
                minLength: { value: 2, message: "Minimum 2 characters" },
                pattern: {
                  value: /^[a-zA-Z\s]+$/,
                  message: "Only letters allowed",
                },
              })}
            />
          </Box>

          <TextField
            label="Mobile Number"
            fullWidth
            size="small"
            inputMode="numeric"
            autoComplete="tel"
            sx={{ ...fieldSx, mb: 2 }}
            error={!!errors.mobile}
            helperText={errors.mobile?.message}
            {...register("mobile", {
              required: "Mobile number is required",
              pattern: {
                value: /^[6-9]\d{9}$/,
                message: "Enter a valid 10-digit Indian mobile number",
              },
            })}
          />

          <TextField
            label="Email Address"
            fullWidth
            size="small"
            type="email"
            autoComplete="email"
            sx={{ ...fieldSx, mb: 3 }}
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Enter a valid email address",
              },
            })}
          />

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 24px",
              borderRadius: "10px",
              border: "none",
              background: loading ? "#888" : "linear-gradient(135deg, #c9a96e 0%, #b8864e 100%)",
              color: "#fff",
              fontSize: "14px",
              fontWeight: 600,
              letterSpacing: "0.02em",
              cursor: loading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "opacity 0.2s",
            }}
          >
            {loading ? (
              <>
                <CircularProgress size={16} sx={{ color: "#fff" }} />
                Submitting…
              </>
            ) : (
              <>
                <Download sx={{ fontSize: 18 }} />
                Download Brochure
              </>
            )}
          </button>
        </Box>
      </Box>
    </Modal>
  );
}

export function Footer() {
  const [brochureOpen, setBrochureOpen] = useState(false);

  return (
    <>
      <footer className="bg-primary text-primary-foreground pt-24 pb-12">
        <div className="mx-auto max-w-screen-2xl px-4 lg:px-12 2xl:px-0">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-12 lg:gap-16 items-start">
            <div className="md:col-span-7">
              <h3 className="font-serif text-4xl mb-6">Shika Arts</h3>
              <p className="text-sm opacity-60 leading-relaxed max-w-sm mb-8">
                A premium gifting atelier crafting heartfelt, handcrafted experiences for every
                occasion. Our mission is to elevate the art of giving through artisanal excellence.
              </p>

              <button
                onClick={() => setBrochureOpen(true)}
                className="inline-flex items-center cursor-pointer gap-2 mb-10 px-5 py-2.5 rounded-full border border-accent text-accent text-xs font-semibold uppercase tracking-widest hover:bg-accent hover:text-primary transition-all duration-300"
              >
                <Download sx={{ fontSize: 15 }} />
                Download Brochure
              </button>

              <div className="flex gap-5">
                <a
                  href="https://www.instagram.com/shikaarts_/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
                >
                  <Instagram size={16} strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.facebook.com/profile.php?id=100063892390349"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
                >
                  <Facebook size={16} strokeWidth={1.5} />
                </a>
                <a
                  href="https://www.linkedin.com/company/shika-arts/?viewAsMember=true"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="h-8 w-8 flex items-center justify-center rounded-full border border-white/10 hover:border-accent hover:text-accent transition-all duration-500"
                >
                  <LinkedIn size={16} strokeWidth={1.5} />
                </a>
              </div>
            </div>

            <div className="md:col-span-5">
              <h4 className="text-[11px] uppercase tracking-ultra text-accent font-semibold mb-8">
                Contact
              </h4>
              <ul className="space-y-5">
                <li>
                  <a
                    href="tel:+919370440001"
                    className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 hover:text-accent transition-all"
                  >
                    <Phone size={13} strokeWidth={1.5} className="shrink-0" />
                    +91 93704 40001
                  </a>
                </li>
                <li>
                  <a
                    href="tel:+918698474999"
                    className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 hover:text-accent transition-all"
                  >
                    <Phone size={13} strokeWidth={1.5} className="shrink-0" />
                    +91 86984 74999
                  </a>
                </li>
                <li>
                  <a
                    href="mailto:info@shikaarts.com"
                    className="flex items-center gap-3 text-xs opacity-70 hover:opacity-100 hover:text-accent transition-all"
                  >
                    <Mail size={13} strokeWidth={1.5} className="shrink-0" />
                    info@shikaarts.com
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-24 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] uppercase tracking-ultra opacity-40 text-center">
              © {new Date().getFullYear()} Shika Arts — All rights reserved.
            </p>
            <div className="flex gap-8">
              <Link
                to="/privacy"
                className="text-[9px] uppercase tracking-ultra opacity-40 hover:opacity-100 transition-opacity"
              >
                Privacy
              </Link>
              <Link
                to="/terms"
                className="text-[9px] uppercase tracking-ultra opacity-40 hover:opacity-100 transition-opacity"
              >
                Terms
              </Link>
            </div>
          </div>
        </div>
      </footer>

      <BrochureModal open={brochureOpen} onClose={() => setBrochureOpen(false)} />
    </>
  );
}
