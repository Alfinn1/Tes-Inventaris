import React, { useState, useMemo, useEffect } from 'react';
import { InventoryItem } from '../../types';
import { useApp } from '../../context/AppContext';
import { Check, Layers, AlertCircle } from 'lucide-react';

interface ComponentPickerProps {
  items: InventoryItem[];
  selectedId: string;
  onSelect: (item: InventoryItem | null) => void;
  label?: string;
  required?: boolean;
  disabled?: boolean;
}

export const ComponentPicker: React.FC<ComponentPickerProps> = ({
  items,
  selectedId,
  onSelect,
  label = 'Pilih Komponen iPhone',
  required = true,
  disabled = false,
}) => {
  const { categories } = useApp();

  // Selected series state ('ALL' or specific series name)
  const [selectedSeries, setSelectedSeries] = useState<string>('ALL');

  // Extract unique series from available items
  const availableSeries = useMemo(() => {
    const seriesSet = new Set<string>();
    items.forEach((item) => {
      if (item.model_iphone) {
        seriesSet.add(item.model_iphone);
      }
    });
    return Array.from(seriesSet).sort();
  }, [items]);

  // Filtered items based on selected series
  const filteredItems = useMemo(() => {
    if (selectedSeries === 'ALL') {
      return items;
    }
    return items.filter((item) => item.model_iphone === selectedSeries);
  }, [items, selectedSeries]);

  // Selected item object
  const selectedItem = useMemo(() => {
    return items.find((i) => i.id === selectedId) || null;
  }, [items, selectedId]);

  // If currently selected item is outside the newly filtered series, automatically sync
  useEffect(() => {
    if (filteredItems.length > 0) {
      const isStillInList = filteredItems.some((i) => i.id === selectedId);
      if (!isStillInList && selectedSeries !== 'ALL') {
        onSelect(filteredItems[0]);
      }
    } else if (items.length > 0 && selectedSeries === 'ALL') {
      if (!selectedId) {
        onSelect(items[0]);
      }
    }
  }, [selectedSeries, filteredItems, selectedId, items, onSelect]);

  // Find category name helper
  const getCategoryName = (catId: string) => {
    const found = categories.find((c) => c.id === catId);
    return found ? found.nama_kategori : 'Sparepart';
  };

  return (
    <div className="space-y-3">
      {/* 1. Filter / Pilih Seri iPhone */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
          <span>Pilih Seri iPhone</span>
          <span className="text-[10px] font-normal text-slate-400">
            {availableSeries.length} Seri Tersedia
          </span>
        </label>
        <select
          value={selectedSeries}
          onChange={(e) => setSelectedSeries(e.target.value)}
          disabled={disabled}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50/70 hover:bg-white focus:bg-white focus:border-blue-600 focus:outline-none transition-colors font-medium text-slate-800"
        >
          <option value="ALL">Semua Seri iPhone ({items.length} Komponen)</option>
          {availableSeries.map((series) => {
            const countInSeries = items.filter((i) => i.model_iphone === series).length;
            return (
              <option key={series} value={series}>
                {series} ({countInSeries} Komponen)
              </option>
            );
          })}
        </select>
      </div>

      {/* 2. Pilih Komponen iPhone */}
      <div>
        <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center justify-between">
          <span>Pilih Komponen iPhone</span>
          <span className="text-[10px] font-normal text-slate-400">
            {filteredItems.length} pilihan
          </span>
        </label>
        <select
          value={selectedId}
          onChange={(e) => {
            const found = items.find((i) => i.id === e.target.value) || null;
            onSelect(found);
          }}
          required={required}
          disabled={disabled || filteredItems.length === 0}
          className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white focus:border-blue-600 focus:outline-none transition-colors font-medium text-slate-900"
        >
          {filteredItems.length === 0 ? (
            <option value="">Tidak ada komponen untuk seri ini</option>
          ) : (
            filteredItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.nama_barang} — {item.stok > 0 ? `Stok: ${item.stok}` : 'Habis (0)'}
              </option>
            ))
          )}
        </select>
      </div>

      {/* 3. Visual Preview Kartu Komponen Terpilih */}
      {selectedItem ? (
        <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start justify-between gap-3 text-xs">
          <div className="min-w-0 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-mono text-[11px] font-bold text-blue-700 bg-white px-1.5 py-0.5 rounded border border-blue-200 shadow-2xs">
                {selectedItem.kode_barang}
              </span>
              <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                {selectedItem.model_iphone}
              </span>
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Layers className="w-2.5 h-2.5 text-slate-400" />
                {getCategoryName(selectedItem.category_id)}
              </span>
            </div>
            <p className="font-bold text-slate-900 text-xs truncate">
              {selectedItem.nama_barang}
            </p>
          </div>

          <div className="text-right shrink-0">
            <span className="text-[10px] text-slate-400 block font-medium">Stok Saat Ini:</span>
            <span
              className={`inline-flex items-center gap-1 font-bold text-xs px-2 py-0.5 rounded-full ${
                selectedItem.stok > 5
                  ? 'bg-emerald-100 text-emerald-800'
                  : selectedItem.stok > 0
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {selectedItem.stok > 0 ? (
                <Check className="w-3 h-3" />
              ) : (
                <AlertCircle className="w-3 h-3" />
              )}
              <span>
                {selectedItem.stok} {selectedItem.satuan || 'Unit'}
              </span>
            </span>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-400 text-center">
          Pilih komponen iPhone di atas
        </div>
      )}
    </div>
  );
};
