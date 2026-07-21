"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, X } from "lucide-react";
import { clsx } from "clsx";

interface Option {
  id: string;
  name: string;
}

interface MultiSelectProps {
  label: string;
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelect = ({
  label,
  options,
  selected,
  onChange,
  placeholder = "Select...",
}: MultiSelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleOption = (id: string) => {
    if (selected.includes(id)) {
      onChange(selected.filter((s) => s !== id));
    } else {
      onChange([...selected, id]);
    }
  };

  const removeOption = (id: string) => {
    onChange(selected.filter((s) => s !== id));
  };

  const selectedLabels = options
    .filter((o) => selected.includes(o.id))
    .map((o) => o.name);

  return (
    <div ref={containerRef} className="relative">
      <label className="mb-2 block text-sm font-medium">{label}</label>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={clsx(
          "flex min-h-[42px] w-full flex-wrap items-center gap-1 rounded-lg border p-2 text-left transition",
          isOpen ? "border-blue-500 ring-2 ring-blue-200" : "border-slate-300 hover:border-slate-400"
        )}
      >
        {selectedLabels.length === 0 ? (
          <span className="px-1 text-sm text-slate-400">{placeholder}</span>
        ) : (
          selectedLabels.map((label, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700"
            >
              {label}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  const id = options.find((o) => o.name === label)?.id;
                  if (id) removeOption(id);
                }}
                className="hover:text-blue-900"
              >
                <X size={12} />
              </button>
            </span>
          ))
        )}
        <ChevronDown
          size={16}
          className={clsx(
            "ml-auto text-slate-400 transition",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white shadow-lg">
          {options.length === 0 ? (
            <p className="p-3 text-sm text-slate-500">No options available</p>
          ) : (
            options.map((option) => {
              const isSelected = selected.includes(option.id);
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => toggleOption(option.id)}
                  className={clsx(
                    "flex w-full items-center gap-2 px-3 py-2 text-sm transition",
                    isSelected
                      ? "bg-blue-50 text-blue-700 font-medium"
                      : "text-slate-700 hover:bg-slate-50"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    readOnly
                    className="pointer-events-none rounded border-slate-300"
                  />
                  {option.name}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default MultiSelect;