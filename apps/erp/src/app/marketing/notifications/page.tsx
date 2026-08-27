'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Send,
  Trash2,
  Plus,
  Sparkles,
  CheckCircle,
  Smartphone,
  Globe,
  Clock,
  Layers,
  X,
  ShieldCheck,
  AlertTriangle,
  Users,
  Briefcase,
  Megaphone,
} from '../../../components/HeroIconsHub';
import { showToast } from '../../../lib/toastStore';

interface NotificationItem {
  id: string;
  title: string;
  description: string;
  target?: string;
  author_name?: string;
  priority?: string;
  created_at: string;
}

const ERP_API_KEY = 'technomania_secure_erp_token_2026_98x!';

export default function MarketingNotificationsPage() {
  const [activeTab, setActiveTab] = useState<'customer' | 'erp'>('customer');
  const [customerNotifications, setCustomerNotifications] = useState<NotificationItem[]>([]);
  const [erpNotifications, setErpNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [targetType, setTargetType] = useState<'customer' | 'erp'>('customer');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [customerTarget, setCustomerTarget] = useState<'all' | 'web' | 'mobile'>('all');
  const [erpPriority, setErpPriority] = useState<'info' | 'urgent' | 'warning' | 'success'>('info');
  const [authorName, setAuthorName] = useState('Rəhbərlik');
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const loadAllNotifications = async () => {
    setLoading(true);
    try {
      const [custRes, erpRes] = await Promise.all([
        fetch('/api/catalog/notifications', {
          cache: 'no-store',
          headers: { 'x-erp-api-key': ERP_API_KEY },
        }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/catalog/erp-notifications', {
          cache: 'no-store',
          headers: { 'x-erp-api-key': ERP_API_KEY },
        }).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);

      if (Array.isArray(custRes)) setCustomerNotifications(custRes);
      if (Array.isArray(erpRes)) setErpNotifications(erpRes);
    } catch (e) {
      console.error('Failed to load notifications:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllNotifications();
  }, []);

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setErrorMsg('Başlıq və açıqlama mütləq daxil edilməlidir.');
      return;
    }

    setSubmitting(true);
    setErrorMsg('');

    try {
      const isErp = targetType === 'erp';
      const endpoint = isErp ? '/api/catalog/erp-notifications' : '/api/catalog/notifications';
      const payload = isErp ? {
        title: title.trim(),
        description: description.trim(),
        author_name: authorName.trim() || 'Rəhbərlik',
        priority: erpPriority,
        target_role: 'all',
      } : {
        title: title.trim(),
        description: description.trim(),
        target: customerTarget,
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-erp-api-key': ERP_API_KEY,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || (data.success === false)) {
        throw new Error(data.message || data.error || 'Bildiriş göndərilərkən xəta baş verdi.');
      }

      showToast(
        isErp
          ? 'ERP Daxili Bildirişi bütün əməkdaşların panelinə uğurla göndərildi! 📢'
          : 'Bildiriş müştəri profillərinə uğurla göndərildi! 🚀',
        'success'
      );

      setTitle('');
      setDescription('');
      setIsModalOpen(false);
      loadAllNotifications();
    } catch (err: any) {
      setErrorMsg(err.message || 'Xəta baş verdi.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, isErp: boolean) => {
    if (!confirm('Bu bildirişi silmək istədiyinizə əminsiniz?')) return;
    try {
      const endpoint = isErp ? `/api/catalog/erp-notifications/${id}` : `/api/catalog/notifications/${id}`;
      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'x-erp-api-key': ERP_API_KEY },
      });
      if (res.ok) {
        if (isErp) {
          setErpNotifications(prev => prev.filter(n => n.id !== id));
        } else {
          setCustomerNotifications(prev => prev.filter(n => n.id !== id));
        }
        showToast('Bildiriş silindi', 'info');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const activeList = activeTab === 'customer' ? customerNotifications : erpNotifications;

  return (
    <div className="space-y-6 antialiased">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] flex items-center justify-center border border-[#4f533b]/20">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900 tracking-tight">Bildiriş və Elan İdarəetmə Mərkəzi</h1>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              Həm sayt müştərilərinə kampaniyalar, həm də ERP daxilində əməkdaşlara təcili daxili elanlar göndərin.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setTargetType(activeTab);
            setIsModalOpen(true);
            setErrorMsg('');
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs flex items-center gap-2 shadow-xs transition cursor-pointer active:scale-95 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Yeni bildiriş göndər</span>
        </button>
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-fit">
        <button
          type="button"
          onClick={() => setActiveTab('customer')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'customer'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Müştəri bildirişləri ({customerNotifications.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('erp')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'erp'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>ERP daxili elanlar ({erpNotifications.length})</span>
        </button>
      </div>

      {/* List of Sent Notifications */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-400" />
            <span>
              {activeTab === 'customer' ? 'Müştərilərə Göndərilmiş Bildirişlər' : 'Əməkdaşlara Göndərilmiş ERP Daxili Elanlar'}
            </span>
          </h2>
          <span className="text-xs font-semibold text-slate-400">{activeList.length} aktiv qeyd</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <div className="w-8 h-8 border-3 border-[#4f533b] border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : activeList.length === 0 ? (
          <div className="p-12 text-center">
            <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-bold text-slate-700">Hələ heç bir bildiriş göndərilməyib</p>
            <p className="text-xs text-slate-400 mt-1">
              {activeTab === 'customer'
                ? 'Müştərilərinizə endirimlər və yeniliklər haqqında ilk bildirişi göndərin.'
                : 'ERP panelindəki bütün işçilərə daxili elan və ya təlimat göndərin.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {activeList.map((n) => (
              <div key={n.id} className="p-5 hover:bg-slate-50/70 transition-colors flex items-start justify-between gap-4 group">
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    <span className="font-bold text-sm text-slate-900">{n.title}</span>

                    {activeTab === 'customer' ? (
                      <span className="px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 text-[10px] font-bold border border-blue-100">
                        {n.target === 'mobile' ? '📱 Mobil' : n.target === 'web' ? '🌐 Veb' : '🌍 Hamısı'}
                      </span>
                    ) : (
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        n.priority === 'urgent'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : n.priority === 'warning'
                          ? 'bg-amber-50 text-amber-700 border-amber-200'
                          : n.priority === 'success'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}>
                        {n.priority === 'urgent' ? '🚨 Təcili' : n.priority === 'warning' ? '⚠️ Xəbərdarlıq' : n.priority === 'success' ? '✅ Uğurlu' : 'ℹ️ Məlumat'}
                      </span>
                    )}

                    {n.author_name && (
                      <span className="text-[11px] font-semibold text-slate-500">
                        Müəllif: <strong className="text-slate-700">{n.author_name}</strong>
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed font-medium">{n.description}</p>

                  <div className="flex items-center gap-4 text-[11px] text-slate-400 pt-1">
                    <span>📅 {new Date(n.created_at).toLocaleString('az-AZ')}</span>
                    {activeTab === 'erp' && (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Canlı ERP Bell popup-da aktivdir
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(n.id, activeTab === 'erp')}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-[#4f533b]/10 text-[#4f533b] flex items-center justify-center">
                  <Send className="w-4 h-4" />
                </div>
                <h3 className="font-black text-slate-900 text-base">Yeni Bildiriş / Elan Göndər</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-semibold">
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSendNotification} className="space-y-4">
              {/* Type Switcher */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Bildiriş Növü</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetType('customer')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      targetType === 'customer'
                        ? 'border-[#4f533b] bg-[#4f533b]/10 text-[#4f533b]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>Müştərilərə Bildiriş</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetType('erp')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                      targetType === 'erp'
                        ? 'border-[#4f533b] bg-[#4f533b]/10 text-[#4f533b]'
                        : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Briefcase className="w-4 h-4" />
                    <span>ERP Daxili Elan</span>
                  </button>
                </div>
              </div>

              {/* Title */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Başlıq</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder={targetType === 'erp' ? 'Məs: Təcili anbar sayımı və ya sistem yenilənməsi' : 'Məs: Bahar endirimləri başladı! 🎉'}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mətn / Açıqlama</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Bildirişin tam mətnini daxil edin..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                />
              </div>

              {targetType === 'customer' ? (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Hədəf Platforma</label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { key: 'all', label: '🌍 Hamısı' },
                      { key: 'web', label: '🌐 Veb Sayt' },
                      { key: 'mobile', label: '📱 Mobil Tətbiq' },
                    ].map(p => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => setCustomerTarget(p.key as any)}
                        className={`py-2 px-3 rounded-xl border text-xs font-bold transition cursor-pointer ${
                          customerTarget === p.key
                            ? 'border-[#4f533b] bg-[#4f533b] text-white'
                            : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Müəllif / Departament</label>
                    <input
                      type="text"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="Rəhbərlik"
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Prioritet</label>
                    <select
                      value={erpPriority}
                      onChange={(e) => setErpPriority(e.target.value as any)}
                      className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                    >
                      <option value="info">ℹ️ Standart Məlumat</option>
                      <option value="urgent">🚨 Təcili Əməliyyat</option>
                      <option value="warning">⚠️ Xəbərdarlıq</option>
                      <option value="success">✅ Uğurlu Xəbər</option>
                    </select>
                  </div>
                </div>
              )}

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                >
                  <Send className="w-4 h-4" />
                  <span>{submitting ? 'Göndərilir...' : 'Yayımla'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
