import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { CartDrawer } from "./components/CartDrawer";
import { WishlistDrawer } from "./components/WishlistDrawer";
import ScrollToTop from "./components/ScrollToTop";
import { Toaster } from "./components/ui/sonner";
import { useCartSync } from "./hooks/useCartSync";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import Home from "./pages/Home";
import Category from "./pages/Category";
import Product from "./pages/Product";
import Products from "./pages/Products";

const queryClient = new QueryClient();

function App() {
  useCartSync();

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <Header />
        <main className="min-h-[60vh]">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/category/:slug" element={<Category />} />
            <Route path="/product/:handle" element={<Product />} />
            <Route path="/products" element={<Products />} />
          </Routes>
        </main>
        <Footer />
        <CartDrawer />
        <WishlistDrawer />
        <Toaster position="top-center" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
