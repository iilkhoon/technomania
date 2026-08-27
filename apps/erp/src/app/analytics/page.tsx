'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  Users,
  Award,
  ArrowUpRight,
  Inbox,
} from '../../components/HeroIconsHub';

interface OrderItem {
  id: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
  paymentMethod: 'cash' | 'credit';
  status: 'İcrada' | 'Çatdırıldı' | 'Gözləyir';
  createdAt: string;
  items: Array<{ id: string; name: string; price: number; quantity: number }>;
}

export default function AnalyticsPage() {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const rawAnalytics = localStorage.getItem('technomania_real_analytics');
      const rawOrders = localStorage.getItem('technomania_orders') || localStorage.getItem('erp_orders');

      let list: OrderItem[] = [];
      if (rawAnalytics) {
        try {
          const parsed = JSON.parse(rawAnalytics);
          if (Array.isArray(parsed.orders)) list = parsed.orders;
        } catch (e) {}
      }
      if (list.length === 0 && rawOrders) {
        try {
          const parsed = JSON.parse(rawOrders);
          if (Array.isArray(parsed)) list = parsed;
        } catch (e) {}
      }
      setOrders(list);
    } catch (e) {
      console.error('Failed to load orders for analytics:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const completedOrders = orders.filter(o => o.status === 'Çatdırıldı' || o.status === 'İcrada');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const aov = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0;

  const uniqueCustomers = Array.from(
    new Set(orders.map(o => o.customerPhone || o.customerName).filter(Boolean))
  ).length;

  // Aggregate top selling products
  const productSalesMap: Record<string, { name: string; category: string; sales: number; revenue: number }> = {};

  orders.forEach(ord => {
    (ord.items || []).forEach(item => {
      const id = item.id || item.name;
      if (!productSalesMap[id]) {
        productSalesMap[id] = {
          name: item.name,
          category: 'Elektro & Texnika',
          sales: 0,
          revenue: 0,
        };
      }
      productSalesMap[id].sales += item.quantity || 1;
      productSalesMap[id].revenue += (item.price || 0) * (item.quantity || 1);
    });
  });

  const topProducts = Object.values(productSalesMap)
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 10);

  const stats = [
    {
      title: 'Ümumi Real Dövriyyə',
      value: `${totalRevenue.toLocaleString('az-AZ', { minimumFractionDigits: 2 })} ₼`,
      change: 'Canlı Yığılan',
      isUp: true,
      icon: DollarSign,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200'
    },
    {
      title: 'Ortalama səbət məbləği (AOV)',
      value: `${aov.toLocaleString('az-AZ', { minimumFractionDigits: 2 })} ₼`,
      change: 'Real Orta',
      isUp: true,
      icon: ShoppingCart,
      color: 'text-[#4f533b] bg-[#f4f5f0] border-[#4f533b]/20'
    },
    {
      title: 'Ümumi tamamlanan sifarişlər',
      value: `${completedOrders.length} sifariş`,
      change: 'Uğurlu Satışlar',
      isUp: true,
      icon: TrendingUp,
      color: 'text-blue-700 bg-blue-50 border-blue-200'
    },
    {
      title: 'Aktiv alıcı sayı',
      value: `${uniqueCustomers} müştəri`,
      change: 'Real Müştərilər',
      isUp: true,
      icon: Users,
      color: 'text-amber-700 bg-amber-50 border-amber-200'
    },
  ];

  return (
    <div className="space-y-5 text-slate-700">
      {/* ── Header ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-[#4f533b]" /> Real analitika və dövriyyə hesabatları
            </h1>
            <span className="text-xs font-bold bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-md">
              Canlı data
            </span>
          </div>
          <p className="text-sm text-slate-500 font-medium">
            Real müştəri sifarişlərindən yığılan dövriyyə, ortalama səbət göstəriciləri və lider məhsullar.
          </p>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((st, i) => {
          const Icon = st.icon;
          return (
            <div key={i} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 tracking-wider">{st.title}</span>
                <div className={`w-9 h-9 rounded-xl border flex items-center justify-center ${st.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-xl font-black text-slate-900 tracking-tight">{st.value}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-0.5">
                  <ArrowUpRight className="w-3 h-3" /> {st.change}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Top Products Table ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4 shadow-xs">
        <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
          <Award className="w-5 h-5 text-[#4f533b]" /> Ən Çox Satılan Lider Məhsullar (Real Sifarişlərdən)
        </h3>

        {topProducts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200 text-xs font-bold text-slate-500 bg-slate-50">
                  <th className="py-3 px-4">Məhsul Adı</th>
                  <th className="py-3 px-4">Kateqoriya</th>
                  <th className="py-3 px-4">Satış Sayı</th>
                  <th className="py-3 px-4 text-right">Məbləğ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {topProducts.map((tp, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{tp.name}</td>
                    <td className="py-3.5 px-4 text-slate-500 text-xs font-medium">{tp.category}</td>
                    <td className="py-3.5 px-4 text-slate-700 font-bold">{tp.sales} ədəd</td>
                    <td className="py-3.5 px-4 text-right font-extrabold text-[#4f533b]">
                      {tp.revenue.toFixed(2)} ₼
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 text-xs text-slate-500 font-medium flex flex-col items-center gap-2">
            <Inbox className="w-8 h-8 text-slate-400" />
            <span>Hələlik sifariş olunmuş məhsul yoxdur. Mağazada ilk sifariş yarandıqda burada real göstəricilər hesablanacaq.</span>
          </div>
        )}
      </div>
    </div>
  );
}
