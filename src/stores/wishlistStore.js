import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

const getProductId = (product) =>
  product?.node?.id || product?.id || product?.key || null;

const getProductTitle = (product) =>
  product?.node?.title || product?.title || product?.name || "";

export const useWishlistStore = create()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setOpen: (v) => set({ isOpen: v }),

      toggleItem: (product) => {
        const { items } = get();
        const productId = getProductId(product);
        const exists = items.find((i) => getProductId(i) === productId);

        if (exists) {
          set({
            items: items.filter((i) => getProductId(i) !== productId),
          });
          toast.success("Removed from wishlist", {
            description: getProductTitle(product),
          });
        } else {
          set({ items: [...items, product] });
          toast.success("Added to wishlist", {
            description: getProductTitle(product),
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        const product = items.find((i) => getProductId(i) === productId);

        set({
          items: items.filter((i) => getProductId(i) !== productId),
        });

        if (product) {
          toast.success("Removed from wishlist", {
            description: getProductTitle(product),
          });
        }
      },

      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((i) => getProductId(i) === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "shika-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);