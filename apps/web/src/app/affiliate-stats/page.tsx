'use client';

export const dynamic = 'force-dynamic';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  TrendingUp,
  FileText,
  DollarSign,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Users,
  Search,
  ExternalLink,
  ShieldCheck,
  ChevronLeft,
  Link as LinkIcon,
  Copy,
  Check,
  Eye,
  MousePointerClick,
} from '../components/HeroIconsHub';
import Header from '../components/Header';
import { AffiliateLinkItem } from '../utils/affiliateTracker';

export interface AffiliateLead {
  id: string;
  partner_code: string;
  partner_name: string;
  product_name: string;
  customer_name: string;
  customer_phone: string;
  price: number;
  commission: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  created_at: string;
}

export interface AffiliatePartner {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  commission_rate: number;
  status: 'active' | 'inactive';
}

function AffiliateStatsContent() {
  const searchParams = useSearchParams();
  const refCodeParam = searchParams.get('ref') || searchParams.get('aff') || '';

  const [partnerCodeInput, setPartnerCodeInput] = useState(refCodeParam);
  const [activePartnerCode, setActivePartnerCode] = useState(refCodeParam);

  const [partner, setPartner] = useState<AffiliatePartner | null>(null);
  const [leads, setLeads] = useState<AffiliateLead[]>([]);
  const [links, setLinks] = useState<AffiliateLinkItem[]>([]);
  const [copiedLinkId, setCopiedLinkId] = useState<string | null>(null);

  useEffect(() => {
    if (refCodeParam) {
      setPartnerCodeInput(refCodeParam);
      setActivePartnerCode(refCodeParam);
    }
  }, [refCodeParam]);

  const loadData = () => {
    if (!activePartnerCode) return;
    const code = activePartnerCode.trim().toUpperCase();

    // Load partners
    try {
      const savedPartners = localStorage.getItem('technomania_affiliate_partners');
      if (savedPartners) {
        const list: AffiliatePartner[] = JSON.parse(savedPartners);
        const matched = list.find(p => p.code.toUpperCase() === code);
        setPartner(matched || null);
      } else {
        setPartner(null);
      }
    } catch (e) {
      setPartner(null);
    }

    // Load leads
    try {
      const savedLeads = localStorage.getItem('technomania_affiliate_leads');
      if (savedLeads) {
        const list: AffiliateLead[] = JSON.parse(savedLeads);
        const matchedLeads = list.filter(l => l.partner_code.toUpperCase() === code);
        setLeads(matchedLeads);
      }
    } catch (e) {}

    // Load links
    try {
      const savedLinks = localStorage.getItem('technomania_affiliate_links');
      if (savedLinks) {
        const list: AffiliateLinkItem[] = JSON.parse(savedLinks);
        const matchedLinks = list.filter(l => l.partner_code.toUpperCase() === code);
        setLinks(matchedLinks);
      }
    } catch (e) {}
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('techno_affiliate_links_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('techno_affiliate_links_updated', loadData);
    };
  }, [activePartnerCode]);

  const handleSearchCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (partnerCodeInput.trim()) {
      setActivePartnerCode(partnerCodeInput.trim().toUpperCase());
    }
  };

  const copyLinkToClipboard = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLinkId(id);
    setTimeout(() => setCopiedLinkId(null), 2000);
  };

  const totalLeadsCount = leads.length;
  const totalCompletedSales = leads.filter(l => l.status === 'completed').reduce((sum, l) => sum + l.price, 0);
  const totalCommissionEarned = leads.filter(l => l.status === 'completed' || l.status === 'confirmed').reduce((sum, l) => sum + l.commission, 0);
  const totalClicksCount = links.reduce((sum, l) => sum + (l.clicks || 0), 0);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Back Link */}
        <Link href="/" className="inline-flex items-center gap-1 text-xs font-bold text-[#4f533b] hover:underline">
          <ChevronLeft className="w-4 h-4" /> Ana Səhifəyə Qayıt
        </Link>

        {/* Portal Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div className="space-y-1">
              <span className="inline-flex items-center gap-1 text-xs font-extrabold text-[#4f533b] bg-[#f4f5f0] border border-[#4f533b]/20 px-3 py-1 rounded-full">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Affiliate Tərəfdaş Portalı
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                {partner ? partner.name : 'Şəxsi Satış İzləmə Paneli'}
              </h1>
              <p className="text-xs text-slate-500">
                Sizin xüsusi affiliate linkləriniz, kecid (klik) sayları və komissiyanızın canlı göstericiləri
              </p>
            </div>

            {/* Code Search Box */}
            <form onSubmit={handleSearchCode} className="flex items-center gap-2">
              <input
                type="text"
                value={partnerCodeInput}
                onChange={e => setPartnerCodeInput(e.target.value)}
                placeholder="Partner Kodunuz (məs: RESAD_TECH)"
                className="bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs font-mono font-bold text-slate-800 outline-none focus:border-[#4f533b]"
              />
              <button
                type="submit"
                className="bg-[#4f533b] text-white text-xs font-bold px-4 py-2 rounded-xl hover:bg-[#3e4230] transition cursor-pointer"
              >
                Göstər
              </button>
            </form>
          </div>

          {activePartnerCode && (
            <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-slate-600">
              <span>Referral Kodu: <strong className="text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded font-mono">{activePartnerCode}</strong></span>
              <span>Komissiya Faizi: <strong className="text-[#4f533b]">{partner?.commission_rate || 5}%</strong></span>
            </div>
          )}
        </div>

        {activePartnerCode ? (
          <>
            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block">Aktiv Link Sayınız</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{links.length} link</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <LinkIcon className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block">Keçid (Klik) Sayı</span>
                  <span className="text-xl font-black text-indigo-700 mt-1 block">{totalClicksCount} dəfə</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <MousePointerClick className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block">Sifariş İstəkləri</span>
                  <span className="text-xl font-black text-slate-900 mt-1 block">{totalLeadsCount} sorğu</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 font-bold block">Qazanılan Komissiya</span>
                  <span className="text-xl font-black text-[#4f533b] mt-1 block">{totalCommissionEarned.toFixed(2)} ₼</span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* SECTION 1: AFFILIATE LINKS & CLICK STATS TABLE */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                  <LinkIcon className="w-4.5 h-4.5 text-[#4f533b]" /> Sizin Affiliate Linkləriniz Və Keçid Statistikası ({links.length})
                </h3>
                <span className="text-xs font-bold bg-[#f4f5f0] text-[#4f533b] px-2.5 py-1 rounded-lg border border-[#4f533b]/20">
                  Canlı Klik Sayğacı
                </span>
              </div>

              {links.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold tracking-wider">
                      <tr>
                        <th className="p-3.5">Hədəf Məhsul / Səhifə</th>
                        <th className="p-3.5">Affiliate Link</th>
                        <th className="p-3.5 text-center">Keçid (Klik) Sayı</th>
                        <th className="p-3.5 text-right">Əməliyyat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {links.map(l => (
                        <tr key={l.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-bold text-slate-900 max-w-[200px] truncate">
                            {l.product_name || 'Ana Səhifə'}
                          </td>
                          <td className="p-3.5 font-mono text-[11px] text-slate-600 max-w-[280px] truncate">
                            {l.tracking_url}
                          </td>
                          <td className="p-3.5 text-center">
                            <span className="inline-flex items-center gap-1 font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full">
                              <MousePointerClick className="w-3 h-3" /> {l.clicks || 0} keçid
                            </span>
                          </td>
                          <td className="p-3.5 text-right">
                            <button
                              onClick={() => copyLinkToClipboard(l.tracking_url, l.id)}
                              className="inline-flex items-center gap-1 text-xs font-bold bg-[#f4f5f0] text-[#4f533b] hover:bg-[#e8ead5] px-3 py-1.5 rounded-lg border border-[#4f533b]/20 transition cursor-pointer"
                            >
                              {copiedLinkId === l.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              {copiedLinkId === l.id ? 'Kopyalandı' : 'Link Kopyala'}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  Hələlik bu tərəfdaş üçün yaratdığınız xüsusi link yoxdur. ERP panelindən link yarada bilərsiniz.
                </div>
              )}
            </div>

            {/* SECTION 2: Sales Requests List */}
            <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-xs">
              <h3 className="font-black text-slate-900 text-base flex items-center gap-2">
                <FileText className="w-4.5 h-4.5 text-[#4f533b]" /> Sizin Linkinizlə Gələn Sifariş İstəkləri ({leads.length})
              </h3>

              {leads.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold tracking-wider">
                      <tr>
                        <th className="p-3.5">Məhsul</th>
                        <th className="p-3.5">Müştəri / Şəxs</th>
                        <th className="p-3.5">Qiymət</th>
                        <th className="p-3.5">Qazanılan Komissiya</th>
                        <th className="p-3.5">Status</th>
                        <th className="p-3.5">Tarix</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {leads.map(lead => (
                        <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                          <td className="p-3.5 font-bold text-slate-900">{lead.product_name}</td>
                          <td className="p-3.5 font-bold text-slate-700">{lead.customer_name}</td>
                          <td className="p-3.5 font-black text-slate-900">{lead.price.toFixed(2)} ₼</td>
                          <td className="p-3.5 font-black text-emerald-600">+{lead.commission.toFixed(2)} ₼</td>
                          <td className="p-3.5">
                            {lead.status === 'completed' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Tamamlandı</span>}
                            {lead.status === 'confirmed' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">✓ Təsdiqləndi</span>}
                            {lead.status === 'pending' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⏳ Gözləmədə</span>}
                            {lead.status === 'cancelled' && <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">✕ Ləğv Olundu</span>}
                          </td>
                          <td className="p-3.5 text-slate-400 font-mono text-[11px]">
                            {new Date(lead.created_at).toLocaleDateString('az-AZ')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-400 text-xs">
                  Hələlik bu referral kodla daxil olan sifariş istəyi yoxdur.
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-3">
            <ShieldCheck className="w-10 h-10 text-[#4f533b] mx-auto" />
            <h3 className="font-extrabold text-slate-900 text-base">Affiliate Kodu Daxil Edin</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Zəhmət olmasa yuxarıdakı xanaya sizə təqdim olunan Affiliate referral kodunuzu daxil edin.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}

export default function AffiliatePublicStatsPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen bg-[#f4f5f8] flex items-center justify-center text-slate-500 font-bold">Yüklənir...</div>}>
      <AffiliateStatsContent />
    </React.Suspense>
  );
}
