import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { CartDrawer } from "./components/CartDrawer";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "./components/ui/sonner";
import { WishlistDrawer } from "./components/WishlistDrawer";
import { NavbarProvider } from "./context/NavbarContext";
import { useCartSync } from "./hooks/useCartSync";
import { useWishlistSync } from "./hooks/useWishlistSync";

import AdminDashboard from "./pages/AdminDashboard";
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
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import AboutUs from "./pages/AboutUs";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import TermsAndConditions from "./pages/TermsAndConditions";
import ShippingPolicy from "./pages/ShippingPolicy";
const queryClient = new QueryClient();

function App() {
  useCartSync();
  useWishlistSync();
  const customerData = JSON.parse(localStorage.getItem("user") || "{}");
  console.log("rolesAre", customerData);

  return (
    <QueryClientProvider client={queryClient}>
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
              <Route path="/category/customizedgifts" element={<CustomizedGifts />} />
              <Route path="/category/customization" element={<CustomizedGifts />} />
              <Route path="/category/packaging-studio" element={<PackagingStudio />} />
              <Route path="/category/packagingstudio" element={<PackagingStudio />} />
              <Route path="/category/earthworth" element={<EarthWorth />} />
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/product/:handle" element={<Product />} />
              <Route path="/products" element={<Products />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              {customerData?.role === "administrator" && (
                <Route path="/admin" element={<AdminDashboard />} />
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
          <Toaster position="top-center" />
        </BrowserRouter>
      </NavbarProvider>
    </QueryClientProvider>
  );
}

export default App;
