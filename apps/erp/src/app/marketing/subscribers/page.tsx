'use client';

import React, { useState, useEffect } from 'react';
import {
  Mail,
  Search,
  Download,
  Trash2,
  Calendar,
  CheckCircle,
  Users,
  RefreshCw,
  FileSpreadsheet,
} from '../../../components/HeroIconsHub';

interface Subscriber {
  id: string;
  email: string;
  status: string;
  created_at: string;
}

export default function MarketingSubscribersPage() {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const loadSubscribers = () => {
    setLoading(true);
    fetch('/api/catalog/subscribers', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache'
      }
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setSubscribers(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadSubscribers();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Bu abunəçini siyahıdan silmək istəyirsiniz?')) return;
    try {
      await fetch(`/api/catalog/subscribers/${id}`, { method: 'DELETE' });
      loadSubscribers();
    } catch (e) {}
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      alert('İxrac ediləcək heç bir abunəçi yoxdur');
      return;
    }

    const headers = ['ID', 'Email', 'Status', 'Abunə Tarixi'];
    const rows = subscribers.map(s => [
      s.id,
      s.email,
      s.status || 'active',
      s.created_at ? new Date(s.created_at).toLocaleString('az-AZ') : ''
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `technomania_subscribers_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filtered = subscribers.filter(s =>
    s.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
            <Mail className="w-3.5 h-3.5" />
            <span>Email Marketinq</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Email Abunəçilər Siyahısı
          </h1>
          <p className="text-xs text-slate-500 font-medium">
            Saytdan və bloqdan bülletenə abunə olan müştərilərin siyahısı və idarəedilməsi.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={loadSubscribers}
            className="p-3 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-2xl transition cursor-pointer"
            title="Yenilə"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            onClick={handleExportCSV}
            className="px-5 py-3 bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm rounded-2xl transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Excel (CSV) İxrac Et</span>
          </button>
        </div>
      </div>

      {/* Search & Stats Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Email üzrə axtarış..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs sm:text-sm outline-none focus:border-[#4f533b]"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Cəmi: <strong className="text-slate-900 font-black">{subscribers.length}</strong> aktiv abunəçi
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
        {filtered.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-12 h-12 stroke-[1.5] text-slate-300 mx-auto" />
            <h3 className="font-extrabold text-base text-slate-700">Hələ ki, abunəçi qeydiyyatdan keçməyib</h3>
            <p className="text-xs text-slate-400">Saytın footer və ya bloq hissəsindən abunə olan müştərilər burada toplanacaq.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-extrabold tracking-wider text-[10.5px]">
                <tr>
                  <th className="px-6 py-4">№</th>
                  <th className="px-6 py-4">Email Ünvanı</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Qeydiyyat Tarixi</th>
                  <th className="px-6 py-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((sub, idx) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-6 py-4 text-slate-400 font-bold">{idx + 1}</td>
                    <td className="px-6 py-4 font-black text-slate-900 flex items-center gap-2">
                      <Mail className="w-4 h-4 text-[#4f533b]" />
                      <span>{sub.email}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-[11px] font-extrabold">
                        <CheckCircle className="w-3 h-3" />
                        <span>Aktiv</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {sub.created_at ? new Date(sub.created_at).toLocaleString('az-AZ') : '—'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleDelete(sub.id)}
                        className="p-2 hover:bg-rose-50 rounded-xl text-rose-500 transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
