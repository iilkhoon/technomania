'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Globe,
  FileText,
  CreditCard,
  CheckCircle,
  XCircle,
  X,
  Layers,
  ArrowRight,
} from '../../../components/HeroIconsHub';
import Link from 'next/link';

export interface Supplier {
  id: string;
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  address?: string;
  country?: string;
  tax_number?: string;
  bank_details?: string;
  notes?: string;
  status?: 'active' | 'inactive';
  created_at?: string;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: 'sup-1',
    name: 'Apple Distribution FZE',
    contact_person: 'Elmir Məmmədov',
    phone: '+994 12 404 88 00',
    email: 'supply@appledist.az',
    address: 'Bakı şəhəri, Nobel prospekti 15, Azure Business Center',
    country: 'BƏƏ / Azərbaycan',
    tax_number: '1402938471',
    bank_details: 'Kapital Bank ASC, AZ34NABZ01350100000000123456',
    notes: 'Rəsmi iPhone, iPad, MacBook təchizatı',
    status: 'active'
  },
  {
    id: 'sup-2',
    name: 'Samsung Electronics Caucasus',
    contact_person: 'Rəşad Əliyev',
    phone: '+994 12 510 33 22',
    email: 'orders@samsung-caucasus.com',
    address: 'Bakı şəhəri, Tbilisi prospekti 49/C',
    country: 'Cənubi Koreya / Azərbaycan',
    tax_number: '9900123456',
    bank_details: 'PAŞA Bank ASC, AZ89PASA00000000000000987654',
    notes: 'Smartfon, planşet və məişət texnikası',
    status: 'active'
  },
  {
    id: 'sup-3',
    name: 'Xiaomi Tech Official Partner',
    contact_person: 'Tural Quliyev',
    phone: '+994 50 222 11 00',
    email: 'b2b@xiaomi-az.com',
    address: 'Bakı şəhəri, Dərnəgül şosesi 102',
    country: 'Çin / Azərbaycan',
    tax_number: '1700543210',
    bank_details: 'ABB Bank, AZ12IBAZ00000000000000554433',
    notes: 'Smartfonlar, robot tozsoranlar və aksessuarlar',
    status: 'active'
  }
];

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<Omit<Supplier, 'id'>>({
    name: '',
    contact_person: '',
    phone: '+994 ',
    email: '',
    address: '',
    country: 'Azərbaycan',
    tax_number: '',
    bank_details: '',
    notes: '',
    status: 'active'
  });

  const loadSuppliers = async () => {
    try {
      const res = await fetch('/api/catalog/suppliers', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setSuppliers(data);
          localStorage.setItem('technomania_suppliers', JSON.stringify(data));
          return;
        }
      }
    } catch (e) {}

    const saved = localStorage.getItem('technomania_suppliers');
    if (saved) {
      try {
        setSuppliers(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setSuppliers(INITIAL_SUPPLIERS);
    localStorage.setItem('technomania_suppliers', JSON.stringify(INITIAL_SUPPLIERS));
  };

  useEffect(() => {
    loadSuppliers().finally(() => setLoading(false));
  }, []);

  const saveSuppliersList = async (list: Supplier[]) => {
    setSuppliers(list);
    localStorage.setItem('technomania_suppliers', JSON.stringify(list));
  };

  const handleOpenAddModal = () => {
    setEditingSupplier(null);
    setFormData({
      name: '',
      contact_person: '',
      phone: '+994 ',
      email: '',
      address: '',
      country: 'Azərbaycan',
      tax_number: '',
      bank_details: '',
      notes: '',
      status: 'active'
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setFormData({
      name: supplier.name,
      contact_person: supplier.contact_person || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
      country: supplier.country || 'Azərbaycan',
      tax_number: supplier.tax_number || '',
      bank_details: supplier.bank_details || '',
      notes: supplier.notes || '',
      status: supplier.status || 'active'
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const supplierPayload: Supplier = {
      id: editingSupplier?.id || 'sup-' + Date.now(),
      ...formData
    };

    let updated: Supplier[];
    if (editingSupplier) {
      updated = suppliers.map(s => s.id === editingSupplier.id ? supplierPayload : s);
    } else {
      updated = [supplierPayload, ...suppliers];
    }

    await saveSuppliersList(updated);
    setIsModalOpen(false);

    try {
      await fetch('/api/catalog/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(supplierPayload)
      });
    } catch (e) {}
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu təchizatçını bazadan silmək istədiyinizdən əminsiniz?')) return;
    const updated = suppliers.filter(s => s.id !== id);
    await saveSuppliersList(updated);
    try {
      await fetch(`/api/catalog/suppliers/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const filteredSuppliers = suppliers.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.contact_person || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.phone || '').toLowerCase().includes(search.toLowerCase()) ||
    (s.tax_number || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = suppliers.filter(s => s.status !== 'inactive').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#f4f5f0] border border-[#4f533b]/20 flex items-center justify-center text-[#4f533b] shadow-xs">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Təchizatçılar və partnyorlar
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Rəsmi distribütorlar, xarici idxalçılar və topdansatış tərəfdaşların vahid reyestri
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 self-start md:self-auto">
          <Link
            href="/purchases/invoices"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
          >
            <span>Alış qaimələrinə keç</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni təchizatçı əlavə et</span>
          </button>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">Ümumi təchizatçılar</div>
            <div className="text-lg font-black text-slate-800">{suppliers.length} şirkət</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">Aktiv müqavilələr</div>
            <div className="text-lg font-black text-emerald-600">{activeCount} aktiv</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">Beynəlxalq / Yerli</div>
            <div className="text-lg font-black text-slate-800">Qlobal təchizat şəbəkəsi</div>
          </div>
        </div>
      </div>

      {/* ── Search Bar ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Təchizatçı adı, əlaqədar şəxs, telefon və ya VÖEN ilə axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
          />
        </div>
      </div>

      {/* ── Suppliers Grid ── */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Təchizatçılar yüklənir...</div>
      ) : filteredSuppliers.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
          <Building2 className="w-10 h-10 mx-auto text-slate-300" />
          <div className="text-sm font-bold text-slate-700">Təchizatçı tapılmadı</div>
          <p className="text-xs text-slate-400">Yeni partnyor əlavə edərək alış qaimələrində seçə bilərsiniz</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredSuppliers.map(supplier => {
            const isActive = supplier.status !== 'inactive';

            return (
              <div
                key={supplier.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 transition-all shadow-xs flex flex-col justify-between hover:border-slate-300 space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#f4f5f0] border border-[#4f533b]/20 flex items-center justify-center text-[#4f533b] flex-shrink-0">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900 leading-tight">{supplier.name}</h3>
                        {supplier.contact_person && (
                          <div className="text-xs text-slate-500 font-medium mt-0.5">{supplier.contact_person}</div>
                        )}
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {isActive ? 'Aktiv' : 'Passiv'}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {supplier.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="font-semibold">{supplier.phone}</span>
                      </div>
                    )}
                    {supplier.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{supplier.email}</span>
                      </div>
                    )}
                    {supplier.address && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight text-slate-500">{supplier.address}</span>
                      </div>
                    )}
                    {supplier.tax_number && (
                      <div className="flex items-center gap-2 pt-1 border-t border-slate-200/60 mt-1">
                        <FileText className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                        <span className="text-[11px] font-mono text-slate-700">VÖEN: {supplier.tax_number}</span>
                      </div>
                    )}
                  </div>

                  {supplier.notes && (
                    <p className="text-[11px] text-slate-400 italic">
                      Qeyd: {supplier.notes}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400">{supplier.country || 'Azərbaycan'}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(supplier)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#4f533b] hover:bg-slate-100 transition cursor-pointer"
                      title="Redaktə et"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(supplier.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                      title="Sil"
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

      {/* ── Add / Edit Modal ── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">
                {editingSupplier ? 'Təchizatçını redaktə et' : 'Yeni təchizatçı əlavə et'}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Şirkət / Təchizatçı adı *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Məs: Apple Distribution FZE"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Əlaqədar şəxs</label>
                  <input
                    type="text"
                    value={formData.contact_person}
                    onChange={e => setFormData({ ...formData, contact_person: e.target.value })}
                    placeholder="Məs: Elmir Məmmədov"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Telefon nömrəsi</label>
                  <input
                    type="text"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="+994 50 000 00 00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-poçt ünvanı</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    placeholder="supply@company.az"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Ölkə / Şəhər</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={e => setFormData({ ...formData, country: e.target.value })}
                    placeholder="Azərbaycan / Bakı"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">VÖEN</label>
                  <input
                    type="text"
                    value={formData.tax_number}
                    onChange={e => setFormData({ ...formData, tax_number: e.target.value })}
                    placeholder="1402938471"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  >
                    <option value="active">Aktiv tərəfdaş</option>
                    <option value="inactive">Passiv</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Faktiki ünvan</label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Bakı ş., Nobel pr. 15, Azure BC"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bank rekvizitləri / IBAN</label>
                <textarea
                  rows={2}
                  value={formData.bank_details}
                  onChange={e => setFormData({ ...formData, bank_details: e.target.value })}
                  placeholder="Bank adı, filial kodu, IBAN hesabı..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Qeydlər və şərtlər</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Təchizat müddəti, zəmanət öhdəliyi və s."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
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
                  className="px-5 py-2 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Yadda saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
