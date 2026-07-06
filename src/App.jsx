import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { WishlistDrawer } from "./components/WishlistDrawer";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "./components/ui/sonner";
import { useCartSync } from "./hooks/useCartSync";
import { useWishlistSync } from "./hooks/useWishlistSync";
import { useSessionRestore } from "./hooks/useSessionRestore";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NavbarProvider } from "./context/NavbarContext";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Product from "./pages/ProductDetailPage";
import Products from "./pages/Products";
import Occasions from "./pages/Occasions";
import Corporate from "./pages/Corporate";
import Wedding from "./pages/Wedding";
import CustomizedGifts from "./pages/CustomizedGifts";
import PackagingStudio from "./pages/PackagingStudio";
import CheckoutPage from "./pages/CheckoutPage";
import OrderSuccessPage from "./pages/OrderSuccessPage";
import MyOrdersPage from "./pages/MyOrdersPage";
import AdminDashboard from "./pages/AdminDashboard";
import ProfilePage from "./pages/ProfilePage";

const queryClient = new QueryClient();

function App() {
  useCartSync();
  useWishlistSync();
  
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
              <Route path="/category/:slug" element={<Category />} />
              <Route path="/product/:handle" element={<Product />} />
              <Route path="/products" element={<Products />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-success/:orderId" element={<OrderSuccessPage />} />
              <Route path="/my-orders" element={<MyOrdersPage />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/profilePage" element={<ProfilePage />} />
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
