import { createContext, useContext, useLayoutEffect, useRef, useState } from "react";
import { getCategories } from "../services/LoginServices";

const NavbarContext = createContext([]);

export function NavbarProvider({ children }) {
  const [navbarMenus, setNavbarMenus] = useState(() => {
    try {
      const cached = localStorage.getItem("shika_navbar_categories");
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const hasFetched = useRef(false);

  useLayoutEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    getCategories()
      .then((res) => {
        if (!Array.isArray(res)) return;
        const filteredCategories = res.filter(
          (category) =>
            category.slug !== "uncategorized" &&
            category.slug !== "packaging-studio" &&
            category.slug !== "packagingstudio",
        );

        const desiredOrder = [
          "corporate",
          "occasions",
          "wedding",
          "customizedgifts",
          "customization",
          "premium-gifts",
          "packaging-studio",
          "packagingstudio",
          "delicacies",
          "earth-worth",
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
        try {
          localStorage.setItem("shika_navbar_categories", JSON.stringify(filteredCategories));
        } catch {}
      })
      .catch((err) => {
        console.error("Failed to load navbar categories:", err);
      });
  }, []);

  return <NavbarContext.Provider value={navbarMenus}>{children}</NavbarContext.Provider>;
}

export const useNavbarMenus = () => useContext(NavbarContext);
