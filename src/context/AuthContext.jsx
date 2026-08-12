import React, { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser } from "@/services/LoginServices";
import { useCartStore } from "@/stores/cartStore";
import { useWishlistStore } from "@/stores/wishlistStore";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [isRestoring, setIsRestoring] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const profile = await getCurrentUser(token);
          const customerData = profile.account || profile;
          setUser(customerData);
        } catch (error) {
          console.error("Failed to restore user session:", error);
          setUser(null);
          setToken(null);
        }
      }
      setIsRestoring(false);
    };

    initAuth();
  }, [token]);

  useEffect(() => {
    const handleStorage = () => {
      const currentToken = localStorage.getItem("token");
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [token]);

  const login = (newToken, userData) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem("token", newToken);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.clear();
    useCartStore.getState().resetCart();
    useWishlistStore.getState().clearWishlist();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isRestoring,
        isSuperAdmin:
          user?.is_super_admin === true ||
          (Array.isArray(user?.roles) && user.roles.includes("administrator")),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
