import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { toast } from "sonner";
import { storefrontApiRequest } from "@/lib/shopify";

const CART_QUERY = `query cart($id: ID!) { cart(id: $id) { id totalQuantity } }`;
const CART_CREATE_MUTATION = `
  mutation cartCreate($input: CartInput!) {
    cartCreate(input: $input) {
      cart { id checkoutUrl lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } }
      userErrors { field message }
    }
  }`;
const CART_LINES_ADD_MUTATION = `
  mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
    cartLinesAdd(cartId: $cartId, lines: $lines) {
      cart { id lines(first: 100) { edges { node { id merchandise { ... on ProductVariant { id } } } } } }
      userErrors { field message }
    }
  }`;
const CART_LINES_UPDATE_MUTATION = `
  mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
    cartLinesUpdate(cartId: $cartId, lines: $lines) { cart { id } userErrors { field message } }
  }`;
const CART_LINES_REMOVE_MUTATION = `
  mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
    cartLinesRemove(cartId: $cartId, lineIds: $lineIds) { cart { id } userErrors { field message } }
  }`;
function formatCheckoutUrl(checkoutUrl) {
  try {
    const url = new URL(checkoutUrl);
    url.searchParams.set("channel", "online_store");
    return url.toString();
  } catch {
    return checkoutUrl;
  }
}
function isCartNotFoundError(userErrors) {
  return userErrors.some(e => e.message.toLowerCase().includes("cart not found") || e.message.toLowerCase().includes("does not exist"));
}
async function createShopifyCart(item) {
  const data = await storefrontApiRequest(CART_CREATE_MUTATION, {
    input: {
      lines: [{
        quantity: item.quantity,
        merchandiseId: item.variantId
      }]
    }
  });
  if (data?.data?.cartCreate?.userErrors?.length > 0) return null;
  const cart = data?.data?.cartCreate?.cart;
  if (!cart?.checkoutUrl) return null;
  const lineId = cart.lines.edges[0]?.node?.id;
  if (!lineId) return null;
  return {
    cartId: cart.id,
    checkoutUrl: formatCheckoutUrl(cart.checkoutUrl),
    lineId
  };
}
async function addLineToShopifyCart(cartId, item) {
  const data = await storefrontApiRequest(CART_LINES_ADD_MUTATION, {
    cartId,
    lines: [{
      quantity: item.quantity,
      merchandiseId: item.variantId
    }]
  });
  const userErrors = data?.data?.cartLinesAdd?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return {
    success: false,
    cartNotFound: true
  };
  if (userErrors.length > 0) return {
    success: false
  };
  const lines = data?.data?.cartLinesAdd?.cart?.lines?.edges || [];
  const newLine = lines.find(l => l.node.merchandise.id === item.variantId);
  return {
    success: true,
    lineId: newLine?.node?.id
  };
}
async function updateShopifyCartLine(cartId, lineId, quantity) {
  const data = await storefrontApiRequest(CART_LINES_UPDATE_MUTATION, {
    cartId,
    lines: [{
      id: lineId,
      quantity
    }]
  });
  const userErrors = data?.data?.cartLinesUpdate?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return {
    success: false,
    cartNotFound: true
  };
  if (userErrors.length > 0) return {
    success: false
  };
  return {
    success: true
  };
}
async function removeLineFromShopifyCart(cartId, lineId) {
  const data = await storefrontApiRequest(CART_LINES_REMOVE_MUTATION, {
    cartId,
    lineIds: [lineId]
  });
  const userErrors = data?.data?.cartLinesRemove?.userErrors || [];
  if (isCartNotFoundError(userErrors)) return {
    success: false,
    cartNotFound: true
  };
  if (userErrors.length > 0) return {
    success: false
  };
  return {
    success: true
  };
}
export const useCartStore = create()(persist((set, get) => ({
  items: [],
  cartId: null,
  checkoutUrl: null,
  isLoading: false,
  isSyncing: false,
  isOpen: false,
  setOpen: v => set({
    isOpen: v
  }),
  addItem: async item => {
    const {
      items,
      cartId,
      clearCart
    } = get();
    const existingItem = items.find(i => i.variantId === item.variantId);
    set({
      isLoading: true
    });
    try {
      if (!cartId) {
        const result = await createShopifyCart({
          ...item,
          lineId: null
        });
        if (result) {
          set({
            cartId: result.cartId,
            checkoutUrl: result.checkoutUrl,
            items: [{
              ...item,
              lineId: result.lineId
            }]
          });
          toast.success("Added to cart", { description: item.product.node.title });
        } else {
          toast.error("Failed to create cart", { description: "Shopify API error. Please try again." });
        }
      } else if (existingItem) {
        const newQuantity = existingItem.quantity + item.quantity;
        if (!existingItem.lineId) {
          toast.error("Item sync error", { description: "Please refresh and try again." });
          return;
        }
        const result = await updateShopifyCartLine(cartId, existingItem.lineId, newQuantity);
        if (result.success) {
          const currentItems = get().items;
          set({
            items: currentItems.map(i => i.variantId === item.variantId ? {
              ...i,
              quantity: newQuantity
            } : i)
          });
          toast.success("Updated cart", { description: item.product.node.title });
        } else if (result.cartNotFound) {
          clearCart();
          toast.error("Cart expired", { description: "Refreshing your cart..." });
        } else {
          toast.error("Failed to update cart");
        }
      } else {
        const result = await addLineToShopifyCart(cartId, {
          ...item,
          lineId: null
        });
        if (result.success) {
          const currentItems = get().items;
          set({
            items: [...currentItems, {
              ...item,
              lineId: result.lineId ?? null
            }]
          });
          toast.success("Added to cart", { description: item.product.node.title });
        } else if (result.cartNotFound) {
          clearCart();
          toast.error("Cart expired", { description: "Refreshing your cart..." });
        } else {
          toast.error("Failed to add to cart");
        }
      }
    } catch (e) {
      console.error("Failed to add item:", e);
      toast.error("Connection error", { description: "Could not reach Shopify." });
    } finally {
      set({
        isLoading: false
      });
    }
  },
  updateQuantity: async (variantId, quantity) => {
    if (quantity <= 0) {
      await get().removeItem(variantId);
      return;
    }
    const {
      items,
      cartId,
      clearCart
    } = get();
    const item = items.find(i => i.variantId === variantId);
    if (!item?.lineId || !cartId) return;
    set({
      isLoading: true
    });
    try {
      const result = await updateShopifyCartLine(cartId, item.lineId, quantity);
      if (result.success) {
        const currentItems = get().items;
        set({
          items: currentItems.map(i => i.variantId === variantId ? {
            ...i,
            quantity
          } : i)
        });
      } else if (result.cartNotFound) {
        clearCart();
      }
    } finally {
      set({
        isLoading: false
      });
    }
  },
  removeItem: async variantId => {
    const {
      items,
      cartId,
      clearCart
    } = get();
    const item = items.find(i => i.variantId === variantId);
    if (!item?.lineId || !cartId) return;
    set({
      isLoading: true
    });
    try {
      const result = await removeLineFromShopifyCart(cartId, item.lineId);
      if (result.success) {
        const currentItems = get().items;
        const newItems = currentItems.filter(i => i.variantId !== variantId);
        newItems.length === 0 ? clearCart() : set({
          items: newItems
        });
      } else if (result.cartNotFound) {
        clearCart();
      }
    } finally {
      set({
        isLoading: false
      });
    }
  },
  clearCart: () => set({
    items: [],
    cartId: null,
    checkoutUrl: null
  }),
  getCheckoutUrl: () => get().checkoutUrl,
  syncCart: async () => {
    const {
      cartId,
      isSyncing,
      isLoading,
      clearCart
    } = get();
    // Skip sync if cart ID is missing, already syncing, or an addItem is in-flight
    if (!cartId || isSyncing || isLoading) return;
    set({
      isSyncing: true
    });
    try {
      const data = await storefrontApiRequest(CART_QUERY, {
        id: cartId
      });
      if (!data) return;
      const cart = data?.data?.cart;
      // Only clear if the cart truly doesn't exist on Shopify (expired/deleted)
      // Do NOT clear on totalQuantity === 0 — that can be a race condition
      if (!cart) clearCart();
    } finally {
      set({
        isSyncing: false
      });
    }
  }
}), {
  name: "shika-cart",
  storage: createJSONStorage(() => localStorage),
  partialize: state => ({
    items: state.items,
    cartId: state.cartId,
    checkoutUrl: state.checkoutUrl
  })
}));