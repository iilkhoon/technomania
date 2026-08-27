'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Card,
  CardHeader,
  CardContent,
  Button,
  Chip,
  Tooltip,
} from '@heroui/react';
import {
  Package,
  FolderTree,
  ShoppingCart,
  TrendingUp,
  Plus,
  ArrowRight,
  AlertTriangle,
  Zap,
  ArrowUpRight,
  Award,
  BarChart3,
  Eye,
  CreditCard,
  CheckCircle,
  Clock,
  Sparkles,
  Inbox,
  Store,
  Warehouse,
  ShieldCheck,
  RefreshCw,
  SlidersHorizontal,
  DollarSign,
  Search,
  ExternalLink,
  ChevronRight,
  CheckCircle2,
  TrendingDown,
  Calendar,
  Layers,
  Settings,
  ChevronUp,
  ChevronDown,
  X,
  Lock,
  FileSpreadsheet,
  Users,
  Megaphone,
} from '../components/HeroIconsHub';
import SparklineChart from '../components/SparklineChart';
import { Category, Product } from '../types/index';
import { getLocalCategories, getLocalProducts } from '../lib/supabase';
import { fetchAuditLogsFromApi, AuditLogEntry } from '../lib/auditLogger';
import { showToast } from '../lib/toastStore';

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

interface AnalyticsStorage {
  productViews: Record<string, { count: number; name: string }>;
  categoryViews: Record<string, { count: number; name: string }>;
  orders: OrderItem[];
}

export interface DashboardWidgetConfig {
  id: string;
  title: string;
  category: 'kpi' | 'sales' | 'inventory' | 'analytics' | 'security' | 'actions';
  description: string;
  iconName: string;
  visible: boolean;
  order: number;
}

export const DEFAULT_WIDGETS_CONFIG: DashboardWidgetConfig[] = [
  // KPI Cards
  { id: 'kpi_inventory_value', title: 'Aktiv anbar dəyəri', category: 'kpi', description: 'Real anbar qalıqlarının ümumi pul dəyəri', iconName: 'DollarSign', visible: true, order: 1 },
  { id: 'kpi_orders_count', title: 'Ümumi sifarişlər', category: 'kpi', description: 'Bütün nağd və kredit sifarişlərin statistikası', iconName: 'ShoppingCart', visible: true, order: 2 },
  { id: 'kpi_catalog_base', title: 'Kataloq bazası', category: 'kpi', description: 'Məhsul və kateqoriyaların ümumi sayı', iconName: 'Package', visible: true, order: 3 },
  { id: 'kpi_stock_alerts', title: 'Kritik stok xəbərdarlığı', category: 'kpi', description: 'Bitmiş və ya kritik azalmış məhsullar', iconName: 'AlertTriangle', visible: true, order: 4 },
  { id: 'kpi_credit_ratio', title: 'Kredit və taksit nisbəti', category: 'kpi', description: 'Kredit satışlarının ümumi satışa nisbəti', iconName: 'CreditCard', visible: true, order: 5 },
  { id: 'kpi_stock_health', title: 'Anbar sağlamlıq indeksi', category: 'kpi', description: 'Anbarın ümumi təminat və sağlamlıq faizi', iconName: 'ShieldCheck', visible: true, order: 6 },

  // Sections
  { id: 'section_revenue_chart', title: 'Satış və gəlir diaqramı', category: 'sales', description: 'Gəlirlərin və sifariş dinamikasının vizual qrafiki', iconName: 'TrendingUp', visible: true, order: 7 },
  { id: 'section_category_distribution', title: 'Kateqoriya üzrə anbar bölgüsü', category: 'inventory', description: 'Bölmələr üzrə məhsul və dövriyyə payı', iconName: 'FolderTree', visible: true, order: 8 },
  { id: 'section_recent_orders', title: 'Son sifarişlər paneli', category: 'sales', description: 'Müştərilərin ən son sifariş axını və statusları', iconName: 'ShoppingCart', visible: true, order: 9 },
  { id: 'section_recent_products', title: 'Son əlavə olunan mallar', category: 'inventory', description: 'Kataloqa daxil edilmiş son məhsulların cədvəli', iconName: 'Package', visible: true, order: 10 },
  { id: 'section_critical_stock', title: 'Kritik stok xəbərdarlıqları', category: 'inventory', description: 'Təcili tədarük tələb edən qalıqlar', iconName: 'AlertTriangle', visible: true, order: 11 },
  { id: 'section_top_products', title: 'Ən çox baxılan məhsullar', category: 'analytics', description: 'Müştərilərin canlı baxış və maraq reytinqi', iconName: 'Eye', visible: true, order: 12 },
  { id: 'section_sales_breakdown', title: 'Kredit və nağd liderləri', category: 'analytics', description: 'Ödəniş növləri üzrə ən çox satılan mallar', iconName: 'BarChart3', visible: true, order: 13 },
  { id: 'section_audit_live', title: 'Canlı təhlükəsizlik və audit jurnalı', category: 'security', description: 'Əməkdaşların son qiymət, stok və status əməliyyatları', iconName: 'ShieldCheck', visible: true, order: 14 },
];

export default function ERPDashboard() {
  const formattedAzDate = useMemo(() => {
    const d = new Date();
    const months = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "İyun",
      "İyul", "Avqust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
    ];
    const weekdays = [
      "Bazar", "Bazar ertəsi", "Çərşənbə axşamı", "Çərşənbə",
      "Cümə axşamı", "Cümə", "Şənbə"
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}, ${weekdays[d.getDay()]}`;
  }, []);

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsStorage>({
    productViews: {},
    categoryViews: {},
    orders: []
  });
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [userName, setUserName] = useState('İlkin Rzayev');
  const [userKey, setUserKey] = useState('default_user');
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'sales' | 'inventory' | 'analytics' | 'security'>('all');
  const [refreshing, setRefreshing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // ═══════════════════════════════════════════════════
  // ACCOUNT-SPECIFIC MODULAR DASHBOARD WIDGETS STATE
  // ═══════════════════════════════════════════════════
  const [widgetsConfig, setWidgetsConfig] = useState<DashboardWidgetConfig[]>(DEFAULT_WIDGETS_CONFIG);
  const [isWidgetManagerOpen, setIsWidgetManagerOpen] = useState(false);
  const [widgetCategoryFilter, setWidgetCategoryFilter] = useState<'all' | 'kpi' | 'sales' | 'inventory' | 'analytics' | 'security' | 'actions'>('all');
  const [widgetSearchQuery, setWidgetSearchQuery] = useState('');

  useEffect(() => {
    setMounted(true);
    let currentKey = 'default_user';
    try {
      const savedUser = localStorage.getItem('erp_active_user') || localStorage.getItem('technomania_erp_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        if (parsed?.name) setUserName(parsed.name);
        currentKey = parsed?.id || parsed?.email || parsed?.username || 'default_user';
      }
    } catch (e) {}
    setUserKey(currentKey);

    // Load account-specific widgets
    try {
      const saved = localStorage.getItem(`technomania_dashboard_widgets_${currentKey}`) ||
                    localStorage.getItem('technomania_dashboard_widgets_config');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const savedIds = new Set(parsed.map((p: any) => p.id));
          const missingDefaults = DEFAULT_WIDGETS_CONFIG.filter(dw => !savedIds.has(dw.id));
          setWidgetsConfig([...parsed, ...missingDefaults].sort((a, b) => a.order - b.order));
        }
      }
    } catch (e) {}
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 6) return 'Gecəniz xeyir';
    if (hour < 12) return 'Sabahınız xeyir';
    if (hour < 18) return 'Hər vaxtınız xeyir';
    return 'Axşamınız xeyir';
  }, []);

  const loadDashboardData = async () => {
    try {
      setRefreshing(true);
      const cats = getLocalCategories() || [];
      const prods = getLocalProducts() || [];
      setCategories(cats);
      setProducts(prods);

      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const [prodRes, catRes, logRes] = await Promise.all([
          fetch('/api/catalog/products', { signal: controller.signal }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetch('/api/catalog/categories', { signal: controller.signal }).then(r => r.ok ? r.json() : null).catch(() => null),
          fetchAuditLogsFromApi({ limit: 6 }).catch(() => null),
        ]);
        clearTimeout(timeoutId);

        if (Array.isArray(prodRes) && prodRes.length > 0) setProducts(prodRes);
        if (Array.isArray(catRes) && catRes.length > 0) setCategories(catRes);
        if (logRes && Array.isArray(logRes.logs)) setAuditLogs(logRes.logs);
      } catch (e) { }

      // Load Analytics & Orders
      const rawAnalytics = typeof window !== 'undefined' ? localStorage.getItem('technomania_real_analytics') : null;
      const rawOrders = typeof window !== 'undefined' ? (localStorage.getItem('technomania_orders') || localStorage.getItem('erp_orders')) : null;

      let loadedOrders: OrderItem[] = [];
      let loadedProdViews: Record<string, { count: number; name: string }> = {};
      let loadedCatViews: Record<string, { count: number; name: string }> = {};

      if (rawAnalytics) {
        try {
          const parsed = JSON.parse(rawAnalytics);
          loadedProdViews = parsed.productViews || {};
          loadedCatViews = parsed.categoryViews || {};
          if (Array.isArray(parsed.orders)) loadedOrders = parsed.orders;
        } catch (e) { }
      }

      if (loadedOrders.length === 0 && rawOrders) {
        try {
          const parsedOrders = JSON.parse(rawOrders);
          if (Array.isArray(parsedOrders)) loadedOrders = parsedOrders;
        } catch (e) { }
      }

      setAnalytics({
        productViews: loadedProdViews,
        categoryViews: loadedCatViews,
        orders: loadedOrders,
      });
    } catch (e) {
      console.error('Failed to load ERP local data:', e);
    } finally {
      setIsLoaded(true);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const saveWidgetsConfig = (newConfig: DashboardWidgetConfig[]) => {
    const sorted = [...newConfig].sort((a, b) => a.order - b.order);
    setWidgetsConfig(sorted);
    try {
      localStorage.setItem(`technomania_dashboard_widgets_${userKey}`, JSON.stringify(sorted));
      localStorage.setItem('technomania_dashboard_widgets_config', JSON.stringify(sorted));
    } catch (e) {}
  };

  const toggleWidgetVisibility = (id: string) => {
    const updated = widgetsConfig.map(w => w.id === id ? { ...w, visible: !w.visible } : w);
    saveWidgetsConfig(updated);
    const target = updated.find(w => w.id === id);
    showToast(`"${target?.title}" ${target?.visible ? 'aktivləşdirildi' : 'gizlədildi'} ⚙️`, 'info');
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const index = widgetsConfig.findIndex(w => w.id === id);
    if (index === -1) return;
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === widgetsConfig.length - 1) return;

    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const reordered = [...widgetsConfig];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    const updatedWithOrder = reordered.map((item, idx) => ({ ...item, order: idx + 1 }));
    saveWidgetsConfig(updatedWithOrder);
  };

  const resetWidgetsToDefault = () => {
    saveWidgetsConfig(DEFAULT_WIDGETS_CONFIG);
    showToast('Dashboard widget-ləri standart düzənə sıfırlandı 🔄', 'success');
  };

  const isWidgetActive = (id: string) => {
    const w = widgetsConfig.find(item => item.id === id);
    return w ? w.visible : true;
  };

  // Metrics
  const totalProducts = products.length;
  const inStockProductsCount = products.filter(p => (p?.stock ?? 0) > 0).length;
  const outOfStockProductsCount = products.filter(p => (p?.stock ?? 0) <= 0).length;
  const lowStockProductsCount = products.filter(p => (p?.stock ?? 0) > 0 && (p?.stock ?? 0) <= 2).length;
  const totalCategoriesCount = categories.length;

  const totalInventoryValue = products.reduce((sum, p) => {
    const price = typeof p?.cash_price === 'number' ? p.cash_price : (parseFloat(String(p?.cash_price || 0)) || 0);
    const qty = typeof p?.stock === 'number' ? p.stock : (parseInt(String(p?.stock || 0), 10) || 0);
    return sum + (price * qty);
  }, 0);

  const realOrders = analytics.orders || [];
  const totalOrdersCount = realOrders.length;
  const creditSalesCount = realOrders.filter(o => o.paymentMethod === 'credit').length;
  const cashSalesCount = realOrders.filter(o => o.paymentMethod === 'cash').length;
  const completedSalesCount = realOrders.filter(o => o.status === 'Çatdırıldı' || o.status === 'İcrada').length;

  const stockHealthScore = totalProducts > 0
    ? Math.round(((totalProducts - outOfStockProductsCount - lowStockProductsCount) / totalProducts) * 100)
    : 100;

  const recentProducts = [...products].reverse().slice(0, 6);
  const warningProducts = products.filter(p => (p?.stock ?? 0) <= 2);
  const recentOrdersList = realOrders.slice(0, 6);

  const topViewedProducts = [...products]
    .map(p => {
      const trackObj = analytics.productViews[p.id];
      const realViews = trackObj ? trackObj.count : 0;
      return { ...p, realViews };
    })
    .sort((a, b) => b.realViews - a.realViews)
    .slice(0, 6);

  const getProductOrderCounts = (methodFilter?: 'cash' | 'credit') => {
    const itemMap: Record<string, { product: Product; count: number; totalRev: number }> = {};

    realOrders.forEach(ord => {
      if (methodFilter && ord.paymentMethod !== methodFilter) return;
      (ord.items || []).forEach(item => {
        const matchingProd = products.find(p => p.id === item.id || p.model_name === item.name);
        const prodObj = matchingProd || ({
          id: item.id,
          name: item.name,
          model_name: item.name,
          cash_price: item.price,
          brand: 'TechnoMania',
          stock: 10
        } as any);

        if (!itemMap[item.id]) {
          itemMap[item.id] = { product: prodObj, count: 0, totalRev: 0 };
        }
        itemMap[item.id].count += item.quantity || 1;
        itemMap[item.id].totalRev += (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.values(itemMap).sort((a, b) => b.count - a.count);
  };

  const topCreditOrderedProducts = getProductOrderCounts('credit').slice(0, 5);

  // Category Distribution stats
  const categoryDistribution = useMemo(() => {
    const map: Record<string, number> = {};
    products.forEach(p => {
      const cat = p.category_name || 'Digər';
      map[cat] = (map[cat] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, count]) => ({
        name,
        count,
        percent: totalProducts > 0 ? Math.round((count / totalProducts) * 100) : 0,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }, [products, totalProducts]);

  const filteredModalWidgets = useMemo(() => {
    return widgetsConfig.filter(w => {
      const matchCat = widgetCategoryFilter === 'all' || w.category === widgetCategoryFilter;
      const matchSearch = !widgetSearchQuery.trim() ||
        w.title.toLowerCase().includes(widgetSearchQuery.toLowerCase()) ||
        w.description.toLowerCase().includes(widgetSearchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [widgetsConfig, widgetCategoryFilter, widgetSearchQuery]);

  const visibleWidgetsCount = widgetsConfig.filter(w => w.visible).length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn select-none antialiased">
      {/* ═══ 1. EXECUTIVE HERO BANNER ═══ */}
      <Card className="relative overflow-hidden bg-gradient-to-r from-white via-white to-[#f4f6ee] border border-slate-200/90 rounded-3xl shadow-xs transition-all">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 w-64 h-64 bg-[#4f533b]/5 rounded-full blur-3xl pointer-events-none" />

        <CardContent className="p-6 sm:p-7 relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 bg-slate-100/90 text-slate-700 font-semibold border border-slate-200/80 px-3 py-1 rounded-full text-xs">
                  <Calendar className="w-3.5 h-3.5 text-[#4f533b]" />
                  {formattedAzDate}
                </span>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 px-3 py-1 rounded-full text-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem aktivdir
                </span>
                <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-800 font-bold border border-amber-200/80 px-3 py-1 rounded-full text-xs">
                  🧩 {visibleWidgetsCount} / {widgetsConfig.length} widget aktiv
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                {greeting}, {userName} <span className="text-xl sm:text-2xl">👋</span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-2xl leading-relaxed font-medium">
                İdarəetmə panelinə xoş gəlmisiniz. Modulyar statistik kartların yerini sərbəst dəyişə və ya ehtiyacınıza uyğun tənzimləyə bilərsiniz.
              </p>
            </div>

            {/* Quick Action Button Group */}
            <div className="flex flex-wrap items-center gap-2.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => setIsWidgetManagerOpen(true)}
                className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-2xl border border-slate-200 shadow-xs transition cursor-pointer active:scale-95 group"
              >
                <SlidersHorizontal className="w-4 h-4 text-[#4f533b] group-hover:rotate-45 transition-transform" />
                <span>Vidcetləri idarə et</span>
              </button>

              <Tooltip content="Məlumatları yenilə" placement="bottom">
                <Button
                  isIconOnly
                  variant="bordered"
                  onClick={loadDashboardData}
                  isDisabled={refreshing}
                  className="bg-white border-slate-200 text-slate-700 min-w-10 h-10 rounded-2xl active:scale-95 transition-transform"
                  aria-label="Yenilə"
                >
                  <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#4f533b]' : ''}`} />
                </Button>
              </Tooltip>

              <Button
                as={Link}
                href="/pos"
                variant="solid"
                className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs h-10 px-4 rounded-2xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Store className="w-4 h-4" />
                <span>POS kassa</span>
              </Button>

              <Button
                as={Link}
                href="/products/new"
                variant="solid"
                className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs h-10 px-4 rounded-2xl shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Yeni məhsul</span>
              </Button>
            </div>
          </div>

          {/* Overview Filter Selector Tabs & Health Gauge */}
          <div className="mt-6 pt-5 border-t border-slate-200/60 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80 inline-flex items-center gap-1.5 overflow-x-auto scrollbar-none max-w-full">
              {[
                { key: 'all', label: 'Bütün icmal' },
                { key: 'sales', label: '🛒 Satış və sifarişlər' },
                { key: 'inventory', label: '📦 Anbar və kataloq' },
                { key: 'analytics', label: '🔥 Canlı baxışlar' },
                { key: 'security', label: '🔒 Təhlükəsizlik jurnalı' },
              ].map((tab) => {
                const isActive = activeTab === tab.key;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer select-none ${
                      isActive
                        ? 'bg-[#4f533b] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-white/70'
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 font-medium min-w-[220px]">
              <div className="flex-1 space-y-1 bg-white/70 p-2.5 rounded-2xl border border-slate-200/60">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-slate-700">Anbar sağlamlığı</span>
                  <span className="font-black text-[#4f533b]">{stockHealthScore}%</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      stockHealthScore > 80 ? 'bg-emerald-500' : stockHealthScore > 50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, Math.max(0, stockHealthScore))}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ═══ 2. MODULAR KPI STATS CARDS GRID ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {isWidgetActive('kpi_inventory_value') && (
          <Card className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl shadow-xs hover-lift transition-all animate-fadeIn">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-100 shadow-2xs">
                  <DollarSign className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                  Real qalıq
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 block">Aktiv anbar dəyəri</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {totalInventoryValue.toLocaleString('az-AZ', { minimumFractionDigits: 0 })} ₼
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>{inStockProductsCount} aktiv məhsul</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isWidgetActive('kpi_orders_count') && (
          <Card className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl shadow-xs hover-lift transition-all animate-fadeIn">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-2xs">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                  {completedSalesCount} uğurlu
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 block">Ümumi sifarişlər</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {totalOrdersCount} ədəd
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span>{creditSalesCount} kredit, {cashSalesCount} nağd</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isWidgetActive('kpi_catalog_base') && (
          <Card className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl shadow-xs hover-lift transition-all animate-fadeIn">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-[#f4f6ee] text-[#4f533b] flex items-center justify-center border border-[#4f533b]/20 shadow-2xs">
                  <Package className="w-4 h-4" />
                </div>
                <Link href="/categories" className="text-[10px] font-bold text-[#4f533b] hover:underline">
                  {totalCategoriesCount} bölmə →
                </Link>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 block">Kataloq bazası</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {totalProducts} məhsul
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#4f533b]" />
                  <span>{totalCategoriesCount} aktiv kateqoriya</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isWidgetActive('kpi_stock_alerts') && (
          <Card className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl shadow-xs hover-lift transition-all animate-fadeIn">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${
                  outOfStockProductsCount > 0 ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}>
                  {outOfStockProductsCount > 0 ? 'Təcili diqqət' : 'Nəzarətdə'}
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 block">Kritik stok</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {lowStockProductsCount + outOfStockProductsCount} məhsul
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{outOfStockProductsCount} bitib, {lowStockProductsCount} azalıb</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isWidgetActive('kpi_credit_ratio') && (
          <Card className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl shadow-xs hover-lift transition-all animate-fadeIn">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-2xs">
                  <CreditCard className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                  Taksit payı
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 block">Kredit nisbəti</span>
                <div className="text-xl sm:text-2xl font-black text-purple-700 tracking-tight mt-0.5">
                  {totalOrdersCount > 0 ? Math.round((creditSalesCount / totalOrdersCount) * 100) : 0}%
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>{creditSalesCount} kredit qeydiyyatı</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {isWidgetActive('kpi_stock_health') && (
          <Card className="bg-white border border-slate-200/90 hover:border-slate-300 rounded-3xl shadow-xs hover-lift transition-all animate-fadeIn">
            <CardContent className="p-4 sm:p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center border border-teal-100 shadow-2xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span className="text-[10px] font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-100">
                  {stockHealthScore}% təminat
                </span>
              </div>

              <div>
                <span className="text-xs font-bold text-slate-600 block">Anbar sağlamlığı</span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                  {stockHealthScore}%
                </div>
                <div className="text-[11px] text-slate-500 font-medium mt-1 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  <span>{inStockProductsCount} məhsul anbardadır</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══ 3. SECTION: DUAL ANALYTICS DIAGRAMS (REVENUE & CATEGORY SHARE) ═══ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Revenue Dynamics */}
        {isWidgetActive('section_revenue_chart') && (
          <Card className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl shadow-xs animate-fadeIn">
            <CardHeader className="p-5 sm:p-6 pb-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] flex items-center justify-center border border-[#4f533b]/20">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">Satış və dövriyyə dinamikası</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Həftəlik sifarişlər və gəlir axını</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#4f533b]" /> Nağd
                </span>
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Hissəli
                </span>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6">
              <div className="h-44 sm:h-52 w-full relative flex items-end justify-between gap-2 sm:gap-4 pt-6">
                <div className="absolute inset-0 flex flex-col justify-between pointer-events-none opacity-30">
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                  <div className="border-b border-dashed border-slate-300 w-full" />
                </div>

                {[
                  { day: 'B.E', cash: 45, credit: 60, total: '2,450 ₼' },
                  { day: 'Ç.A', cash: 60, credit: 80, total: '3,100 ₼' },
                  { day: 'Çər', cash: 50, credit: 65, total: '2,800 ₼' },
                  { day: 'C.A', cash: 75, credit: 90, total: '4,200 ₼' },
                  { day: 'Cüm', cash: 85, credit: 110, total: '5,600 ₼' },
                  { day: 'Şən', cash: 100, credit: 130, total: '6,900 ₼' },
                  { day: 'Baz', cash: 90, credit: 115, total: '5,850 ₼' },
                ].map((item, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2 group relative z-10">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg pointer-events-none shadow-md">
                      {item.total}
                    </div>
                    <div className="w-full max-w-[36px] flex items-end justify-center gap-1 h-32 sm:h-36">
                      <div
                        className="w-1/2 bg-[#4f533b] rounded-t-lg transition-all duration-500 hover:opacity-80 shadow-2xs"
                        style={{ height: `${item.cash}%` }}
                      />
                      <div
                        className="w-1/2 bg-purple-500 rounded-t-lg transition-all duration-500 hover:opacity-80 shadow-2xs"
                        style={{ height: `${item.credit}%` }}
                      />
                    </div>
                    <span className="text-[11px] font-bold text-slate-500">{item.day}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Right: Category Distribution */}
        {isWidgetActive('section_category_distribution') && (
          <Card className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs animate-fadeIn">
            <CardHeader className="p-5 sm:p-6 pb-3 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/10 text-amber-700 flex items-center justify-center border border-amber-500/20">
                  <FolderTree className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 tracking-tight">Kateqoriya üzrə anbar payı</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Ən böyük məhsul payına sahib bölmələr</p>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 sm:p-6 space-y-4">
              {categoryDistribution.map((c, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">{c.name}</span>
                    <span className="text-slate-500 font-medium">{c.count} məhsul ({c.percent}%)</span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        idx === 0 ? 'bg-[#4f533b]' : idx === 1 ? 'bg-blue-600' : idx === 2 ? 'bg-purple-600' : idx === 3 ? 'bg-amber-500' : 'bg-teal-500'
                      }`}
                      style={{ width: `${Math.max(5, c.percent)}%` }}
                    />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* ═══ 4. SECTION: RECENT ORDERS & RECENT PRODUCTS ═══ */}
      {(activeTab === 'all' || activeTab === 'sales') && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Son Sifarişlər Paneli */}
          {isWidgetActive('section_recent_orders') && (
            <Card className="lg:col-span-7 bg-white border border-slate-200/90 rounded-3xl shadow-xs animate-fadeIn">
              <CardHeader className="p-5 sm:p-6 pb-3.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs">
                    <ShoppingCart className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Son sifarişlər</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Müştərilərin daxil olan sifarişləri</p>
                  </div>
                </div>
                <Link
                  href="/orders"
                  className="text-xs font-bold text-[#4f533b] hover:text-[#3e4230] flex items-center gap-1"
                >
                  <span>Bütün sifarişlər ({realOrders.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-4 space-y-2.5">
                {recentOrdersList.length > 0 ? (
                  recentOrdersList.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group hover-lift"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-[#4f533b]/10 text-[#4f533b] font-black text-xs flex items-center justify-center flex-shrink-0">
                          {ord.customerName ? ord.customerName.charAt(0) : 'M'}
                        </div>
                        <div className="space-y-0.5 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono font-bold text-xs text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200 shadow-2xs">
                              {ord.id}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                              {ord.status || 'İcrada'}
                            </span>
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {ord.customerName} • <span className="text-slate-500 font-normal">{ord.customerPhone}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 flex-shrink-0">
                        <span className="text-sm font-black text-slate-900">
                          {(ord.totalAmount || 0).toLocaleString()} ₼
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {ord.paymentMethod === 'credit' ? '💳 Hissəli' : '💵 Nağd'}
                        </span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-xs text-slate-400">
                    Hələlik sifariş qeydə alınmayıb.
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Son Əlavə Olunan Mallar */}
          {isWidgetActive('section_recent_products') && (
            <Card className="lg:col-span-5 bg-white border border-slate-200/90 rounded-3xl shadow-xs animate-fadeIn">
              <CardHeader className="p-5 sm:p-6 pb-3.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-2xs">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Son əlavə olunan mallar</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Kataloqa yeni daxil edilmiş məhsullar</p>
                  </div>
                </div>
                <Link
                  href="/products"
                  className="text-xs font-bold text-[#4f533b] hover:text-[#3e4230] flex items-center gap-1"
                >
                  <span>Hamısı ({products.length})</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-4 space-y-2.5">
                {recentProducts.map((p) => {
                  const price = typeof p?.cash_price === 'number' ? p.cash_price : (parseFloat(String(p?.cash_price || 0)) || 0);
                  const stock = typeof p?.stock === 'number' ? p.stock : (parseInt(String(p?.stock || 0), 10) || 0);
                  return (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 transition-all hover-lift"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="max-h-full object-contain" />
                          ) : (
                            <Package className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-xs text-slate-900 block truncate">{p.name}</span>
                          <span className="text-[10px] text-slate-400 block">{p.category_name || 'Kataloq'}</span>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-black text-[#4f533b] block">{price.toFixed(2)} ₼</span>
                        <span className={`text-[10px] font-bold block ${stock > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {stock > 0 ? `${stock} ədəd` : 'Tükənib'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══ 5. SECTION: TOP VIEWED & SALES BREAKDOWN ═══ */}
      {(activeTab === 'all' || activeTab === 'analytics') && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {isWidgetActive('section_top_products') && (
            <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-xs animate-fadeIn">
              <CardHeader className="p-5 sm:p-6 pb-3.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center border border-blue-100 shadow-2xs">
                    <Eye className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Ən çox baxılan məhsullar</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Müştərilərin canlı baxış və maraq reytinqi</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-4 space-y-2.5">
                {topViewedProducts.map((p, idx) => (
                  <div
                    key={p.id}
                    className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 transition-all"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <span className="w-6 h-6 rounded-lg bg-blue-100 text-blue-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                        #{idx + 1}
                      </span>
                      <span className="font-bold text-xs text-slate-900 truncate">{p.name}</span>
                    </div>
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-xl border border-blue-100 flex-shrink-0">
                      {p.realViews} baxış
                    </span>
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {isWidgetActive('section_sales_breakdown') && (
            <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-xs animate-fadeIn">
              <CardHeader className="p-5 sm:p-6 pb-3.5 flex items-center justify-between border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-100 shadow-2xs">
                    <CreditCard className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 tracking-tight">Kreditlə ən çox alınanlar</h3>
                    <p className="text-[11px] text-slate-500 font-medium">Taksit və hissəli ödəniş sifarişləri</p>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-5 sm:p-6 pt-4 space-y-2.5">
                {topCreditOrderedProducts.length > 0 ? (
                  topCreditOrderedProducts.map((item, idx) => (
                    <div
                      key={item.product.id}
                      className="p-3 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="w-6 h-6 rounded-lg bg-purple-100 text-purple-700 font-black text-xs flex items-center justify-center flex-shrink-0">
                          #{idx + 1}
                        </span>
                        <span className="font-bold text-xs text-slate-900 truncate">
                          {item.product.name || item.product.model_name}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-xl border border-purple-100 flex-shrink-0">
                        {item.count} ədəd
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-xs text-slate-400">
                    Hələlik kredit satışı qeydə alınmayıb.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ═══ 6. SECTION: AUDIT LOGS LIVE ═══ */}
      {(activeTab === 'all' || activeTab === 'security') && isWidgetActive('section_audit_live') && (
        <Card className="bg-white border border-slate-200/90 rounded-3xl shadow-xs animate-fadeIn">
          <CardHeader className="p-5 sm:p-6 pb-3.5 flex items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-100 shadow-2xs">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 tracking-tight">Dəyişməz təhlükəsizlik və audit qeydləri</h3>
                <p className="text-[11px] text-slate-500 font-medium">Əməkdaşların son qiymət dəyişikliyi, stok silinməsi və status əməliyyatları</p>
              </div>
            </div>
            <Link
              href="/audit-logs"
              className="text-xs font-bold text-[#4f533b] hover:text-[#3e4230] flex items-center gap-1"
            >
              <span>Audit jurnalına keç →</span>
            </Link>
          </CardHeader>

          <CardContent className="p-5 sm:p-6 pt-4">
            {auditLogs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                {auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3.5 rounded-2xl bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 hover:border-amber-200 space-y-2 transition-all hover-lift"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 truncate max-w-[140px]">{log.user_name}</span>
                      <span className="font-mono text-slate-400">{new Date(log.created_at).toLocaleTimeString('az-AZ', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-slate-700 font-medium line-clamp-2 leading-relaxed" title={log.details}>
                      {log.details}
                    </p>
                    <div className="flex items-center justify-between text-[10px] pt-1.5 border-t border-slate-200/60">
                      <span className="font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200/60">{log.action}</span>
                      <span className="text-emerald-700 font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Silinməz
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-xs text-slate-500 font-medium">
                Hələlik yeni audit qeydi qeydə alınmayıb.
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* ═══ 7. MODULAR DASHBOARD WIDGET MANAGER MODAL ═══ */}
      {isWidgetManagerOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <div
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-md transition-opacity animate-fadeIn"
            onClick={() => setIsWidgetManagerOpen(false)}
          />

          <div
            className="relative w-full max-w-2xl my-auto bg-white rounded-3xl p-6 sm:p-7 shadow-2xl border border-slate-200 z-10 animate-scaleUp flex flex-col max-h-[88vh]"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-[#4f533b]/10 text-[#4f533b] flex items-center justify-center border border-[#4f533b]/20">
                  <SlidersHorizontal className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-slate-900">Modulyar dashboard vidcetləri</h3>
                  <p className="text-xs text-slate-500 font-medium">Statistik kartların və bölmələrin yerini dəyişin və ya gizlədin</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsWidgetManagerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 pb-2 space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={widgetSearchQuery}
                  onChange={e => setWidgetSearchQuery(e.target.value)}
                  placeholder="Vidcet adı və ya izahı üzrə axtar..."
                  className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                />
              </div>

              <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                {[
                  { key: 'all', label: 'Bütün vidcetlər' },
                  { key: 'kpi', label: '📊 KPI kartları' },
                  { key: 'sales', label: '🛒 Satış və sifariş' },
                  { key: 'inventory', label: '📦 Anbar' },
                  { key: 'analytics', label: '🔥 Analitika' },
                  { key: 'security', label: '🔒 Təhlükəsizlik' },
                ].map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setWidgetCategoryFilter(c.key as any)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                      widgetCategoryFilter === c.key
                        ? 'bg-[#4f533b] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {c.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-2 overflow-y-auto space-y-2.5 flex-1 pr-1 scrollbar-thin">
              {filteredModalWidgets.map((widget, idx) => (
                <div
                  key={widget.id}
                  className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    widget.visible
                      ? 'bg-slate-50/80 border-slate-200/90'
                      : 'bg-slate-100/40 border-slate-200/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className="flex flex-col gap-0.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => moveWidget(widget.id, 'up')}
                        disabled={idx === 0}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Yuxarı köçür"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWidget(widget.id, 'down')}
                        disabled={idx === filteredModalWidgets.length - 1}
                        className="p-1 rounded hover:bg-slate-200 text-slate-500 disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                        title="Aşağı köçür"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="w-6 h-6 rounded-lg bg-white border border-slate-200 font-bold text-xs flex items-center justify-center text-slate-700 shadow-2xs">
                      {widget.order}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-slate-900 truncate">{widget.title}</span>
                        <span className="text-[10px] font-medium text-slate-400 bg-white px-1.5 py-0.5 rounded border border-slate-200">
                          {widget.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium truncate mt-0.5">{widget.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleWidgetVisibility(widget.id)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        widget.visible ? 'bg-[#4f533b]' : 'bg-slate-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          widget.visible ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                    <span className="text-xs font-bold text-slate-600 min-w-[45px] text-right">
                      {widget.visible ? 'Aktiv' : 'Gizli'}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={resetWidgetsToDefault}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 transition cursor-pointer"
              >
                Varsayılana sıfırla
              </button>

              <button
                type="button"
                onClick={() => {
                  setIsWidgetManagerOpen(false);
                  showToast('Vidcet tənzimləmələri yadda saxlanıldı! 🚀', 'success');
                }}
                className="px-6 py-2.5 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs rounded-xl shadow-md transition cursor-pointer"
              >
                Yadda saxla və bağla
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
