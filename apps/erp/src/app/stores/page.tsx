'use client';

import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Plus,
  Edit2,
  Trash2,
  Phone,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Building2,
  Search,
  X,
  Save,
  Globe,
} from '../../components/HeroIconsHub';
import { StoreBranch, getStoreBranches, saveStoreBranches, fetchStoreBranchesApi } from '../../data/storesData';

export default function StoresManagementPage() {
  const [stores, setStores] = useState<StoreBranch[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreBranch | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<StoreBranch, 'id'>>({
    name: '',
    address: '',
    phone: '',
    hours: '09:00 - 21:00 (Hər gün)',
    mapEmbedUrl: '',
    googleMapsUrl: '',
    isMain: false,
    status: 'active',
  });

  useEffect(() => {
    fetchStoreBranchesApi().then(data => setStores(data));
  }, []);

  const handleOpenAddModal = () => {
    setEditingStore(null);
    setFormData({
      name: '',
      address: '',
      phone: '+994 12 555 00 00',
      hours: '09:00 - 21:00 (Hər gün)',
      mapEmbedUrl: '',
      googleMapsUrl: '',
      isMain: false,
      status: 'active',
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (store: StoreBranch) => {
    setEditingStore(store);
    setFormData({
      name: store.name,
      address: store.address,
      phone: store.phone,
      hours: store.hours,
      mapEmbedUrl: store.mapEmbedUrl || '',
      googleMapsUrl: store.googleMapsUrl || '',
      isMain: store.isMain || false,
      status: store.status,
    });
    setIsModalOpen(true);
  };

  const handleSaveStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.address.trim()) return;

    let updated: StoreBranch[];
    if (editingStore) {
      updated = stores.map(s => s.id === editingStore.id ? { ...s, ...formData } : s);
    } else {
      const newStore: StoreBranch = {
        id: `store-${Date.now()}`,
        ...formData,
      };
      updated = [...stores, newStore];
    }

    // If marked as main, unmark others
    if (formData.isMain) {
      const targetId = editingStore ? editingStore.id : updated[updated.length - 1].id;
      updated = updated.map(s => ({
        ...s,
        isMain: s.id === targetId,
      }));
    }

    setStores(updated);
    saveStoreBranches(updated);
    setIsModalOpen(false);
  };

  const handleDeleteStore = (id: string) => {
    if (confirm('Bu mağaza filialını silmək istədiyinizdən əminsiniz?')) {
      const updated = stores.filter(s => s.id !== id);
      setStores(updated);
      saveStoreBranches(updated);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = stores.map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: (s.status === 'active' ? 'inactive' : 'active') as 'active' | 'inactive',
        };
      }
      return s;
    });
    setStores(updated);
    saveStoreBranches(updated);
  };

  const filteredStores = stores.filter(s =>
    s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl text-slate-700">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#4f533b]" /> Mağazalar və filiallar idarəetməsi
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md font-medium">
              {stores.length} filial
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Fiziki mağaza ünvanlarını, əlaqə nömrələrini, iş saatlarını və Google Maps xəritə yerləşməsini tənzimləyin.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-sm px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
        >
          <Plus className="w-4 h-4" /> Yeni filial əlavə et
        </button>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Filial adı və ya ünvan üzrə axtar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-white border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-700 outline-none focus:border-[#4f533b] transition"
          />
        </div>

        <div className="text-xs text-slate-500 font-medium">
          Aktiv filiallar: <span className="font-bold text-emerald-600">{stores.filter(s => s.status === 'active').length}</span>
        </div>
      </div>

      {/* Stores Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStores.map(store => (
          <div
            key={store.id}
            className={`bg-white border rounded-2xl p-5 space-y-4 shadow-xs transition flex flex-col justify-between ${
              store.status === 'active' ? 'border-slate-200' : 'border-slate-200 opacity-60 bg-slate-50/50'
            }`}
          >
            <div className="space-y-3">
              {/* Branch Header */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-base text-slate-900">{store.name}</h3>
                  </div>
                  {store.isMain && (
                    <span className="inline-block mt-1 text-[10px] bg-amber-100 text-amber-800 border border-amber-300 font-bold px-2 py-0.5 rounded-full">
                      ★ Əsas Filial
                    </span>
                  )}
                </div>

                {/* Status Badge */}
                <button
                  type="button"
                  onClick={() => handleToggleStatus(store.id)}
                  className={`text-[11px] font-bold px-2.5 py-1 rounded-full border cursor-pointer transition ${
                    store.status === 'active'
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                  }`}
                >
                  {store.status === 'active' ? 'Aktiv' : 'Deaktiv'}
                </button>
              </div>

              {/* Branch Details */}
              <div className="space-y-2 text-xs text-slate-600 pt-1 border-t border-slate-100">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-[#4f533b] flex-shrink-0 mt-0.5" />
                  <span className="font-medium text-slate-800">{store.address}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#4f533b] flex-shrink-0" />
                  <span className="font-semibold text-slate-700">{store.phone}</span>
                </div>

                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#4f533b] flex-shrink-0" />
                  <span className="font-medium text-slate-600">{store.hours}</span>
                </div>
              </div>

              {/* Google Maps Preview */}
              {store.mapEmbedUrl ? (
                <div className="rounded-xl overflow-hidden border border-slate-200 h-32 bg-slate-100 relative">
                  <iframe
                    src={store.mapEmbedUrl}
                    className="w-full h-full border-0 pointer-events-none"
                    loading="lazy"
                    title={store.name}
                  />
                  <div className="absolute bottom-1 right-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] text-slate-600 font-bold border border-slate-200">
                    Xəritə
                  </div>
                </div>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 p-3 text-center text-xs text-slate-400">
                  Xəritə linki əlavə edilməyib
                </div>
              )}
            </div>

            {/* Actions Bar */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
              {store.googleMapsUrl ? (
                <a
                  href={store.googleMapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#4f533b] font-bold hover:underline flex items-center gap-1"
                >
                  <ExternalLink className="w-3.5 h-3.5" /> Google Maps
                </a>
              ) : <span />}

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => handleOpenEditModal(store)}
                  className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                  title="Düzəliş Et"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteStore(store.id)}
                  className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Store Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="w-5 h-5 text-[#4f533b]" />
                {editingStore ? 'Filialı Düzəliş Et' : 'Yeni Mağaza Filialı Əlavə Et'}
              </h2>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4 text-xs">
              <div>
                <label className="text-xs text-slate-600 mb-1 block">Filial Adı *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: 28 May Filialı"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Dəqiq Ünvan *</label>
                <input
                  type="text"
                  required
                  placeholder="Məs: Nizami küç. 142, 28 May m/st çıxışı"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-slate-600 mb-1 block">Əlaqə Nömrəsi *</label>
                  <input
                    type="text"
                    required
                    placeholder="+994 12 555 17 17"
                    value={formData.phone}
                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-600 mb-1 block">İş Saatları *</label>
                  <input
                    type="text"
                    required
                    placeholder="09:00 - 21:00 (Hər gün)"
                    value={formData.hours}
                    onChange={e => setFormData({ ...formData, hours: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Google Maps Xəritə Embed URL-i (iframe src)</label>
                <input
                  type="text"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  value={formData.mapEmbedUrl}
                  onChange={e => setFormData({ ...formData, mapEmbedUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
                <p className="text-[10px] text-slate-400 mt-1">Google Maps-də "Paylaş / Xəritəni Yerləşdir" hissəsindəki iframe linki.</p>
              </div>

              <div>
                <label className="text-xs text-slate-600 mb-1 block">Google Maps Birbaşa Linki</label>
                <input
                  type="text"
                  placeholder="https://maps.google.com/?q=..."
                  value={formData.googleMapsUrl}
                  onChange={e => setFormData({ ...formData, googleMapsUrl: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-sm text-slate-800 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="flex items-center gap-4 pt-2 border-t border-slate-100">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isMain}
                    onChange={e => setFormData({ ...formData, isMain: e.target.checked })}
                    className="rounded text-[#4f533b] focus:ring-[#4f533b] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-medium">Əsas Mağaza Filialı Kimi İşarələ</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.status === 'active'}
                    onChange={e => setFormData({ ...formData, status: e.target.checked ? 'active' : 'inactive' })}
                    className="rounded text-[#4f533b] focus:ring-[#4f533b] w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs text-slate-700 font-medium">Aktiv Status</span>
                </label>
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 cursor-pointer"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-[#4f533b] hover:bg-[#3e4230] shadow-xs cursor-pointer"
                >
                  <Save className="w-4 h-4 inline-block mr-1" /> Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
