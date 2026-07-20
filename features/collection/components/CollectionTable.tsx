"use client";

import Image from "next/image";
import { Pencil, Trash2 } from "lucide-react";

import { Collection } from "../types/collection";

interface CollectionTableProps {
  collections: Collection[];
  onEdit: (collection: Collection) => void;
  onDelete: (collection: Collection) => void;
}

const CollectionTable = ({
  collections,
  onEdit,
  onDelete,
}: CollectionTableProps) => {
  return (
    <div className="overflow-x-auto rounded-xl border bg-white shadow-sm">
      <table className="w-full text-left text-sm">
        <thead className="border-b bg-slate-50 text-slate-600">
          <tr>
            <th className="px-4 py-3">Image</th>
            <th className="px-4 py-3">Name</th>
            <th className="px-4 py-3">Slug</th>
            <th className="px-4 py-3">Order</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {collections.length === 0 ? (
            <tr>
              <td
                colSpan={6}
                className="px-4 py-8 text-center text-slate-500"
              >
                No collections found.
              </td>
            </tr>
          ) : (
            collections.map((collection) => (
              <tr
                key={collection.id}
                className="border-b last:border-0"
              >
                <td className="px-4 py-3">
                  {collection.image ? (
                    <Image
                      src={collection.image}
                      alt={collection.name}
                      width={48}
                      height={48}
                      className="h-12 w-12 rounded object-cover"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded bg-slate-100" />
                  )}
                </td>
                <td className="px-4 py-3 font-medium">
                  {collection.name}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {collection.slug}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {collection.displayOrder}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-1 text-xs ${
                      collection.isActive
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    {collection.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => onEdit(collection)}
                      className="rounded p-2 text-blue-600 hover:bg-blue-50"
                    >
                      <Pencil size={16} />
                    </button>
                    <button
                      onClick={() => onDelete(collection)}
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

export default CollectionTable;
