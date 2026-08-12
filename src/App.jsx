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
import { useState, useEffect } from "react";
import { ResetPasswordModal } from "./components/ResetPasswordModal";

import AdminDashboard from "./pages/AdminDashboard";
import BrochureDownloads from "./pages/BrochureDownloads";
import EnquiriesAdminPage from "./pages/EnquiriesAdminPage";

import Category from "./pages/Category";
import CheckoutPage from "./pages/CheckoutPage";
import Corporate from "./pages/Corporate";
import CustomizedGifts from "./pages/CustomizedGifts";
import Home from "./pages/Home";
import MyOrdersPage from "./pages/MyOrdersPage";
import Occasions from "./pages/Occasions";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import PackagingStudio from "./pages/PackagingStudio";
import Product from "./pages/ProductDetailPage";
import Products from "./pages/Products";
import ProfilePage from "./pages/ProfilePage";
import Wedding from "./pages/Wedding";
import EarthWorth from "./pages/EarthWorth";
import PremiumGifts from "./pages/PremiumGifts";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ShippingPolicy from "./pages/ShippingPolicy";
import { startTokenAutoRefresh } from "./services/http-common";
import Delicacies from "./pages/Delicacies";
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
