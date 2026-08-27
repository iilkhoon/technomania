'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useRouter } from 'next/navigation';
import {
  ShoppingCartIcon,
  ShoppingBagIcon,
  XMarkIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  TruckIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';
import { Button } from '@heroui/react';
import { Product } from '../data/products';

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartDrawerProps {
  isOpen?: boolean;
  onClose?: () => void;
  isDarkMode?: boolean;
}

function toSlug(name: string): string {
  return (name || '')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export default function CartDrawer({
  isOpen: externalIsOpen,
  onClose: externalOnClose,
  isDarkMode: externalDarkMode,
}: CartDrawerProps = {}) {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const isOpen = externalIsOpen !== undefined ? externalIsOpen : internalIsOpen;

  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for global open cart event
  useEffect(() => {
    const handleOpenCart = () => {
      setInternalIsOpen(true);
    };
    window.addEventListener('techno_open_cart_drawer', handleOpenCart);
    return () => {
      window.removeEventListener('techno_open_cart_drawer', handleOpenCart);
    };
  }, []);

  // Load items from localStorage
  const loadCart = () => {
    try {
      const saved = localStorage.getItem('technomania_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          const itemMap: { [key: string]: CartItem } = {};
          parsed.forEach((p: Product) => {
            if (!p || !p.id) return;
            if (itemMap[p.id]) {
              itemMap[p.id].quantity += 1;
            } else {
              itemMap[p.id] = { product: p, quantity: 1 };
            }
          });
          setCartItems(Object.values(itemMap));
        }
      } else {
        setCartItems([]);
      }
    } catch (e) {
      console.error('Failed to parse cart items:', e);
      setCartItems([]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadCart();
      setIsRendered(true);
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 20);
      return () => clearTimeout(timer);
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => {
        setIsRendered(false);
      }, 320);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      setIsRendered(false);
      if (externalOnClose) {
        externalOnClose();
      } else {
        setInternalIsOpen(false);
      }
    }, 300);
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isRendered) {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRendered]);

  // Sync Dark Mode
  useEffect(() => {
    if (externalDarkMode !== undefined) {
      setIsDarkMode(externalDarkMode);
    } else {
      const isDark = typeof window !== 'undefined' && localStorage.getItem('technomania_dark') === 'true';
      setIsDarkMode(isDark);
    }
  }, [externalDarkMode]);

  // Listen for storage events
  useEffect(() => {
    const handleStorage = () => {
      loadCart();
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('techno_cart_updated', handleStorage);
    return () => {
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('techno_cart_updated', handleStorage);
    };
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setCartItems(newItems);
    const flatList: Product[] = [];
    newItems.forEach(item => {
      for (let i = 0; i < item.quantity; i++) {
        flatList.push(item.product);
      }
    });
    localStorage.setItem('technomania_cart', JSON.stringify(flatList));
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('techno_cart_updated'));
  };

  const updateQuantity = (productId: string, delta: number) => {
    const updated = cartItems
      .map(item => {
        if (item.product.id === productId) {
          const newQty = item.quantity + delta;
          return newQty > 0 ? { ...item, quantity: newQty } : null;
        }
        return item;
      })
      .filter(Boolean) as CartItem[];
    saveCart(updated);
  };

  const removeItem = (productId: string) => {
    const updated = cartItems.filter(item => item.product.id !== productId);
    saveCart(updated);
  };

  const clearAll = () => {
    saveCart([]);
  };

  const parsePrice = (priceStr?: string | number) => {
    if (typeof priceStr === 'number') return priceStr;
    if (!priceStr) return 0;
    const num = parseFloat(String(priceStr).replace(/[^\d.]/g, ''));
    return isNaN(num) ? 0 : num;
  };

  const totalItemsCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cartItems.reduce((acc, item) => {
    const unitPrice = item.product.rawPrice || parsePrice(item.product.cash_price);
    return acc + unitPrice * item.quantity;
  }, 0);

  const grandTotal = subtotal;

  // Prevent background scrolling when open
  useEffect(() => {
    if (isRendered) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isRendered]);

  if (!isRendered || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999999] overflow-hidden select-none">
      {/* Full-screen Dark Backdrop */}
      <div
        className={`fixed inset-0 bg-black/65 backdrop-blur-sm transition-opacity duration-300 ease-out cursor-pointer ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Slide-over Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          className={`w-screen max-w-md h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-10 ${
            isVisible ? 'translate-x-0' : 'translate-x-full'
          } ${
            isDarkMode ? 'bg-slate-900 text-slate-100 border-l border-slate-800' : 'bg-white text-slate-900 border-l border-slate-200'
          }`}
        >
          {/* Header */}
          <div className="p-4 sm:p-4.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-[#4f533b] text-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center text-amber-300 shadow-inner">
                <ShoppingCartIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black tracking-tight flex items-center gap-2">
                  Səbətim
                  {totalItemsCount > 0 && (
                    <span className="text-[11px] bg-amber-400 text-slate-950 font-black px-2 py-0.5 rounded-full shadow-xs">
                      {totalItemsCount}
                    </span>
                  )}
                </h2>
                <p className="text-[11px] text-amber-100/80 font-medium">Faizsiz taksit və pulsuz çatdırılma</p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {cartItems.length > 0 && (
                <button
                  onClick={clearAll}
                  title="Səbəti təmizlə"
                  className="p-2 rounded-xl text-amber-100/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={handleClose}
                className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition cursor-pointer"
                aria-label="Bağla"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Dynamic Free Shipping Progress Bar */}
          <div className={`px-4 py-2.5 border-b space-y-1.5 ${
            isDarkMode ? 'bg-slate-800/90 border-slate-700/80' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className="flex items-center justify-between text-[11px] font-black">
              <span className="flex items-center gap-1.5 text-slate-700 dark:text-slate-200">
                <TruckIcon className="w-4 h-4 text-[#4f533b]" />
                {subtotal >= 100 ? (
                  <span className="text-[#4f533b] dark:text-[#a3a886]">Təbriklər! Çatdırılmanız tam pulsuzdur! 🚚✨</span>
                ) : (
                  <span>
                    Pulsuz çatdırılmaya cəmi <span className="text-[#4f533b] dark:text-[#a3a886] font-black">{(100 - subtotal).toFixed(2)} ₼</span> qaldı!
                  </span>
                )}
              </span>
              <span className="text-slate-400 text-[10px]">
                {Math.min(100, Math.round((subtotal / 100) * 100))}%
              </span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#4f533b] to-emerald-400 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, (subtotal / 100) * 100)}%` }}
              />
            </div>
          </div>

          {/* Body: Product Items List */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-2.5 scrollbar-thin">
            {cartItems.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4 my-auto">
                <div className="w-18 h-18 rounded-3xl bg-[#4f533b]/10 dark:bg-slate-800 flex items-center justify-center text-[#4f533b] dark:text-amber-300">
                  <ShoppingBagIcon className="w-9 h-9" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-black">Səbətiniz boşdur</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed">
                    Bəyəndiyiniz smartfon, noutbuk və digər elektrotexnika məhsullarını səbətə əlavə edərək alış-verişə başlayın.
                  </p>
                </div>
                <button
                  onClick={() => {
                    handleClose();
                    router.push('/');
                  }}
                  className="px-6 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs shadow-md transition cursor-pointer active:scale-95"
                >
                  Məhsullara bax →
                </button>
              </div>
            ) : (
              cartItems.map(({ product, quantity }) => {
                const unitPrice = product.rawPrice || parsePrice(product.cash_price);
                const itemTotal = unitPrice * quantity;

                return (
                  <div
                    key={product.id}
                    className={`p-3 rounded-2xl border transition-all duration-200 flex gap-3 items-center group relative ${
                      isDarkMode ? 'bg-slate-800/60 border-slate-700/80 hover:border-slate-600' : 'bg-white border-slate-200/90 hover:border-[#4f533b]/40 shadow-xs'
                    }`}
                  >
                    {/* Thumbnail */}
                    <div
                      onClick={() => {
                        handleClose();
                        router.push(`/product/${toSlug(product.model_name)}`);
                      }}
                      className="w-16 h-16 rounded-xl bg-slate-50 dark:bg-slate-900 p-1.5 border border-slate-200/80 dark:border-slate-800 flex items-center justify-center flex-shrink-0 cursor-pointer shadow-2xs group-hover:scale-102 transition-transform"
                    >
                      <img
                        src={product.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80'}
                        alt={product.model_name}
                        className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch py-0.5">
                      <div>
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 tracking-wider block">
                          {product.brand || 'TechnoMania'}
                        </span>
                        <h4
                          onClick={() => {
                            handleClose();
                            router.push(`/product/${toSlug(product.model_name)}`);
                          }}
                          className="text-xs font-bold line-clamp-1 cursor-pointer hover:text-[#4f533b] transition-colors leading-snug"
                        >
                          {product.model_name}
                        </h4>
                      </div>

                      {/* Price & Quantity Controls */}
                      <div className="flex items-center justify-between gap-2 mt-1.5">
                        <div>
                          <span className="text-sm font-black text-[#4f533b] dark:text-[#a3a886]">
                            {itemTotal.toFixed(2)} ₼
                          </span>
                          {quantity > 1 && (
                            <span className="text-[10px] text-slate-400 block -mt-0.5">
                              ({unitPrice.toFixed(2)} ₼ × {quantity})
                            </span>
                          )}
                        </div>

                        {/* Quantity Buttons */}
                        <div className={`flex items-center gap-1 p-0.5 rounded-lg border ${
                          isDarkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200 shadow-2xs'
                        }`}>
                          <button
                            onClick={() => updateQuantity(product.id, -1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer active:scale-90"
                            aria-label="Azalt"
                          >
                            {quantity === 1 ? <TrashIcon className="w-3 h-3 text-rose-500" /> : <MinusIcon className="w-2.5 h-2.5" />}
                          </button>
                          <span className="w-5 text-center text-xs font-black text-slate-900 dark:text-white">
                            {quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(product.id, 1)}
                            className="w-6 h-6 rounded-md flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 transition cursor-pointer active:scale-90"
                            aria-label="Artır"
                          >
                            <PlusIcon className="w-2.5 h-2.5" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Delete Icon Button */}
                    <button
                      onClick={() => removeItem(product.id)}
                      className="absolute top-2 right-2 text-slate-300 hover:text-rose-500 p-1 transition opacity-70 group-hover:opacity-100 cursor-pointer"
                      title="Sil"
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </button>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer: Summary & Action Buttons */}
          {cartItems.length > 0 && (
            <div className={`p-4 border-t space-y-3 ${
              isDarkMode ? 'bg-slate-900/95 border-slate-800' : 'bg-white border-slate-200'
            }`}>
              {/* Summary details */}
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Məhsulların sayı:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{totalItemsCount} ədəd</span>
                </div>
                <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                  <span>Çatdırılma:</span>
                  <span className="font-bold text-[#4f533b] dark:text-[#a3a886]">Pulsuz</span>
                </div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <span className="text-sm font-black text-slate-900 dark:text-white">Yekun Məbləğ:</span>
                  <span className="text-lg sm:text-xl font-black text-[#4f533b] dark:text-[#a3a886]">
                    {grandTotal.toFixed(2)} ₼
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 text-right">
                  və ya <span className="font-black text-[#4f533b] dark:text-amber-300">{(grandTotal / 12).toFixed(1)} ₼ / ay</span> (12 ay faizsiz)
                </div>
              </div>

              {/* Action Buttons with HeroUI */}
              <div className="space-y-2 pt-1">
                {/* 1. Sifarişi Rəsmiləşdir */}
                <Button
                  variant="primary"
                  onPress={() => {
                    handleClose();
                    router.push('/cart?checkout=true');
                  }}
                  className="w-full py-3 px-5 h-12 bg-gradient-to-r from-[#4f533b] to-[#3e4230] hover:from-[#3e4230] hover:to-[#2d3023] text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 shadow-md shadow-[#4f533b]/25 transition cursor-pointer active:scale-98"
                >
                  <span>Sifarişi rəsmiləşdir</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>

                {/* 2. Səbətə Keçid Et */}
                <Button
                  variant="outline"
                  onPress={() => {
                    handleClose();
                    router.push('/cart');
                  }}
                  className={`w-full py-2.5 px-5 h-10 rounded-xl font-bold text-xs border transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    isDarkMode
                      ? 'border-slate-700 text-slate-200 hover:bg-slate-800'
                      : 'border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 bg-slate-50'
                  }`}
                >
                  <ShoppingCartIcon className="w-4 h-4" />
                  <span>Səbətə keçid et</span>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}
