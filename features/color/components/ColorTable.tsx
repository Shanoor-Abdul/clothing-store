"use client";

import { Pencil, Trash2 } from "lucide-react";

import { Color } from "../types/color";

interface ColorTableProps {
  colors: Color[];
  onEdit: (color: Color) => void;
  onDelete: (color: Color) => void;
}

const ColorTable = ({
  colors,
  onEdit,
  onDelete,
}: ColorTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Swatch</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Hex</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {colors.length === 0 ? (
            <tr>
              <td
                colSpan={5}
                className="px-4 py-8 text-center text-slate-500"
              >
                No colors found.
              </td>
            </tr>
          ) : (
            colors.map((color) => (
              <tr key={color.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <span
                    className="inline-block h-6 w-6 rounded-full border"
                    style={{ backgroundColor: color.hexCode }}
                  />
                </td>
                <td className="px-4 py-3 font-medium">
                  {color.name}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {color.hexCode}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      color.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {color.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(color)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(color)}
                      className="rounded p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ColorTable;
