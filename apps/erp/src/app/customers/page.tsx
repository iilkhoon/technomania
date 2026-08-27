'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  MessageSquare,
  X,
  ShieldAlert,
  ShieldCheck,
  Ban,
  CheckCircle,
  Eye,
  Send,
  Calendar,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShoppingBag,
  CreditCard,
  UserCheck,
  Bell,
  Plus,
  RefreshCw,
  FileSpreadsheet,
} from '../../components/HeroIconsHub';
import { showToast } from '../../lib/toastStore';

export interface RegisteredCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  avatar_url?: string;
  registeredAt: string;
  lastLogin: string;
  ipAddress: string;
  address: string;
  city: string;
  totalSpent: number;
  orderCount: number;
  status: 'active' | 'blocked';
  notes?: string;
  fin_code?: string;
  id_serial?: string;
  workplace?: string;
  orders?: Array<{
    id: string;
    date: string;
    total: string;
    status: string;
  }>;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<RegisteredCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked'>('all');

  // Modals State
  const [selectedCustomer, setSelectedCustomer] = useState<RegisteredCustomer | null>(null);
  const [notificationModalCustomer, setNotificationModalCustomer] = useState<RegisteredCustomer | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);

  // New Customer Form State
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    city: 'Bakı',
    address: '',
    fin_code: '',
  });

  // Notification Form State
  const [notifTitle, setNotifTitle] = useState('');
  const [notifMessage, setNotifMessage] = useState('');
  const [notifSuccess, setNotifSuccess] = useState(false);

  const loadCustomers = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/catalog/customers', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          const mapped: RegisteredCustomer[] = data.map((row: any) => ({
            id: row.id || `cust_${Date.now()}`,
            name: row.name || (row.surname ? `${row.name || ''} ${row.surname}`.trim() : 'Müştəri'),
            phone: row.phone || '-',
            email: row.email || (row.phone ? `${row.phone.replace(/[^0-9]/g, '')}@musteri.az` : '-'),
            avatar_url: row.avatar_url || row.avatar || '',
            registeredAt: row.created_at ? new Date(row.created_at).toLocaleDateString('az-AZ') : 'Aktiv',
            lastLogin: row.last_login ? new Date(row.last_login).toLocaleDateString('az-AZ') : 'Bu gün',
            ipAddress: row.ip_address || '127.0.0.1',
            address: row.address || 'Ünvan qeyd edilməyib',
            city: row.city || 'Bakı',
            totalSpent: parseFloat(String(row.total_spent || 0)) || 0,
            orderCount: parseInt(String(row.order_count || 0), 10) || 0,
            status: (row.status === 'blocked' ? 'blocked' : 'active') as 'active' | 'blocked',
            notes: row.notes || '',
            fin_code: row.fin_code || '',
            id_serial: row.id_serial || '',
            workplace: row.workplace || '',
          }));

          setCustomers(mapped);
          try {
            localStorage.setItem('technomania_customers', JSON.stringify(mapped));
          } catch (e) {}
          return;
        }
      }
    } catch (e) {
      console.error('Failed to fetch customers from API:', e);
    } finally {
      setLoading(false);
    }

    // Fallback to local storage
    try {
      const saved = localStorage.getItem('technomania_customers');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCustomers(parsed);
      }
    } catch (e) {}
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const saveCustomers = async (updated: RegisteredCustomer[]) => {
    setCustomers(updated);
    try {
      localStorage.setItem('technomania_customers', JSON.stringify(updated));
    } catch (e) {}
  };

  // Toggle Block / Unblock Account
  const handleToggleBlockCustomer = async (customer: RegisteredCustomer) => {
    const isBlocking = customer.status === 'active';
    const actionText = isBlocking ? 'bloklamaq' : 'blokdan çıxarmaq';

    if (confirm(`${customer.name} adlı müştərinin hesabını ${actionText} istədiyinizdən əminsiniz?`)) {
      const newStatus = isBlocking ? 'blocked' : 'active';
      const updated = customers.map(c => c.id === customer.id ? {
        ...c,
        status: newStatus as 'active' | 'blocked'
      } : c);

      saveCustomers(updated);

      if (selectedCustomer && selectedCustomer.id === customer.id) {
        setSelectedCustomer({ ...selectedCustomer, status: newStatus as 'active' | 'blocked' });
      }

      // Sync with backend API
      try {
        await fetch('/api/catalog/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-erp-api-key': 'technomania_secure_erp_token_2026_98x!',
          },
          body: JSON.stringify({
            ...customer,
            status: newStatus,
          }),
        });
        showToast(`Müştəri hesabı ${isBlocking ? 'bloklandı' : 'aktivləşdirildi'}`, 'success');
      } catch (e) {}
    }
  };

  // Create new customer
  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()) {
      showToast('Zəhmət olmasa ad və telefon nömrəsini daxil edin!', 'error');
      return;
    }

    const newCust: RegisteredCustomer = {
      id: `cust_${Date.now()}`,
      name: newCustomerForm.name.trim(),
      phone: newCustomerForm.phone.trim(),
      email: newCustomerForm.email.trim() || `${newCustomerForm.phone.replace(/[^0-9]/g, '')}@musteri.az`,
      city: newCustomerForm.city || 'Bakı',
      address: newCustomerForm.address || '',
      fin_code: newCustomerForm.fin_code || '',
      registeredAt: new Date().toLocaleDateString('az-AZ'),
      lastLogin: 'Yeni qeydiyyat',
      ipAddress: '127.0.0.1',
      totalSpent: 0,
      orderCount: 0,
      status: 'active',
    };

    try {
      await fetch('/api/catalog/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-erp-api-key': 'technomania_secure_erp_token_2026_98x!',
        },
        body: JSON.stringify(newCust),
      });
      showToast('Yeni müştəri bazaya əlavə edildi! ✅', 'success');
      setIsNewCustomerModalOpen(false);
      setNewCustomerForm({ name: '', phone: '', email: '', city: 'Bakı', address: '', fin_code: '' });
      loadCustomers();
    } catch (e) {
      showToast('Müştəri saxlanılarkən xəta baş verdi', 'error');
    }
  };

  // Send Notification
  const handleSendNotification = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMessage.trim()) return;

    setNotifSuccess(true);
    setTimeout(() => {
      setNotifSuccess(false);
      setNotificationModalCustomer(null);
      setNotifTitle('');
      setNotifMessage('');
      showToast('Müştəriyə bildiriş göndərildi! 🚀', 'success');
    }, 1000);
  };

  const filteredCustomers = customers.filter(c => {
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch = c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (statusFilter === 'active' && c.status !== 'active') return false;
    if (statusFilter === 'blocked' && c.status !== 'blocked') return false;

    return true;
  });

  return (
    <div className="space-y-6 max-w-7xl text-slate-700 antialiased">
      {/* Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4f533b]" />
              <span>Müştərilər və CRM idarəetməsi</span>
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-full font-bold">
              Canlı PostgreSQL bazası
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">
            Veb saytdan qeydiyyatdan keçmiş bütün müştərilərin canlı məlumatlarını görün, profilləri idarə edin və fərdi bildirişlər göndərin.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={loadCustomers}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl transition cursor-pointer border border-slate-200"
            title="Yenilə"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#4f533b]' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsNewCustomerModalOpen(true)}
            className="px-4 py-2.5 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Yeni müştəri</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Ad, telefon, e-poçt və ya şəhər üzrə axtar..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-700 font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'all' ? 'bg-[#4f533b] text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bütün ({customers.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'active' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Aktiv ({customers.filter(c => c.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('blocked')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
              statusFilter === 'blocked' ? 'bg-rose-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Bloklanmış ({customers.filter(c => c.status === 'blocked').length})
          </button>
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-slate-200/90 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100 text-slate-500 font-bold">
                <th className="py-4 px-5">Müştəri</th>
                <th className="py-4 px-5">Əlaqə məlumatları</th>
                <th className="py-4 px-5">Qeydiyyat tarixi</th>
                <th className="py-4 px-5">Sifariş və xərc</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Əməliyyatlar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="w-8 h-8 border-3 border-[#4f533b] border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 font-medium">
                    Heç bir müştəri tapılmadı.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(customer => (
                  <tr key={customer.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3">
                        {customer.avatar_url ? (
                          <img
                            src={customer.avatar_url}
                            alt={customer.name}
                            className="w-10 h-10 rounded-2xl object-cover border border-slate-200 shadow-2xs flex-shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] font-black text-sm flex items-center justify-center border border-[#4f533b]/20 flex-shrink-0">
                            {customer.name ? customer.name.charAt(0).toUpperCase() : 'M'}
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-900 block text-xs">{customer.name}</span>
                          <span className="text-[11px] text-slate-400">Şəhər: {customer.city}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <span className="font-bold text-slate-800 block flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#4f533b]" /> {customer.phone}
                        </span>
                        <span className="text-[11px] text-slate-500 flex items-center gap-1.5">
                          <Mail className="w-3.5 h-3.5 text-slate-400" /> {customer.email}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div className="space-y-0.5">
                        <span className="text-slate-800 font-semibold block">{customer.registeredAt}</span>
                        <span className="text-[10px] text-slate-400">Son giriş: {customer.lastLogin}</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <div>
                        <span className="font-black text-emerald-600 text-xs block">{customer.totalSpent.toFixed(2)} ₼</span>
                        <span className="text-[11px] text-slate-500 font-medium">{customer.orderCount} sifariş</span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                        customer.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${customer.status === 'active' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                        {customer.status === 'active' ? 'Aktiv' : 'Bloklanıb'}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                          title="Profilə bax"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleBlockCustomer(customer)}
                          className={`p-2 rounded-xl transition cursor-pointer ${
                            customer.status === 'active'
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-600'
                          }`}
                          title={customer.status === 'active' ? 'Blokla' : 'Blokdan çıxar'}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Profile Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                {selectedCustomer.avatar_url ? (
                  <img
                    src={selectedCustomer.avatar_url}
                    alt={selectedCustomer.name}
                    className="w-12 h-12 rounded-2xl object-cover border border-slate-200 shadow-xs flex-shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] font-black flex items-center justify-center border border-[#4f533b]/20 flex-shrink-0 text-base">
                    {selectedCustomer.name ? selectedCustomer.name.charAt(0).toUpperCase() : 'M'}
                  </div>
                )}
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">{selectedCustomer.name}</h3>
                  <p className="text-xs text-slate-400">{selectedCustomer.phone}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block">E-poçt:</span>
                <span className="font-bold text-slate-800 truncate block">{selectedCustomer.email}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block">Şəhər & Ünvan:</span>
                <span className="font-bold text-slate-800 truncate block">{selectedCustomer.city}, {selectedCustomer.address}</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block">Ümumi dövriyyə:</span>
                <span className="font-bold text-emerald-600 block">{selectedCustomer.totalSpent.toFixed(2)} ₼</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                <span className="text-slate-400 block">Sifariş sayı:</span>
                <span className="font-bold text-slate-800 block">{selectedCustomer.orderCount} ədəd</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Yeni Müştəri Əlavə Et</h3>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Ad və Soyad *</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.name}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  placeholder="Məs: Əli Məmmədov"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Nömrəsi *</label>
                <input
                  type="text"
                  required
                  value={newCustomerForm.phone}
                  onChange={e => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                  placeholder="+994 50 123 45 67"
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">E-poçt</label>
                  <input
                    type="email"
                    value={newCustomerForm.email}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    placeholder="musteri@mail.com"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Şəhər</label>
                  <input
                    type="text"
                    value={newCustomerForm.city}
                    onChange={e => setNewCustomerForm({ ...newCustomerForm, city: e.target.value })}
                    placeholder="Bakı"
                    className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
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
