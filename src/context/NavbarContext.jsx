import { createContext, useContext, useEffect, useLayoutEffect, useState } from "react";
import { getCategories } from "../services/LoginServices";

const NavbarContext = createContext([]);

export function NavbarProvider({ children }) {
  const [navbarMenus, setNavbarMenus] = useState([]);

  useLayoutEffect(() => {
    getCategories()
      .then((res) => {
        const filteredCategories = res.filter((category) => category.slug !== "uncategorized");
        
        const desiredOrder = [
          "occasions", 
          "corporate", 
          "wedding", 
          "customizedgifts", 
          "customization", 
          "packaging-studio",
          "packagingstudio"
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
      });
  }, []);

  return <NavbarContext.Provider value={navbarMenus}>{children}</NavbarContext.Provider>;
}

export const useNavbarMenus = () => useContext(NavbarContext);
