'use client';

import React, { useState, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Printer,
  X,
  Eye,
  Download,
  FileText,
  Trash2,
  AlertCircle,
} from '../../components/HeroIconsHub';
import SlideOverDrawer from '../../components/SlideOverDrawer';
import { exportToCSV, printOrderInvoice } from '../../lib/exportUtils';
import { addAuditLog } from '../../lib/auditLogger';
import { showToast } from '../../lib/toastStore';

interface OrderItem {
  name: string;
  price: number;
  qty: number;
}

interface Order {
  id: string;
  customer: string;
  phone: string;
  address: string;
  total: number;
  status: 'Yeni' | 'Təsdiqləndi' | 'Kuryerdə' | 'Təhvil verildi' | 'Ləğv edildi';
  date: string;
  payment: string;
  items: OrderItem[];
  notes?: string;
  order_type?: string;
  fin?: string;
  id_card?: string;
  promo_code?: string;
  installment_months?: number;
  monthly_payment?: number;
}

export default function OrdersPage() {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [drawerOrder, setDrawerOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      const res = await fetch('/api/catalog/orders', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setOrders(data);
          try { localStorage.setItem('techno_erp_orders', JSON.stringify(data)); } catch (e) {}
          return;
        }
      }
    } catch (e) {}

    // LocalStorage Fallback
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('techno_erp_orders') || localStorage.getItem('technomania_orders');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) setOrders(parsed);
        } catch (e) {}
      }
    }
  };

  useEffect(() => {
    loadOrders();
    window.addEventListener('techno_orders_updated', loadOrders);
    window.addEventListener('storage', loadOrders);
    return () => {
      window.removeEventListener('techno_orders_updated', loadOrders);
      window.removeEventListener('storage', loadOrders);
    };
  }, []);

  const saveOrdersList = (newOrders: Order[]) => {
    setOrders(newOrders);
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('techno_erp_orders', JSON.stringify(newOrders));
        localStorage.setItem('technomania_orders', JSON.stringify(newOrders));
      } catch (e) {}
    }
  };

  const handleDeleteOrder = async (orderId: string) => {
    if (!confirm(`Sifariş ${orderId} həmişəlik silinsin?`)) return;

    try {
      await fetch(`/api/catalog/orders/${orderId}`, { method: 'DELETE' });
    } catch (e) {}

    const updated = orders.filter(o => o.id !== orderId);
    saveOrdersList(updated);

    if (selectedOrder?.id === orderId) setSelectedOrder(null);
    if (drawerOrder?.id === orderId) setDrawerOrder(null);

    addAuditLog('delete', 'order', `Sifariş ${orderId} bazadan silindi`);
    showToast(`Sifariş ${orderId} uğurla silindi`, 'success');
  };

  const handleClearAllOrders = async () => {
    if (!confirm('Bütün sifarişlər bazadan tamamilə silinsin? Bu əməliyyat geri qaytarıla bilməz!')) return;

    try {
      await fetch('/api/catalog/orders', { method: 'DELETE' });
    } catch (e) {}

    saveOrdersList([]);
    setSelectedOrder(null);
    setDrawerOrder(null);

    addAuditLog('delete', 'order', 'Bütün sifarişlər bazadan təmizləndi');
    showToast('Bütün sifarişlər uğurla silindi', 'success');
  };

  const handleUpdateStatus = async (orderId: string, newStatus: Order['status']) => {
    const updated = orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o);
    saveOrdersList(updated);

    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }
    if (drawerOrder && drawerOrder.id === orderId) {
      setDrawerOrder(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      await fetch(`/api/catalog/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
    } catch (e) {}

    const prevOrder = orders.find(o => o.id === orderId);
    addAuditLog(
      'order_status_update',
      'order',
      `Sifariş #${orderId} (${prevOrder?.customer || 'Müştəri'}) statusu "${prevOrder?.status || 'Bilinməyən'}" -> "${newStatus}" olaraq dəyişdirildi`,
      {
        entityId: orderId,
        entityName: prevOrder?.customer ? `Sifariş #${orderId} (${prevOrder.customer})` : `Sifariş #${orderId}`,
        oldValues: { status: prevOrder?.status, total: prevOrder?.total, customer: prevOrder?.customer },
        newValues: { status: newStatus, total: prevOrder?.total, customer: prevOrder?.customer },
      }
    );
    showToast(`Sifariş ${orderId} statusu "${newStatus}" edildi`, 'info');
  };

  const handlePrintInvoice = () => {
    if (selectedOrder) {
      printOrderInvoice(selectedOrder);
      addAuditLog('pdf_print', 'order', `Sifariş ${selectedOrder.id} üçün PDF faktura çap edildi`);
      showToast(`Sifariş ${selectedOrder.id} üçün PDF faktura generasiya edildi`, 'success');
    }
  };

  const getStatusBadge = (status: Order['status']) => {
    switch (status) {
      case 'Yeni':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-200">⚡ Yeni Sifariş</span>;
      case 'Təsdiqləndi':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-200">✓ Təsdiqləndi</span>;
      case 'Kuryerdə':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">🚚 Kuryerdə</span>;
      case 'Təhvil verildi':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">✅ Təhvil Verildi</span>;
      case 'Ləğv edildi':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">❌ Ləğv Edildi</span>;
      default:
        return null;
    }
  };

  const filteredOrders = orders.filter(o => {
    const matchesStatus = filterStatus === 'all' || o.status === filterStatus;
    const matchesSearch = o.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          o.phone.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleExportOrdersExcel = () => {
    const headers = ['Sifariş №', 'Müştəri Adı', 'Telefon', 'Ünvan', 'Məbləğ (₼)', 'Status', 'Ödəniş Üsulu', 'Tarix'];
    const rows = filteredOrders.map(o => [
      o.id,
      o.customer || '',
      o.phone || '',
      o.address || '',
      typeof o.total === 'number' ? o.total.toFixed(2) : String(o.total || 0),
      o.status || '',
      o.payment || '',
      o.date || '',
    ]);
    exportToCSV('Sifarisler_Hesabati', headers, rows);
    addAuditLog('excel_export', 'order', `Sifarişlər siyahısı (${rows.length} ədəd) Excel-ə çıxarıldı`);
  };

  return (
    <div className="space-y-5 text-slate-700">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <ShoppingCart className="w-5 h-5 text-[#4f533b]" /> Sifarişlərin idarə edilməsi
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md">
              {orders.length} sifariş
            </span>
          </div>
          <p className="text-sm text-slate-500">Veb saytdan daxil olan onlayn, nağd və hissə-hissə kredit sifarişlərini idarə edin.</p>
        </div>

        <div className="flex items-center gap-2">
          {orders.length > 0 && (
            <button
              type="button"
              onClick={handleClearAllOrders}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-sm px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer active:scale-95 font-medium flex-shrink-0"
              title="Bütün sifarişləri həmişəlik sil"
            >
              <Trash2 className="w-4 h-4 text-rose-600" /> Bütün Sifarişləri Sil
            </button>
          )}

          <button
            type="button"
            onClick={handleExportOrdersExcel}
            className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-sm px-3.5 py-2.5 rounded-xl transition flex items-center gap-2 cursor-pointer active:scale-95 font-medium flex-shrink-0"
          >
            <Download className="w-4 h-4 text-emerald-600" /> Excel-ə çıxart
          </button>
        </div>
      </div>

      {/* ── Filters & Search ── */}
      <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Sifariş №, müştəri adı..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto scrollbar-hide">
          {['all', 'Yeni', 'Təsdiqləndi', 'Kuryerdə', 'Təhvil verildi', 'Ləğv edildi'].map(st => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer whitespace-nowrap border ${
                filterStatus === st
                  ? 'bg-[#4f533b] text-white border-[#4f533b]'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {st === 'all' ? 'Bütün sifarişlər' : st}
            </button>
          ))}
        </div>
      </div>

      {/* ── Orders Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-16 px-4 text-center space-y-3">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <ShoppingCart className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Sifariş Tapılmadı</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto">
              Hələ ki heç bir sifariş daxil olmayıb. Veb saytdan daxil olan bütün yeni sifarişlər burada real vaxt rejimində göstəriləcək.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500 tracking-wider">
                  <th className="py-3.5 px-4">Sifariş №</th>
                  <th className="py-3.5 px-4">Müştəri və əlaqə</th>
                  <th className="py-3.5 px-4">Məhsullar</th>
                  <th className="py-3.5 px-4">Ödəniş üsulu</th>
                  <th className="py-3.5 px-4">Məbləğ (₼)</th>
                  <th className="py-3.5 px-4">Tarix</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredOrders.map(ord => (
                  <tr key={ord.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-3.5 px-4 font-mono font-medium text-[#4f533b]">
                      <span>{ord.id}</span>
                      {ord.order_type === 'Bir kliklə al' && (
                        <span className="block mt-0.5 text-[10px] font-black text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded-md w-fit">
                          ⚡ 1 Kliklə Al
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-slate-900 font-bold block">{ord.customer}</span>
                      <span className="text-xs text-slate-500 font-mono font-semibold block">{ord.phone}</span>
                      {ord.fin && (
                        <span className="text-[11px] font-mono text-slate-400">FİN: {ord.fin}</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 max-w-[200px] truncate">
                      {Array.isArray(ord.items) ? ord.items.map(i => i.name).join(', ') : ''}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-md text-xs">
                        {ord.payment}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-medium text-slate-900">
                      {typeof ord.total === 'number' ? ord.total.toFixed(2) : String(ord.total || 0)} ₼
                    </td>
                    <td className="py-3.5 px-4 text-slate-400 text-xs">
                      {ord.date}
                    </td>
                    <td className="py-3.5 px-4">
                      {getStatusBadge(ord.status)}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setDrawerOrder(ord)}
                          className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 p-1.5 rounded-xl text-xs transition cursor-pointer"
                          title="Tez Baxış Paneli"
                        >
                          <Eye className="w-3.5 h-3.5 text-slate-600" />
                        </button>
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="bg-slate-100 hover:bg-[#4f533b] hover:text-white text-slate-700 border border-slate-200 px-3 py-1.5 rounded-xl text-xs transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Detallar
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(ord.id)}
                          className="bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 border border-rose-200 p-1.5 rounded-xl text-xs transition cursor-pointer"
                          title="Sifarişi Sil"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Order Detail Modal ── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setSelectedOrder(null)}>
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-2xl p-6 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-medium text-slate-900 font-mono">{selectedOrder.id}</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
                <p className="text-xs text-slate-400">{selectedOrder.date}</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrintInvoice}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer transition"
                >
                  <Printer className="w-4 h-4" /> Faktura Çap Et
                </button>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-xl bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 border border-slate-200 p-4 rounded-xl text-xs">
              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Müştəri Məlumatı</span>
                <p className="font-bold text-slate-900 text-sm">{selectedOrder.customer}</p>
                <p className="text-slate-700 font-mono font-semibold">📞 {selectedOrder.phone}</p>
                {selectedOrder.fin && (
                  <p className="text-slate-600 font-mono">🔑 FİN Kod: <strong className="text-slate-900">{selectedOrder.fin}</strong></p>
                )}
                {selectedOrder.id_card && (
                  <p className="text-slate-600 font-mono">🪪 Ş/V Seriya: <strong className="text-slate-900">{selectedOrder.id_card}</strong></p>
                )}
              </div>

              <div className="space-y-1.5">
                <span className="text-slate-400 text-[10px] font-bold block uppercase tracking-wider">Ödəniş və Sifariş Detalları</span>
                <p className="text-slate-700">📍 Ünvan: <span className="font-medium">{selectedOrder.address}</span></p>
                <p className="text-slate-700">💳 Ödəniş: <span className="text-[#4f533b] font-bold">{selectedOrder.payment}</span></p>
                {selectedOrder.order_type && (
                  <p className="text-slate-700">🏷️ Sifariş növü: <span className="font-bold text-amber-800">{selectedOrder.order_type}</span></p>
                )}
                {selectedOrder.promo_code && (
                  <p className="text-emerald-700 font-bold">🎟️ Promo kod: {selectedOrder.promo_code}</p>
                )}
                {selectedOrder.notes && (
                  <p className="text-slate-500 italic mt-1 bg-white p-2 rounded border border-slate-200">📝 {selectedOrder.notes}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-xs text-slate-500 tracking-wider">Sifariş Olunan Məhsullar</h4>
              <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200">
                {selectedOrder.items.map((item, idx) => {
                  const itmPrice = typeof item.price === 'number' ? item.price : (parseFloat(String(item.price || 0)) || 0);
                  return (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <span className="text-slate-800">{item.name} x {item.qty}</span>
                      <span className="font-medium text-[#4f533b]">{itmPrice.toFixed(2)} ₼</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-100">
              <label className="text-xs text-slate-600 block">Sifariş Statusunu Dəyişin:</label>
              <div className="flex flex-wrap gap-2">
                {(['Yeni', 'Təsdiqləndi', 'Kuryerdə', 'Təhvil verildi', 'Ləğv edildi'] as Order['status'][]).map(s => (
                  <button
                    key={s}
                    onClick={() => handleUpdateStatus(selectedOrder.id, s)}
                    className={`px-3 py-1.5 rounded-xl text-xs transition cursor-pointer border ${
                      selectedOrder.status === s
                        ? 'bg-[#4f533b] text-white border-[#4f533b]'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Slide-Over Quick Inspection Drawer */}
      <SlideOverDrawer
        isOpen={!!drawerOrder}
        onClose={() => setDrawerOrder(null)}
        title={`Sifariş ${drawerOrder?.id || ''}`}
        subtitle={`Tarix: ${drawerOrder?.date || ''}`}
      >
        {drawerOrder && (
          <div className="space-y-4">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
              <span className="text-slate-400 text-[10px] font-bold block">Müştəri</span>
              <p className="font-bold text-slate-900 text-sm">{drawerOrder.customer}</p>
              <p className="text-slate-600 font-mono">{drawerOrder.phone}</p>
              <p className="text-slate-500 text-xs mt-1">📍 {drawerOrder.address}</p>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Status</span>
              <span>{getStatusBadge(drawerOrder.status)}</span>
            </div>

            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <span className="text-slate-500">Ödəniş Üsulu</span>
              <span className="font-medium text-slate-800">{drawerOrder.payment}</span>
            </div>

            <div className="space-y-2">
              <span className="text-slate-500 text-xs block">Məhsullar ({drawerOrder.items.length})</span>
              <div className="bg-slate-50 border border-slate-200 rounded-xl divide-y divide-slate-200">
                {drawerOrder.items.map((it, idx) => {
                  const rowPrice = typeof it.price === 'number' ? it.price : (parseFloat(String(it.price || 0)) || 0);
                  const rowQty = typeof it.qty === 'number' ? it.qty : (parseInt(String(it.qty || 1), 10) || 1);
                  return (
                    <div key={idx} className="p-3 flex items-center justify-between">
                      <span className="font-medium text-slate-900">{it.name} x {rowQty}</span>
                      <span className="font-bold text-[#4f533b]">{(rowPrice * rowQty).toFixed(2)} ₼</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-3.5 bg-[#4f533b]/10 border border-[#4f533b]/20 rounded-xl flex items-center justify-between">
              <span className="font-bold text-slate-900">Yekun Məbləğ</span>
              <span className="font-extrabold text-base text-[#4f533b]">
                {(typeof drawerOrder.total === 'number' ? drawerOrder.total : (parseFloat(String(drawerOrder.total || 0)) || 0)).toFixed(2)} ₼
              </span>
            </div>

            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  printOrderInvoice(drawerOrder);
                }}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer className="w-4 h-4" /> Faktura Çap Et
              </button>
            </div>
          </div>
        )}
      </SlideOverDrawer>
    </div>
  );
}
