import Link from "next/link";
import { ShieldCheck, Truck, CreditCard, RefreshCw } from "lucide-react";

const StoreFooter = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-4 pb-8 border-b border-slate-800/80">
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-lg font-black text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold text-xs">
                S
              </span>
              <span>ClothingStore</span>
            </Link>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed">
              Curated clothing and modern apparel drops. Delivering quality fashion across Saudi Arabia and GCC.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Departments</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/products" className="hover:text-sky-400 transition">
                  All Clothing Catalog
                </Link>
              </li>
              <li>
                <Link href="/products?featured=true" className="hover:text-sky-400 transition">
                  Featured Deals & Drops
                </Link>
              </li>
              <li>
                <Link href="/cart" className="hover:text-sky-400 transition">
                  Shopping Cart
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Customer Service</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/account/orders" className="hover:text-sky-400 transition">
                  Track Your Orders
                </Link>
              </li>
              <li>
                <Link href="/account" className="hover:text-sky-400 transition">
                  Account Details
                </Link>
              </li>
              <li>
                <span className="text-slate-400">Easy 30-Day Returns</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Accepted Payments</h4>
            <p className="mt-3 text-xs text-slate-400 mb-3">
              We accept Cash on Delivery & Credit/Debit Cards.
            </p>
            <div className="flex flex-wrap gap-2 text-[10px] font-bold text-slate-300">
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-1">VISA</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-1">Mastercard</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-1">COD</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-1">Apple Pay</span>
            </div>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} ClothingStore Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-xs">
            <span className="hover:text-slate-300 cursor-pointer">Privacy Notice</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Terms of Use</span>
            <span>•</span>
            <span className="hover:text-slate-300 cursor-pointer">Help & FAQs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
