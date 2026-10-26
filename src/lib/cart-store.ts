"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  productId: string;
  slug: string;
  name: string;
  brand: string;
  presentation: string;
  price: number;
  packColor: string;
  categoryIcon?: string | null;
  imageUrl?: string | null;
  stock: number;
  quantity: number;
};

type CartState = {
  items: CartItem[];
  isOpen: boolean;
  add: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  setQuantity: (productId: string, quantity: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
  open: () => void;
  close: () => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId);
          if (existing) {
            return {
              isOpen: true,
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, item.stock) }
                  : i,
              ),
            };
          }
          return { isOpen: true, items: [...state.items, { ...item, quantity: Math.min(quantity, item.stock) }] };
        }),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.productId === productId ? { ...i, quantity: Math.max(1, Math.min(quantity, i.stock)) } : i,
          ),
        })),
      remove: (productId) => set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    { name: "tap-cart", partialize: (state) => ({ items: state.items }) },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.quantity, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.price * i.quantity, 0);
