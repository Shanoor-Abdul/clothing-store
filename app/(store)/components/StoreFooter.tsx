import Link from "next/link";

const StoreFooter = () => {
  return (
    <footer className="border-t bg-slate-900 text-slate-300">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 md:grid-cols-4">
        <div>
          <h3 className="text-lg font-bold text-white">
            ClothingStore
          </h3>
          <p className="mt-2 text-sm">
            Quality fashion for everyone. Explore the latest
            collections.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-white">Shop</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/products" className="hover:text-white">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products?featured=true" className="hover:text-white">
                Featured
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Account</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>
              <Link href="/login" className="hover:text-white">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/register" className="hover:text-white">
                Register
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-white">
                Cart
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white">Support</h4>
          <ul className="mt-2 space-y-1 text-sm">
            <li>Help Center</li>
            <li>Shipping & Returns</li>
            <li>Privacy Policy</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-slate-700 py-4 text-center text-sm">
        © {new Date().getFullYear()} ClothingStore. All rights
        reserved.
      </div>
    </footer>
  );
};

export default StoreFooter;
