'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Plus,
  Link as LinkIcon,
  Copy,
  Check,
  TrendingUp,
  DollarSign,
  Search,
  ExternalLink,
  Edit2,
  Trash2,
  Sparkles,
  Eye,
  Percent,
  CheckCircle2,
  Clock,
  XCircle,
  FileText,
  MousePointerClick,
} from '../../components/HeroIconsHub';
import { getLocalProducts } from '../../lib/supabase';
import { Product } from '../../types';

export interface AffiliatePartner {
  id: string;
  name: string;
  code: string;
  phone: string;
  email: string;
  commission_rate: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface AffiliateLinkItem {
  id: string;
  partner_id: string;
  partner_code: string;
  partner_name: string;
  product_id?: string;
  product_name?: string;
  product_slug?: string;
  target_url: string;
  tracking_url: string;
  clicks: number;
  leads_count: number;
  created_at: string;
}

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

const DEFAULT_PARTNERS: AffiliatePartner[] = [];
const DEFAULT_LEADS: AffiliateLead[] = [];

export default function AffiliatesPage() {
  const [activeTab, setActiveTab] = useState<'partners' | 'links' | 'leads'>('partners');
  const [partners, setPartners] = useState<AffiliatePartner[]>([]);
  const [leads, setLeads] = useState<AffiliateLead[]>([]);
  const [links, setLinks] = useState<AffiliateLinkItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Modal states
  const [isPartnerModalOpen, setIsPartnerModalOpen] = useState(false);
  const [editingPartner, setEditingPartner] = useState<AffiliatePartner | null>(null);

  // Partner Form State
  const [partnerName, setPartnerName] = useState('');
  const [partnerCode, setPartnerCode] = useState('');
  const [partnerPhone, setPartnerPhone] = useState('');
  const [partnerEmail, setPartnerEmail] = useState('');
  const [partnerCommission, setPartnerCommission] = useState<number>(5);

  // Link Generator State
  const [isLinkModalOpen, setIsLinkModalOpen] = useState(false);
  const [selectedPartnerCode, setSelectedPartnerCode] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');

  const [generatedCustomerUrl, setGeneratedCustomerUrl] = useState('');
  const [generatedPartnerUrl, setGeneratedPartnerUrl] = useState('');

  const loadData = () => {
    // Load products
    const prods = getLocalProducts() || [];
    setProducts(prods);

    // Load partners
    try {
      const savedPartners = localStorage.getItem('technomania_affiliate_partners');
      if (savedPartners) {
        const parsed = JSON.parse(savedPartners);
        const real = parsed.filter((p: any) => p.code !== 'RESAD_TECH' && p.code !== 'NIGAR_STYLE');
        setPartners(real);
      } else {
        setPartners([]);
      }
    } catch (e) {
      setPartners([]);
    }

    // Load leads
    try {
      const savedLeads = localStorage.getItem('technomania_affiliate_leads');
      if (savedLeads) {
        const parsed = JSON.parse(savedLeads);
        const real = parsed.filter((l: any) => l.partner_code !== 'RESAD_TECH' && l.partner_code !== 'NIGAR_STYLE');
        setLeads(real);
      } else {
        setLeads([]);
      }
    } catch (e) {
      setLeads([]);
    }

    // Load links
    try {
      const savedLinks = localStorage.getItem('technomania_affiliate_links');
      if (savedLinks) {
        const parsed = JSON.parse(savedLinks);
        setLinks(Array.isArray(parsed) ? parsed : []);
      } else {
        setLinks([]);
      }
    } catch (e) {
      setLinks([]);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    window.addEventListener('techno_affiliate_links_updated', loadData);
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('techno_affiliate_links_updated', loadData);
    };
  }, []);

  const savePartnersList = (list: AffiliatePartner[]) => {
    setPartners(list);
    try {
      localStorage.setItem('technomania_affiliate_partners', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  const saveLeadsList = (list: AffiliateLead[]) => {
    setLeads(list);
    try {
      localStorage.setItem('technomania_affiliate_leads', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}
  };

  const handleOpenCreatePartner = () => {
    setEditingPartner(null);
    setPartnerName('');
    setPartnerCode(`PARTNER_${Math.floor(1000 + Math.random() * 9000)}`);
    setPartnerPhone('');
    setPartnerEmail('');
    setPartnerCommission(5);
    setIsPartnerModalOpen(true);
  };

  const handleOpenEditPartner = (p: AffiliatePartner) => {
    setEditingPartner(p);
    setPartnerName(p.name);
    setPartnerCode(p.code);
    setPartnerPhone(p.phone || '');
    setPartnerEmail(p.email || '');
    setPartnerCommission(p.commission_rate || 5);
    setIsPartnerModalOpen(true);
  };

  const handleSavePartner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerName.trim() || !partnerCode.trim()) return;

    const payload: AffiliatePartner = {
      id: editingPartner ? editingPartner.id : 'part-' + Date.now(),
      name: partnerName.trim(),
      code: partnerCode.trim().toUpperCase().replace(/\s+/g, '_'),
      phone: partnerPhone.trim(),
      email: partnerEmail.trim(),
      commission_rate: Number(partnerCommission) || 5,
      status: editingPartner ? editingPartner.status : 'active',
      created_at: editingPartner ? editingPartner.created_at : new Date().toISOString(),
    };

    const updated = editingPartner
      ? partners.map(p => p.id === editingPartner.id ? payload : p)
      : [payload, ...partners];

    savePartnersList(updated);
    setIsPartnerModalOpen(false);
  };

  const handleDeletePartner = (id: string) => {
    if (!confirm('Bu affiliate tərəfdaşı silmək istədiyinizdən əminsiniz?')) return;
    const updated = partners.filter(p => p.id !== id);
    savePartnersList(updated);
  };

  const saveLinksList = (list: AffiliateLinkItem[]) => {
    setLinks(list);
    try {
      localStorage.setItem('technomania_affiliate_links', JSON.stringify(list));
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new Event('techno_affiliate_links_updated'));
    } catch (e) {}
  };

  const handleDeleteLink = (id: string) => {
    if (!confirm('Bu affiliate linki silmək istədiyinizdən əminsiniz?')) return;
    const updated = links.filter(l => l.id !== id);
    saveLinksList(updated);
  };

  // Generate Affiliate Link
  const handleGenerateLink = (pCode?: string) => {
    const code = pCode || selectedPartnerCode || (partners[0]?.code || 'PARTNER');
    setSelectedPartnerCode(code);
    const partnerObj = partners.find(p => p.code === code);

    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://technomania.az';
    const webOrigin = origin.replace(':3000', ':3001');

    let custUrl = `${webOrigin}/?ref=${code}`;
    let prodName = 'Ana Səhifə (Bütün Mağaza)';
    let prodSlug = '';

    if (selectedProductId) {
      const prod = products.find(p => p.id === selectedProductId);
      if (prod) {
        prodSlug = (prod.name || prod.model_name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-');
        custUrl = `${webOrigin}/product/${prodSlug}?ref=${code}`;
        prodName = prod.name || prod.model_name || 'Məhsul';
      }
    }

    const partnerUrl = `${webOrigin}/affiliate-stats?ref=${code}`;

    setGeneratedCustomerUrl(custUrl);
    setGeneratedPartnerUrl(partnerUrl);

    // Save link item if not already existing
    const existing = links.find(l => l.tracking_url === custUrl && l.partner_code === code);
    if (!existing) {
      const newLinkItem: AffiliateLinkItem = {
        id: 'link-' + Date.now(),
        partner_id: partnerObj?.id || 'part-1',
        partner_code: code,
        partner_name: partnerObj?.name || code,
        product_id: selectedProductId || undefined,
        product_name: prodName,
        product_slug: prodSlug || undefined,
        target_url: custUrl.split('?')[0],
        tracking_url: custUrl,
        clicks: 0,
        leads_count: 0,
        created_at: new Date().toISOString(),
      };
      saveLinksList([newLinkItem, ...links]);
    }

    setIsLinkModalOpen(true);
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Update Lead Status
  const handleUpdateLeadStatus = (leadId: string, newStatus: 'pending' | 'confirmed' | 'completed' | 'cancelled') => {
    const updated = leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l);
    saveLeadsList(updated);
  };

  // Calculations
  const totalLeadsCount = leads.length;
  const totalCompletedSales = leads.filter(l => l.status === 'completed').reduce((sum, l) => sum + l.price, 0);
  const totalCommissionEarned = leads.filter(l => l.status === 'completed' || l.status === 'confirmed').reduce((sum, l) => sum + l.commission, 0);

  const filteredPartners = partners.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.phone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredLeads = leads.filter(l =>
    l.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.partner_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-6xl text-slate-700">
      {/* Header Card */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl text-slate-900 font-black flex items-center gap-2">
              <Users className="w-5 h-5 text-[#4f533b]" /> Affiliate Satış Və Tərəfdaşlıq Sistemi
            </h1>
            <span className="text-xs bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md font-bold">
              Marketinq Hub
            </span>
          </div>
          <p className="text-sm text-slate-500">
            Tərəfdaşlar (influencer, blogger) yaradın, xüsusi affiliate linkləri verin və onların satış istəklərini izləyin.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerateLink()}
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <LinkIcon className="w-4 h-4" /> Link Generator
          </button>
          <button
            onClick={handleOpenCreatePartner}
            className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer active:scale-95 flex-shrink-0"
          >
            <Plus className="w-4 h-4" /> Yeni Tərəfdaş Əlavə Et
          </button>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block">Ümumi Sifariş İstəkləri</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalLeadsCount} sorğu</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block">Tamamlanmış Satış Həcmi</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block">{totalCompletedSales.toFixed(2)} ₼</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-bold block">Hesablanmış Komissiya</span>
            <span className="text-2xl font-black text-[#4f533b] mt-1 block">{totalCommissionEarned.toFixed(2)} ₼</span>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          onClick={() => setActiveTab('partners')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'partners'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" /> Tərəfdaş Şəxslər ({partners.length})
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'links'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <LinkIcon className="w-4 h-4" /> Referal Linklər ({links.length})
        </button>

        <button
          onClick={() => setActiveTab('leads')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
            activeTab === 'leads'
              ? 'bg-[#4f533b] text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" /> Satış İstəkləri Və Sorğular ({leads.length})
        </button>
      </div>

      {/* ── TAB 1: PARTNERS LIST ── */}
      {activeTab === 'partners' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tərəfdaş adı, kod və ya telefon ilə axtar..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPartners.map(p => {
              const partnerLeads = leads.filter(l => l.partner_code === p.code);
              const partnerLinksList = links.filter(l => l.partner_code === p.code);
              const partnerClicksCount = partnerLinksList.reduce((sum, l) => sum + (l.clicks || 0), 0);
              const partnerEarnings = partnerLeads.filter(l => l.status === 'completed' || l.status === 'confirmed').reduce((sum, l) => sum + l.commission, 0);

              return (
                <div key={p.id} className="bg-white border border-slate-200 hover:border-[#4f533b] rounded-2xl p-5 space-y-4 shadow-xs transition">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-extrabold text-slate-900 text-base">{p.name}</h3>
                        <span className="text-[10px] font-mono font-black bg-amber-100 text-amber-800 border border-amber-300 px-2 py-0.5 rounded-md">
                          {p.code}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{p.phone} • {p.email || 'Email yoxdur'}</p>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEditPartner(p)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                        title="Redaktə et"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeletePartner(p.id)}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 py-3 px-3 bg-slate-50 border border-slate-100 rounded-xl text-center text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Komissiya</span>
                      <span className="font-black text-[#4f533b]">{p.commission_rate}%</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Link Sayı</span>
                      <span className="font-black text-purple-700">{partnerLinksList.length} link</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Keçid (Klik)</span>
                      <span className="font-black text-indigo-700">{partnerClicksCount} dəfə</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Qazanılan</span>
                      <span className="font-black text-emerald-600">{partnerEarnings.toFixed(2)} ₼</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleGenerateLink(p.code)}
                      className="flex-1 bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold py-2 rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <LinkIcon className="w-3.5 h-3.5" /> Affiliate Link Əldə Et
                    </button>
                  </div>
                </div>
              );
            })}

            {filteredPartners.length === 0 && (
              <div className="col-span-full bg-white border border-slate-200 rounded-2xl p-10 text-center space-y-3">
                <Users className="w-10 h-10 text-slate-300 mx-auto" />
                <h3 className="font-extrabold text-slate-700 text-sm">Hələ ki heç bir affiliate tərəfdaş əlavə edilməyib</h3>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Yuxarıdakı "Yeni Tərəfdaş Əlavə Et" düyməsindən istifadə edərək ilk tərəfdaşınızı yarada bilərsiniz.
                </p>
                <button
                  onClick={handleOpenCreatePartner}
                  className="bg-[#4f533b] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#3e4230] transition cursor-pointer"
                >
                  + Tərəfdaş Əlavə Et
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: AFFILIATE LINKS & CLICK STATS TABLE ── */}
      {activeTab === 'links' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Tərəfdaş adı, kod və ya məhsul adı ilə axtar..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>
            <button
              onClick={() => handleGenerateLink()}
              className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold px-4 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            >
              <LinkIcon className="w-4 h-4" /> Yeni Link Generator
            </button>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="p-4">Tərəfdaş (Kod)</th>
                  <th className="p-4">Hədəf Məhsul / Səhifə</th>
                  <th className="p-4">Affiliate Referal Link</th>
                  <th className="p-4 text-center">Keçid (Klik) Sayı</th>
                  <th className="p-4">Tarix</th>
                  <th className="p-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {links
                  .filter(l =>
                    l.partner_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    l.partner_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    (l.product_name || '').toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map(linkItem => (
                    <tr key={linkItem.id} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-900">
                        {linkItem.partner_name}
                        <span className="block text-[10px] font-mono text-amber-700 font-normal">{linkItem.partner_code}</span>
                      </td>
                      <td className="p-4 font-bold text-slate-800 max-w-[180px] truncate">
                        {linkItem.product_name || 'Ana Səhifə (Bütün Mağaza)'}
                      </td>
                      <td className="p-4 font-mono text-[11px] text-slate-600 max-w-[260px] truncate">
                        {linkItem.tracking_url}
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 font-black text-indigo-700 bg-indigo-50 border border-indigo-200 px-3 py-1 rounded-full text-xs">
                          <MousePointerClick className="w-3.5 h-3.5" /> {linkItem.clicks || 0} keçid
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 font-mono text-[11px]">
                        {new Date(linkItem.created_at).toLocaleDateString('az-AZ')}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => copyToClipboard(linkItem.tracking_url, linkItem.id)}
                            className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-[#4f533b] hover:text-white transition cursor-pointer"
                            title="Link Kopyala"
                          >
                            {copiedId === linkItem.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>
                          <button
                            onClick={() => handleDeleteLink(linkItem.id)}
                            className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            title="Link Sil"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>

            {links.length === 0 && (
              <div className="py-12 text-center text-slate-400 text-xs">
                Hələlik heç bir affiliate referal link yaradılmayıb.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── TAB 2: LEADS & SALES REQUESTS ── */}
      {activeTab === 'leads' && (
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-xs flex items-center justify-between">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Müştəri, tərəfdaş və ya məhsul adı ilə axtar..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-700 outline-none focus:border-[#4f533b] transition"
              />
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold tracking-wider">
                <tr>
                  <th className="p-4">Tərəfdaş</th>
                  <th className="p-4">Məhsul</th>
                  <th className="p-4">Müştəri / Telefon</th>
                  <th className="p-4">Məhsul Qiyməti</th>
                  <th className="p-4">Komissiya (₼)</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Əməliyyat</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">
                      {lead.partner_name}
                      <span className="block text-[10px] font-mono text-amber-700 font-normal">{lead.partner_code}</span>
                    </td>
                    <td className="p-4 font-bold text-slate-800">{lead.product_name}</td>
                    <td className="p-4">
                      <span className="font-bold text-slate-900 block">{lead.customer_name}</span>
                      <span className="text-slate-400 text-[11px] block">{lead.customer_phone}</span>
                    </td>
                    <td className="p-4 font-black text-slate-900">{lead.price.toFixed(2)} ₼</td>
                    <td className="p-4 font-black text-emerald-600">+{lead.commission.toFixed(2)} ₼</td>
                    <td className="p-4">
                      {lead.status === 'completed' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">✓ Tamamlandı</span>}
                      {lead.status === 'confirmed' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-300">✓ Təsdiqləndi</span>}
                      {lead.status === 'pending' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">⏳ Gözləmədə</span>}
                      {lead.status === 'cancelled' && <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-300">✕ Ləğv Olundu</span>}
                    </td>
                    <td className="p-4 text-right">
                      <select
                        value={lead.status}
                        onChange={e => handleUpdateLeadStatus(lead.id, e.target.value as any)}
                        className="bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-xs outline-none focus:border-[#4f533b]"
                      >
                        <option value="pending">Gözləmədə</option>
                        <option value="confirmed">Təsdiqləndi</option>
                        <option value="completed">Tamamlandı</option>
                        <option value="cancelled">Ləğv edildi</option>
                      </select>
                    </td>
                  </tr>
                ))}

                {filteredLeads.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-10 text-center text-slate-400 text-xs">
                      Hələ ki heç bir sifariş istəyi sorğusu daxil olmayıb.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal: Create Partner */}
      {isPartnerModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md border border-slate-200 shadow-2xl space-y-4">
            <h3 className="font-extrabold text-slate-900 text-base">
              {editingPartner ? 'Tərəfdaşı Redaktə Et' : 'Yeni Affiliate Tərəfdaş Əlavə Et'}
            </h3>

            <form onSubmit={handleSavePartner} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Tərəfdaşın Adı Və Soyadı *</label>
                <input
                  type="text" required
                  value={partnerName}
                  onChange={e => setPartnerName(e.target.value)}
                  placeholder="Məsələn: Əli Məmmədov (Blogger)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Affiliate Kod (Referral Code) *</label>
                <input
                  type="text" required
                  value={partnerCode}
                  onChange={e => setPartnerCode(e.target.value)}
                  placeholder="Məsələn: ALI_TECH"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-mono text-slate-700 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Telefon</label>
                  <input
                    type="text"
                    value={partnerPhone}
                    onChange={e => setPartnerPhone(e.target.value)}
                    placeholder="+994 50 000 00 00"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                  />
                </div>
                <div>
                  <label className="block text-slate-600 font-bold mb-1">Komissiya Faizi (%)</label>
                  <input
                    type="number" step="0.5"
                    value={partnerCommission}
                    onChange={e => setPartnerCommission(Number(e.target.value))}
                    placeholder="5"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Email Ünvanı</label>
                <input
                  type="email"
                  value={partnerEmail}
                  onChange={e => setPartnerEmail(e.target.value)}
                  placeholder="partner@mail.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-700 outline-none focus:border-[#4f533b]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsPartnerModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold border border-slate-200 bg-slate-50 text-slate-600"
                >
                  Ləğv Et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-[#4f533b] hover:bg-[#3e4230] text-white"
                >
                  Yadda Saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Generate Affiliate Link */}
      {isLinkModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg border border-slate-200 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
                <LinkIcon className="w-5 h-5 text-[#4f533b]" /> Affiliate Link Generator
              </h3>
              <button onClick={() => setIsLinkModalOpen(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-600 font-bold mb-1">Tərəfdaş Seçin:</label>
                <select
                  value={selectedPartnerCode}
                  onChange={e => handleGenerateLink(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800"
                >
                  {partners.map(p => (
                    <option key={p.id} value={p.code}>
                      {p.name} ({p.code}) — {p.commission_rate}% komissiya
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-600 font-bold mb-1">Xüsusi Məhsul Seçin (Könüllü):</label>
                <select
                  value={selectedProductId}
                  onChange={e => {
                    setSelectedProductId(e.target.value);
                    setTimeout(() => handleGenerateLink(), 100);
                  }}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-800"
                >
                  <option value="">Bütün Sayt / Ana Səhifə</option>
                  {products.map(prod => (
                    <option key={prod.id} value={prod.id}>
                      {prod.name || prod.model_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Box 1: Customer Link */}
              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-1.5">
                <span className="block text-[11px] font-bold text-slate-700">1. Müştəriyə Paylaşılacaq Link (Məhsul/Sayt):</span>
                <div className="flex items-center gap-2">
                  <input
                    type="text" readOnly
                    value={generatedCustomerUrl}
                    className="flex-1 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedCustomerUrl, 'cust')}
                    className="px-3 py-2 rounded-xl bg-[#4f533b] text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'cust' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Box 2: Partner Tracking Dashboard Link */}
              <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 space-y-1.5">
                <span className="block text-[11px] font-bold text-amber-900">2. Tərəfdaşa Veriləcək Şəxsi Satış İzləmə Linki:</span>
                <p className="text-[10px] text-amber-700 mb-1">
                  Tərəfdaş (blogger/influencer) bu linklə öz şəxsi istək sayını və komissiyasını canlı görə bilir.
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text" readOnly
                    value={generatedPartnerUrl}
                    className="flex-1 bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-mono text-amber-900 select-all"
                  />
                  <button
                    onClick={() => copyToClipboard(generatedPartnerUrl, 'part')}
                    className="px-3 py-2 rounded-xl bg-amber-700 text-white text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                  >
                    {copiedId === 'part' ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setIsLinkModalOpen(false)}
                  className="px-5 py-2 rounded-xl bg-slate-200 text-slate-700 font-bold text-xs"
                >
                  Bağla
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
