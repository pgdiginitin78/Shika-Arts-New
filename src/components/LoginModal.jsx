import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, EyeOff, X } from "lucide-react";
import { loginCustomer, getCustomerProfile } from "@/lib/shopify";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";

export function LoginModal({ isOpen, onClose }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const login = useCustomerAuthStore((s) => s.login);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await loginCustomer(email, password);
      if (result?.customerUserErrors?.length > 0) {
        setError(result.customerUserErrors[0].message || "Invalid email or password.");
        return;
      }
      const { accessToken } = result.customerAccessToken;
      const customer = await getCustomerProfile(accessToken);
      login(accessToken, customer);
      onClose();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9998] bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, y: -12, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.97 }}
            transition={{ duration: 0.2 }}
            className="fixed top-[70px] right-4 z-[9999] w-[300px] bg-white border border-border shadow-2xl p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-serif font-semibold text-foreground">Sign In</h2>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Email
                </label>
                <input
                  data-testid="login-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                  className="w-full border border-border px-3 py-2.5 text-sm outline-none focus:border-destructive transition-colors bg-transparent"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest font-semibold text-muted-foreground">
                  Password
                </label>
                <div className="relative">
                  <input
                    data-testid="login-password-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className="w-full border border-border px-3 py-2.5 text-sm outline-none focus:border-destructive transition-colors pr-10 bg-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              {error && (
                <p data-testid="login-error" className="text-[12px] text-destructive">
                  {error}
                </p>
              )}

              <button
                data-testid="login-submit-button"
                type="submit"
                disabled={loading}
                className="w-full bg-[#7A1F3D] text-white py-2.5 text-[11px] uppercase tracking-[0.2em] font-semibold hover:bg-[#6a1b35] transition-colors disabled:opacity-60 cursor-pointer"
              >
                {loading ? "Signing In..." : "Sign In"}
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
