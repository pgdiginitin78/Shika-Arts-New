import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCustomerAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      idToken: null,       // kept for backwards compat (OAuth flow)
      customer: null,
      isRestoring: true,   // true until session restore check is done
      login: (token, customer, idToken = null) =>
        set({ token, customer, idToken, isRestoring: false }),
      logout: () =>
        set({ token: null, idToken: null, customer: null, isRestoring: false }),
      setCustomer: (customer) => set({ customer }),
      setRestoring: (v) => set({ isRestoring: v }),
    }),
    {
      name: "shika-customer-auth",
      storage: createJSONStorage(() => localStorage),
      // Don't persist isRestoring
      partialize: (state) => ({
        token: state.token,
        idToken: state.idToken,
        customer: state.customer,
      }),
    }
  )
);
