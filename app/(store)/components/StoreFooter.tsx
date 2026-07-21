import Link from "next/link";

const StoreFooter = () => {
  return (
    <footer className="border-t border-slate-200/10 bg-slate-950 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-white">ClothingStore</h3>
          <p className="mt-2 max-w-xs text-sm text-slate-400">
            Quality fashion for everyone. Explore the latest collections with fast delivery and easy returns.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Shop</h4>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link href="/products" className="transition hover:text-white">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products?featured=true" className="transition hover:text-white">
                Featured
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Account</h4>
          <ul className="mt-2 space-y-2 text-sm">
            <li>
              <Link href="/login" className="transition hover:text-white">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/register" className="transition hover:text-white">
                Register
              </Link>
            </li>
            <li>
              <Link href="/cart" className="transition hover:text-white">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Support</h4>
          <ul className="mt-2 space-y-2 text-sm text-slate-400">
            <li className="transition hover:text-white">Help Center</li>
            <li className="transition hover:text-white">Shipping & Returns</li>
            <li className="transition hover:text-white">Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-800/70 py-4 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} ClothingStore. All rights reserved.
      </div>
    </footer>
  );
};

export default StoreFooter;
