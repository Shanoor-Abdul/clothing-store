"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Users, Search, UserCheck, UserX, Mail, Phone, Calendar } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

interface Customer {
  id: string;
  name: string;
  email: string | null;
  mobile: string | null;
  isActive: boolean;
  createdAt: string;
  _count: {
    orders: number;
    addresses: number;
    wishlists: number;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

const fetchCustomers = async (): Promise<Customer[]> => {
  const { data } = await api.get<ApiResponse<Customer[]>>("/admin/customers");
  return data.data;
};

const updateCustomerStatusApi = async ({ id, isActive }: { id: string; isActive: boolean }) => {
  const { data } = await api.patch<ApiResponse<Customer>>("/admin/customers", { id, isActive });
  return data.data;
};

export default function AdminCustomersPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: customers = [], isLoading } = useQuery({
    queryKey: ["admin", "customers"],
    queryFn: fetchCustomers,
  });

  const toggleStatusMutation = useMutation({
    mutationFn: updateCustomerStatusApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
      toast.success("Customer status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update customer status");
    },
  });

  const filteredCustomers = customers.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.mobile && c.mobile.includes(q))
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Customer Management</h1>
          <p className="mt-1 text-slate-500">Directory of registered store customers and order activity.</p>
        </div>

        <div className="relative min-w-[280px]">
          <input
            type="text"
            placeholder="Search by name, email, mobile..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm outline-none focus:border-blue-500"
          />
          <Search size={18} className="absolute left-3 top-3 text-slate-400" />
        </div>
      </div>

      {isLoading ? (
        <div className="rounded-2xl border bg-white p-12 text-center text-slate-500">
          Loading customer directory...
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-white p-12 text-center text-slate-500">
          No registered customers found matching search query.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
              <tr>
                <th className="p-4">Customer Name</th>
                <th className="p-4">Contact Info</th>
                <th className="p-4">Joined Date</th>
                <th className="p-4">Orders Placed</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-slate-50/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
                        {customer.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{customer.name}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    {customer.email && (
                      <p className="flex items-center gap-1.5 text-slate-600">
                        <Mail size={14} className="text-slate-400" />
                        {customer.email}
                      </p>
                    )}
                    {customer.mobile && (
                      <p className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
                        <Phone size={14} className="text-slate-400" />
                        {customer.mobile}
                      </p>
                    )}
                  </td>
                  <td className="p-4 text-slate-500">
                    {new Date(customer.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 font-bold text-slate-900">
                    {customer._count.orders} orders
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ${
                        customer.isActive
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-rose-100 text-rose-800 border border-rose-300"
                      }`}
                    >
                      {customer.isActive ? <UserCheck size={13} /> : <UserX size={13} />}
                      {customer.isActive ? "Active" : "Suspended"}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() =>
                        toggleStatusMutation.mutate({
                          id: customer.id,
                          isActive: !customer.isActive,
                        })
                      }
                      className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        customer.isActive
                          ? "bg-slate-100 text-slate-700 hover:bg-red-100 hover:text-red-700"
                          : "bg-emerald-600 text-white hover:bg-emerald-700"
                      }`}
                    >
                      {customer.isActive ? "Suspend" : "Activate"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
