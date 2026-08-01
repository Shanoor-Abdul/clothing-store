"use client";

import { useState } from "react";
import { Settings, Save, Globe, DollarSign, Truck, Mail, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  const [storeName, setStoreName] = useState("Savor & Spice / Clothing Store");
  const [supportEmail, setSupportEmail] = useState("support@store.com");
  const [currency, setCurrency] = useState("USD ($)");
  const [standardShipping, setStandardShipping] = useState("15.00");
  const [freeShippingThreshold, setFreeShippingThreshold] = useState("150.00");
  const [taxRate, setTaxRate] = useState("5.0");

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Store settings updated successfully");
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Store Settings</h1>
        <p className="mt-1 text-slate-500">Configure store settings, shipping rates, and email support.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 border-b pb-4">General Configuration</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Store Name</label>
            <div className="relative">
              <input
                type="text"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 text-sm outline-none focus:border-blue-500"
              />
              <Globe size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Support Email</label>
            <div className="relative">
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 text-sm outline-none focus:border-blue-500"
              />
              <Mail size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Currency Symbol</label>
            <div className="relative">
              <input
                type="text"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 text-sm outline-none focus:border-blue-500"
              />
              <DollarSign size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Tax Rate (%)</label>
            <input
              type="number"
              step="0.1"
              value={taxRate}
              onChange={(e) => setTaxRate(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <h2 className="text-xl font-bold text-slate-800 border-b pb-4 pt-4">Shipping & Logistics</h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Standard Shipping Fee</label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={standardShipping}
                onChange={(e) => setStandardShipping(e.target.value)}
                className="w-full rounded-xl border border-slate-300 p-3 pl-10 text-sm outline-none focus:border-blue-500"
              />
              <Truck size={18} className="absolute left-3 top-3.5 text-slate-400" />
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-semibold text-slate-700">Free Shipping Minimum Amount</label>
            <input
              type="number"
              step="0.01"
              value={freeShippingThreshold}
              onChange={(e) => setFreeShippingThreshold(e.target.value)}
              className="w-full rounded-xl border border-slate-300 p-3 text-sm outline-none focus:border-blue-500"
            />
          </div>
        </div>

        <div className="border-t pt-6 flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-bold text-white hover:bg-blue-700 transition"
          >
            <Save size={18} />
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
