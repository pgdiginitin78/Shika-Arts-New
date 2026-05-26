import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useCustomerAuthStore = create()(
  persist(
    (set) => ({
      token: null,
      customer: null,
      login: (token, customer) => set({ token, customer }),
      logout: () => set({ token: null, customer: null }),
      setCustomer: (customer) => set({ customer }),
    }),
    {
      name: "shika-customer-auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
