'use client';

import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  Sparkles,
  Layers,
  ArrowUpDown,
  X,
  AlertCircle,
  Clock,
  Tag,
} from '../../components/HeroIconsHub';

export interface ServiceItem {
  id: string;
  name: string;
  price: string;
  icon?: string;
  description?: string;
  duration?: string;
  status?: 'active' | 'inactive';
  sort_order?: number;
  created_at?: string;
}

const DEFAULT_SERVICES: ServiceItem[] = [
  {
    id: 'warranty_1y',
    name: 'Zəmanət 1 il',
    price: 'Pulsuz',
    icon: '🛡️',
    description: '1 illik rəsmi istehsalçı və servis mərkəzi zəmanəti',
    duration: '12 ay',
    status: 'active',
    sort_order: 1
  },
  {
    id: 'warranty_2y',
    name: 'Zəmanət 2 il (Uzadılmış)',
    price: '59.99 ₼',
    icon: '🛡️🛡️',
    description: 'Əlavə +1 il TechnoMania rəsmi servis və ehtiyat hissəsi zəmanəti',
    duration: '24 ay',
    status: 'active',
    sort_order: 2
  },
  {
    id: 'warranty_3y',
    name: 'Zəmanət 3 il (Premium)',
    price: '99.99 ₼',
    icon: '🛡️🛡️🛡️',
    description: 'Maksimum 3 illik tam servis, proqram təminatı və texniki dəstək paketi',
    duration: '36 ay',
    status: 'active',
    sort_order: 3
  },
  {
    id: 'screen_protection',
    name: 'Ekran Zəmanəti (1 dəfəlik dəyişim)',
    price: '39.99 ₼',
    icon: '📱',
    description: '1 il ərzində istənilən mexaniki zədələnmədə ekranın ödənişsiz dəyişdirilməsi',
    duration: '12 ay',
    status: 'active',
    sort_order: 4
  },
  {
    id: 'setup_data_transfer',
    name: 'Quraşdırma və Məlumat Köçürülməsi',
    price: '19.99 ₼',
    icon: '⚙️',
    description: 'Köhnə cihazdan yeni cihaza kontaktlar, fotolar və tətbiqlərin köçürülməsi',
    duration: '1 dəfəlik',
    status: 'active',
    sort_order: 5
  }
];

export default function ServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<ServiceItem | null>(null);

  const [formData, setFormData] = useState<Omit<ServiceItem, 'id'>>({
    name: '',
    price: 'Pulsuz',
    icon: '🛡️',
    description: '',
    duration: '12 ay',
    status: 'active',
    sort_order: 1
  });

  const loadServices = async () => {
    try {
      const res = await fetch('/api/catalog/services', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setServices(data);
          localStorage.setItem('technomania_services', JSON.stringify(data));
          return;
        }
      }
    } catch (e) {}

    // Fallback to local storage or defaults
    const saved = localStorage.getItem('technomania_services');
    if (saved) {
      try {
        setServices(JSON.parse(saved));
        return;
      } catch (e) {}
    }
    setServices(DEFAULT_SERVICES);
    localStorage.setItem('technomania_services', JSON.stringify(DEFAULT_SERVICES));
  };

  useEffect(() => {
    loadServices().finally(() => setLoading(false));
  }, []);

  const saveServicesToBackend = async (list: ServiceItem[]) => {
    setServices(list);
    localStorage.setItem('technomania_services', JSON.stringify(list));
    try {
      await fetch('/api/catalog/services', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(list)
      });
    } catch (e) {
      console.error('Failed to sync services with backend:', e);
    }
  };

  const handleOpenAddModal = () => {
    setEditingService(null);
    setFormData({
      name: '',
      price: 'Pulsuz',
      icon: '🛡️',
      description: '',
      duration: '12 ay',
      status: 'active',
      sort_order: services.length + 1
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (service: ServiceItem) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      price: service.price,
      icon: service.icon || '🛡️',
      description: service.description || '',
      duration: service.duration || '12 ay',
      status: service.status || 'active',
      sort_order: service.sort_order || 1
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    let updated: ServiceItem[];
    if (editingService) {
      updated = services.map(s => s.id === editingService.id ? { ...s, ...formData } : s);
    } else {
      const newService: ServiceItem = {
        id: 'srv-' + Date.now(),
        ...formData
      };
      updated = [...services, newService];
    }

    await saveServicesToBackend(updated);
    setIsModalOpen(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bu xidməti silmək istədiyinizdən əminsiniz?')) return;
    const updated = services.filter(s => s.id !== id);
    await saveServicesToBackend(updated);
    try {
      await fetch(`/api/catalog/services/${id}`, { method: 'DELETE' });
    } catch (e) {}
  };

  const handleToggleStatus = async (service: ServiceItem) => {
    const nextStatus: 'active' | 'inactive' = service.status === 'active' ? 'inactive' : 'active';
    const updated = services.map(s => s.id === service.id ? { ...s, status: nextStatus } : s);
    await saveServicesToBackend(updated);
  };

  const filteredServices = services.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.description || '').toLowerCase().includes(search.toLowerCase())
  );

  const activeCount = services.filter(s => s.status !== 'inactive').length;
  const freeCount = services.filter(s => s.price.toLowerCase().includes('pulsuz') || s.price === '0' || s.price === '0 ₼').length;
  const paidCount = services.length - freeCount;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* ── Page Header ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-[#f4f5f0] border border-[#4f533b]/20 flex items-center justify-center text-[#4f533b] shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              Xidmətlər və zəmanət idarəetməsi
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Məhsullara təyin olunan zəmanət paketləri, əlavə servis və quraşdırma xidmətlərinin vahid bazası
            </p>
          </div>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition shadow-xs cursor-pointer self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni xidmət əlavə et</span>
        </button>
      </div>

      {/* ── Stats Overview ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">Ümumi xidmətlər</div>
            <div className="text-lg font-black text-slate-800">{services.length} xidmət</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">Aktiv xidmətlər</div>
            <div className="text-lg font-black text-emerald-600">{activeCount} aktiv</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3.5 shadow-2xs">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-700">
            <Tag className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-slate-400">Ödənişli / Pulsuz</div>
            <div className="text-lg font-black text-slate-800">{paidCount} ödənişli • {freeCount} pulsuz</div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter ── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 flex items-center gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Xidmət adı və ya təsviri üzrə axtar..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
          />
        </div>
      </div>

      {/* ── Services Cards Grid ── */}
      {loading ? (
        <div className="p-12 text-center text-xs text-slate-400">Xidmətlər yüklənir...</div>
      ) : filteredServices.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-dashed border-slate-200 text-center space-y-3">
          <ShieldCheck className="w-10 h-10 mx-auto text-slate-300" />
          <div className="text-sm font-bold text-slate-700">Heç bir xidmət tapılmadı</div>
          <p className="text-xs text-slate-400">Yeni xidmət əlavə edərək məhsullara bağlaya bilərsiniz</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(service => {
            const isActive = service.status !== 'inactive';
            const isFree = service.price.toLowerCase().includes('pulsuz') || service.price === '0' || service.price === '0 ₼';

            return (
              <div
                key={service.id}
                className={`bg-white rounded-2xl border p-5 transition-all shadow-xs flex flex-col justify-between ${
                  isActive ? 'border-slate-200 hover:border-slate-300' : 'border-slate-200/60 opacity-60 bg-slate-50/50'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-xl flex-shrink-0">
                        {service.icon || '🛡️'}
                      </div>
                      <div>
                        <h3 className="font-black text-sm text-slate-900">{service.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isFree ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 font-black'
                          }`}>
                            {service.price}
                          </span>
                          {service.duration && (
                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {service.duration}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => handleToggleStatus(service)}
                      title={isActive ? 'Deaktiv et' : 'Aktiv et'}
                      className="cursor-pointer"
                    >
                      {isActive ? (
                        <CheckCircle className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-slate-400" />
                      )}
                    </button>
                  </div>

                  {service.description && (
                    <p className="text-xs text-slate-500 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      {service.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-100 text-xs">
                  <span className="text-[10px] text-slate-400">Sıra: #{service.sort_order || 1}</span>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleOpenEditModal(service)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-[#4f533b] hover:bg-slate-100 transition cursor-pointer"
                      title="Redaktə et"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
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
          <div className="bg-white w-full max-w-lg rounded-3xl p-6 border border-slate-200 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-base font-black text-slate-900">
                {editingService ? 'Xidməti redaktə et' : 'Yeni xidmət əlavə et'}
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
                <label className="block text-xs font-bold text-slate-700 mb-1">Xidmətin adı *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Məs: Zəmanət 2 il (Uzadılmış)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Qiymət *</label>
                  <input
                    type="text"
                    required
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    placeholder="Məs: Pulsuz və ya 49.99 ₼"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Müddət</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={e => setFormData({ ...formData, duration: e.target.value })}
                    placeholder="Məs: 24 ay"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">İkon (Emoji və ya Mətn)</label>
                  <input
                    type="text"
                    value={formData.icon}
                    onChange={e => setFormData({ ...formData, icon: e.target.value })}
                    placeholder="🛡️"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Sıra nömrəsi</label>
                  <input
                    type="number"
                    value={formData.sort_order}
                    onChange={e => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 1 })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ətraflı təsvir</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Xidmətin şərtləri və nələri əhatə etdiyi..."
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Vəziyyət</label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:border-[#4f533b] transition"
                >
                  <option value="active">Aktiv (Məhsullarda görünür)</option>
                  <option value="inactive">Deaktiv</option>
                </select>
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
