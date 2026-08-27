'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCart,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Search,
  Sparkles,
  ChevronRight,
  MapPin,
  PhoneCall,
  Globe,
  Sun,
  Moon,
  Menu,
  Scale,
  Heart,
  User,
  ShieldCheck,
  Truck,
  CreditCard,
  Plus,
  Minus,
  Tag,
  Check,
  Lock,
  ArrowRight,
  DollarSign,
  Zap,
} from '../components/HeroIconsHub';
import { LEADER_PRODUCTS, GREAT_OFFERS, toSlug, Product } from '../data/products';
import { translations, Language } from '../data/translations';
import { recordNewOrder } from '../lib/analytics';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useSearchParams } from 'next/navigation';
import { Button } from '@heroui/react';
import {
  getAppliedCouponCode,
  setAppliedCouponCode,
  validateCoupon,
  PromoCoupon
} from '../utils/couponManager';

interface CartItem {
  product: Product;
  quantity: number;
}

function CartContent() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');
  const t = translations[currentLang] || translations.AZ;

  useEffect(() => {
    const savedLang = (localStorage.getItem('technomania_lang') as Language) || 'AZ';
    if (savedLang && (savedLang === 'AZ' || savedLang === 'EN' || savedLang === 'RU')) {
      setCurrentLang(savedLang);
    }
  }, []);

  const handleLangChange = (lang: Language) => {
    setCurrentLang(lang);
    localStorage.setItem('technomania_lang', lang);
  };
  const searchParams = useSearchParams();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [comparedIds, setComparedIds] = useState<string[]>([]);
  const [promoCode, setPromoCode] = useState('');
  const [appliedCouponCode, setAppliedCouponState] = useState<string>('');
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutMode, setCheckoutMode] = useState<'cash' | 'credit'>('cash');
  const [checkoutForm, setCheckoutForm] = useState({
    fullName: '',
    phone: '+994 ',
    address: '',
    finCode: '',
    birthDate: '',
    salary: '',
    months: '12',
  });
  const [orderSubmitted, setOrderSubmitted] = useState(false);
  const [orderId, setOrderId] = useState('');

  // Sync applied coupon from localStorage & URL
  useEffect(() => {
    if (searchParams.get('checkout') === 'true') {
      setIsCheckoutOpen(true);
    }
    const urlCoupon = searchParams.get('coupon') || searchParams.get('promo');
    if (urlCoupon) {
      setAppliedCouponCode(urlCoupon);
      setPromoCode(urlCoupon.toUpperCase());
    }

    const current = getAppliedCouponCode();
    setAppliedCouponState(current);
    if (current) setPromoCode(current);

    const handleUpdate = () => {
      setAppliedCouponState(getAppliedCouponCode());
    };
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('techno_coupon_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('techno_coupon_updated', handleUpdate);
    };
  }, [searchParams]);

  // Load cart on mount
  useEffect(() => {
    const savedDark = localStorage.getItem('technomania_dark') === 'true';
    setIsDarkMode(savedDark);
    if (savedDark) {
      document.documentElement.classList.add('dark');
    }

    const savedCart = localStorage.getItem('technomania_cart');
    if (savedCart) {
      try {
        const rawProducts: Product[] = JSON.parse(savedCart);
        const itemMap = new Map<string, CartItem>();
        rawProducts.forEach(p => {
          if (itemMap.has(p.id)) {
            itemMap.get(p.id)!.quantity += 1;
          } else {
            itemMap.set(p.id, { product: p, quantity: 1 });
          }
        });
        setCartItems(Array.from(itemMap.values()));
      } catch (e) {
        console.error(e);
        setCartItems([]);
      }
    } else {
      setCartItems([]);
    }

    const savedFavs = localStorage.getItem('technomania_favorites');
    if (savedFavs) {
      try { setFavoriteIds(JSON.parse(savedFavs)); } catch (e) {}
    }

    const savedCompare = localStorage.getItem('technomania_compare');
    if (savedCompare) {
      try { setComparedIds(JSON.parse(savedCompare)); } catch (e) {}
    }
  }, []);

  const saveCartState = (items: CartItem[]) => {
    setCartItems(items);
    const flat: Product[] = [];
    items.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        flat.push(item.product);
      }
    });
    localStorage.setItem('technomania_cart', JSON.stringify(flat));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cartItems.map(item => {
      if (item.product.id === productId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    });
    saveCartState(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cartItems.filter(item => item.product.id !== productId);
    saveCartState(updated);
  };

  const clearCart = () => {
    saveCartState([]);
  };

  const parsePrice = (priceStr: string) => {
    const num = parseFloat(priceStr.replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const subtotal = cartItems.reduce((acc, item) => {
    const unitPrice = item.product.rawPrice || parsePrice(item.product.cash_price);
    return acc + (unitPrice * item.quantity);
  }, 0);

  // Validate applied coupon
  const couponValidation = validateCoupon(appliedCouponCode, subtotal);
  const discountAmount = couponValidation.valid ? couponValidation.discountAmount : 0;
  const deliveryFee = 0;
  const grandTotal = Math.max(0, subtotal - discountAmount + deliveryFee);
  const totalMonthly = (grandTotal / 12).toFixed(2);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');

    const res = validateCoupon(promoCode, subtotal);
    if (res.valid) {
      setAppliedCouponCode(promoCode);
      setPromoSuccess(res.message);
    } else {
      setPromoError(res.message);
    }
  };

  const handleRemovePromo = () => {
    setAppliedCouponCode('');
    setPromoCode('');
    setPromoSuccess('');
    setPromoError('');
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const randomOrderNum = 'TM-' + Math.floor(100000 + Math.random() * 900000);
    setOrderId(randomOrderNum);

    try {
      recordNewOrder({
        id: randomOrderNum,
        customerName: checkoutForm.fullName || 'Müştəri',
        customerPhone: checkoutForm.phone || '+994 50 000 00 00',
        totalAmount: grandTotal,
        paymentMethod: checkoutMode === 'credit' ? 'credit' : 'cash',
        items: cartItems.map(item => ({
          id: item.product.id,
          name: item.product.model_name,
          price: typeof item.product.cash_price === 'number' ? item.product.cash_price : parseFloat(String(item.product.cash_price || 0)) || 0,
          quantity: item.quantity
        }))
      });
    } catch (err) {}

    setOrderSubmitted(true);
    saveCartState([]);
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#f8fafc] text-slate-900'} flex flex-col`}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLang={currentLang}
        setCurrentLang={handleLangChange}
      />

      {/* SLEEK CART HEADER BAR */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <div className="bg-[#4f533b] text-white rounded-2xl p-3.5 sm:p-4 shadow-md flex flex-wrap items-center justify-between gap-3 border border-[#3e4230]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 font-bold border border-white/20">
              <ShoppingCart className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-black tracking-tight">
                  {t.cartTitle}
                </h1>
                <span className="text-[10px] font-black bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full text-white">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} Məhsul
                </span>
              </div>
              <span className="text-[11px] text-[#f4f5f0] font-medium hidden sm:block">
                {t.cartDesc}
              </span>
            </div>
          </div>

          {cartItems.length > 0 && (
            <button
              onClick={clearCart}
              className="bg-rose-500/20 hover:bg-rose-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl border border-rose-300/30 transition flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-200" /> Səbəti təmizlə
            </button>
          )}
        </div>
      </div>

      {/* CART MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full">
        {cartItems.length === 0 ? (
          <div className={`rounded-3xl border p-12 text-center max-w-lg mx-auto my-8 shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
            <div className="w-20 h-20 rounded-3xl bg-[#f4f5f0] dark:bg-stone-900/80 border border-[#4f533b]/30 flex items-center justify-center mx-auto mb-4 text-[#4f533b] shadow-inner">
              <ShoppingCart className="w-10 h-10 text-[#4f533b]" />
            </div>
            <h3 className="text-xl font-black mb-2">{t.emptyCart}</h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-6 max-w-sm mx-auto">
              Səbətinizə məhsul əlavə etmək üçün kataloqu kəşf edin və əsas endirimlərdən yararlanın.
            </p>
            <button
              onClick={() => router.push('/')}
              className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-black text-xs sm:text-sm px-6 py-3 rounded-2xl shadow-lg shadow-[#4f533b]/25 transition flex items-center gap-2 mx-auto cursor-pointer"
            >
              {t.startShopping}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Cart Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className={`rounded-3xl border overflow-hidden shadow-sm ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span className="font-extrabold text-xs tracking-wider text-slate-400">Səbətdəki Məhsullar</span>
                  <span className="text-xs font-bold text-[#4f533b]">Qapıda / Hissə-hissə Ödəniş Dəstəyi</span>
                </div>

                <div className="divide-y divide-slate-100 dark:divide-slate-800">
                  {cartItems.map(item => {
                    const unitPrice = item.product.rawPrice || parsePrice(item.product.cash_price);
                    const itemTotal = unitPrice * item.quantity;

                    return (
                      <div key={item.product.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 group">
                        
                        <div className="flex items-center gap-4 w-full sm:w-auto">
                          <div
                            className="w-20 h-20 p-2 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60 flex items-center justify-center flex-shrink-0 cursor-pointer group-hover:scale-105 transition-transform"
                            onClick={() => router.push(`/product/${toSlug(item.product.model_name)}`)}
                          >
                            <img
                              src={item.product.image || undefined}
                              alt={item.product.model_name}
                              className="h-16 object-contain"
                            />
                          </div>

                          <div>
                            <span className="text-[9px] font-bold text-[#4f533b] bg-[#f4f5f0] dark:bg-stone-900/80 px-2 py-0.5 rounded border border-emerald-200/40 ">
                              {item.product.brand}
                            </span>
                            <h4
                              className="font-black text-xs sm:text-sm line-clamp-2 cursor-pointer hover:text-[#4f533b] transition mt-1"
                              onClick={() => router.push(`/product/${toSlug(item.product.model_name)}`)}
                            >
                              {item.product.model_name}
                            </h4>
                            <span className="text-[10px] font-bold text-emerald-600 dark:text-[#a3a886] flex items-center gap-1 mt-1">
                              <CheckCircle2 className="w-3 h-3" /> Stokda var (1 İlə Zəmanət)
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                          
                          <div className="flex items-center border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                            <button
                              onClick={() => updateQuantity(item.product.id, -1)}
                              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="px-3 font-black text-xs min-w-[28px] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.product.id, 1)}
                              className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white transition cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="font-black text-base sm:text-lg text-[#4f533b] dark:text-[#a3a886] block leading-tight">
                              {itemTotal.toFixed(2)} ₼
                            </span>
                            <span className="text-[10px] font-semibold text-slate-400">
                              ({unitPrice.toFixed(2)} ₼ / ədəd)
                            </span>
                          </div>

                          <button
                            onClick={() => removeItem(item.product.id)}
                            className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                            title="Səbətdən sil"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Promo Code Input Card */}
              <div className={`rounded-2xl border p-4 space-y-2 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                {appliedCouponCode && couponValidation.valid ? (
                  <div className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 p-3 rounded-xl flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Tag className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <div>
                        <span className="font-black text-xs text-emerald-950 dark:text-emerald-200 block">
                          Kupon Tətbiq Edilib: <strong className="font-mono bg-emerald-200 dark:bg-emerald-800 text-emerald-950 dark:text-white px-1.5 py-0.2 rounded-md">{appliedCouponCode}</strong>
                        </span>
                        <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-bold">
                          {discountAmount > 0 ? `Səbətinizə -${discountAmount.toFixed(2)} ₼ endirim edildi 🎉` : 'Aktiv kupon'}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleRemovePromo}
                      className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline cursor-pointer flex-shrink-0"
                    >
                      Ləğv Et ✕
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleApplyPromo} className="flex gap-3">
                    <div className="relative flex-1">
                      <Tag className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Promo kod yazın (Məs: SUMMER20, TECHNO10)"
                        value={promoCode}
                        onChange={e => setPromoCode(e.target.value)}
                        className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs font-bold outline-none focus:border-[#4f533b] transition ${
                          isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200'
                        }`}
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl transition cursor-pointer shadow-xs active:scale-95"
                    >
                      {t.applyPromo}
                    </button>
                  </form>
                )}
                {promoError && <p className="text-xs font-bold text-rose-500 mt-2">{promoError}</p>}
                {promoSuccess && !appliedCouponCode && <p className="text-xs font-bold text-[#4f533b] mt-2">{promoSuccess}</p>}
              </div>

              {/* Delivery Speed Notice */}
              <div className="bg-emerald-50 dark:bg-stone-900/60 border border-emerald-200 dark:border-emerald-900 rounded-2xl p-4 flex items-center gap-3 text-xs text-emerald-900 dark:text-emerald-300">
                <Truck className="w-6 h-6 text-[#4f533b] flex-shrink-0" />
                <div>
                  <span className="font-black block">Bakı İçi Pulsuz Ekspress Çatdırılma</span>
                  <span className="text-[11px] text-emerald-700 dark:text-[#a3a886] font-medium">
                    Sifarişiniz təsdiqləndikdən sonra 2 saat ərzində ünvanınıza qapıda təhvil verilir.
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Order Summary (Sticky) */}
            <div className="lg:col-span-4 sticky top-[80px]">
              <div className={`rounded-3xl border p-6 shadow-xl space-y-5 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'}`}>
                <h3 className="font-black text-lg pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <span>{t.orderSummary}</span>
                  <ShieldCheck className="w-5 h-5 text-[#4f533b]" />
                </h3>

                <div className="space-y-3 text-xs font-semibold text-slate-600 dark:text-slate-300">
                  <div className="flex justify-between">
                    <span>{t.subtotal}</span>
                    <span className="font-black text-slate-900 dark:text-white">{subtotal.toFixed(2)} ₼</span>
                  </div>

                  {discountAmount > 0 && (
                    <div className="flex justify-between text-emerald-600 dark:text-[#a3a886] font-extrabold">
                      <span>Promo Endirim ({appliedCouponCode}):</span>
                      <span>-{discountAmount.toFixed(2)} ₼</span>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <span>{t.deliveryFee}</span>
                    <span className="font-black text-emerald-600 dark:text-[#a3a886]">{t.free}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex justify-between items-baseline">
                    <span className="font-black text-sm text-slate-900 dark:text-white">{t.grandTotal}</span>
                    <div className="text-right">
                      <span className="font-black text-2xl text-[#4f533b] dark:text-[#a3a886] block leading-none">
                        {grandTotal.toFixed(2)} ₼
                      </span>
                      <span className="text-[10px] font-extrabold text-amber-600 dark:text-amber-400 mt-1 block">
                        {t.orMonthly} {totalMonthly} ₼ / 12 ay
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => setIsCheckoutOpen(true)}
                  className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-4 rounded-2xl shadow-lg shadow-[#4f533b]/30 transition text-sm flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <Lock className="w-4 h-4" /> {t.checkout}
                </button>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4f533b]" />
                    <span>100% Orijinal Rəsmi Zəmanətli Məhsullar</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#4f533b]" />
                    <span>Qapıda Nağd, Pos-terminal və Hissə-hissə ödəniş</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>

      {/* CHECKOUT MODAL */}
      {isCheckoutOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setIsCheckoutOpen(false)}
        >
          <div
            className={`rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-gradient-to-r from-[#4f533b] to-[#3e4230] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">Sifarişin Rəsmiləşdirilməsi</h3>
                <p className="text-xs text-[#f4f5f0]">Yekun cəm: {grandTotal.toFixed(2)} ₼</p>
              </div>
              <button onClick={() => setIsCheckoutOpen(false)} className="text-white/70 hover:text-white transition cursor-pointer">
                ✕
              </button>
            </div>

            {/* Mode Switcher Buttons */}
            <div className="flex items-center gap-2.5 p-4 bg-slate-100 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setCheckoutMode('cash')}
                className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 border ${
                  checkoutMode === 'cash'
                    ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-lg shadow-[#4f533b]/25'
                    : isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <DollarSign className="w-4 h-4 text-emerald-400" />
                <span>Nağd Al</span>
              </button>

              <button
                type="button"
                onClick={() => setCheckoutMode('credit')}
                className={`flex-1 py-3 px-3 rounded-2xl font-black text-xs transition cursor-pointer flex items-center justify-center gap-2 border ${
                  checkoutMode === 'credit'
                    ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-lg shadow-[#4f533b]/25'
                    : isDarkMode
                    ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Zap className="w-4 h-4 text-emerald-400" />
                <span>Kreditlə Al (Hissə-Hissə)</span>
              </button>
            </div>

            {!orderSubmitted ? (
              <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
                {/* Common Fields */}
                <div>
                  <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">Ad Və Soyadınız *</label>
                  <input
                    required
                    value={checkoutForm.fullName}
                    onChange={e => setCheckoutForm({ ...checkoutForm, fullName: e.target.value })}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#4f533b] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    placeholder="Məs: Kənan Məmmədov"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">Əlaqə Nömrəsi *</label>
                  <input
                    required
                    value={checkoutForm.phone}
                    onChange={e => setCheckoutForm({ ...checkoutForm, phone: e.target.value })}
                    className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#4f533b] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                    placeholder="+994 50 123 45 67"
                  />
                </div>

                {/* Mode Specific Fields */}
                {checkoutMode === 'credit' ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">FİN Kod *</label>
                        <input
                          required
                          value={checkoutForm.finCode}
                          onChange={e => setCheckoutForm({ ...checkoutForm, finCode: e.target.value.toUpperCase() })}
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold outline-none focus:border-[#4f533b] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                          placeholder="Məs: 7ABC123"
                          maxLength={7}
                        />
                      </div>

                      <div>
                        <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">Doğum Tarixi *</label>
                        <input
                          required
                          type="date"
                          value={checkoutForm.birthDate}
                          onChange={e => setCheckoutForm({ ...checkoutForm, birthDate: e.target.value })}
                          className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#4f533b] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">Aylıq Əmək Haqqınız (₼) *</label>
                      <input
                        required
                        type="number"
                        placeholder="Məs: 1200 ₼"
                        value={checkoutForm.salary}
                        onChange={e => setCheckoutForm({ ...checkoutForm, salary: e.target.value })}
                        className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#4f533b] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">Kredit Müddəti</label>
                      <div className="grid grid-cols-4 gap-2">
                        {['6', '12', '18', '24'].map(m => (
                          <button
                            key={m}
                            type="button"
                            onClick={() => setCheckoutForm({ ...checkoutForm, months: m })}
                            className={`py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                              checkoutForm.months === m
                                ? 'bg-[#4f533b] text-white shadow-xs'
                                : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {m} ay
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                ) : (
                  <div>
                    <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">Çatdırılma Ünvanı / Qeydlər *</label>
                    <input
                      required
                      value={checkoutForm.address}
                      onChange={e => setCheckoutForm({ ...checkoutForm, address: e.target.value })}
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs font-bold outline-none focus:border-[#4f533b] ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                      placeholder="Məs: Nərimanov r., Atatürk pr. 45, mənzil 12"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3.5 h-12 rounded-xl shadow-lg transition text-xs cursor-pointer mt-3 flex items-center justify-center gap-2 shadow-[#4f533b]/25"
                >
                  {checkoutMode === 'credit'
                    ? 'Kredit Müraciətini Təsdiqlə →'
                    : `Təsdiqlə Və Sifariş Et (${grandTotal.toFixed(2)} ₼) →`
                  }
                </Button>
              </form>
            ) : (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-stone-900 flex items-center justify-center mx-auto mb-3 text-[#4f533b]">
                  <Check className="w-8 h-8 text-emerald-500" />
                </div>
                <h4 className="font-black text-xl text-slate-900 dark:text-white">
                  {checkoutMode === 'credit' ? 'Kredit Müraciətiniz Qəbul Edildi!' : 'Sifarişiniz Uğurla Qəbul Edildi!'}
                </h4>
                <p className="text-xs font-extrabold text-[#4f533b] dark:text-[#a3a886] mt-1">Sifariş / Müraciət Nömrəniz: {orderId}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 leading-relaxed">
                  {checkoutMode === 'credit'
                    ? 'Mütəxəssisimiz FIN kodunuz və müraciətiniz əsasında qiymətləndirmə aparıb 5 dəqiqə ərzində sizinlə əlaqə saxlayacaq.'
                    : 'Kuryerimiz məhsulu ünvana çatdırmadan öncə sizinlə əlaqə saxlayacaq. Təşəkkür edirik!'
                  }
                </p>
                <button
                  onClick={() => { setIsCheckoutOpen(false); setOrderSubmitted(false); router.push('/'); }}
                  className="mt-6 bg-[#4f533b] text-white text-xs font-extrabold px-6 py-3 rounded-xl transition cursor-pointer shadow-lg"
                >
                  Ana Səhifəyə Qayıt
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER */}
      <Footer isDarkMode={isDarkMode} />
    </div>
  );
}

export default function CartPage() {
  return (
    <React.Suspense fallback={<div className="min-h-screen flex items-center justify-center p-6"><div className="w-8 h-8 border-4 border-[#4f533b] border-t-transparent rounded-full animate-spin" /></div>}>
      <CartContent />
    </React.Suspense>
  );
}
