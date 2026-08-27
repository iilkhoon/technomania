'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  Maximize2,
  LayoutGrid,
  List,
  Download,
  Eye,
} from '../../components/HeroIconsHub';
import { Product, Category } from '../../types';
import { getLocalProducts, saveLocalProducts, getLocalCategories, fetchApiProducts, deleteApiProduct, saveProductToApi } from '../../lib/supabase';
import SlideOverDrawer from '../../components/SlideOverDrawer';
import { exportToCSV } from '../../lib/exportUtils';
import { addAuditLog } from '../../lib/auditLogger';
import { showToast } from '../../lib/toastStore';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Drawer State
  const [drawerProduct, setDrawerProduct] = useState<Product | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setCategories(getLocalCategories() || []);
      const liveProds = await fetchApiCategoriesAndProducts();
      setProducts(Array.isArray(liveProds) ? liveProds : []);
    } catch (e) {
      console.error('Error loading products page:', e);
      setProducts(getLocalProducts() || []);
    }
  };

  const fetchApiCategoriesAndProducts = async () => {
    try {
      const prods = await fetchApiProducts();
      return Array.isArray(prods) ? prods : getLocalProducts() || [];
    } catch (e) {
      return getLocalProducts() || [];
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name || 'Məhsul'}" məhsulunu silmək istədiyinizdən əminsiniz?`)) return;

    const targetProd = products.find(p => p?.id === id);
    const updated = products.filter(p => p?.id !== id);
    setProducts(updated);
    saveLocalProducts(updated);
    await deleteApiProduct(id);
    addAuditLog('product_delete', 'product', `Məhsul "${name || id}" bazadan silindi`, {
      entityId: id,
      entityName: name,
      oldValues: { name, price: targetProd?.cash_price, stock: targetProd?.stock, brand: targetProd?.brand },
    });
    showToast(`"${name || 'Məhsul'}" bazadan silindi!`, 'error');
  };

  const handleToggleStatus = async (p: Product) => {
    if (!p) return;
    const updatedProd = { ...p, is_active: !p.is_active };
    const updated = products.map(item => item?.id === p.id ? updatedProd : item);
    setProducts(updated);
    saveLocalProducts(updated);
    await saveProductToApi(updatedProd);
    addAuditLog('product_status', 'product', `Məhsul "${p.name || p.model_name}" statusu "${updatedProd.is_active ? 'Aktiv' : 'Deaktiv'}" edildi`, {
      entityId: p.id,
      entityName: p.name || p.model_name,
      oldValues: { is_active: p.is_active },
      newValues: { is_active: updatedProd.is_active },
    });
    showToast(`Məhsul statusu "${updatedProd.is_active ? 'Aktiv' : 'Deaktiv'}" edildi`, 'info');
  };

  // Filter products safely
  const filteredProducts = (products || []).filter(p => {
    if (!p) return false;

    const pName = (p.name || p.model_name || '').toLowerCase();
    const pBrand = (p.brand || '').toLowerCase();
    const q = searchQuery.toLowerCase();

    const pId = String(p.id || '').toLowerCase();
    const matchesSearch = !q || pName.includes(q) || pBrand.includes(q) || pId.includes(q);
    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;

    const stockVal = typeof p.stock === 'number' ? p.stock : (parseInt(String(p.stock || 0), 10) || 0);
    const matchesStock =
      stockFilter === 'all' ||
      (stockFilter === 'in_stock' && stockVal > 0) ||
      (stockFilter === 'out_of_stock' && stockVal <= 0);

    return matchesSearch && matchesCat && matchesStock;
  });

  const handleExportExcel = () => {
    const headers = ['ID', 'Məhsul Adı', 'Brend', 'Kateqoriya', 'Nağd Qiymət (₼)', 'Kredit Qiyməti (₼)', 'Stok Sayı'];
    const rows = filteredProducts.map(p => [
      p.id,
      p.name || p.model_name || '',
      p.brand || '',
      p.category_name || '',
      typeof (p as any).cash_price === 'number' ? (p as any).cash_price.toFixed(2) : String((p as any).cash_price || (p as any).price || 0),
      typeof (p as any).credit_price === 'number' ? (p as any).credit_price.toFixed(2) : String((p as any).credit_price || 0),
      p.stock ?? 0,
    ]);
    exportToCSV('Mehsul_Bazasi', headers, rows);
    addAuditLog('excel_export', 'product', `Bütün məhsullar (${rows.length} ədəd) Excel CSV-yə köçürüldü`);
    showToast(`Məhsul bazası Excel-ə yükləndi (${rows.length} ədəd)`, 'success');
  };

  return (
    <div className="space-y-5 text-slate-700">
      {/* ── 1. Page Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-[#4f533b]" /> Məhsullar və anbar
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md">
              {products.length} məhsul
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Məhsul bazası, kateqoriya spesifikasiyaları və stok statuslarını tənzimləyin.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex-1 sm:flex-none bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm px-3.5 py-2.5 rounded-xl transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 font-medium"
            title="Excel CSV yüklə"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Excel-ə çıxart
          </button>

          <Link
            href="/products/new"
            className="flex-1 sm:flex-none bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer active:scale-95 font-bold"
          >
            <Plus className="w-4 h-4" /> Yeni Məhsul Əlavə Et
          </Link>
        </div>
      </div>

      {/* ── 2. Filter & View Toolbar ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Model adı və ya brend axtar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-400"
          />
        </div>

        {/* Filters & View Switcher */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full md:w-auto">
          {/* Category Selector */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none cursor-pointer focus:border-[#4f533b]"
          >
            <option value="all">Bütün kateqoriyalar</option>
            {categories.map(c => (
              <option key={c?.id} value={c?.id}>{c?.name}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-700 outline-none cursor-pointer focus:border-[#4f533b]"
          >
            <option value="all">Bütün stok statusu</option>
            <option value="in_stock">Stokda var</option>
            <option value="out_of_stock">Stoku bitənlər</option>
          </select>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-sm transition cursor-pointer ${
                viewMode === 'table' ? 'bg-[#4f533b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Cədvəl Görünüşü"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg text-sm transition cursor-pointer ${
                viewMode === 'grid' ? 'bg-[#4f533b] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Kart (Grid) Görünüşü"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* ── 3. Data Table View ── */}
      {viewMode === 'table' ? (
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
          {/* Top Status Header */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-sm">
            <span className="text-slate-600">
              Nümayiş olunur: <strong className="text-slate-900 font-semibold">{filteredProducts.length}</strong> / {products.length} Məhsul
            </span>
            <span className="text-xs text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
              Sinxronizasiya Aktivdir
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Məhsul & Brend</th>
                  <th className="py-3.5 px-4">Kateqoriya</th>
                  <th className="py-3.5 px-4">Nağd Qiymət</th>
                  <th className="py-3.5 px-4">Stok Sayı</th>
                  <th className="py-3.5 px-4">Spesifikasiyalar</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-slate-400">
                      Axtarış parametrinizə uyğun məhsul tapılmadı!
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map(p => {
                    const catObj = categories.find(c => c?.id === p?.category_id);
                    const specKeys = Object.keys(p?.attributes && typeof p.attributes === 'object' ? p.attributes : {});
                    const cashPrice = typeof p?.cash_price === 'number' ? p.cash_price : (parseFloat(String(p?.cash_price || 0)) || 0);
                    const oldPrice = p?.old_price ? (typeof p.old_price === 'number' ? p.old_price : parseFloat(String(p.old_price)) || undefined) : undefined;
                    const stock = typeof p?.stock === 'number' ? p.stock : (parseInt(String(p?.stock || 0), 10) || 0);
                    const name = p?.name || p?.model_name || '—';
                    const brand = p?.brand || 'GÖSTƏRİLMƏYİB';

                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors group">
                        {/* Thumbnail & Product Info */}
                        <td className="py-3.5 px-4 flex items-center gap-3 min-w-[240px]">
                          <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center flex-shrink-0">
                            {p.image ? (
                              <img src={p.image} alt={name} className="max-h-full object-contain" />
                            ) : (
                              <Package className="w-4 h-4 text-slate-400" />
                            )}
                          </div>
                          <div>
                            <span className="text-slate-900 text-sm block line-clamp-1 group-hover:text-[#4f533b] transition">
                              {name}
                            </span>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-1.5 py-0.2 rounded ">
                                {brand}
                              </span>
                              {p.discount && (
                                <span className="text-xs text-[#4f533b] bg-[#f4f5f0] px-1.5 py-0.2 rounded-full border border-[#4f533b]/20">
                                  {p.discount}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span className="bg-slate-100 text-slate-700 px-2.5 py-1 rounded-md border border-slate-200 text-xs">
                            {catObj ? catObj.name : p.category_name || 'Ümumi'}
                          </span>
                        </td>

                        {/* Cash Price */}
                        <td className="py-3.5 px-4">
                          <span className="text-slate-900 text-sm block font-medium">
                            {cashPrice.toFixed(2)} ₼
                          </span>
                          {oldPrice && (
                            <span className="line-through text-xs text-slate-400 block">
                              {oldPrice.toFixed(2)} ₼
                            </span>
                          )}
                        </td>

                        {/* Stock */}
                        <td className="py-3.5 px-4">
                          <span className={`text-xs px-2.5 py-0.5 rounded-full border ${
                            stock > 0
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border-rose-200'
                          }`}>
                            {stock > 0 ? `${stock} ədəd` : 'Bitib'}
                          </span>
                        </td>

                        {/* Specs Summary */}
                        <td className="py-3.5 px-4 max-w-[220px]">
                          <div className="flex flex-wrap gap-1">
                            {specKeys.length > 0 ? (
                              specKeys.slice(0, 3).map(k => (
                                <span key={k} className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded border border-slate-200 truncate max-w-[100px]">
                                  {k}: {p.attributes[k]}
                                </span>
                              ))
                            ) : (
                              <span className="text-xs text-slate-400 italic">Parametr yoxdur</span>
                            )}
                          </div>
                        </td>

                        {/* Status Toggle Button */}
                        <td className="py-3.5 px-4">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(p)}
                            className="cursor-pointer"
                          >
                            {p.is_active && stock > 0 ? (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-emerald-50 text-emerald-700 border border-emerald-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                Aktiv
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-rose-50 text-rose-700 border border-rose-200">
                                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                                Deaktiv / Bitib
                              </span>
                            )}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => setDrawerProduct(p)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 transition cursor-pointer border border-slate-200"
                              title="Təfərrüatlara bax"
                            >
                              <Eye className="w-3.5 h-3.5" />
                            </button>
                            <Link
                              href={`/products/${p.id}/edit`}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-[#4f533b] hover:text-white text-slate-600 transition cursor-pointer border border-slate-200"
                              title="Redaktə et"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </Link>
                            <button
                              type="button"
                              onClick={() => handleDelete(p.id, name)}
                              className="p-1.5 rounded-xl bg-slate-100 hover:bg-rose-600 hover:text-white text-slate-600 transition cursor-pointer border border-slate-200"
                              title="Sil"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredProducts.map(p => {
            const cashPrice = typeof p?.cash_price === 'number' ? p.cash_price : (parseFloat(String(p?.cash_price || 0)) || 0);
            const stock = typeof p?.stock === 'number' ? p.stock : (parseInt(String(p?.stock || 0), 10) || 0);
            const name = p?.name || p?.model_name || '—';
            const brand = p?.brand || 'GÖSTƏRİLMƏYİB';

            return (
              <div
                key={p.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs hover:border-[#4f533b] transition duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-40 bg-slate-50 rounded-xl p-3 border border-slate-200 flex items-center justify-center mb-3 relative overflow-hidden">
                    {p.image ? (
                      <img src={p.image} alt={name} className="max-h-full object-contain" />
                    ) : (
                      <Package className="w-8 h-8 text-slate-400" />
                    )}
                    {p.discount && (
                      <span className="absolute top-2 left-2 bg-[#4f533b] text-white text-xs px-2 py-0.5 rounded-md">
                        {p.discount}
                      </span>
                    )}
                  </div>

                  <span className="text-xs text-slate-500 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded ">
                    {brand}
                  </span>

                  <h3 className="text-sm text-slate-900 mt-1.5 line-clamp-2 leading-snug">
                    {name}
                  </h3>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2 mt-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-base text-slate-900 font-medium">{cashPrice.toFixed(2)} ₼</span>
                    <span className={`text-xs ${stock > 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                      Stok: {stock}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <Link
                      href={`/products/${p.id}/edit`}
                      className="flex-1 py-2 px-3 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Redaktə Et
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(p.id, name)}
                      className="p-2 rounded-xl bg-slate-100 hover:bg-rose-600 text-slate-600 hover:text-white border border-slate-200 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}



      {/* Slide-Over Quick Inspection Drawer */}
      <SlideOverDrawer
        isOpen={!!drawerProduct}
        onClose={() => setDrawerProduct(null)}
        title={drawerProduct?.name || (drawerProduct as any)?.model_name || 'Məhsul Təfərrüatları'}
        subtitle={`ID: ${drawerProduct?.id || '—'}`}
      >
        {drawerProduct && (
          <div className="space-y-4">
            {/* Product Image */}
            <div className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-center justify-center">
              {(drawerProduct as any).image ? (
                <img src={(drawerProduct as any).image} alt={drawerProduct.name} className="max-h-full object-contain" />
              ) : (
                <Package className="w-12 h-12 text-slate-300" />
              )}
            </div>

            {/* Info Badges */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Brend</span>
              <span className="font-medium text-slate-900">{drawerProduct.brand || 'Qeyd olunmayıb'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Kateqoriya</span>
              <span className="font-medium text-slate-900">{(drawerProduct as any).category_name || 'Qeyd olunmayıb'}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Nağd Qiymət</span>
              <span className="font-bold text-[#4f533b]">
                {(typeof (drawerProduct as any).cash_price === 'number' ? (drawerProduct as any).cash_price : parseFloat(String((drawerProduct as any).cash_price || (drawerProduct as any).price || 0))).toFixed(2)} ₼
              </span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Stok Qalığı</span>
              <span className={`font-medium ${((drawerProduct.stock || 0) > 0 ? 'text-emerald-600' : 'text-rose-600')}`}>
                {(drawerProduct.stock || 0) > 0 ? `${drawerProduct.stock} ədəd` : '❌ Tükənib'}
              </span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const p = drawerProduct;
                  setDrawerProduct(null);
                  handleOpenEditModal(p);
                }}
                className="w-full py-2.5 bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" /> Məhsulu Redaktə Et
              </button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
