"use client";

import React, { useState } from "react";
import { ChevronDown, Search } from "lucide-react";

interface CollapsibleFilterGroupProps {
  title: string;
  defaultExpanded?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  children: (searchQuery: string) => React.ReactNode;
}

export default function CollapsibleFilterGroup({
  title,
  defaultExpanded = true,
  searchable = false,
  searchPlaceholder = "Search...",
  children,
}: CollapsibleFilterGroupProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="border-b border-slate-200 py-3.5 last:border-0">
      {/* Header with expand / collapse toggle */}
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between py-1 text-left text-xs font-bold uppercase tracking-wider text-slate-900 hover:text-blue-600 transition"
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-200 ${
            isExpanded ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* Collapsible Content */}
      {isExpanded && (
        <div className="pt-2 space-y-2">
          {searchable && (
            <div className="relative mb-2">
              <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-8 pr-3 text-xs outline-none focus:border-blue-500 focus:bg-white transition"
              />
            </div>
          )}

          {children(searchQuery)}
        </div>
      )}
    </div>
  );
}
