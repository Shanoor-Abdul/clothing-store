"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trash2, Pencil, Plus } from "lucide-react";
import { toast } from "sonner";

import { useAppSelector } from "@/store";
import api from "@/lib/axios";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const fetchAddresses = async () => {
  const { data } = await api.get<ApiResponse<any[]>>("/addresses");
  return data.data;
};

interface AddressForm {
  fullName: string;
  phone: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

const emptyForm: AddressForm = {
  fullName: "",
  phone: "",
  street: "",
  city: "",
  state: "",
  postalCode: "",
  country: "Saudi Arabia",
};

const AddressesPage = () => {
  const router = useRouter();
  const isAuthenticated = useAppSelector(
    (state) => state.auth.isAuthenticated
  );
  const queryClient = useQueryClient();

  const [form, setForm] = useState<AddressForm>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) router.replace("/login");
  }, [isAuthenticated, router]);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    enabled: isAuthenticated,
  });

  const createMutation = useMutation({
    mutationFn: (payload: AddressForm) =>
      api.post("/addresses", payload),
    onSuccess: () => {
      toast.success("Address saved");
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () =>
      toast.error("Failed to save address"),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: AddressForm }) =>
      api.put(`/addresses/${id}`, payload),
    onSuccess: () => {
      toast.success("Address updated");
      setForm(emptyForm);
      setShowForm(false);
      setEditingId(null);
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Failed to update address"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => {
      toast.success("Address deleted");
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
    },
    onError: () => toast.error("Failed to delete address"),
  });

  const handleEdit = (addr: any) => {
    setEditingId(addr.id);
    setForm({
      fullName: addr.fullName,
      phone: addr.phone,
      street: addr.street,
      city: addr.city,
      state: addr.state ?? "",
      postalCode: addr.postalCode ?? "",
      country: addr.country,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  if (!isAuthenticated) return null;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Addresses</h1>
        <button
          onClick={() => {
            setForm(emptyForm);
            setEditingId(null);
            setShowForm(true);
          }}
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
        >
          <Plus size={16} /> Add Address
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-4 rounded-xl border bg-white p-6 shadow-sm"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Full Name"
              value={form.fullName}
              onChange={(e) =>
                setForm({ ...form, fullName: e.target.value })
              }
              className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
              className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              placeholder="Street"
              value={form.street}
              onChange={(e) =>
                setForm({ ...form, street: e.target.value })
              }
              className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500 sm:col-span-2"
            />
            <input
              placeholder="City"
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
              className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              placeholder="State"
              value={form.state}
              onChange={(e) =>
                setForm({ ...form, state: e.target.value })
              }
              className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              placeholder="Postal Code"
              value={form.postalCode}
              onChange={(e) =>
                setForm({ ...form, postalCode: e.target.value })
              }
              className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
            <input
              placeholder="Country"
              value={form.country}
              onChange={(e) =>
                setForm({ ...form, country: e.target.value })
              }
              className="rounded-lg border px-4 py-2.5 outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white hover:bg-blue-700 disabled:opacity-60"
            >
              {(createMutation.isPending ||
                updateMutation.isPending) && (
                <Loader2 className="animate-spin" size={16} />
              )}
              {editingId ? "Update" : "Save"}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
                setForm(emptyForm);
              }}
              className="rounded-lg border px-6 py-2.5 hover:bg-slate-50"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {isLoading ? (
        <div className="mt-8 flex justify-center">
          <Loader2 className="animate-spin" size={28} />
        </div>
      ) : addresses.length === 0 && !showForm ? (
        <p className="mt-8 text-slate-500">
          No addresses yet. Add your first shipping address.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {addresses.map((addr: any) => (
            <div
              key={addr.id}
              className="flex items-start justify-between rounded-xl border bg-white p-4"
            >
              <div>
                <p className="font-medium">{addr.fullName}</p>
                <p className="text-sm text-slate-500">
                  {addr.street}, {addr.city}
                  {addr.state ? `, ${addr.state}` : ""}{" "}
                  {addr.postalCode}
                </p>
                <p className="text-sm text-slate-500">
                  {addr.phone} • {addr.country}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleEdit(addr)}
                  className="rounded p-2 text-blue-600 hover:bg-blue-50"
                >
                  <Pencil size={16} />
                </button>
                <button
                  onClick={() => deleteMutation.mutate(addr.id)}
                  className="rounded p-2 text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AddressesPage;
