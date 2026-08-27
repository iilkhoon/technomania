'use client';

import React, { useState, useMemo } from 'react';
import {
  ChevronDownIcon as ChevronDown,
  ChevronUpIcon as ChevronUp,
  FunnelIcon as Filter,
  CheckIcon as Check,
  ArrowPathIcon as RotateCcw,
} from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { Product, getProductAttributes } from '../data/products';

export interface FilterState {
  minPrice: number;
  maxPrice: number;
  selectedBrands: string[];
  selectedSpecs: Record<string, string[]>;
}

interface DynamicFilterSidebarProps {
  products: Product[];
  filteredCount?: number;
  categorySlug?: string;
  categoryName?: string;
  filterState: FilterState;
  onFilterChange: (next: FilterState) => void;
  onReset: () => void;
  isDarkMode?: boolean;
}

export default function DynamicFilterSidebar({
  products = [],
  filteredCount,
  categorySlug = '',
  categoryName = 'Məhsullar',
  filterState,
  onFilterChange,
  onReset,
  isDarkMode = false,
}: DynamicFilterSidebarProps) {
  const absoluteMaxPrice = useMemo(() => {
    if (!products || products.length === 0) return 5000;
    const prices = products.map(p => p.rawPrice || parseFloat(String(p.cash_price || 0).replace(/[^\d.]/g, '')) || 0);
    const max = Math.max(...prices);
    return Math.ceil(max) || 5000;
  }, [products]);

  const currentMinPrice = filterState.minPrice || 0;
  const currentMaxPrice = (filterState.maxPrice && filterState.maxPrice < 100000) ? filterState.maxPrice : absoluteMaxPrice;

  const [priceMinInput, setPriceMinInput] = useState<string>(filterState.minPrice ? String(filterState.minPrice) : '');
  const [priceMaxInput, setPriceMaxInput] = useState<string>(filterState.maxPrice && filterState.maxPrice < 100000 ? String(filterState.maxPrice) : '');

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});

  const toggleSection = (sectionKey: string) => {
    setCollapsedSections(prev => ({ ...prev, [sectionKey]: !prev[sectionKey] }));
  };

  const handleApplyPrice = () => {
    onFilterChange({
      ...filterState,
      minPrice: Number(priceMinInput) || 0,
      maxPrice: Number(priceMaxInput) || absoluteMaxPrice,
    });
  };

  const handleMinSliderChange = (newMin: number) => {
    const minVal = Math.min(newMin, currentMaxPrice - 10);
    setPriceMinInput(String(minVal));
    onFilterChange({
      ...filterState,
      minPrice: minVal,
      maxPrice: currentMaxPrice,
    });
  };

  const handleMaxSliderChange = (newMax: number) => {
    const maxVal = Math.max(newMax, currentMinPrice + 10);
    setPriceMaxInput(String(maxVal));
    onFilterChange({
      ...filterState,
      minPrice: currentMinPrice,
      maxPrice: maxVal,
    });
  };

  const toggleBrand = (brandName: string) => {
    const exists = filterState.selectedBrands.includes(brandName);
    const nextBrands = exists
      ? filterState.selectedBrands.filter(b => b !== brandName)
      : [...filterState.selectedBrands, brandName];

    onFilterChange({
      ...filterState,
      selectedBrands: nextBrands,
    });
  };

  const toggleSpec = (specGroup: string, specVal: string) => {
    const groupVals = filterState.selectedSpecs[specGroup] || [];
    const exists = groupVals.includes(specVal);
    const nextVals = exists
      ? groupVals.filter(v => v !== specVal)
      : [...groupVals, specVal];

    onFilterChange({
      ...filterState,
      selectedSpecs: {
        ...filterState.selectedSpecs,
        [specGroup]: nextVals,
      },
    });
  };

  const { dynamicBrands, dynamicSections } = useMemo(() => {
    const brandCounts: Record<string, number> = {};
    const specGroups: Record<string, Record<string, number>> = {};

    products.forEach(p => {
      if (p.brand) {
        brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
      }

      const attrs = getProductAttributes(p);
      Object.entries(attrs).forEach(([key, val]) => {
        if (!specGroups[key]) {
          specGroups[key] = {};
        }
        specGroups[key][val] = (specGroups[key][val] || 0) + 1;
      });
    });

    const brands = Object.entries(brandCounts).map(([bName, count]) => ({
      name: bName,
      count,
    }));

    const sections = Object.entries(specGroups).map(([groupTitle, optionsMap]) => ({
      title: groupTitle,
      options: Object.entries(optionsMap).map(([optVal, count]) => ({
        label: optVal,
        count,
      })),
    }));

    return { dynamicBrands: brands, dynamicSections: sections };
  }, [products]);

  return (
    <aside className={`w-full rounded-2xl border p-4 transition-colors space-y-5 ${
      isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900 shadow-sm'
    }`}>
      {/* Sidebar Top Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-sm tracking-wider flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#4f533b]" /> Filtrələr
          </h3>
          <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[#f4f5f0] dark:bg-stone-900 text-[#4f533b] dark:text-[#a3a886] border border-[#4f533b]/20">
            {filteredCount !== undefined ? filteredCount : products.length} məhsul
          </span>
        </div>
        <button
          onClick={onReset}
          className="text-xs font-bold text-[#4f533b] hover:underline flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" /> Sıfırla
        </button>
      </div>

      {/* 1. QİYMƏT SECTION */}
      <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between font-black text-xs tracking-wider mb-3 text-slate-800 dark:text-slate-200"
        >
          <span>Qiymət</span>
          {collapsedSections['price'] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
        </button>

        {!collapsedSections['price'] && (
          <div className="space-y-4">
            {/* Input boxes for typing exact numbers */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Min qiymət (₼)</label>
                <input
                  type="number"
                  placeholder="0 ₼"
                  value={priceMinInput}
                  onChange={e => setPriceMinInput(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none focus:border-[#4f533b] transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 font-semibold block mb-1">Maks qiymət (₼)</label>
                <input
                  type="number"
                  placeholder={`${absoluteMaxPrice} ₼`}
                  value={priceMaxInput}
                  onChange={e => setPriceMaxInput(e.target.value)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold outline-none focus:border-[#4f533b] transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                />
              </div>
            </div>

            {/* Dual Range Controls with Dynamic Price Indicator */}
            <div className="space-y-3 px-1 pt-1">
              <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium">
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">{currentMinPrice} ₼</span>
                <span className="font-extrabold text-[#4f533b] dark:text-[#a3a886]">
                  Aralıq: {currentMinPrice} ₼ — {currentMaxPrice} ₼
                </span>
                <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 font-bold">{currentMaxPrice} ₼</span>
              </div>

              <div className="space-y-2">
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Minimun Slayder</label>
                  <input
                    type="range"
                    min={0}
                    max={Math.max(10, currentMaxPrice - 10)}
                    step={10}
                    value={currentMinPrice}
                    onChange={e => handleMinSliderChange(Number(e.target.value))}
                    className="w-full accent-[#4f533b] cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                    title="Min Qiymət Slider"
                  />
                </div>
                <div>
                  <label className="text-[9px] text-slate-400 font-semibold block mb-0.5">Maksimum Slayder</label>
                  <input
                    type="range"
                    min={Math.min(absoluteMaxPrice - 10, currentMinPrice + 10)}
                    max={absoluteMaxPrice}
                    step={10}
                    value={currentMaxPrice}
                    onChange={e => handleMaxSliderChange(Number(e.target.value))}
                    className="w-full accent-[#4f533b] cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none"
                    title="Maks Qiymət Slider"
                  />
                </div>
              </div>
            </div>

            <Button
              variant="primary"
              onPress={handleApplyPrice}
              className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black text-xs py-2.5 h-10 rounded-xl shadow-xs transition cursor-pointer active:scale-95 text-center tracking-wider"
            >
              Filtrləri Tətbiq Et
            </Button>
          </div>
        )}
      </div>

      {/* 2. DYNAMIC BREND SECTION */}
      {dynamicBrands.length > 0 && (
        <div className="border-b pb-4 border-slate-100 dark:border-slate-800">
          <button
            onClick={() => toggleSection('brand')}
            className="w-full flex items-center justify-between font-black text-xs tracking-wider mb-3 text-slate-800 dark:text-slate-200"
          >
            <span>Brend</span>
            {collapsedSections['brand'] ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
          </button>

          {!collapsedSections['brand'] && (
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {dynamicBrands.map((bObj) => {
                const isChecked = filterState.selectedBrands.includes(bObj.name);

                return (
                  <label
                    key={bObj.name}
                    onClick={() => toggleBrand(bObj.name)}
                    className="flex items-center justify-between text-xs font-semibold cursor-pointer hover:text-[#4f533b] transition select-none"
                  >
                    <div className="flex items-center gap-2">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                        isChecked ? 'bg-[#4f533b] border-[#4f533b] text-white' : isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
                      }`}>
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={isChecked ? 'font-extrabold text-[#4f533b]' : ''}>{bObj.name}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-medium">({bObj.count})</span>
                  </label>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 3. DYNAMIC SPECS SECTIONS GENERATED FROM JSON ATTRIBUTES */}
      {dynamicSections.map((sec) => {
        const isCollapsed = collapsedSections[sec.title];
        const activeGroupVals = filterState.selectedSpecs[sec.title] || [];

        return (
          <div key={sec.title} className="border-b pb-4 border-slate-100 dark:border-slate-800">
            <button
              onClick={() => toggleSection(sec.title)}
              className="w-full flex items-center justify-between font-black text-xs tracking-wider mb-3 text-slate-800 dark:text-slate-200"
            >
              <span>{sec.title}</span>
              {isCollapsed ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronUp className="w-4 h-4 text-slate-400" />}
            </button>

            {!isCollapsed && (
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {sec.options.map((opt) => {
                  const isChecked = activeGroupVals.includes(opt.label);

                  return (
                    <label
                      key={opt.label}
                      onClick={() => toggleSpec(sec.title, opt.label)}
                      className="flex items-center justify-between text-xs font-semibold cursor-pointer hover:text-[#4f533b] transition select-none"
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition ${
                          isChecked ? 'bg-[#4f533b] border-[#4f533b] text-white' : isDarkMode ? 'border-slate-700 bg-slate-800' : 'border-slate-300 bg-white'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={isChecked ? 'font-extrabold text-[#4f533b]' : ''}>{opt.label}</span>
                      </div>
                      {opt.count !== undefined && (
                        <span className="text-[11px] text-slate-400 font-medium">({opt.count})</span>
                      )}
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </aside>
  );
}
