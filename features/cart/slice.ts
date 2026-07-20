import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface CartItem {
  productId: string;
  name: string;
  slug: string;
  image?: string | null;
  price: number;
  sellingPrice: number;
  quantity: number;
  stock: number;
  variantId?: string | null;
  color?: string | null;
  size?: string | null;
}

interface CartState {
  items: CartItem[];
}

const STORAGE_KEY = "cs_cart";

const loadCart = (): CartItem[] => {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(STORAGE_KEY);

    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
};

const saveCart = (items: CartItem[]) => {
  if (typeof window === "undefined") return;

  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
};

const initialState: CartState = {
  items: loadCart(),
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const item = action.payload;
      const key = item.variantId ?? item.productId;

      const existing = state.items.find(
        (i) => (i.variantId ?? i.productId) === key
      );

      if (existing) {
        existing.quantity = Math.min(
          existing.quantity + item.quantity,
          item.stock
        );
      } else {
        state.items.push(item);
      }

      saveCart(state.items);
    },
    removeFromCart: (
      state,
      action: PayloadAction<{ key: string }>
    ) => {
      state.items = state.items.filter(
        (i) => (i.variantId ?? i.productId) !== action.payload.key
      );

      saveCart(state.items);
    },
    updateQuantity: (
      state,
      action: PayloadAction<{ key: string; quantity: number }>
    ) => {
      const item = state.items.find(
        (i) => (i.variantId ?? i.productId) === action.payload.key
      );

      if (item) {
        item.quantity = Math.max(
          1,
          Math.min(action.payload.quantity, item.stock)
        );
      }

      saveCart(state.items);
    },
    clearCart: (state) => {
      state.items = [];

      saveCart(state.items);
    },
  },
});

export const { addToCart, removeFromCart, updateQuantity, clearCart } =
  cartSlice.actions;

export default cartSlice.reducer;
