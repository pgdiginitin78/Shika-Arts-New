import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { getWishlistItems } from "@/services/orderService";

const getProductKey = (product) => {
  const id = product?.id ?? product?.product_id ?? product?.productId ?? null;
  const variationId = product?.variation_id ?? product?.variationId ?? 0;
  return id != null ? `${id}_${variationId}` : null;
};

const getProductTitle = (product) => product?.name || "";

export const useWishlistStore = create()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      isLoading: false,

      setOpen: (v) => set({ isOpen: v }),

      toggleItem: (product) => {
        const { items } = get();
        const productKey = getProductKey(product);
        const exists = items.find((i) => getProductKey(i) === productKey);

        if (exists) {
          set({ items: items.filter((i) => getProductKey(i) !== productKey) });
          toast.success("Removed from wishlist", { description: getProductTitle(product) });
        } else {
          set({ items: [...items, product] });
          toast.success("Added to wishlist", { description: getProductTitle(product) });
        }
      },

      removeItem: (productKey) => {
        const { items } = get();
        const product = items.find((i) => getProductKey(i) === productKey);
        set({ items: items.filter((i) => getProductKey(i) !== productKey) });
        if (product) {
          toast.success("Removed from wishlist", { description: getProductTitle(product) });
        }
      },

      removeItemOptimistic: (productKey) => {
        const { items } = get();
        set({ items: items.filter((i) => getProductKey(i) !== productKey) });
      },

      isInWishlist: (productId, variationId = 0) => {
        const key = `${productId}_${variationId}`;
        return get().items.some((i) => getProductKey(i) === key);
      },

      clearWishlist: () => set({ items: [] }),

      fetchWishlist: async () => {
        set({ isLoading: true });
        try {
          const data = await getWishlistItems();
          set({ items: Array.isArray(data?.items) ? data.items : [] });
        } catch (error) {
          console.error("Failed to fetch wishlist:", error);
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: "shika-wishlist",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export { getProductKey };