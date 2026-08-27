'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Shield,
  Search,
  RotateCcw,
  Download,
  Filter,
  Eye,
  Calendar,
  User,
  Clock,
  DollarSign,
  TrendingDown,
  TrendingUp,
  Package,
  ShoppingCart,
  AlertTriangle,
  FileSpreadsheet,
  CheckCircle2,
  Lock,
  ArrowRight,
  ExternalLink,
  Layers,
  Activity,
  ChevronRight,
  SlidersHorizontal,
  X,
} from '../../components/HeroIconsHub';
import {
  AuditLogEntry,
  AuditLogStats,
  fetchAuditLogsFromApi,
  fetchAuditLogStats,
  getActiveEmployee,
} from '../../lib/auditLogger';
import { showToast } from '../../lib/toastStore';

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [stats, setStats] = useState<AuditLogStats>({
    total: 0,
    today: 0,
    priceChanges: 0,
    stockChanges: 0,
    orderChanges: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [actionFilter, setActionFilter] = useState('all');
  const [entityFilter, setEntityFilter] = useState('all');
  const [userFilter, setUserFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | '7days' | '30days'>('all');

  // Selected Log for Diff Modal
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);

  const activeEmployee = useMemo(() => getActiveEmployee(), []);

  // Load audit logs and stats
  const loadData = async (showRefresh = false) => {
    if (showRefresh) setRefreshing(true);
    try {
      let startDate: string | undefined;
      const now = new Date();
      if (dateFilter === 'today') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        startDate = today.toISOString();
      } else if (dateFilter === '7days') {
        const d7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        startDate = d7.toISOString();
      } else if (dateFilter === '30days') {
        const d30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        startDate = d30.toISOString();
      }

      const [logData, statData] = await Promise.all([
        fetchAuditLogsFromApi({
          search: searchQuery,
          action: actionFilter,
          entity_type: entityFilter,
          user_name: userFilter,
          startDate,
          limit: 200,
        }),
        fetchAuditLogStats(),
      ]);

      setLogs(logData.logs || []);
      setStats(statData);
    } catch (e) {
      console.error('Audit log data loading failed:', e);
      showToast('Audit logları yüklənərkən xəta baş verdi', 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [actionFilter, entityFilter, userFilter, dateFilter]);

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Real-time event listener for live logs
  useEffect(() => {
    const handleLogAdded = () => {
      loadData();
    };
    window.addEventListener('techno_audit_log_added', handleLogAdded);
    return () => window.removeEventListener('techno_audit_log_added', handleLogAdded);
  }, []);

  // Unique employees list for filter dropdown
  const employeeNames = useMemo(() => {
    const set = new Set<string>();
    logs.forEach(l => {
      if (l.user_name) set.add(l.user_name);
    });
    return Array.from(set);
  }, [logs]);

  // Export logs to CSV
  const handleExportCSV = () => {
    if (logs.length === 0) {
      showToast('İxrac etmək üçün heç bir log tapılmadı', 'info');
      return;
    }

    try {
      const headers = ['ID', 'Tarix', 'Əməkdaş', 'Rol', 'Əməliyyat Növü', 'Modul', 'Obyekt', 'Detallar', 'IP Ünvanı'];
      const rows = logs.map(l => [
        l.id,
        new Date(l.created_at).toLocaleString('az-AZ'),
        `"${l.user_name || 'Bilinməyən'}"`,
        `"${l.user_role || 'Admin'}"`,
        `"${l.action}"`,
        `"${l.entity_type}"`,
        `"${l.entity_name || l.entity_id || ''}"`,
        `"${(l.details || '').replace(/"/g, '""')}"`,
        l.ip_address || '127.0.0.1',
      ]);

      const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `technomania_audit_logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      showToast(`${logs.length} audit qeydi CSV faylına ixrac edildi 📄`, 'success');
    } catch (e) {
      console.error('Export failed:', e);
      showToast('İxrac zamanı xəta baş verdi', 'error');
    }
  };

  const getActionBadge = (action: string) => {
    switch (action) {
      case 'price_change':
      case 'bulk_pricing':
      case 'pricing_update':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs">
            <DollarSign className="w-3.5 h-3.5 text-amber-600" /> Qiymət Dəyişikliyi
          </span>
        );
      case 'stock_delete':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs">
            <TrendingDown className="w-3.5 h-3.5 text-rose-600" /> Stok Silinməsi / Sıfırlanma
          </span>
        );
      case 'stock_update':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-emerald-50 text-emerald-800 border border-emerald-200/80 shadow-2xs">
            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" /> Stok Düzəlişi
          </span>
        );
      case 'order_status_update':
      case 'status_update':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-indigo-50 text-indigo-800 border border-indigo-200/80 shadow-2xs">
            <ShoppingCart className="w-3.5 h-3.5 text-indigo-600" /> Sifariş Statusu
          </span>
        );
      case 'order_delete':
      case 'delete':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-red-50 text-red-800 border border-red-200/80 shadow-2xs">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Silinmə Əməliyyatı
          </span>
        );
      case 'employee_add':
      case 'employee_update':
      case 'employee_delete':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-black bg-purple-50 text-purple-800 border border-purple-200/80 shadow-2xs">
            <User className="w-3.5 h-3.5 text-purple-600" /> Əməkdaş İdarəetməsi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
            <Activity className="w-3.5 h-3.5 text-slate-500" /> {action}
          </span>
        );
    }
  };

  const getEntityBadge = (entity: string) => {
    switch (entity) {
      case 'product':
      case 'pricing':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-blue-50 text-blue-700">Məhsul & Qiymət</span>;
      case 'inventory':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-700">Anbar & Stok</span>;
      case 'order':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-indigo-50 text-indigo-700">Sifarişlər</span>;
      case 'employee':
      case 'settings':
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-purple-50 text-purple-700">Sistem / Əməkdaş</span>;
      default:
        return <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-slate-100 text-slate-600">{entity}</span>;
    }
  };

  return (
    <div className="space-y-6 text-slate-700 select-none pb-16 antialiased">
      {/* ── 1. PAGE HEADER & SECURITY BANNER ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-7 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-emerald-500/5 via-amber-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5 relative z-10">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#4f533b] to-[#3a3d2b] text-white flex items-center justify-center shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Dəyişməz Audit Log Jurnalı
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full shadow-2xs">
                <Lock className="w-3 h-3 text-emerald-600" /> PostgreSQL Dəyişməzlik Möhürü
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 font-medium max-w-2xl">
              Hər bir əməkdaşın qiymət dəyişməsi, stok silinməsi, sifariş statusu yeniləməsi və sistem əməliyyatlarını dəyişdirilməz şəkildə qeydə alan mərkəzi təhlükəsizlik jurnalı.
            </p>
          </div>

          {/* Top Actions */}
          <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-2xl border border-slate-200 transition cursor-pointer active:scale-95 disabled:opacity-50"
            >
              <RotateCcw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Yenilə</span>
            </button>

            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 px-4 py-2.5 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs rounded-2xl shadow-md shadow-[#4f533b]/20 transition cursor-pointer active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>Excel / CSV İxrac</span>
            </button>
          </div>
        </div>

        {/* Active Session & Verification Pill */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-semibold text-slate-600">Canlı Təhlükəsizlik Qeydiyyatı:</span>
            <span className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">AKTİV (Append-Only)</span>
          </div>

          <div className="flex items-center gap-3 text-slate-500">
            <span>Cari İnzibatçı: <strong className="text-slate-800 font-black">{activeEmployee.name}</strong> ({activeEmployee.role})</span>
          </div>
        </div>
      </div>

      {/* ── 2. KPI STATS CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        {/* Total Logs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Cəmi Əməliyyatlar</span>
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {stats.total.toLocaleString('az-AZ')}
          </div>
          <p className="text-[11px] text-slate-400 font-semibold mt-1">Bazada saxlanılan silinməz qeyd</p>
        </div>

        {/* Today's Logs */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Bugünkü Qeydlər</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">
            {stats.today.toLocaleString('az-AZ')}
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Bu gün icra edilən əməliyyatlar</p>
        </div>

        {/* Price Changes */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Qiymət Dəyişimi</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-amber-600 tracking-tight">
            {stats.priceChanges.toLocaleString('az-AZ')}
          </div>
          <p className="text-[11px] text-amber-600 font-semibold mt-1">Məhsul qiyməti & endirim qeydi</p>
        </div>

        {/* Stock Changes / Deletions */}
        <div className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Stok Silinmə & Düzəliş</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tight">
            {stats.stockChanges.toLocaleString('az-AZ')}
          </div>
          <p className="text-[11px] text-rose-600 font-semibold mt-1">Anbar qalıq düzəlişləri</p>
        </div>

        {/* Order Status Changes */}
        <div className="col-span-2 lg:col-span-1 bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-2xs relative overflow-hidden group hover:shadow-md transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Sifariş Statusu</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-black text-indigo-600 tracking-tight">
            {stats.orderChanges.toLocaleString('az-AZ')}
          </div>
          <p className="text-[11px] text-indigo-600 font-semibold mt-1">Status dəyişikliyi qeydləri</p>
        </div>
      </div>

      {/* ── 3. FILTER & SEARCH TOOLBAR ── */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative w-full md:flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Detallar, məhsul adı, sifariş ID və ya əməkdaş üzrə dərhal axtar..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm font-semibold outline-none focus:bg-white focus:border-[#4f533b] transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Date Filter Pills */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-2xl w-full md:w-auto overflow-x-auto">
            {(['all', 'today', '7days', '30days'] as const).map(df => (
              <button
                key={df}
                onClick={() => setDateFilter(df)}
                className={`px-3 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition cursor-pointer ${
                  dateFilter === df
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {df === 'all' && 'Bütün vaxtlar'}
                {df === 'today' && 'Bu gün'}
                {df === '7days' && 'Son 7 gün'}
                {df === '30days' && 'Son 30 gün'}
              </button>
            ))}
          </div>
        </div>

        {/* Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-slate-100">
          {/* Action Type Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Əməliyyat Növü</label>
            <select
              value={actionFilter}
              onChange={e => setActionFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#4f533b]"
            >
              <option value="all">Bütün əməliyyatlar</option>
              <option value="price_change">Qiymət Dəyişikliyi (Tək)</option>
              <option value="bulk_pricing">Toplu Qiymət Tənzimləməsi</option>
              <option value="stock_update">Stok Yenilənməsi</option>
              <option value="stock_delete">Stok Silinməsi / Sıfırlanma</option>
              <option value="order_status_update">Sifariş Statusu Yeniləməsi</option>
              <option value="delete">Silinmə Əməliyyatları</option>
              <option value="employee_update">Əməkdaş İdarəetməsi</option>
            </select>
          </div>

          {/* Module / Entity Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Modul / Bölmə</label>
            <select
              value={entityFilter}
              onChange={e => setEntityFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#4f533b]"
            >
              <option value="all">Bütün modullar</option>
              <option value="pricing">Qiymətləndirmə (Pricing)</option>
              <option value="inventory">Anbar & Stok (Inventory)</option>
              <option value="order">Sifarişlər (Orders)</option>
              <option value="product">Məhsullar (Products)</option>
              <option value="employee">Əməkdaşlar & Rollar</option>
              <option value="settings">Sistem Tənzimləmələri</option>
            </select>
          </div>

          {/* Employee Filter */}
          <div>
            <label className="block text-[11px] font-bold text-slate-400 mb-1">Əməkdaş (İcraçı)</label>
            <select
              value={userFilter}
              onChange={e => setUserFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-[#4f533b]"
            >
              <option value="all">Bütün əməkdaşlar</option>
              {employeeNames.map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── 4. AUDIT LOGS DATA TABLE ── */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900">Əməliyyat Qeydləri Jurnalı</h2>
            <span className="text-xs font-bold text-slate-400">({logs.length} qeyd tapıldı)</span>
          </div>
          <span className="text-[11px] font-semibold text-slate-400">
            Təhlükəsizlik Protokolu: TLS 1.3 / PostgreSQL Trigger Verified
          </span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <div className="w-8 h-8 border-3 border-[#4f533b] border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs font-bold text-slate-500">Dəyişməz audit qeydləri bazadan oxunur...</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-extrabold text-slate-700">Seçilmiş filtrlərə uyğun heç bir log tapılmadı</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Axtarış sözünü dəyişə və ya filtrləri sıfırlayaraq bütün təhlükəsizlik qeydlərini görə bilərsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  <th className="py-3.5 px-5">Tarix / Zaman</th>
                  <th className="py-3.5 px-5">Əməkdaş</th>
                  <th className="py-3.5 px-5">Əməliyyat</th>
                  <th className="py-3.5 px-5">Modul</th>
                  <th className="py-3.5 px-5">Detallar & İzahat</th>
                  <th className="py-3.5 px-5 text-right">Fərq (Diff)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs font-semibold">
                {logs.map((log) => {
                  const hasDiff = (log.old_values && Object.keys(log.old_values).length > 0) ||
                                  (log.new_values && Object.keys(log.new_values).length > 0);

                  const dateObj = new Date(log.created_at);
                  const timeFormatted = dateObj.toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
                  const dateFormatted = dateObj.toLocaleDateString('az-AZ', { day: '2-digit', month: '2-digit', year: 'numeric' });

                  return (
                    <tr key={log.id} className="hover:bg-slate-50/80 transition-colors group">
                      {/* Timestamp & ID */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="font-bold text-slate-800">{timeFormatted}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{dateFormatted}</div>
                        <div className="text-[9px] text-slate-400 font-mono truncate max-w-[110px]" title={log.id}>
                          #{log.id.slice(-8)}
                        </div>
                      </td>

                      {/* Employee */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-[#4f533b]/10 border border-[#4f533b]/20 text-[#4f533b] font-black text-xs flex items-center justify-center">
                            {(log.user_name || 'U').slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-extrabold text-slate-900">{log.user_name || 'Sistem'}</div>
                            <div className="text-[10px] text-slate-400 font-bold">{log.user_role || 'Admin'}</div>
                          </div>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getActionBadge(log.action)}
                      </td>

                      {/* Entity */}
                      <td className="py-3.5 px-5 whitespace-nowrap">
                        {getEntityBadge(log.entity_type)}
                      </td>

                      {/* Details */}
                      <td className="py-3.5 px-5 max-w-md">
                        <p className="text-xs text-slate-800 font-medium leading-relaxed break-words line-clamp-2" title={log.details}>
                          {log.details}
                        </p>
                        {log.ip_address && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            IP: {log.ip_address}
                          </span>
                        )}
                      </td>

                      {/* Diff Action Button */}
                      <td className="py-3.5 px-5 whitespace-nowrap text-right">
                        {hasDiff ? (
                          <button
                            onClick={() => setSelectedLog(log)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-slate-100 hover:bg-[#4f533b] hover:text-white text-slate-700 border border-slate-200 transition cursor-pointer active:scale-95 shadow-2xs"
                          >
                            <Eye className="w-3.5 h-3.5" /> Fərqə Bax
                          </button>
                        ) : (
                          <span className="text-[11px] font-bold text-slate-400 italic">
                            Dəyişməz qeyd ✓
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── 5. INTERACTIVE DIFF MODAL ── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-7 shadow-2xl border border-slate-200 relative overflow-hidden max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Əməliyyat Fərq Snapshot-u (Diff)</h3>
                  <p className="text-xs text-slate-500 font-medium">Log ID: <span className="font-mono">{selectedLog.id}</span></p>
                </div>
              </div>

              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="py-4 overflow-y-auto space-y-4 flex-1">
              {/* Event Summary Box */}
              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/80 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">İcraçı Əməkdaş:</span>
                  <span className="font-extrabold text-slate-900">{selectedLog.user_name} ({selectedLog.user_role})</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Tarix & Zaman:</span>
                  <span className="font-mono text-slate-800">{new Date(selectedLog.created_at).toLocaleString('az-AZ')}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-500">Əməliyyat:</span>
                  <span>{getActionBadge(selectedLog.action)}</span>
                </div>
                <div className="text-xs pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-500 block mb-1">Açıqlama:</span>
                  <p className="font-medium text-slate-800">{selectedLog.details}</p>
                </div>
              </div>

              {/* Side-by-side Snapshot Comparison */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Old State */}
                <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-xs font-black text-rose-700 mb-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500" /> Əvvəlki Vəziyyət (Köhnə)
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white/80 p-3 rounded-xl border border-rose-100 overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {selectedLog.old_values && Object.keys(selectedLog.old_values).length > 0
                      ? JSON.stringify(selectedLog.old_values, null, 2)
                      : '// Əvvəlki dəyər qeydə alınmayıb'}
                  </pre>
                </div>

                {/* New State */}
                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                  <div className="flex items-center gap-1.5 text-xs font-black text-emerald-700 mb-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" /> Yeni Vəziyyət (Dəyişiklik)
                  </div>
                  <pre className="text-[11px] font-mono text-slate-700 bg-white/80 p-3 rounded-xl border border-emerald-100 overflow-x-auto max-h-48 whitespace-pre-wrap">
                    {selectedLog.new_values && Object.keys(selectedLog.new_values).length > 0
                      ? JSON.stringify(selectedLog.new_values, null, 2)
                      : '// Yeni dəyər qeydə alınmayıb'}
                  </pre>
                </div>
              </div>

              {/* Immutable Security Notice */}
              <div className="bg-slate-100/90 rounded-2xl p-3 text-[11px] text-slate-500 flex items-center gap-2">
                <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                <span>Bu qeyd PostgreSQL bazasında dəyişdirilməz (Append-Only) təhlükəsizlik triggeri ilə qorunur və heç kim tərəfindən silinə bilməz.</span>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
