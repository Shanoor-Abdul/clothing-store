import Link from "next/link";

const StoreFooter = () => {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {/* Compact grid — 2 cols on mobile, 4 on md */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pb-6 border-b border-slate-800/80">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="inline-flex items-center gap-2 text-base font-black text-white">
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-600 text-white font-extrabold text-xs flex-shrink-0">
                S
              </span>
              <span>ClothingStore</span>
            </Link>
            <p className="mt-2 text-xs text-slate-400 leading-relaxed max-w-xs">
              Curated fashion for Saudi Arabia & GCC.
            </p>
          </div>

          {/* Departments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Shop</h4>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li><Link href="/products" className="hover:text-sky-400 transition">All Products</Link></li>
              <li><Link href="/products?featured=true" className="hover:text-sky-400 transition">Featured Deals</Link></li>
              <li><Link href="/cart" className="hover:text-sky-400 transition">My Cart</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Support</h4>
            <ul className="mt-2 space-y-1.5 text-xs">
              <li><Link href="/account/orders" className="hover:text-sky-400 transition">Track Orders</Link></li>
              <li><Link href="/account" className="hover:text-sky-400 transition">My Account</Link></li>
              <li><span className="text-slate-500">30-Day Returns</span></li>
            </ul>
          </div>

          {/* Payments */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Payment</h4>
            <p className="mt-2 text-xs text-slate-500 mb-2">COD & Cards accepted.</p>
            <div className="flex flex-wrap gap-1.5 text-[10px] font-bold text-slate-300">
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">VISA</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">MC</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">COD</span>
              <span className="rounded bg-slate-900 border border-slate-800 px-2 py-0.5">Apple Pay</span>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-600">
          <p>© {new Date().getFullYear()} ClothingStore Inc.</p>
          <div className="flex items-center gap-3">
            <span className="hover:text-slate-400 cursor-pointer">Privacy</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">Terms</span>
            <span>•</span>
            <span className="hover:text-slate-400 cursor-pointer">FAQs</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default StoreFooter;
