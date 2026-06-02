import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCustomerAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      idToken: null,
      login: (token, customer, idToken = null) => set({ token, customer, idToken }),
      logout: () => set({ token: null, customer: null, idToken: null }),
      setCustomer: (customer) => set({ customer }),
    }),
    {
      name: "shika-customer-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
