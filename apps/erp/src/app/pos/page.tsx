'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Store,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  User,
  UserPlus,
  CreditCard,
  Banknote,
  Printer,
  CheckCircle,
  AlertCircle,
  Clock,
  FileText,
  Percent,
  X,
  Phone,
  MapPin,
  Briefcase,
  Layers,
  ShoppingBag,
  Eye,
  Check,
  ChevronRight,
  RefreshCw,
  Package,
  Sparkles,
} from '../../components/HeroIconsHub';
import { addAuditLog } from '../../lib/auditLogger';
import { showToast } from '../../lib/toastStore';

interface PosProduct {
  id: string;
  name: string;
  model_name?: string;
  brand?: string;
  cash_price: number;
  stock: number;
  image?: string;
  category_id?: string;
  category_name?: string;
  sku?: string;
}

interface PosCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  fin_code?: string;
  total_spent?: number;
  order_count?: number;
}

interface CartItem {
  product: PosProduct;
  quantity: number;
}

export default function PosPage() {
  const [products, setProducts] = useState<PosProduct[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<PosCustomer[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchProduct, setSearchProduct] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Selected customer
  const [selectedCustomer, setSelectedCustomer] = useState<PosCustomer | null>(null);
  const [customerSearch, setCustomerSearch] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState(false);
  const [newCustomerForm, setNewCustomerForm] = useState({ name: '', phone: '', fin_code: '' });

  // Payment State
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [cashGiven, setCashGiven] = useState<string>('');
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [creditMonths, setCreditMonths] = useState<number>(6);
  const [downPayment, setDownPayment] = useState<string>('0');

  // Checkout Receipt Modal
  const [completedOrder, setCompletedOrder] = useState<any | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  const loadPosData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes, custRes] = await Promise.all([
        fetch('/api/catalog/products', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/catalog/categories', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch('/api/catalog/customers', { cache: 'no-store' }).then(r => r.ok ? r.json() : []).catch(() => []),
      ]);

      if (Array.isArray(prodRes) && prodRes.length > 0) {
        setProducts(prodRes.map((p: any) => ({
          ...p,
          cash_price: typeof p?.cash_price === 'number' ? p.cash_price : (parseFloat(String(p?.cash_price || 0)) || 0),
          stock: typeof p?.stock === 'number' ? p.stock : (parseInt(String(p?.stock || 0), 10) || 0),
        })));
      }

      if (Array.isArray(catRes)) setCategories(catRes);
      if (Array.isArray(custRes)) setCustomers(custRes);
    } catch (e) {
      console.error('POS data load error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosData();
  }, []);

  // Keyboard shortcut for fast search focusing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        setCart([]);
        setSearchProduct('');
        searchInputRef.current?.focus();
        showToast('Yeni satış başladıldı', 'info');
      } else if (e.key === 'F4') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = selectedCategory === 'ALL' || p.category_id === selectedCategory || p.category_name === selectedCategory;
      const q = searchProduct.toLowerCase().trim();
      const matchesSearch = !q ||
        p.name.toLowerCase().includes(q) ||
        (p.model_name && p.model_name.toLowerCase().includes(q)) ||
        (p.sku && p.sku.toLowerCase().includes(q)) ||
        (p.brand && p.brand.toLowerCase().includes(q));

      return matchesCat && matchesSearch;
    });
  }, [products, selectedCategory, searchProduct]);

  // Cart operations
  const addToCart = (product: PosProduct) => {
    if (product.stock <= 0) {
      showToast(`"${product.name}" məhsulunun stoku tükənib!`, 'error');
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showToast(`Maksimum anbar stoku: ${product.stock} ədəd`, 'warning');
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [{ product, quantity: 1 }, ...prev];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) {
              showToast(`Anbarda cəmi ${item.product.stock} ədəd var`, 'warning');
              return item;
            }
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Calculations
  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.product.cash_price * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const grandTotal = useMemo(() => {
    return Math.max(0, subtotal - discountAmount);
  }, [subtotal, discountAmount]);

  const changeAmount = useMemo(() => {
    const given = parseFloat(cashGiven) || 0;
    return Math.max(0, given - grandTotal);
  }, [cashGiven, grandTotal]);

  const monthlyPayment = useMemo(() => {
    if (paymentMethod !== 'credit') return 0;
    const dp = parseFloat(downPayment) || 0;
    const remaining = Math.max(0, grandTotal - dp);
    return creditMonths > 0 ? (remaining / creditMonths) : 0;
  }, [grandTotal, downPayment, creditMonths, paymentMethod]);

  // Checkout Execution
  const handleCheckout = async () => {
    if (cart.length === 0) {
      showToast('Səbət boşdur! Əvvəlcə məhsul seçin.', 'error');
      return;
    }

    const orderId = `TM-POS-${Math.floor(100000 + Math.random() * 900000)}`;
    const custName = selectedCustomer ? selectedCustomer.name : 'Pərakəndə Alıcı';
    const custPhone = selectedCustomer ? selectedCustomer.phone : '+994 50 000 00 00';

    const orderData = {
      id: orderId,
      customerName: custName,
      customerPhone: custPhone,
      totalAmount: grandTotal,
      paymentMethod,
      status: 'Çatdırıldı',
      createdAt: new Date().toISOString(),
      items: cart.map((i) => ({
        id: i.product.id,
        name: i.product.name,
        price: i.product.cash_price,
        quantity: i.quantity,
      })),
      discount: discountAmount,
      cashGiven: paymentMethod === 'cash' ? (parseFloat(cashGiven) || grandTotal) : null,
      changeAmount: paymentMethod === 'cash' ? changeAmount : null,
      creditMonths: paymentMethod === 'credit' ? creditMonths : null,
      downPayment: paymentMethod === 'credit' ? (parseFloat(downPayment) || 0) : null,
      monthlyPayment: paymentMethod === 'credit' ? monthlyPayment : null,
    };

    // Save to local storage orders
    try {
      const existing = localStorage.getItem('technomania_orders') || localStorage.getItem('erp_orders');
      let ordersList = [];
      if (existing) ordersList = JSON.parse(existing);
      ordersList.unshift(orderData);
      localStorage.setItem('technomania_orders', JSON.stringify(ordersList));
      localStorage.setItem('erp_orders', JSON.stringify(ordersList));
    } catch (e) {}

    // Audit log
    addAuditLog('POS_SALE', 'POS Terminalı', `${custName} üçün ${grandTotal.toFixed(2)} ₼ məbləğində satış rəsmiləşdirildi (${orderId}).`);

    setCompletedOrder(orderData);
    setIsReceiptModalOpen(true);
    setCart([]);
    setCashGiven('');
    setDiscountPercent(0);
    showToast(`Satış uğurla tamamlandı! Qəbz #${orderId} 🧾`, 'success');
  };

  // Quick Customer Creation
  const handleQuickAddCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim() || !newCustomerForm.phone.trim()) {
      showToast('Ad və telefon vacibdir', 'error');
      return;
    }

    const created: PosCustomer = {
      id: `cust_${Date.now()}`,
      name: newCustomerForm.name.trim(),
      phone: newCustomerForm.phone.trim(),
      fin_code: newCustomerForm.fin_code.trim(),
    };

    setCustomers((prev) => [created, ...prev]);
    setSelectedCustomer(created);
    setIsNewCustomerModalOpen(false);
    setNewCustomerForm({ name: '', phone: '', fin_code: '' });
    showToast(`"${created.name}" müştəri kimi seçildi`, 'success');
  };

  return (
    <div className="space-y-4 pb-12 antialiased select-none">
      {/* Top POS Header Bar */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center border border-emerald-500/20">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <span>POS Kassa və Satış Terminalı</span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full font-bold border border-emerald-200">
                Canlı Kassa
              </span>
            </h1>
            <p className="text-xs text-slate-500 font-medium">Sürətli pərakəndə nağd, kart və hissəli taksit satışı</p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600">
            [F2] Yeni Satış
          </span>
          <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-600">
            [F4] Axtarış
          </span>
          <button
            type="button"
            onClick={loadPosData}
            className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition cursor-pointer"
            title="Kataloqu yenilə"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-[#4f533b]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Side: Product Selector (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Barcode Input */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-3.5 shadow-xs space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchProduct}
                onChange={(e) => setSearchProduct(e.target.value)}
                placeholder="Məhsul adı, Model, Barkod və ya SKU daxil edin (F4)..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
                autoFocus
              />
              {searchProduct && (
                <button
                  type="button"
                  onClick={() => setSearchProduct('')}
                  className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Category Quick Tabs */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              <button
                type="button"
                onClick={() => setSelectedCategory('ALL')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                  selectedCategory === 'ALL'
                    ? 'bg-[#4f533b] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Hamısı ({products.length})
              </button>

              {categories.map((cat) => (
                <button
                  key={cat.id || cat.slug}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id || cat.name)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedCategory === (cat.id || cat.name)
                      ? 'bg-[#4f533b] text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="bg-white border border-slate-200/90 rounded-3xl p-4 shadow-xs min-h-[460px]">
            {loading ? (
              <div className="py-24 text-center">
                <div className="w-8 h-8 border-3 border-[#4f533b] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="py-24 text-center text-slate-400 space-y-2">
                <Package className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-xs font-bold text-slate-600">Axtarışa uyğun məhsul tapılmadı</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 max-h-[520px] overflow-y-auto pr-1 scrollbar-thin">
                {filteredProducts.map((p) => {
                  const inCartItem = cart.find((i) => i.product.id === p.id);
                  const isOut = p.stock <= 0;

                  return (
                    <div
                      key={p.id}
                      onClick={() => !isOut && addToCart(p)}
                      className={`p-3 rounded-2xl border transition-all flex flex-col justify-between group ${
                        isOut
                          ? 'bg-slate-50 border-slate-200/60 opacity-50 cursor-not-allowed'
                          : inCartItem
                          ? 'bg-[#f4f5f0] border-[#4f533b] shadow-xs cursor-pointer'
                          : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200/80 hover:border-slate-300 cursor-pointer hover-lift'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="w-full h-20 bg-white rounded-xl border border-slate-200/60 p-1 flex items-center justify-center overflow-hidden">
                          {p.image ? (
                            <img src={p.image} alt={p.name} className="max-h-full max-w-full object-contain" />
                          ) : (
                            <Package className="w-6 h-6 text-slate-300" />
                          )}
                        </div>

                        <div>
                          <span className="text-[10px] font-bold text-slate-400 block truncate">{p.brand || 'TechnoMania'}</span>
                          <h4 className="font-bold text-xs text-slate-900 line-clamp-2 leading-tight group-hover:text-[#4f533b]">
                            {p.name}
                          </h4>
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                        <span className="font-black text-xs text-emerald-700">
                          {p.cash_price.toFixed(2)} ₼
                        </span>

                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          isOut ? 'bg-rose-100 text-rose-700' : p.stock <= 2 ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                        }`}>
                          {isOut ? 'Bitib' : `${p.stock} ədəd`}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Active Cart & Checkout (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs space-y-4">
            {/* Customer Picker */}
            <div className="flex items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-bold block">Seçilmiş Müştəri:</span>
                  <span className="text-xs font-black text-slate-900 block truncate">
                    {selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.phone})` : 'Pərakəndə (Anonim) Alıcı'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-shrink-0">
                {selectedCustomer && (
                  <button
                    type="button"
                    onClick={() => setSelectedCustomer(null)}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
                    title="Müştərini sıfırla"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(true)}
                  className="px-2.5 py-1.5 bg-[#4f533b]/10 hover:bg-[#4f533b]/20 text-[#4f533b] font-bold text-xs rounded-xl transition cursor-pointer flex items-center gap-1"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Seç / Əlavə et</span>
                </button>
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-2 min-h-[200px] max-h-[260px] overflow-y-auto pr-1 scrollbar-thin">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-slate-400 space-y-1">
                  <ShoppingCart className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">Səbət hazırda boşdur</p>
                  <p className="text-[11px] text-slate-400">Sol tərəfdən məhsullara klikləyərək əlavə edin</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="min-w-0 flex-1">
                      <h5 className="font-bold text-xs text-slate-900 truncate">{item.product.name}</h5>
                      <span className="text-[11px] text-slate-500 font-semibold block">
                        {item.product.cash_price.toFixed(2)} ₼ × {item.quantity} = {(item.product.cash_price * item.quantity).toFixed(2)} ₼
                      </span>
                    </div>

                    {/* Stepper */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl p-0.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-black text-xs text-slate-800">{item.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-lg bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-600 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Payment Method Selector */}
            <div className="pt-3 border-t border-slate-100 space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'cash'
                      ? 'border-[#4f533b] bg-[#4f533b] text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Banknote className="w-4 h-4" />
                  <span>💵 Nağd</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-[#4f533b] bg-[#4f533b] text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>💳 Bank Kartı</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('credit')}
                  className={`p-2.5 rounded-2xl border text-xs font-bold transition flex flex-col items-center gap-1 cursor-pointer ${
                    paymentMethod === 'credit'
                      ? 'border-purple-600 bg-purple-600 text-white shadow-xs'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span>📊 Hissəli / Taksit</span>
                </button>
              </div>

              {/* Cash Input */}
              {paymentMethod === 'cash' && (
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-600">Alınan nağd məbləğ:</span>
                    <input
                      type="number"
                      value={cashGiven}
                      onChange={(e) => setCashGiven(e.target.value)}
                      placeholder={grandTotal.toFixed(2)}
                      className="w-28 text-right px-2 py-1 bg-white border border-slate-200 rounded-lg font-mono font-bold text-xs"
                    />
                  </div>
                  {parseFloat(cashGiven) > grandTotal && (
                    <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-slate-200/60 text-emerald-700">
                      <span>Qaytarılacaq qalıq:</span>
                      <span className="font-mono text-sm">{changeAmount.toFixed(2)} ₼</span>
                    </div>
                  )}
                </div>
              )}

              {/* Credit Terms Input */}
              {paymentMethod === 'credit' && (
                <div className="p-3 bg-purple-50/70 rounded-2xl border border-purple-200/80 space-y-2.5 text-xs font-bold">
                  <div className="flex items-center justify-between">
                    <span className="text-purple-900">Müddət (Ay):</span>
                    <div className="flex items-center gap-1">
                      {[3, 6, 12, 18, 24].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setCreditMonths(m)}
                          className={`px-2 py-1 rounded-lg border text-[11px] cursor-pointer ${
                            creditMonths === m
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-purple-900 border-purple-200'
                          }`}
                        >
                          {m} ay
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-purple-200/60 text-purple-900">
                    <span>Aylıq ödəniş:</span>
                    <span className="font-mono text-sm font-black">{monthlyPayment.toFixed(2)} ₼ / ay</span>
                  </div>
                </div>
              )}

              {/* Summary Rows */}
              <div className="space-y-1.5 text-xs pt-2">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Cəmi məbləğ:</span>
                  <span className="font-mono font-bold">{subtotal.toFixed(2)} ₼</span>
                </div>

                {discountAmount > 0 && (
                  <div className="flex items-center justify-between text-rose-600 font-bold">
                    <span>Endirim ({discountPercent}%):</span>
                    <span className="font-mono">-{discountAmount.toFixed(2)} ₼</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>Yekun Ödəniş:</span>
                  <span className="font-mono text-emerald-700 text-xl">{grandTotal.toFixed(2)} ₼</span>
                </div>
              </div>

              {/* Complete Sale Button */}
              <button
                type="button"
                onClick={handleCheckout}
                disabled={cart.length === 0}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-2xl shadow-md transition-all cursor-pointer active:scale-98 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <Check className="w-5 h-5" />
                <span>Satışı Rəsmiləşdir ({grandTotal.toFixed(2)} ₼)</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Printable Receipt Modal */}
      {isReceiptModalOpen && completedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp text-center">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-6 h-6" />
            </div>

            <div>
              <h3 className="font-black text-slate-900 text-base">Satış Tamamlandı!</h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{completedOrder.id}</p>
            </div>

            {/* Receipt Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>Müştəri:</span>
                <span>{completedOrder.customerName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-200 pb-1.5 font-bold">
                <span>Ödəniş növü:</span>
                <span>{completedOrder.paymentMethod === 'cash' ? '💵 Nağd' : completedOrder.paymentMethod === 'card' ? '💳 Kart' : '📊 Taksit'}</span>
              </div>
              <div className="space-y-1 pt-1">
                {completedOrder.items.map((i: any) => (
                  <div key={i.id} className="flex justify-between text-[11px]">
                    <span className="truncate max-w-[180px]">{i.name} ×{i.quantity}</span>
                    <span className="font-mono">{(i.price * i.quantity).toFixed(2)} ₼</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-200 font-black text-sm text-slate-900">
                <span>Yekun:</span>
                <span className="text-emerald-700">{completedOrder.totalAmount.toFixed(2)} ₼</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Çek Çap Et</span>
              </button>
              <button
                type="button"
                onClick={() => setIsReceiptModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Bağla
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Modal */}
      {isNewCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-black text-slate-900 text-sm">Müştəri Seç / Tez Əlavə Et</h3>
              <button
                type="button"
                onClick={() => setIsNewCustomerModalOpen(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Existing */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-600 block">Mövcud Müştərilərdən Seç:</span>
              <div className="max-h-36 overflow-y-auto space-y-1 pr-1 scrollbar-thin">
                {customers.map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setIsNewCustomerModalOpen(false);
                      showToast(`"${c.name}" seçildi`, 'success');
                    }}
                    className="p-2 rounded-xl bg-slate-50 hover:bg-[#f4f5f0] border border-slate-200/80 cursor-pointer flex items-center justify-between text-xs font-semibold"
                  >
                    <span>{c.name}</span>
                    <span className="text-slate-400 font-mono text-[11px]">{c.phone}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Create */}
            <form onSubmit={handleQuickAddCustomer} className="pt-3 border-t border-slate-100 space-y-2.5">
              <span className="text-xs font-bold text-slate-600 block">Və ya Yeni Müştəri Əlavə Et:</span>
              <input
                type="text"
                required
                value={newCustomerForm.name}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                placeholder="Müştərinin adı və soyadı..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
              />
              <input
                type="text"
                required
                value={newCustomerForm.phone}
                onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                placeholder="Telefon nömrəsi (+994 50...)"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:bg-white focus:border-[#4f533b]"
              />
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewCustomerModalOpen(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl transition cursor-pointer"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Müştərini Təyin Et
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
