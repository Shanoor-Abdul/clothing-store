"use client";

import { useAppDispatch, useAppSelector } from "@/store";
import {
  addToCart,
  clearCart,
  removeFromCart,
  updateQuantity,
} from "./slice";
import { CartItem } from "./slice";

export const useCart = () => {
  const items = useAppSelector((state) => state.cart.items);
  const dispatch = useAppDispatch();

  const add = (item: CartItem) => dispatch(addToCart(item));
  const remove = (key: string) =>
    dispatch(removeFromCart({ key }));
  const setQuantity = (key: string, quantity: number) =>
    dispatch(updateQuantity({ key, quantity }));
  const clear = () => dispatch(clearCart());

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce(
    (sum, i) => sum + i.sellingPrice * i.quantity,
    0
  );

  return {
    items,
    add,
    remove,
    setQuantity,
    clear,
    totalItems,
    subtotal,
  };
};
