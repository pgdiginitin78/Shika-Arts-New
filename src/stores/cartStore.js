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

// ─── Helpers ────────────────────────────────────────────────────────────────

const CART_STORAGE_KEY = "shika_cart_items";

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

const isUserLoggedIn = () => !!localStorage.getItem("token");

/** Persist cart items to localStorage */
const saveCartToStorage = (items) => {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(Array.isArray(items) ? items : []));
  } catch (_) {}
};

/** Load cart items from localStorage */
const loadCartFromStorage = () => {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (_) {
    return [];
  }
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
      results?.find(
        (p) => p?.slug === handle || p?.name?.toLowerCase() === title.toLowerCase()
      ) || results?.[0];
    const productId = toNumber(exact?.id);
    if (productId > 0) return productId;
  }

  return null;
};

// ─── Store ───────────────────────────────────────────────────────────────────

export const useCartStore = create((set, get) => ({
  // Initialize from localStorage — cart survives page refresh
  items: loadCartFromStorage(),
  isLoading: false,
  isSyncing: false,
  isOpen: false,

  setOpen: (v) => set({ isOpen: v }),

  /** Sync cart from WC server (best-effort; localStorage is the fallback) */
  syncCart: async () => {
    const hasCartToken = !!localStorage.getItem("cart_token");
    const loggedIn = isUserLoggedIn();

    // Nothing to sync without a session
    if (!loggedIn && !hasCartToken) return null;

    set({ isSyncing: true });

    try {
      const data = await getCart();
      const serverItems = Array.isArray(data?.items) ? data.items : [];

      if (serverItems.length > 0) {
        // Server has items — trust server and update localStorage
        set({ items: serverItems });
        saveCartToStorage(serverItems);
      } else {
        // Server returned empty — keep whatever is in localStorage
        // This prevents a stale/new session from wiping the displayed cart
        const localItems = loadCartFromStorage();
        if (localItems.length > 0) {
          console.log("[Cart] Server returned empty but localStorage has items — keeping local state");
          set({ items: localItems });
        } else {
          set({ items: [] });
          saveCartToStorage([]);
        }
      }

      return data;
    } catch (error) {
      console.log("[Cart] syncCart error:", error);
      // On error, fall back to localStorage
      const localItems = loadCartFromStorage();
      set({ items: localItems });
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
        // Use server response directly — most accurate
        set({ items: data.items });
        saveCartToStorage(data.items);
      } else {
        // Optimistic update — add locally if server didn't return items array
        const current = get().items;
        const existingIndex = current.findIndex((i) => i.id === productId);
        let updated;
        if (existingIndex >= 0) {
          updated = current.map((i, idx) =>
            idx === existingIndex ? { ...i, quantity: i.quantity + quantity } : i
          );
        } else {
          updated = [
            ...current,
            {
              key: `local_${productId}_${Date.now()}`,
              id: productId,
              quantity,
              name: getTitle(item),
              prices: {},
              totals: {},
            },
          ];
        }
        set({ items: updated });
        saveCartToStorage(updated);
        // Then try to get accurate server state
        get().syncCart();
      }

      toast.success("Added to cart", {
        description: getTitle(item),
      });

      return data;
    } catch (error) {
      console.log("[Cart] addItem error:", error);
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

    // Optimistic update immediately
    const optimistic = get().items.map((i) =>
      i.key === cartItemKey ? { ...i, quantity } : i
    );
    set({ items: optimistic });
    saveCartToStorage(optimistic);

    set({ isLoading: true });

    try {
      const data = await updateCartItem(cartItemKey, quantity);

      if (Array.isArray(data?.items)) {
        set({ items: data.items });
        saveCartToStorage(data.items);
      }
    } catch (error) {
      console.log("[Cart] updateQuantity error:", error);
      toast.error("Could not update cart item.");
      // Revert on error
      await get().syncCart();
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

    // Optimistic remove immediately
    const optimistic = get().items.filter((i) => i.key !== cartItemKey);
    set({ items: optimistic });
    saveCartToStorage(optimistic);

    set({ isLoading: true });

    try {
      const data = await removeCartItem(cartItemKey);

      if (Array.isArray(data?.items)) {
        set({ items: data.items });
        saveCartToStorage(data.items);
      }
    } catch (error) {
      console.log("[Cart] removeItem error:", error);
      toast.error("Could not remove item from cart.");
      // Revert on error
      await get().syncCart();
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
        await removeCartItem(item.key);
      }

      set({ items: [] });
      saveCartToStorage([]);
    } catch (err) {
      console.log("[Cart] clearCart error:", err.response?.data || err);
    } finally {
      set({ isLoading: false });
    }
  },

  resetCart: () => {
    set({ items: [] });
    saveCartToStorage([]);
  },

  getCheckoutUrl: () => "https://api.shikaarts.com/checkout",
}));