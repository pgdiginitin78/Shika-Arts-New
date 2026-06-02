import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";

export const useWishlistStore = create()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      setOpen: (v) => set({ isOpen: v }),
      
      toggleItem: (product) => {
        const { items } = get();
        const productId = product.node?.id || product.id;
        const exists = items.find((i) => (i.node?.id || i.id) === productId);

        if (exists) {
          set({
            items: items.filter((i) => (i.node?.id || i.id) !== productId),
          });
          toast.success("Removed from wishlist", {
            description: product.node?.title || product.title,
          });
        } else {
          set({ items: [...items, product] });
          toast.success("Added to wishlist", {
            description: product.node?.title || product.title,
          });
        }
      },

      removeItem: (productId) => {
        const { items } = get();
        const product = items.find((i) => (i.node?.id || i.id) === productId);
        set({
          items: items.filter((i) => (i.node?.id || i.id) !== productId),
        });
        if (product) {
          toast.success("Removed from wishlist", {
            description: product.node?.title || product.title,
          });
        }
      },

      isInWishlist: (productId) => {
        const { items } = get();
        return items.some((i) => (i.node?.id || i.id) === productId);
      },

      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: "shika-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
