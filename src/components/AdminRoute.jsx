import { Navigate } from "react-router-dom";
import { useCustomerAuthStore } from "@/stores/customerAuthStore";

export function AdminRoute({ children }) {
  const token = useCustomerAuthStore((s) => s.token);
  
  let isAdmin = false;
  if (token) {
    try {
      const customerData = JSON.parse(localStorage.getItem("user") || "{}");
      const roles = customerData?.account?.roles || customerData?.roles || [];
      const role = customerData?.account?.role || customerData?.role || "";

      console.log("rolesAre",roles,role)
      
      if (roles.includes("administrator") || role === "administrator") {
        isAdmin = true;
      }
    } catch (e) {
      console.error("Failed to parse customer data", e);
    }
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
