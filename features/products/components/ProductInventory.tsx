"use client";

interface ProductInventoryProps {
  stock: number;
  lowStockThreshold: number;

  onStockChange: (value: number) => void;
  onLowStockThresholdChange: (
    value: number
  ) => void;
}

const ProductInventory = ({
  stock,
  lowStockThreshold,
  onStockChange,
  onLowStockThresholdChange,
}: ProductInventoryProps) => {
  const stockStatus =
    stock <= 0
      ? {
          label: "Out of Stock",
          className:
            "bg-red-100 text-red-700",
        }
      : stock <= lowStockThreshold
      ? {
          label: "Low Stock",
          className:
            "bg-yellow-100 text-yellow-700",
        }
      : {
          label: "In Stock",
          className:
            "bg-green-100 text-green-700",
        };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm">

      <div className="mb-6">
        <h2 className="text-xl font-semibold">
          Inventory
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage product inventory and stock alerts.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        <div>
          <label className="mb-2 block font-medium">
            Available Stock
          </label>

          <input
            type="number"
            min={0}
            value={stock}
            onChange={(e) =>
              onStockChange(
                Number(e.target.value)
              )
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

        <div>
          <label className="mb-2 block font-medium">
            Low Stock Alert
          </label>

          <input
            type="number"
            min={0}
            value={lowStockThreshold}
            onChange={(e) =>
              onLowStockThresholdChange(
                Number(e.target.value)
              )
            }
            className="w-full rounded-lg border p-3"
          />
        </div>

      </div>

      <div className="mt-8 rounded-lg border bg-slate-50 p-5">

        <div className="flex items-center justify-between">

          <span className="font-medium">
            Current Stock Status
          </span>

          <span
            className={`rounded-full px-4 py-1 text-sm font-medium ${stockStatus.className}`}
          >
            {stockStatus.label}
          </span>

        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">

            <h4 className="text-sm text-slate-500">
              Available
            </h4>

            <p className="mt-2 text-2xl font-bold">
              {stock}
            </p>

          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">

            <h4 className="text-sm text-slate-500">
              Alert At
            </h4>

            <p className="mt-2 text-2xl font-bold">
              {lowStockThreshold}
            </p>

          </div>

          <div className="rounded-lg bg-white p-4 text-center shadow-sm">

            <h4 className="text-sm text-slate-500">
              Remaining
            </h4>

            <p className="mt-2 text-2xl font-bold">
              {stock}
            </p>

          </div>

        </div>

      </div>

    </div>
  );
};

export default ProductInventory;