import { createContext, useContext, useLayoutEffect, useState } from "react";
import { getCategories } from "../services/LoginServices";
import { Loader2 } from "lucide-react";

const NavbarContext = createContext([]);

export function NavbarProvider({ children }) {
  const [navbarMenus, setNavbarMenus] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useLayoutEffect(() => {
    getCategories()
      .then((res) => {
        const filteredCategories = res.filter((category) => category.slug !== "uncategorized");
        
        const desiredOrder = [
          "corporate", 
          "occasions", 
          "wedding", 
          "customizedgifts", 
          "customization", 
          "packaging-studio",
          "packagingstudio",
          "delicacies",
          "premium-gifts",
          "earth-worth"
        ];

        filteredCategories.sort((a, b) => {
          const indexA = desiredOrder.indexOf(a.slug.toLowerCase());
          const indexB = desiredOrder.indexOf(b.slug.toLowerCase());
          
          if (indexA === -1 && indexB === -1) return 0;
          if (indexA === -1) return 1;
          if (indexB === -1) return -1;
          return indexA - indexB;
        });

        setNavbarMenus(filteredCategories);
      })
      .catch((err) => {
        console.error("Failed to load navbar categories:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <NavbarContext.Provider value={navbarMenus}>
      {isLoading && (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAF7F2]/60 backdrop-blur-md">
          <Loader2 className="h-12 w-12 animate-spin text-destructive" />
          <p className="mt-4 text-sm uppercase tracking-widest text-destructive font-semibold">Loading...</p>
        </div>
      )}
      {children}
    </NavbarContext.Provider>
  );
}

export const useNavbarMenus = () => useContext(NavbarContext);
