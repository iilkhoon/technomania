'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Plus,
  Search,
  Download,
  Printer,
  Trash2,
  CheckCircle,
  Clock,
  Building2,
  CreditCard,
  Layers,
  X,
  FileText,
  DollarSign,
  AlertCircle,
  FileSpreadsheet,
  Calendar,
  Check,
  ChevronRight,
  Eye,
} from '../../../components/HeroIconsHub';
import { Supplier } from '../suppliers/page';

export interface InvoiceItem {
  id: string;
  name: string;
  brand?: string;
  sku?: string;
  image?: string;
  purchase_price: number; // Alış qiyməti (editable per invoice item)
  quantity: number;
  total: number;
}

export interface PurchaseInvoice {
  id: string;
  invoice_number: string;
  supplier_id: string;
  supplier_name: string;
  supplier_tax_number?: string;
  supplier_phone?: string;
  items: InvoiceItem[];
  total_amount: number;
  payment_status: 'paid' | 'pending' | 'partial';
  payment_method: 'cash' | 'bank' | 'pos';
  is_draft: boolean;
  notes?: string;
  invoice_date: string;
  created_at?: string;
}

const INITIAL_INVOICES: PurchaseInvoice[] = [
  {
    id: 'pi-1',
    invoice_number: 'QAI-2026-0089',
    supplier_id: 'sup-1',
    supplier_name: 'Apple Distribution FZE',
    supplier_tax_number: '1402938471',
    supplier_phone: '+994 12 404 88 00',
    items: [
      {
        id: 'prod-iphone15',
        name: 'iPhone 15 Pro 128GB Black Titanium',
        brand: 'Apple',
        purchase_price: 1850.00,
        quantity: 10,
        total: 18500.00
      },
      {
        id: 'prod-iphone15pm',
        name: 'iPhone 15 Pro Max 256GB Natural Titanium',
        brand: 'Apple',
        purchase_price: 2280.00,
        quantity: 5,
        total: 11400.00
      }
    ],
    total_amount: 29900.00,
    payment_status: 'paid',
    payment_method: 'bank',
    is_draft: false,
    notes: 'Rəsmi partiya mədaxil edildi',
    invoice_date: '2026-08-15'
  },
  {
    id: 'pi-2',
    invoice_number: 'QAI-2026-0090',
    supplier_id: 'sup-2',
    supplier_name: 'Samsung Electronics Caucasus',
    supplier_tax_number: '9900123456',
    supplier_phone: '+994 12 510 33 22',
    items: [
      {
        id: 'prod-s24u',
        name: 'Samsung Galaxy S24 Ultra 512GB Titanium Gray',
        brand: 'Samsung',
        purchase_price: 2050.00,
        quantity: 8,
        total: 16400.00
      }
    ],
    total_amount: 16400.00,
    payment_status: 'pending',
    payment_method: 'bank',
    is_draft: false,
    notes: 'Ödəniş 14 gün möhlətlə',
    invoice_date: '2026-08-17'
  }
];

export default function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [catalogProducts, setCatalogProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'draft'>('all');

  // Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [activePdfInvoice, setActivePdfInvoice] = useState<PurchaseInvoice | null>(null);

  // New Invoice Form
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentStatus, setPaymentStatus] = useState<'paid' | 'pending' | 'partial'>('paid');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bank' | 'pos'>('bank');
  const [isDraft, setIsDraft] = useState(false);
  const [notes, setNotes] = useState('');

  // Cart / Line items
  const [cartItems, setCartItems] = useState<InvoiceItem[]>([]);
  const [productSearch, setProductSearch] = useState('');

  // Load Invoices, Suppliers and Catalog Products
  const loadData = async () => {
    try {
      // 1. Invoices
      const invRes = await fetch('/api/catalog/purchases/invoices', { cache: 'no-store' });
      if (invRes.ok) {
        const invData = await invRes.json();
        if (Array.isArray(invData) && invData.length > 0) {
          setInvoices(invData);
          localStorage.setItem('technomania_purchase_invoices', JSON.stringify(invData));
        } else {
          const savedInv = localStorage.getItem('technomania_purchase_invoices');
          if (savedInv) setInvoices(JSON.parse(savedInv));
          else setInvoices(INITIAL_INVOICES);
        }
      }

      // 2. Suppliers
      const supRes = await fetch('/api/catalog/suppliers', { cache: 'no-store' });
      if (supRes.ok) {
        const supData = await supRes.json();
        if (Array.isArray(supData) && supData.length > 0) {
          setSuppliers(supData);
        }
      }

      // 3. Products
      const prodRes = await fetch('/api/catalog/products', { cache: 'no-store' });
      if (prodRes.ok) {
        const prodData = await prodRes.json();
        if (Array.isArray(prodData)) {
          setCatalogProducts(prodData);
        }
      }
    } catch (e) {
      const savedInv = localStorage.getItem('technomania_purchase_invoices');
      if (savedInv) setInvoices(JSON.parse(savedInv));
      else setInvoices(INITIAL_INVOICES);
    }
  };

  useEffect(() => {
    loadData().finally(() => setLoading(false));
  }, []);

  const openCreateModal = () => {
    setInvoiceNumber('QAI-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000));
    setSelectedSupplierId(suppliers[0]?.id || 'sup-1');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setPaymentStatus('paid');
    setPaymentMethod('bank');
    setIsDraft(false);
    setNotes('');
    setCartItems([]);
    setProductSearch('');
    setIsCreateModalOpen(true);
  };

  const handleAddProductToCart = (prod: any) => {
    const existingIndex = cartItems.findIndex(i => i.id === prod.id);
    const defaultCost = typeof prod.cost_price === 'number' && prod.cost_price > 0
      ? prod.cost_price
      : (typeof prod.cash_price === 'number' ? Math.round(prod.cash_price * 0.8) : 100);

    if (existingIndex > -1) {
      const updated = [...cartItems];
      updated[existingIndex].quantity += 1;
      updated[existingIndex].total = updated[existingIndex].quantity * updated[existingIndex].purchase_price;
      setCartItems(updated);
    } else {
      const newItem: InvoiceItem = {
        id: prod.id,
        name: prod.name || prod.model_name || 'Məhsul',
        brand: prod.brand || 'Ümumi',
        image: prod.image || '',
        purchase_price: defaultCost,
        quantity: 1,
        total: defaultCost
      };
      setCartItems([...cartItems, newItem]);
    }
  };

  const handleUpdateItemPrice = (index: number, newPrice: number) => {
    const updated = [...cartItems];
    updated[index].purchase_price = newPrice;
    updated[index].total = updated[index].quantity * newPrice;
    setCartItems(updated);
  };

  const handleUpdateItemQuantity = (index: number, newQty: number) => {
    if (newQty < 1) return;
    const updated = [...cartItems];
    updated[index].quantity = newQty;
    updated[index].total = newQty * updated[index].purchase_price;
    setCartItems(updated);
  };

  const handleRemoveCartItem = (index: number) => {
    setCartItems(cartItems.filter((_, i) => i !== index));
  };

  const grandTotal = cartItems.reduce((acc, item) => acc + item.total, 0);

  const handleSaveInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      alert('Zəhmət olmasa qaiməyə ən azı 1 məhsul əlavə edin!');
      return;
    }

    const currentSupplier = suppliers.find(s => s.id === selectedSupplierId) || suppliers[0];

    const newInvoice: PurchaseInvoice = {
      id: 'pi-' + Date.now(),
      invoice_number: invoiceNumber || ('QAI-' + Date.now()),
      supplier_id: selectedSupplierId,
      supplier_name: currentSupplier?.name || 'Təchizatçı',
      supplier_tax_number: currentSupplier?.tax_number || '',
      supplier_phone: currentSupplier?.phone || '',
      items: cartItems,
      total_amount: grandTotal,
      payment_status: paymentStatus,
      payment_method: paymentMethod,
      is_draft: isDraft,
      notes,
      invoice_date: invoiceDate,
      created_at: new Date().toISOString()
    };

    const updated = [newInvoice, ...invoices];
    setInvoices(updated);
    localStorage.setItem('technomania_purchase_invoices', JSON.stringify(updated));
    setIsCreateModalOpen(false);

    // If not draft, update local product stocks immediately
    if (!isDraft) {
      try {
        const localProdsStr = localStorage.getItem('technomania_local_products');
        if (localProdsStr) {
          const localProds = JSON.parse(localProdsStr);
          if (Array.isArray(localProds)) {
            const updatedProds = localProds.map(p => {
              const matchedItem = cartItems.find(item => item.id === p.id);
              if (matchedItem) {
                return {
                  ...p,
                  stock: (Number(p.stock) || 0) + (Number(matchedItem.quantity) || 0),
                  cost_price: matchedItem.purchase_price ? Number(matchedItem.purchase_price) : p.cost_price,
                };
              }
              return p;
            });
            localStorage.setItem('technomania_local_products', JSON.stringify(updatedProds));
            window.dispatchEvent(new Event('techno_products_updated'));
            window.dispatchEvent(new Event('storage'));
          }
        }
      } catch (e) {}
    }

    try {
      await fetch('/api/catalog/purchases/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newInvoice)
      });
      window.dispatchEvent(new Event('techno_products_updated'));
    } catch (e) {}
  };

  const handleDeleteInvoice = async (id: string) => {
    if (!confirm('Bu alış qaiməsini silmək istədiyinizdən əminsiniz?')) return;
    const updated = invoices.filter(i => i.id !== id);
    setInvoices(updated);
    localStorage.setItem('technomania_purchase_invoices', JSON.stringify(updated));
    try {
      await fetch(`/api/catalog/purchases/invoices/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const openPdfViewer = (inv: PurchaseInvoice) => {
    setActivePdfInvoice(inv);
    setIsPdfModalOpen(true);
  };

  const handlePrint = () => {
    window.print();
  };

  const filteredInvoices = invoices.filter(inv => {
    const matchSearch =
      inv.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
      inv.supplier_name.toLowerCase().includes(search.toLowerCase());

    if (!matchSearch) return false;

    if (filterStatus === 'paid') return inv.payment_status === 'paid' && !inv.is_draft;
    if (filterStatus === 'pending') return inv.payment_status === 'pending' && !inv.is_draft;
    if (filterStatus === 'draft') return inv.is_draft;

    return true;
  });

  const totalSpent = invoices.filter(i => !i.is_draft).reduce((a, b) => a + Number(b.total_amount || 0), 0);
  const paidCount = invoices.filter(i => i.payment_status === 'paid' && !i.is_draft).length;
  const pendingCount = invoices.filter(i => i.payment_status === 'pending' && !i.is_draft).length;
  const draftCount = invoices.filter(i => i.is_draft).length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#f4f5f0] border border-[#4f533b]/20 flex items-center justify-center text-[#4f533b] shadow-xs">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Alış qaimələri və mədaxil
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Təchizatçılardan daxil olan məhsul qaimələri, alış qiymətlərinin təyini və elektron PDF fakturalar
            </p>
          </div>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni alış qaiməsi yaz</span>
        </button>
      </div>

      {/* ── Stats Summary ── */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">Ümumi mədaxil dövriyyəsi</div>
          <div className="text-lg font-black text-slate-900 mt-0.5">
            {totalSpent.toLocaleString('az-AZ', { minimumFractionDigits: 2 })} ₼
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">Ödənilmiş qaimələr</div>
          <div className="text-lg font-black text-emerald-600 mt-0.5">{paidCount} qaimə</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">Ödəniş gözləyən</div>
          <div className="text-lg font-black text-amber-600 mt-0.5">{pendingCount} qaimə</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="text-[11px] font-bold text-slate-400">Qaralamalar (Taslak)</div>
          <div className="text-lg font-black text-slate-500 mt-0.5">{draftCount} qaralama</div>
        </div>
      </div>

      {/* ── Search and Filter Tabs ── */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Qaimə № və ya təchizatçı adı ilə axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'all' ? 'bg-[#4f533b] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Hamısı ({invoices.length})
          </button>
          <button
            onClick={() => setFilterStatus('paid')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'paid' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Ödənilib ({paidCount})
          </button>
          <button
            onClick={() => setFilterStatus('pending')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Gözləyir ({pendingCount})
          </button>
          <button
            onClick={() => setFilterStatus('draft')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filterStatus === 'draft' ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Qaralama ({draftCount})
          </button>
        </div>
      </div>

      {/* ── Invoices List Table ── */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Qaimələr yüklənir...</div>
      ) : filteredInvoices.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
          <Receipt className="w-10 h-10 mx-auto text-slate-300" />
          <div className="text-sm font-bold text-slate-700">Heç bir alış qaiməsi tapılmadı</div>
          <p className="text-xs text-slate-400">"Yeni alış qaiməsi yaz" düyməsinə klikləyərək mədaxil edə bilərsiniz</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="px-5 py-3.5">Qaimə № & Tarix</th>
                  <th className="px-5 py-3.5">Təchizatçı</th>
                  <th className="px-5 py-3.5">Məhsul çeşidi</th>
                  <th className="px-5 py-3.5">Məbləğ (₼)</th>
                  <th className="px-5 py-3.5">Ödəniş & Status</th>
                  <th className="px-5 py-3.5 text-right">Əməliyyatlar</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInvoices.map(inv => {
                  const itemCount = inv.items?.reduce((a, b) => a + (b.quantity || 1), 0) || 0;

                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition">
                      <td className="px-5 py-4">
                        <div className="font-mono font-bold text-slate-900 flex items-center gap-2">
                          <span>{inv.invoice_number}</span>
                          {inv.is_draft && (
                            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                              Qaralama
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                          <Calendar className="w-3 h-3" /> {inv.invoice_date}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-800 flex items-center gap-2">
                          <Building2 className="w-3.5 h-3.5 text-slate-400" />
                          <span>{inv.supplier_name}</span>
                        </div>
                        {inv.supplier_tax_number && (
                          <div className="text-[10px] text-slate-400 font-mono">VÖEN: {inv.supplier_tax_number}</div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-700">{inv.items?.length || 0} adda məhsul</div>
                        <div className="text-[10px] text-slate-400">Cəmi: {itemCount} ədəd</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-black text-slate-900 text-sm">
                          {Number(inv.total_amount || 0).toLocaleString('az-AZ', { minimumFractionDigits: 2 })} ₼
                        </div>
                        <div className="text-[10px] text-slate-400 capitalize">{inv.payment_method === 'bank' ? 'Bank köçürməsi' : (inv.payment_method === 'cash' ? 'Nağd' : 'POS')}</div>
                      </td>

                      <td className="px-5 py-4">
                        {inv.is_draft ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                            Taslak
                          </span>
                        ) : inv.payment_status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3 h-3" /> Ödənilib
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <Clock className="w-3 h-3" /> Gözləyir
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openPdfViewer(inv)}
                            className="p-2 rounded-xl bg-slate-100 hover:bg-[#f4f5f0] text-slate-600 hover:text-[#4f533b] transition cursor-pointer flex items-center gap-1 text-[11px] font-bold"
                            title="Elektron PDF Qaiməyə bax və yüklə"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>PDF Qaimə</span>
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(inv.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══ NEW PURCHASE INVOICE MODAL ══ */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-4xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-[#4f533b] to-[#3e4230] text-white">
              <div className="flex items-center gap-3">
                <Receipt className="w-5 h-5 text-amber-300" />
                <div>
                  <h2 className="text-base font-black">Yeni Alış Qaiməsi (Mədaxil)</h2>
                  <p className="text-xs text-white/80">Təchizatçını seçin, səbətə məhsulları əlavə edib alış qiymətini təyin edin</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSaveInvoice} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Header Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Təchizatçı şirkət *</label>
                  <select
                    value={selectedSupplierId}
                    onChange={e => setSelectedSupplierId(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-semibold outline-none focus:border-[#4f533b]"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>{s.name} {s.tax_number ? `(VÖEN: ${s.tax_number})` : ''}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qaimə nömrəsi *</label>
                  <input
                    type="text"
                    required
                    value={invoiceNumber}
                    onChange={e => setInvoiceNumber(e.target.value)}
                    placeholder="QAI-2026-0001"
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 font-mono font-bold outline-none focus:border-[#4f533b]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qaimə tarixi *</label>
                  <input
                    type="date"
                    required
                    value={invoiceDate}
                    onChange={e => setInvoiceDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>
              </div>

              {/* Product Selector & Cart Section */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left (Product Catalog Picker) */}
                <div className="lg:col-span-5 space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">Kataloqdan məhsul seç</span>
                    <span className="text-[10px] text-slate-400">{catalogProducts.length} məhsul</span>
                  </div>

                  <div className="relative">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Məhsul adı və ya brend..."
                      className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1 scrollbar-thin">
                    {catalogProducts
                      .filter(p =>
                        (p.name || p.model_name || '').toLowerCase().includes(productSearch.toLowerCase()) ||
                        (p.brand || '').toLowerCase().includes(productSearch.toLowerCase())
                      )
                      .slice(0, 20)
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => handleAddProductToCart(p)}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 hover:border-[#4f533b] hover:bg-[#f4f5f0]/40 transition flex items-center justify-between gap-2 cursor-pointer shadow-2xs"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-xs font-bold text-slate-800 block truncate">{p.name || p.model_name}</span>
                            <span className="text-[10px] text-slate-400 block">{p.brand}</span>
                          </div>
                          <button
                            type="button"
                            className="w-6 h-6 rounded-lg bg-[#4f533b] text-white flex items-center justify-center flex-shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Right (Invoice Cart & Price Editor) */}
                <div className="lg:col-span-7 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <span className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                      <span>Qaimə Səbəti</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#f4f5f0] text-[#4f533b]">
                        {cartItems.length} növ məhsul
                      </span>
                    </span>
                    <span className="text-xs font-black text-[#4f533b]">
                      Cəmi: {grandTotal.toLocaleString('az-AZ', { minimumFractionDigits: 2 })} ₼
                    </span>
                  </div>

                  {cartItems.length === 0 ? (
                    <div className="p-8 text-center border border-dashed border-slate-200 rounded-2xl text-xs text-slate-400">
                      Soldakı kataloqdan məhsul seçərək bura əlavə edin
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                      {cartItems.map((item, idx) => (
                        <div
                          key={item.id + idx}
                          className="bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs space-y-2"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-bold text-slate-800 truncate">{item.name}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveCartItem(idx)}
                              className="text-slate-400 hover:text-rose-600 p-1 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-2 items-center text-xs">
                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Alış qiyməti (₼)</label>
                              <input
                                type="number"
                                step="0.01"
                                value={item.purchase_price}
                                onChange={e => handleUpdateItemPrice(idx, parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 outline-none focus:border-[#4f533b]"
                              />
                            </div>

                            <div>
                              <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Say (ədəd)</label>
                              <input
                                type="number"
                                min="1"
                                value={item.quantity}
                                onChange={e => handleUpdateItemQuantity(idx, parseInt(e.target.value) || 1)}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 font-bold text-slate-800 outline-none focus:border-[#4f533b]"
                              />
                            </div>

                            <div className="text-right">
                              <label className="text-[10px] font-bold text-slate-400 block mb-0.5">Cəm</label>
                              <span className="font-black text-slate-900 text-xs">
                                {item.total.toLocaleString('az-AZ', { minimumFractionDigits: 2 })} ₼
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Payment and Draft Settings */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ödəniş vəziyyəti</label>
                  <select
                    value={paymentStatus}
                    onChange={e => setPaymentStatus(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                  >
                    <option value="paid">Ödənilib (Tam ödənilib)</option>
                    <option value="pending">Ödəniş gözləyir (Möhlətli)</option>
                    <option value="partial">Qismən ödənilib</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ödəniş metodu</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as any)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                  >
                    <option value="bank">Bank köçürməsi (Hesablaşma)</option>
                    <option value="cash">Nağd ödəniş</option>
                    <option value="pos">POS / Korporativ Kart</option>
                  </select>
                </div>

                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer mt-3">
                    <input
                      type="checkbox"
                      checked={isDraft}
                      onChange={e => setIsDraft(e.target.checked)}
                      className="w-4 h-4 text-[#4f533b] rounded border-slate-300 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-slate-800 block">Qaralama kimi saxla (Taslak)</span>
                      <span className="text-[10px] text-slate-400 block">Stok dərhal artırılmasın</span>
                    </div>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Əlavə qeydlər</label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Qaiməyə aid xüsusi qeyd və ya müqavilə şərti..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="text-xs font-black text-slate-900">
                  Ümumi Qaimə Məbləği: <span className="text-[#4f533b] text-base">{grandTotal.toLocaleString('az-AZ', { minimumFractionDigits: 2 })} ₼</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsCreateModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>Qaiməni təsdiqlə və yadda saxla</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ══ ELECTRONIC PDF FACTURA VIEWER & PRINT MODAL ══ */}
      {isPdfModalOpen && activePdfInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-3xl rounded-3xl border border-slate-200 shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
            {/* Modal Bar */}
            <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-300" />
                <span className="text-xs font-bold font-mono">Elektron Alış Fakturası (PDF) — {activePdfInvoice.invoice_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Çap et / PDF Yüklə</span>
                </button>
                <button
                  onClick={() => setIsPdfModalOpen(false)}
                  className="w-7 h-7 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Print / PDF Document Layout */}
            <div className="flex-1 overflow-y-auto p-8 space-y-6 text-slate-800 bg-white" id="printable-invoice">
              {/* Document Header */}
              <div className="flex items-start justify-between border-b border-slate-200 pb-6">
                <div>
                  <div className="text-xl font-black text-[#4f533b] tracking-tight">TechnoMania Electronics MMC</div>
                  <p className="text-xs text-slate-500 mt-1">Bakı şəhəri, M. Nərimanov küçəsi 15</p>
                  <p className="text-xs text-slate-500">VÖEN: 1300987654 | Tel: *6060 / +994 12 555 60 60</p>
                  <p className="text-xs text-slate-500">E-poçt: invoice@techno-mania.az</p>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-[#f4f5f0] border border-[#4f533b]/20 px-3 py-1 rounded-xl text-xs font-black text-[#4f533b] font-mono">
                    ALIŞ QAİMƏSİ
                  </div>
                  <div className="text-xs font-bold font-mono text-slate-800 mt-2">№ {activePdfInvoice.invoice_number}</div>
                  <div className="text-xs text-slate-500 mt-0.5">Tarix: {activePdfInvoice.invoice_date}</div>
                </div>
              </div>

              {/* Parties Info Grid */}
              <div className="grid grid-cols-2 gap-6 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
                <div>
                  <span className="font-bold text-slate-400 block mb-1">TƏCHİZATÇI:</span>
                  <div className="font-bold text-slate-900 text-sm">{activePdfInvoice.supplier_name}</div>
                  {activePdfInvoice.supplier_tax_number && (
                    <div className="text-slate-600 mt-0.5 font-mono">VÖEN: {activePdfInvoice.supplier_tax_number}</div>
                  )}
                  {activePdfInvoice.supplier_phone && (
                    <div className="text-slate-600 mt-0.5">Tel: {activePdfInvoice.supplier_phone}</div>
                  )}
                </div>

                <div>
                  <span className="font-bold text-slate-400 block mb-1">ÖDƏNİŞ ŞƏRTLƏRİ:</span>
                  <div className="font-bold text-slate-900">
                    Vəziyyət: {activePdfInvoice.payment_status === 'paid' ? 'Ödənilib' : 'Ödəniş gözləyir'}
                  </div>
                  <div className="text-slate-600 mt-0.5">
                    Metod: {activePdfInvoice.payment_method === 'bank' ? 'Bank köçürməsi' : (activePdfInvoice.payment_method === 'cash' ? 'Nağd' : 'POS')}
                  </div>
                </div>
              </div>

              {/* Items Table */}
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">№</th>
                    <th className="p-3">Məhsulun adı</th>
                    <th className="p-3 text-center">Say</th>
                    <th className="p-3 text-right">Alış Qiyməti (₼)</th>
                    <th className="p-3 text-right">Cəmi Məbləğ (₼)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {activePdfInvoice.items?.map((item, idx) => (
                    <tr key={idx}>
                      <td className="p-3 text-slate-500 font-mono">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-800">{item.name}</td>
                      <td className="p-3 text-center font-bold text-slate-700">{item.quantity} ədəd</td>
                      <td className="p-3 text-right font-mono font-semibold">{Number(item.purchase_price).toFixed(2)}</td>
                      <td className="p-3 text-right font-mono font-bold">{Number(item.total).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Total Calculation */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs text-right">
                  <div className="flex justify-between text-slate-600">
                    <span>Yekun Məbləğ:</span>
                    <span className="font-black text-slate-900 text-sm">
                      {Number(activePdfInvoice.total_amount).toLocaleString('az-AZ', { minimumFractionDigits: 2 })} ₼
                    </span>
                  </div>
                </div>
              </div>

              {/* Signatures & Stamp Area */}
              <div className="pt-12 grid grid-cols-2 gap-12 text-xs border-t border-slate-200 mt-12">
                <div className="space-y-6">
                  <span className="font-bold text-slate-700 block">Təhvil verdi (Təchizatçı nümayəndəsi):</span>
                  <div className="border-b border-slate-400 w-48 pb-1 text-slate-400 italic">İmza: _________________</div>
                </div>

                <div className="space-y-6 text-right">
                  <span className="font-bold text-slate-700 block">Təhvil aldı (Məsul anbardar):</span>
                  <div className="border-b border-slate-400 w-48 ml-auto pb-1 text-slate-400 italic">İmza / Möhür: _________</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
