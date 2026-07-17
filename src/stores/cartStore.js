import { create } from "zustand";
import { toast } from "sonner";
import {
  addToCart,
  getCart,
  getProductBySlug,
  removeCartItem,
  searchProducts,
  updateCartItem,
} from "../services/LoginServices";
import { productToNode } from "@/lib/woocommerce";

const toNumber = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getTitle = (item) =>
  item?.product?.node?.title ||
  item?.product?.title ||
  item?.product?.name ||
  item?.title ||
  item?.name ||
  "";

const isUserLoggedIn = () => {
  return !!localStorage.getItem("token");
};

const resolveWooProductId = async (item) => {
  const directId = toNumber(item?.productId ?? item?.product?.id ?? item?.id);
  if (directId > 0) return directId;

  const node = productToNode(item?.product || item);
  const handle =
    item?.handle || item?.slug || node?.handle || item?.product?.handle || item?.product?.slug;

  if (handle) {
    const product = await getProductBySlug(handle);
    const productId = toNumber(product?.id);
    if (productId > 0) return productId;
  }

  const title = getTitle(item) || node?.title || "";

  if (title) {
    const results = await searchProducts(title);

    const exact =
      results?.find((p) => p?.slug === handle || p?.name?.toLowerCase() === title.toLowerCase()) ||
      results?.[0];

    const productId = toNumber(exact?.id);

    if (productId > 0) return productId;
  }

  return null;
};

export const useCartStore = create((set, get) => ({
  items: [],
  isLoading: false,
  isSyncing: false,
  isOpen: false,

  setOpen: (v) => set({ isOpen: v }),

  syncCart: async () => {
    if (!isUserLoggedIn()) {
      set({ items: [] });
      return null;
    }

    set({ isSyncing: true });

    try {
      const data = await getCart();

      set({
        items: Array.isArray(data?.items) ? data.items : [],
      });

      return data;
    } catch (error) {
      console.log(error);
      return null;
    } finally {
      set({ isSyncing: false });
    }
  },

  addItem: async (item) => {
    if (!isUserLoggedIn()) {
      toast.error("Please login to add products to cart");
      return null;
    }

    set({ isLoading: true });

    try {
      const productId = await resolveWooProductId(item);

      if (!productId) {
        toast.error("Could not find the product in WooCommerce");
        return null;
      }

      const quantity = Math.max(1, toNumber(item?.quantity || 1));

      const variationAttributes = Array.isArray(item?.variationAttributes)
        ? item.variationAttributes
        : [];

      const data = await addToCart(productId, quantity, variationAttributes);

      if (Array.isArray(data?.items)) {
        set({ items: data.items });
      } else {
        await get().syncCart();
      }

      toast.success("Added to cart", {
        description: getTitle(item),
      });

      return data;
    } catch (error) {
      console.log(error);
      const errCode = error?.response?.data?.code;
      if (errCode === "woocommerce_rest_missing_attributes") {
        toast.error("This product has options", {
          description: "Redirecting to the product page so you can choose your options...",
        });
      } else {
        toast.error("Could not add to cart. Please try again.");
      }
      return { error: errCode || "unknown_error" };
    } finally {
      set({ isLoading: false });
    }
  },

  updateQuantity: async (cartItemKey, quantity) => {
    if (!isUserLoggedIn()) {
      toast.error("Please login to update cart");
      return;
    }

    if (!cartItemKey) return;

    if (quantity <= 0) {
      await get().removeItem(cartItemKey);
      return;
    }

    set({ isLoading: true });

    try {
      const data = await updateCartItem(cartItemKey, quantity);

      if (Array.isArray(data?.items)) {
        set({ items: data.items });
      } else {
        await get().syncCart();
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not update cart item.");
    } finally {
      set({ isLoading: false });
    }
  },

  removeItem: async (cartItemKey) => {
    if (!isUserLoggedIn()) {
      toast.error("Please login to manage cart");
      return;
    }

    if (!cartItemKey) return;

    set({ isLoading: true });

    try {
      const data = await removeCartItem(cartItemKey);

      if (Array.isArray(data?.items)) {
        set({ items: data.items });
      } else {
        await get().syncCart();
      }
    } catch (error) {
      console.log(error);
      toast.error("Could not remove item from cart.");
    } finally {
      set({ isLoading: false });
    }
  },

  clearCart: async () => {
    if (!isUserLoggedIn()) {
      toast.error("Please login to manage cart");
      return;
    }

    const currentItems = get().items || [];

    if (!currentItems.length) return;

    set({ isLoading: true });

    try {
      for (const item of currentItems) {
        console.log("Removing:", item.key);

        const response = await removeCartItem(item.key);

        console.log(response);
      }

      await get().syncCart();
    } catch (err) {
      console.log(err.response?.data || err);
    } finally {
      set({ isLoading: false });
    }
  },

  resetCart: () => {
    set({ items: [] });
  },

  getCheckoutUrl: () => "https://api.shikaarts.com/checkout",
}));