import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "./components/ui/sonner";
import { WishlistDrawer } from "./components/WishlistDrawer";
import { NavbarProvider } from "./context/NavbarContext";
import { CartAnimationProvider } from "./context/CartAnimationContext";
import { useCartSync } from "./hooks/useCartSync";
import { useWishlistSync } from "./hooks/useWishlistSync";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { useState, useEffect, lazy, Suspense } from "react";
import Home from "./pages/Home";

// Route-level code-splitting for non-home pages
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const BrochureDownloads = lazy(() => import("./pages/BrochureDownloads"));
const EnquiriesAdminPage = lazy(() => import("./pages/EnquiriesAdminPage"));

const Category = lazy(() => import("./pages/Category"));
const CheckoutPage = lazy(() => import("./pages/CheckoutPage"));
const Corporate = lazy(() => import("./pages/Corporate"));
const CustomizedGifts = lazy(() => import("./pages/CustomizedGifts"));
const MyOrdersPage = lazy(() => import("./pages/MyOrdersPage"));
const Occasions = lazy(() => import("./pages/Occasions"));
const OrderSuccessPage = lazy(() => import("./pages/OrderSuccessPage"));
const PackagingStudio = lazy(() => import("./pages/PackagingStudio"));
const Product = lazy(() => import("./pages/ProductDetailPage"));
const Products = lazy(() => import("./pages/AllProducts"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const Wedding = lazy(() => import("./pages/Wedding"));
const EarthWorth = lazy(() => import("./pages/EarthWorth"));
const PremiumGifts = lazy(() => import("./pages/PremiumGifts"));
const GoogleAuthCallback = lazy(() => import("./pages/GoogleAuthCallback"));
const AboutUs = lazy(() => import("./pages/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/PrivacyPolicy"));
const TermsAndConditions = lazy(() => import("./pages/TermsAndConditions"));
const ShippingPolicy = lazy(() => import("./pages/ShippingPolicy"));
const Delicacies = lazy(() => import("./pages/Delicacies"));
import { ResetPasswordModal } from "./components/ResetPasswordModal";
import { startTokenAutoRefresh } from "./services/http-common";
const queryClient = new QueryClient();

function getResetParams() {
  const params = new URLSearchParams(window.location.search);
  const action = params.get("action");
  const key = params.get("key");
  const login = params.get("login");
  if (action === "rp" && key && login) {
    return { key, login };
  }
  return null;
}

function AppContent() {
  useCartSync();
  useWishlistSync();

  const { isSuperAdmin } = useAuth();

  const resetParams = getResetParams();
  const [resetModalOpen, setResetModalOpen] = useState(!!resetParams);

  useEffect(() => {
    startTokenAutoRefresh();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <CartAnimationProvider>
        <NavbarProvider>
          <BrowserRouter>
            <ScrollToTop />
            <Header />
            <main className="">
              <Suspense fallback={<div className="min-h-[60vh]" />}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/category/Occasions" element={<Occasions />} />
                  <Route path="/category/Corporate" element={<Corporate />} />
                  <Route path="/category/Wedding" element={<Wedding />} />
                  <Route path="/category/premium-gifts" element={<PremiumGifts />} />
                  <Route path="/category/customizedgifts" element={<CustomizedGifts />} />
                  <Route path="/category/customization" element={<CustomizedGifts />} />
                  <Route path="/category/packaging-studio" element={<PackagingStudio />} />
                  <Route path="/category/packagingstudio" element={<PackagingStudio />} />
                  <Route path="/category/earthworth" element={<EarthWorth />} />
                  <Route path="/category/:slug" element={<Category />} />
                  <Route path="/product/:handle" element={<Product />} />
                  <Route path="/products" element={<Products />} />
                  <Route path="/category/delicacies" element={<Delicacies />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
                  <Route path="/my-orders" element={<MyOrdersPage />} />
                  {isSuperAdmin && <Route path="/admin" element={<AdminDashboard />} />}
                  {isSuperAdmin && (
                    <Route path="/admin/brochure-downloads" element={<BrochureDownloads />} />
                  )}
                  {isSuperAdmin && (
                    <Route path="/admin/enquiries" element={<EnquiriesAdminPage />} />
                  )}
                  <Route path="/profilePage" element={<ProfilePage />} />
                  <Route path="/auth/callback" element={<GoogleAuthCallback />} />
                  <Route path="/about-us" element={<AboutUs />} />
                  <Route path="/privacy" element={<PrivacyPolicy />} />
                  <Route path="/terms" element={<TermsAndConditions />} />
                  <Route path="/shipping-policy" element={<ShippingPolicy />} />
                </Routes>
              </Suspense>
            </main>
            <Footer />
            <CartDrawer />
            <WishlistDrawer />
            <Toaster position="top-center" richColors />
            {resetParams && (
              <ResetPasswordModal
                isOpen={resetModalOpen}
                resetKey={resetParams.key}
                loginName={resetParams.login}
                onClose={() => setResetModalOpen(false)}
              />
            )}
          </BrowserRouter>
        </NavbarProvider>
      </CartAnimationProvider>
    </QueryClientProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
