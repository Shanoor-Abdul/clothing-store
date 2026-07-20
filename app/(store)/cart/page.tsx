"use client";

import Link from "next/link";
import Image from "next/image";
import { Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/features/cart/hooks";
import { formatCurrency } from "@/utils";

const CartPage = () => {
  const { items, setQuantity, remove, subtotal, totalItems } =
    useCart();

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <h1 className="text-2xl font-bold">Your Cart is Empty</h1>
        <p className="mt-2 text-slate-500">
          Add some products to get started.
        </p>
        <Link
          href="/products"
          className="mt-6 inline-block rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">
        Shopping Cart ({totalItems})
      </h1>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {items.map((item) => {
            const key = item.variantId ?? item.productId;
            return (
              <div
                key={key}
                className="flex gap-4 rounded-xl border bg-white p-4"
              >
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={100}
                    height={100}
                    className="h-24 w-24 rounded-lg object-cover"
                  />
                )}

                <div className="flex flex-1 flex-col">
                  <Link
                    href={`/products/${item.slug}`}
                    className="font-medium hover:text-blue-600"
                  >
                    {item.name}
                  </Link>
                  {(item.color || item.size) && (
                    <p className="text-sm text-slate-500">
                      {item.color}
                      {item.size ? ` / ${item.size}` : ""}
                    </p>
                  )}
                  <p className="font-semibold">
                    {formatCurrency(item.sellingPrice)}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div className="flex items-center rounded-lg border">
                      <button
                        onClick={() =>
                          setQuantity(
                            key,
                            Math.max(1, item.quantity - 1)
                          )
                        }
                        className="p-2"
                        aria-label="Decrease"
                      >
                        <Minus size={16} />
                      </button>
                      <span className="w-10 text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          setQuantity(
                            key,
                            Math.min(item.stock, item.quantity + 1)
                          )
                        }
                        className="p-2"
                        aria-label="Increase"
                      >
                        <Plus size={16} />
                      </button>
                    </div>

                    <button
                      onClick={() => remove(key)}
                      className="text-red-500 hover:text-red-700"
                      aria-label="Remove"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="font-semibold">
                  {formatCurrency(
                    item.sellingPrice * item.quantity
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="h-fit rounded-xl border bg-white p-6">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-4 flex justify-between text-slate-600">
            <span>Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="mt-2 flex justify-between text-slate-600">
            <span>Shipping</span>
            <span>Calculated at checkout</span>
          </div>
          <div className="mt-4 flex justify-between border-t pt-4 text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>

          <Link
            href="/checkout"
            className="mt-6 block rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700"
          >
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
