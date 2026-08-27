'use client';

import React, { useState, useEffect } from 'react';
import {
  ArrowLeftRight,
  Plus,
  Search,
  Warehouse,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Layers,
  X,
  Check,
  Building2,
  FileText,
  Trash2,
} from '../../../components/HeroIconsHub';

export interface TransferItem {
  id: string;
  name: string;
  quantity: number;
}

export interface WarehouseTransfer {
  id: string;
  transfer_number: string;
  from_warehouse_id: string;
  from_warehouse_name: string;
  to_warehouse_id: string;
  to_warehouse_name: string;
  items: TransferItem[];
  status: 'completed' | 'pending' | 'cancelled';
  notes?: string;
  transfer_date: string;
  created_at?: string;
}

const INITIAL_TRANSFERS: WarehouseTransfer[] = [
  {
    id: 'tr-1',
    transfer_number: 'TR-2026-0042',
    from_warehouse_id: 'wh-main',
    from_warehouse_name: 'Mərkəzi Anbar (Dərnəgül)',
    to_warehouse_id: 'wh-narimanov',
    to_warehouse_name: 'Nərimanov Filialı Anbarı',
    items: [
      { id: 'prod-iphone15', name: 'iPhone 15 Pro 128GB Black Titanium', quantity: 5 },
      { id: 'prod-s24u', name: 'Samsung Galaxy S24 Ultra 512GB', quantity: 3 }
    ],
    status: 'completed',
    notes: 'Filial vitrini üçün təcili mədaxil',
    transfer_date: '2026-08-16'
  },
  {
    id: 'tr-2',
    transfer_number: 'TR-2026-0043',
    from_warehouse_id: 'wh-main',
    from_warehouse_name: 'Mərkəzi Anbar (Dərnəgül)',
    to_warehouse_id: 'wh-ganclik',
    to_warehouse_name: 'Gənclik Mall Filialı Anbarı',
    items: [
      { id: 'prod-macbook', name: 'MacBook Air 13 M3 8/256GB Midnight', quantity: 4 }
    ],
    status: 'pending',
    notes: 'Kuryer vasitəsilə göndərilib, qəbul gözlənilir',
    transfer_date: '2026-08-17'
  }
];

const WAREHOUSES = [
  { id: 'wh-main', name: 'Mərkəzi Anbar (Dərnəgül)' },
  { id: 'wh-narimanov', name: 'Nərimanov Filialı Anbarı' },
  { id: 'wh-28may', name: '28 May Filialı Anbarı' },
  { id: 'wh-ganclik', name: 'Gənclik Mall Filialı Anbarı' },
  { id: 'wh-sumqayit', name: 'Sumqayıt Filialı Anbarı' }
];

export default function WarehouseTransfersPage() {
  const [transfers, setTransfers] = useState<WarehouseTransfer[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [transferNumber, setTransferNumber] = useState('');
  const [fromWarehouseId, setFromWarehouseId] = useState('wh-main');
  const [toWarehouseId, setToWarehouseId] = useState('wh-narimanov');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().split('T')[0]);
  const [transferStatus, setTransferStatus] = useState<'completed' | 'pending'>('completed');
  const [notes, setNotes] = useState('');
  const [selectedItems, setSelectedItems] = useState<TransferItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  const loadData = async () => {
    try {
      const res = await fetch('/api/catalog/purchases/transfers', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setTransfers(data);
          localStorage.setItem('technomania_transfers', JSON.stringify(data));
        } else {
          const saved = localStorage.getItem('technomania_transfers');
          if (saved) setTransfers(JSON.parse(saved));
          else setTransfers(INITIAL_TRANSFERS);
        }
      }

      const prodRes = await fetch('/api/catalog/products', { cache: 'no-store' });
      if (prodRes.ok) {
        const prods = await prodRes.json();
        if (Array.isArray(prods)) setCatalogProducts(prods);
      }
    } catch (e) {
      const saved = localStorage.getItem('technomania_transfers');
      if (saved) setTransfers(JSON.parse(saved));
      else setTransfers(INITIAL_TRANSFERS);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const handleOpenModal = () => {
    setTransferNumber('TR-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
    setFromWarehouseId('wh-main');
    setToWarehouseId('wh-narimanov');
    setTransferDate(new Date().toISOString().split('T')[0]);
    setTransferStatus('completed');
    setNotes('');
    setSelectedItems([]);
    setProductSearch('');
    setIsModalOpen(true);
  };

  const handleAddItem = (prod: any) => {
    const existingIndex = selectedItems.findIndex(i => i.id === prod.id);
    if (existingIndex > -1) {
      const updated = [...selectedItems];
      updated[existingIndex].quantity += 1;
      setSelectedItems(updated);
    } else {
      setSelectedItems([...selectedItems, {
        id: prod.id,
        name: prod.name || prod.model_name || 'Məhsul',
        quantity: 1
      }]);
    }
  };

  const handleUpdateQty = (index: number, qty: number) => {
    if (qty < 1) return;
    const updated = [...selectedItems];
    updated[index].quantity = qty;
    setSelectedItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (fromWarehouseId === toWarehouseId) {
      alert('Çıxış və giriş anbarları eyni ola bilməz!');
      return;
    }
    if (selectedItems.length === 0) {
      alert('Zəhmət olmasa transfer üçün ən azı 1 məhsul seçin!');
      return;
    }

    const fromWh = WAREHOUSES.find(w => w.id === fromWarehouseId)?.name || 'Mərkəzi Anbar';
    const toWh = WAREHOUSES.find(w => w.id === toWarehouseId)?.name || 'Filial Anbarı';

    const newTransfer: WarehouseTransfer = {
      id: 'tr-' + Date.now(),
      transfer_number: transferNumber || ('TR-' + Date.now()),
      from_warehouse_id: fromWarehouseId,
      from_warehouse_name: fromWh,
      to_warehouse_id: toWarehouseId,
      to_warehouse_name: toWh,
      items: selectedItems,
      status: transferStatus,
      notes,
      transfer_date: transferDate,
      created_at: new Date().toISOString()
    };

    const updated = [newTransfer, ...transfers];
    setTransfers(updated);
    localStorage.setItem('technomania_transfers', JSON.stringify(updated));
    setIsModalOpen(false);

    try {
      await fetch('/api/catalog/purchases/transfers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTransfer)
      });
    } catch (e) {}
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'completed' ? 'pending' : 'completed';
    const updated = transfers.map(t => t.id === id ? { ...t, status: nextStatus as any } : t);
    setTransfers(updated);
    localStorage.setItem('technomania_transfers', JSON.stringify(updated));
    try {
      await fetch(`/api/catalog/purchases/transfers/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus })
      });
    } catch (e) {}
  };

  const filteredTransfers = transfers.filter(t =>
    t.transfer_number.toLowerCase().includes(search.toLowerCase()) ||
    t.from_warehouse_name.toLowerCase().includes(search.toLowerCase()) ||
    t.to_warehouse_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#f4f5f0] border border-[#4f533b]/20 flex items-center justify-center text-[#4f533b] shadow-xs">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Anbarlararası transfer və yerdəyişmə
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Mərkəzi anbar və filiallar arasında məhsul göndərişi, qəbul aktları və daxili hərəkətin uçotu
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni transfer əməliyyatı</span>
        </button>
      </div>

      {/* ── Search & Filter ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Transfer № və ya anbar adı ilə axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
          />
        </div>
      </div>

      {/* ── Transfers List ── */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Transferlər yüklənir...</div>
      ) : filteredTransfers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
          <ArrowLeftRight className="w-10 h-10 mx-auto text-slate-300" />
          <div className="text-sm font-bold text-slate-700">Heç bir transfer tapılmadı</div>
          <p className="text-xs text-slate-400">Filiallar arası yeni transfer yaradaraq məhsulları hərəkət etdirə bilərsiniz</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Transfer № & Tarix</th>
                  <th className="px-5 py-3.5">Çıxış Anbarı</th>
                  <th className="px-5 py-3.5">Giriş Anbarı</th>
                  <th className="px-5 py-3.5">Köçürülən Məhsullar</th>
                  <th className="px-5 py-3.5">Vəziyyət</th>
                  <th className="px-5 py-3.5 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransfers.map(tr => {
                  const totalUnits = tr.items?.reduce((a, b) => a + (b.quantity || 1), 0) || 0;
                  const isCompleted = tr.status === 'completed';

                  return (
                    <tr key={tr.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900">{tr.transfer_number}</div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {tr.transfer_date}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-rose-500" />
                          <span>{tr.from_warehouse_name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-1.5">
                          <Warehouse className="w-3.5 h-3.5 text-emerald-500" />
                          <span>{tr.to_warehouse_name}</span>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-700">{tr.items?.length || 0} növ məhsul</div>
                        <div className="text-[10px] text-slate-400">Cəmi: {totalUnits} ədəd</div>
                      </td>

                      <td className="px-5 py-4">
                        {isCompleted ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Təhvil alındı
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Yoldadır / Gözləyir
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          onClick={() => handleToggleStatus(tr.id, tr.status)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-[#f4f5f0] text-slate-700 hover:text-[#4f533b] text-[11px] font-bold transition cursor-pointer"
                        >
                          {isCompleted ? 'Gözləməyə qaytar' : 'Qəbulu təsdiqlə'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ NEW TRANSFER MODAL ══ */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-2xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#4f533b] to-[#3e4230] text-white">
              <div className="flex items-center gap-2.5">
                <ArrowLeftRight className="w-5 h-5 text-amber-300" />
                <h2 className="text-base font-black">Yeni Anbar Transferi</h2>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Çıxış Anbarı (Mənbə) *</label>
                  <select
                    value={fromWarehouseId}
                    onChange={e => setFromWarehouseId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold outline-none focus:border-[#4f533b]"
                  >
                    {WAREHOUSES.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Giriş Anbarı (Təyinat) *</label>
                  <select
                    value={toWarehouseId}
                    onChange={e => setToWarehouseId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold outline-none focus:border-[#4f533b]"
                  >
                    {WAREHOUSES.map(w => (
                      <option key={w.id} value={w.id}>{w.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Product Picker */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">Məhsul seçimi və miqdar</label>
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Transfer ediləcək məhsulu axtar..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                  />
                </div>

                {productSearch && (
                  <div className="border border-slate-200 rounded-xl p-2 max-h-36 overflow-y-auto space-y-1 bg-white shadow-xs">
                    {catalogProducts
                      .filter(p => (p.name || p.model_name || '').toLowerCase().includes(productSearch.toLowerCase()))
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleAddItem(p)}
                          className="p-2 rounded-lg hover:bg-[#f4f5f0] cursor-pointer flex items-center justify-between text-xs transition"
                        >
                          <span className="font-bold text-slate-800 truncate">{p.name || p.model_name}</span>
                          <span className="text-[10px] font-bold text-[#4f533b] bg-[#f4f5f0] px-2 py-0.5 rounded-full">+ Əlavə et</span>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Selected Items */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-700">Seçilmiş Məhsullar ({selectedItems.length})</div>
                {selectedItems.length === 0 ? (
                  <div className="p-4 text-center border border-dashed border-slate-200 rounded-xl text-xs text-slate-400">
                    Hələ heç bir məhsul seçilməyib
                  </div>
                ) : (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto">
                    {selectedItems.map((item, idx) => (
                      <div key={item.id + idx} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <span className="font-bold text-slate-800 flex-1 truncate">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={e => handleUpdateQty(idx, parseInt(e.target.value) || 1)}
                            className="w-16 bg-white border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 text-center"
                          />
                          <span className="text-slate-400">ədəd</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(idx)}
                            className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qeydlər</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Transfer səbəbi və ya kuryer məlumatı..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Transferi rəsmiləşdir</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
