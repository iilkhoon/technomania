'use client';

import React, { useState, useEffect } from 'react';
import {
  Warehouse,
  Package,
  Plus,
  Search,
  Check,
  AlertTriangle,
  RefreshCw,
  Edit3,
  Save,
  X,
  Download,
  Building2,
  MapPin,
  CheckCircle,
  Store,
  Layers,
} from '../../components/HeroIconsHub';
import { Product, Category } from '../../types';
import { getLocalProducts, saveLocalProducts, getLocalCategories, fetchApiProducts, saveProductToApi } from '../../lib/supabase';
import { exportToCSV } from '../../lib/exportUtils';
import { addAuditLog } from '../../lib/auditLogger';
import { showToast } from '../../lib/toastStore';

export interface PhysicalStore {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  hours?: string;
}

export interface PhysicalWarehouse {
  id: string;
  name: string;
  store_id: string;
  store_name?: string;
  code?: string;
  address?: string;
  is_main?: boolean;
  is_active?: boolean;
}

export interface WarehouseStockRecord {
  id: number;
  product_id: string;
  warehouse_id: string;
  quantity: number;
  warehouse_name?: string;
  product_name?: string;
}

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState<'stock' | 'warehouses'>('stock');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stores, setStores] = useState<PhysicalStore[]>([]);
  const [warehouses, setWarehouses] = useState<PhysicalWarehouse[]>([]);
  const [stockRecords, setStockRecords] = useState<WarehouseStockRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock' | 'low_stock'>('all');

  // Inline Stock Edit per Warehouse
  const [editingCell, setEditingCell] = useState<{ productId: string; warehouseId: string } | null>(null);
  const [tempQtyValue, setTempQtyValue] = useState<string>('');

  // Add Warehouse Modal State
  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);
  const [newWhName, setNewWhName] = useState('');
  const [newWhStoreId, setNewWhStoreId] = useState('');
  const [newWhCode, setNewWhCode] = useState('');
  const [newWhAddress, setNewWhAddress] = useState('');
  const [newWhIsMain, setNewWhIsMain] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      setCategories(getLocalCategories() || []);

      // 1. Fetch Stores
      try {
        const res = await fetch('/api/catalog/stores', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setStores(data);
        }
      } catch (e) {}

      // 2. Fetch Warehouses
      try {
        const res = await fetch('/api/catalog/warehouses', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setWarehouses(data);
        }
      } catch (e) {}

      // 3. Fetch Warehouse Stock
      try {
        const res = await fetch('/api/catalog/warehouses/stock', { cache: 'no-store' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data)) setStockRecords(data);
        }
      } catch (e) {}

      // 4. Fetch Products with Aggregated Stock
      const liveProds = await fetchApiProducts();
      if (Array.isArray(liveProds) && liveProds.length > 0) {
        setProducts(liveProds);
      } else {
        setProducts(getLocalProducts() || []);
      }
    } catch (e) {
      console.error('Error loading inventory data:', e);
    } finally {
      setLoading(false);
    }
  };

  // Helper to get stock quantity of a product in a specific warehouse
  const getProductStockInWarehouse = (productId: string, warehouseId: string): number => {
    const rec = stockRecords.find(r => r.product_id === productId && r.warehouse_id === warehouseId);
    return rec ? rec.quantity : 0;
  };

  // Save updated stock quantity in a specific warehouse
  const handleSaveWarehouseStock = async (productId: string, warehouseId: string, qtyStr: string) => {
    const qty = parseInt(qtyStr, 10);
    if (isNaN(qty) || qty < 0) {
      showToast('Zəhmət olmasa müsbət say daxil edin', 'error');
      return;
    }

    try {
      const res = await fetch('/api/catalog/warehouses/stock', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, warehouseId, quantity: qty }),
      });

      if (!res.ok) throw new Error('API update failed');
      const data = await res.json();

      // Update local state
      setStockRecords(prev => {
        const existing = prev.find(r => r.product_id === productId && r.warehouse_id === warehouseId);
        if (existing) {
          return prev.map(r => r.product_id === productId && r.warehouse_id === warehouseId ? { ...r, quantity: qty } : r);
        }
        return [...prev, { id: Date.now(), product_id: productId, warehouse_id: warehouseId, quantity: qty }];
      });

      // Update total combined stock in products array
      setProducts(prev => prev.map(p => p.id === productId ? { ...p, stock: data.totalStock } : p));

      setEditingCell(null);
      showToast(`Stok uğurla yeniləndi (Ümumi mərkəzi stok: ${data.totalStock} ədəd) 🚀`, 'success');
      
      const targetProd = products.find(p => p.id === productId);
      const targetWh = warehouses.find(w => w.id === warehouseId);
      const prevQty = stockRecords.find(r => r.product_id === productId && r.warehouse_id === warehouseId)?.quantity ?? 0;

      addAuditLog(
        qty === 0 ? 'stock_delete' : 'stock_update',
        'inventory',
        `${targetProd?.name || 'Məhsul'} (${targetWh?.name || 'Anbar'}) stoku ${prevQty} -> ${qty} ədəd olaraq ${qty === 0 ? 'sıfırlandı/silindi' : 'yeniləndi'}`,
        {
          entityId: productId,
          entityName: targetProd?.name || 'Məhsul',
          oldValues: { quantity: prevQty, warehouse: targetWh?.name },
          newValues: { quantity: qty, totalStock: data.totalStock, warehouse: targetWh?.name },
        }
      );
    } catch (e) {
      console.error('Failed to update warehouse stock:', e);
      showToast('Stok yenilənə bilmədi', 'error');
    }
  };

  // Save New Warehouse with mandatory Store selection
  const handleAddWarehouse = async () => {
    if (!newWhName.trim()) {
      showToast('Zəhmət olmasa anbar adını daxil edin', 'info');
      return;
    }

    if (!newWhStoreId) {
      showToast('Zəhmət olmasa bu anbarın aid olduğu MAĞAZANI seçin!', 'error');
      return;
    }

    try {
      const payload = {
        name: newWhName.trim(),
        store_id: newWhStoreId,
        code: newWhCode.trim() || `WH-${Date.now().toString().slice(-4)}`,
        address: newWhAddress.trim() || null,
        is_main: newWhIsMain,
        is_active: true,
      };

      const res = await fetch('/api/catalog/warehouses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Failed to save warehouse');

      setIsAddWhModalOpen(false);
      setNewWhName('');
      setNewWhStoreId('');
      setNewWhCode('');
      setNewWhAddress('');
      setNewWhIsMain(false);

      loadData();
      showToast('Yeni anbar uğurla mağazaya təyin olundu və yaradıldı! 🏢', 'success');
    } catch (e: any) {
      showToast('Anbar yaradıla bilmədi: ' + e.message, 'error');
    }
  };

  // Filtered Products List
  const filteredProducts = products.filter(prod => {
    const nameMatch = (prod.model_name || prod.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.brand || '').toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || prod.category_id === selectedCategory || (prod as any).category === selectedCategory;

    const totalStock = typeof prod.stock === 'number' ? prod.stock : (parseInt(String(prod.stock || 0), 10) || 0);

    let stockMatch = true;
    if (stockFilter === 'in_stock') stockMatch = totalStock > 0;
    if (stockFilter === 'out_of_stock') stockMatch = totalStock === 0;
    if (stockFilter === 'low_stock') stockMatch = totalStock > 0 && totalStock < 10;

    return nameMatch && categoryMatch && stockMatch;
  });

  return (
    <div className="space-y-6 text-slate-700">
      {/* Header Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Warehouse className="w-6 h-6 text-[#4f533b]" /> Mərkəzi Anbarlar və Stok İdarəetməsi
            </h1>
            <span className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-md font-bold">
              {warehouses.length} Anbar
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Hər fiziki mağazanın öz anbarı üzrə məhsul saylarını idarə edin. Mərkəzi saytda bütün anbarların stoku cəmlənir.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'warehouses' && (
            <button
              type="button"
              onClick={() => setIsAddWhModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer shadow-xs active:scale-95"
            >
              <Plus className="w-4 h-4" /> Yeni Anbar Yarat
            </button>
          )}

          <button
            type="button"
            onClick={loadData}
            className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm px-4 py-2.5 rounded-xl font-bold transition flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Yenilə
          </button>
        </div>
      </div>

      {/* Tabs Selection */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'stock'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Package className="w-4 h-4" /> Anbarlar Üzrə Stok Cədvəli
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('warehouses')}
          className={`px-4 py-2.5 rounded-xl font-bold text-sm transition cursor-pointer flex items-center gap-2 ${
            activeTab === 'warehouses'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" /> Anbarlar və Mağazalar Siyahısı ({warehouses.length})
        </button>
      </div>

      {/* TAB 1: PRODUCT STOCKS PER WAREHOUSE */}
      {activeTab === 'stock' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Məhsul adı və ya brend axtar..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#4f533b]"
              >
                <option value="all">Bütün Kateqoriyalar</option>
                {categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>

              <select
                value={stockFilter}
                onChange={e => setStockFilter(e.target.value as any)}
                className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-[#4f533b]"
              >
                <option value="all">Bütün Stok Rejimləri</option>
                <option value="in_stock">Mövcud Məhsullar</option>
                <option value="low_stock">⚠️ Az Qalan Məhsullar (&lt; 10)</option>
                <option value="out_of_stock">Stokda Olmayanlar (0)</option>
              </select>
            </div>
          </div>

          {/* Warehouse Stock Matrix Table */}
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-600 tracking-wider font-extrabold">
                    <th className="py-4 px-4 min-w-[240px]">Məhsul və Brend</th>
                    <th className="py-4 px-4">Qiymət</th>

                    {/* Columns for each physical warehouse */}
                    {warehouses.map(wh => (
                      <th key={wh.id} className="py-4 px-4 bg-slate-100/60 border-l border-slate-200 text-center min-w-[130px]">
                        <span className="block font-black text-slate-900">{wh.name}</span>
                        <span className="text-[10px] text-slate-400 font-semibold lowercase block">{wh.store_name || 'Mağaza'}</span>
                      </th>
                    ))}

                    <th className="py-4 px-4 text-center bg-emerald-50 text-emerald-900 border-l border-emerald-200 min-w-[130px]">
                      Vahid Mərkəzi Stok (Sayt)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredProducts.map(prod => {
                    const totalStock = typeof prod.stock === 'number' ? prod.stock : (parseInt(String(prod.stock || 0), 10) || 0);
                    const isLowStock = totalStock > 0 && totalStock < 10;

                    return (
                      <tr key={prod.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=100&q=80'}
                              alt={prod.name}
                              className="w-10 h-10 rounded-xl object-contain border border-slate-200 p-1 bg-white flex-shrink-0"
                            />
                            <div>
                              <span className="font-extrabold text-slate-900 block leading-snug">{prod.model_name || prod.name}</span>
                              <span className="text-xs text-slate-400 font-mono">{prod.brand}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 font-black text-slate-900 font-mono">
                          {typeof prod.cash_price === 'number' ? prod.cash_price.toFixed(2) : String(prod.cash_price)} ₼
                        </td>

                        {/* Per-Warehouse Quantity Cells */}
                        {warehouses.map(wh => {
                          const currentQty = getProductStockInWarehouse(prod.id, wh.id);
                          const isEditingThisCell = editingCell?.productId === prod.id && editingCell?.warehouseId === wh.id;

                          return (
                            <td key={wh.id} className="py-3.5 px-4 border-l border-slate-200 text-center bg-slate-50/30">
                              {isEditingThisCell ? (
                                <div className="flex items-center justify-center gap-1">
                                  <input
                                    type="number"
                                    min="0"
                                    value={tempQtyValue}
                                    onChange={e => setTempQtyValue(e.target.value)}
                                    className="w-16 bg-white border border-[#4f533b] font-black text-center text-slate-900 rounded-lg py-1 px-1 text-sm outline-none shadow-inner"
                                    autoFocus
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleSaveWarehouseStock(prod.id, wh.id, tempQtyValue)}
                                    className="p-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setEditingCell(null)}
                                    className="p-1 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition cursor-pointer"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div
                                  onClick={() => {
                                    setEditingCell({ productId: prod.id, warehouseId: wh.id });
                                    setTempQtyValue(String(currentQty));
                                  }}
                                  className="cursor-pointer group flex items-center justify-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-emerald-50 hover:border hover:border-emerald-200 transition"
                                  title="Stoku dəyişmək üçün klikləyin"
                                >
                                  <span className={`font-black font-mono text-sm ${currentQty === 0 ? 'text-rose-500' : 'text-slate-900'}`}>
                                    {currentQty}
                                  </span>
                                  <Edit3 className="w-3 h-3 text-slate-300 group-hover:text-emerald-600 transition" />
                                </div>
                              )}
                            </td>
                          );
                        })}

                        {/* Combined Total Stock Cell */}
                        <td className="py-3.5 px-4 text-center border-l border-emerald-200 bg-emerald-50/50">
                          <div className="flex flex-col items-center">
                            <span className={`font-black font-mono text-base ${totalStock === 0 ? 'text-rose-600' : isLowStock ? 'text-amber-600' : 'text-emerald-700'}`}>
                              {totalStock} ədəd
                            </span>
                            {isLowStock && (
                              <span className="text-[10px] font-black text-rose-600 bg-rose-100 border border-rose-200 px-1.5 py-0.5 rounded-md mt-0.5">
                                ⚠️ Yalnız {totalStock} ədəd qaldı!
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: WAREHOUSES & STORES LIST */}
      {activeTab === 'warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {warehouses.map(wh => (
            <div key={wh.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-[#4f533b]/10 text-[#4f533b] flex items-center justify-center border border-[#4f533b]/20">
                  <Building2 className="w-5 h-5" />
                </div>
                {wh.is_main && (
                  <span className="text-xs font-black bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-lg">
                    Əsas Mərkəzi Anbar
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-base font-black text-slate-900">{wh.name}</h3>
                <span className="text-xs font-mono text-slate-400">Kod: {wh.code || wh.id}</span>
              </div>

              {/* Linked Physical Store Info */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-1">
                <span className="text-[11px] font-black text-slate-400 block tracking-wider flex items-center gap-1">
                  <Store className="w-3.5 h-3.5 text-[#4f533b]" /> Bağlı Olduğu Mağaza:
                </span>
                <span className="text-xs font-bold text-slate-900 block">
                  {wh.store_name || 'Mərkəzi Filial'}
                </span>
                {wh.address && (
                  <span className="text-[11px] text-slate-500 block flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {wh.address}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ADD WAREHOUSE MODAL (MANDATORY STORE SELECTION) */}
      {isAddWhModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#4f533b]" /> Yeni Anbar Yaradılması
              </h3>
              <button
                type="button"
                onClick={() => setIsAddWhModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-xl font-bold cursor-pointer"
              >
                ×
              </button>
            </div>

            {/* Warehouse Name */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-900 block ">Anbarın Adı (*):</label>
              <input
                type="text"
                value={newWhName}
                onChange={e => setNewWhName(e.target.value)}
                placeholder="Məs: 28 May Mağazası Anbarı..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b] transition"
              />
            </div>

            {/* Mandatory Store Selection */}
            <div className="bg-amber-50/70 border border-amber-200 p-3.5 rounded-xl space-y-1.5">
              <label className="text-xs font-black text-amber-900 block flex items-center gap-1.5">
                <Store className="w-4 h-4 text-amber-600" /> Aid Olduğu Mağaza (MƏCBURİ SEÇİM *):
              </label>
              <select
                value={newWhStoreId}
                onChange={e => setNewWhStoreId(e.target.value)}
                className="w-full bg-white border border-amber-300 font-bold text-slate-900 rounded-xl px-3.5 py-2 text-sm outline-none focus:border-amber-600 transition"
              >
                <option value="">-- Zəhmət olmasa mağaza seçin --</option>
                {stores.map(st => (
                  <option key={st.id} value={st.id}>{st.name}</option>
                ))}
              </select>
              <p className="text-[11px] text-amber-700 font-medium">
                * Hər anbar mütləq konkret bir fiziki mağaza ilə əlaqəli olmalıdır.
              </p>
            </div>

            {/* Warehouse Code & Address */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 block ">Anbar Kodu:</label>
                <input
                  type="text"
                  value={newWhCode}
                  onChange={e => setNewWhCode(e.target.value)}
                  placeholder="WH-28M"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 block ">Ünvan:</label>
                <input
                  type="text"
                  value={newWhAddress}
                  onChange={e => setNewWhAddress(e.target.value)}
                  placeholder="Bakı, 28 May küç. 44"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsAddWhModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
              >
                Ləğv Et
              </button>
              <button
                type="button"
                onClick={handleAddWarehouse}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4f533b] hover:bg-[#3e4230] text-white transition cursor-pointer shadow-xs active:scale-95"
              >
                Anbarı Yadda Saxla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
