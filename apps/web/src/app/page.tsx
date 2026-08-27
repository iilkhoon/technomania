'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Product, getLiveProducts, fetchLiveProducts, toSlug, getQuickSpecs } from './data/products';
import { getLocalCategories, fetchApiCategories } from './lib/supabase';
import { fetchStoreBranchesApi } from './data/storesData';
import YouTubeReviewsSection from './components/YouTubeReviewsSection';
import FeatureBadges from './components/FeatureBadges';
import NewsSection from './components/NewsSection';
import Footer from './components/Footer';


import {
  Search,
  ShoppingCart,
  Heart,
  User,
  PhoneCall,
  Percent,
  Truck,
  ShieldCheck,
  Sparkles,
  Bot,
  ChevronRight,
  ChevronLeft,
  X,
  CreditCard,
  CheckCircle,
  Menu,
  Send,
  Smartphone,
  Laptop,
  Tv,
  Home as HomeIcon,
  Headphones,
  ArrowRight,
  Flame,
  Star,
  Scale,
  Video,
  Clock,
  ChevronDown,
  MapPin,
  Share2,
  Globe,
  MessageCircle,
  Mail,
  Phone,
  Gift,
  Zap,
  ExternalLink,
  MousePointer,
  TrendingUp,
  Package,
  BadgePercent,
  Sun,
  Moon,
  Gamepad2,
  Coffee,
  Watch,
  Utensils,
  Scissors,
  Armchair,
  Bike,
  Shirt,
  Grid,
  Layers,
  SearchX,
  Filter,
  RotateCcw,
  SlidersHorizontal,
  Check,
  Tablet,
  Monitor,
  Cpu,
  HardDrive,
  Speaker,
  Camera,
  Radio,
  Printer,
  Joystick,
  Wifi,
  BatteryCharging,
  Plug,
  Fan,
  Thermometer,
  Droplets,
  Microwave,
  Lightbulb,
  Lock,
  Stethoscope,
  Smile,
  Glasses,
  Car,
  Compass,
  Dumbbell,
  Tent,
  Bed,
  Box,
  ShoppingBag,
  Tag,
  Award,
  Music,
  Wrench,
  Hammer,
  Shield,
  Battery,
  CircleDot,
  FolderTree,
  Wind,
  HeartPulse,
} from './components/HeroIconsHub';
import { translations, Language } from './data/translations';
import CatalogModal from './components/CatalogModal';
import SearchAutocompleteDropdown from './components/SearchAutocompleteDropdown';
import Header from './components/Header';
import ProductCard from './components/ProductCard';
import MobileTopAdBanner from './components/MobileTopAdBanner';

const STOREFRONT_ICON_MAP: Record<string, any> = {
  wind: Wind, sun: Sun, smartphone: Smartphone, phone: Smartphone, mobile: Smartphone,
  laptop: Laptop, noutbuk: Laptop, notebook: Laptop, pc: Laptop, computer: Laptop,
  tv: Tv, televizor: Tv, television: Tv, gamepad2: Gamepad2, gaming: Gamepad2, gamer: Gamepad2, joystick: Joystick,
  home: HomeIcon, homeicon: HomeIcon, ev: HomeIcon, utensils: Utensils, kitchen: Utensils, qab: Utensils,
  scissors: Scissors, beauty: Scissors, gozellik: Scissors, bike: Bike, skuter: Bike, velosiped: Bike,
  heartpulse: HeartPulse, saglamliq: HeartPulse, tonometr: HeartPulse, armchair: Armchair, mebel: Armchair,
  shirt: Shirt, paltar: Shirt, geyim: Shirt, coffee: Coffee, qehve: Coffee, watch: Watch, saat: Watch,
  grid: Grid, tablet: Tablet, planset: Tablet, monitor: Monitor, ekran: Monitor, cpu: Cpu, prosessor: Cpu,
  harddrive: HardDrive, ssd: HardDrive, disk: HardDrive, speaker: Speaker, dinamik: Speaker, soundbar: Speaker,
  camera: Camera, foto: Camera, radio: Radio, music: Music, audio: Music, printer: Printer, skaner: Printer,
  wifi: Wifi, modem: Wifi, batterycharging: BatteryCharging, charge: BatteryCharging, adapter: BatteryCharging,
  plug: Plug, fan: Fan, ventilyator: Fan, thermometer: Thermometer, istilik: Thermometer, droplets: Droplets,
  nemlendirici: Droplets, microwave: Microwave, soba: Microwave, mikrodalgali: Microwave, flame: Flame, qaz: Flame,
  sparkles: Sparkles, temizlik: Sparkles, tozsoran: Sparkles, lightbulb: Lightbulb, lampa: Lightbulb, isiq: Lightbulb,
  lock: Lock, tehlukesizlik: Lock, stethoscope: Stethoscope, tibb: Stethoscope, smile: Smile, gigiyena: Smile,
  glasses: Glasses, eynek: Glasses, car: Car, avto: Car, compass: Compass, gps: Compass, dumbbell: Dumbbell,
  idman: Dumbbell, fitnes: Dumbbell, tent: Tent, kempinq: Tent, bed: Bed, yataq: Bed, box: Box, package: Package,
  shoppingbag: ShoppingBag, tag: Tag, award: Award, gift: Gift, truck: Truck, catdirilma: Truck, wrench: Wrench,
  usta: Wrench, hammer: Hammer, temir: Hammer, shield: Shield, qorunma: Shield, battery: Battery, scale: Scale,
  terezi: Scale, circledot: CircleDot, foldertree: FolderTree, folder: FolderTree
};

function renderStorefrontCategoryIcon(catIcon?: string, catIconUrl?: string, className: string = "w-4 h-4") {
  if (catIconUrl && catIconUrl.trim() !== '') {
    return <img src={catIconUrl} alt="icon" className={`${className} object-contain`} suppressHydrationWarning />;
  }
  const cleanKey = String(catIcon || '').trim().toLowerCase().replace(/[-_\s]/g, '');
  const IconComp = (cleanKey && STOREFRONT_ICON_MAP[cleanKey]) || STOREFRONT_ICON_MAP[String(catIcon || '').toLowerCase()] || Grid;
  return <IconComp className={className} suppressHydrationWarning />;
}

const API_BASE = '/api';

/* ═══════════════════════════════════════════════════
   SIDEBAR CATEGORIES (Modern Lucide SVG Icons)
   ═══════════════════════════════════════════════════ */
const SIDEBAR_CATEGORIES = [
  { name: 'Yay fürsətləri', icon: Sun, slug: 'summer' },
  { name: 'Gamer zone', icon: Gamepad2, slug: 'gaming' },
  { name: 'Qəhvə texnikası', icon: Coffee, slug: 'coffee' },
  { name: 'Smartfonlar və aksessuarlar', icon: Smartphone, slug: 'smartphones' },
  { name: 'Smart saatlar', icon: Watch, slug: 'watches' },
  { name: 'Noutbuklar, PC, planşetlər', icon: Laptop, slug: 'laptops' },
  { name: 'TV, audio və foto', icon: Tv, slug: 'tv-audio' },
  { name: 'Ev texnikası', icon: HomeIcon, slug: 'home-appliances' },
  { name: 'Məişət texnikası', icon: Shirt, slug: 'household' },
  { name: 'Qab-qacaq', icon: Utensils, slug: 'kitchenware' },
  { name: 'Gözəllik və baxım', icon: Scissors, slug: 'beauty' },
  { name: 'Mebel və tekstil', icon: Armchair, slug: 'furniture' },
  { name: 'Nəqliyyat və skuterlər', icon: Bike, slug: 'transport' },
];

/* ═══════════════════════════════════════════════════
   BRANDS (kontakt.az brand bar)
   ═══════════════════════════════════════════════════ */
const BRANDS = ['BOSCH', 'HUAWEI', 'HP', 'ACER', 'PANASONIC', 'ELECTROLUX', 'BRAUN', 'ASUS', 'TEFAL', 'SONY'];

/* ═══════════════════════════════════════════════════
   PRODUCT DATA (all sections)
   ═══════════════════════════════════════════════════ */
const LEADER_TABS = [
  'Bütün məhsullar', 'SMARTFON', 'Televizorlar', 'Noutbuklar', 'Qulaqlıqlar', 'Saatlar',
  'Böyük məişət texnikası', 'Mətbəx üçün xırda məişət',
  'Quraşdırılan texnika', 'Ev üçün kiçik texnika',
  'İqlim texnikası', 'Aksessuarlar'
];

// Shared product data
const LEADER_PRODUCTS: Product[] = [
  {
    id: 'a1000000-0000-0000-0000-000000000001',
    model_name: 'iPhone 15 128 GB Blue',
    brand: 'Apple',
    old_price: '2 199.99 ₼',
    cash_price: '1 979.99 ₼',
    discount: '-10%',
    credit_tag: '0₼ 12 ay',
    monthly: '165 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
    colors: ['#e2e8f0', '#fbcfe8', '#dcfce7', '#fef08a'],
    hasVideo: true
  },
  {
    id: 'a2000000-0000-0000-0000-000000000002',
    model_name: 'iPhone 15 Pro Max 256 GB Natural Titanium',
    brand: 'Apple',
    old_price: '3 199.99 ₼',
    cash_price: '2 939.99 ₼',
    discount: '-8%',
    credit_tag: '0₼ 12 ay',
    monthly: '244.9 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=400&q=80',
    colors: ['#d1d5db', '#78716c', '#171717', '#fef3c7'],
    hasVideo: true
  },
  {
    id: 'a3000000-0000-0000-0000-000000000003',
    model_name: 'Samsung Galaxy S24 128GB (8RAM) S921B Gray',
    brand: 'Samsung',
    old_price: '1 899.99 ₼',
    cash_price: '1 785.99 ₼',
    discount: '-6%',
    credit_tag: '0₼ 12 ay',
    monthly: '148.8 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
    colors: ['#475569', '#dbeafe', '#fef3c7', '#18181b'],
    hasVideo: true
  },
  {
    id: 'a4000000-0000-0000-0000-000000000004',
    model_name: 'Samsung Galaxy S24 Ultra 512GB (12RAM) S928B Silver',
    brand: 'Samsung',
    old_price: '2 999.99 ₼',
    cash_price: '2 759.99 ₼',
    discount: '-8%',
    credit_tag: '0₼ 12 ay',
    monthly: '229.9 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=400&q=80',
    colors: ['#94a3b8', '#312e81', '#fbbf24', '#09090b'],
    hasVideo: false
  },
  {
    id: 'a5000000-0000-0000-0000-000000000005',
    model_name: 'Samsung Galaxy A25 (6RAM/128GB) SM-A256B Silver',
    brand: 'Samsung',
    old_price: '549.99 ₼',
    cash_price: '489.99 ₼',
    discount: '-11%',
    credit_tag: '0₼ 12 ay',
    monthly: '40.8 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
    colors: ['#cbd5e1', '#60a5fa', '#fbcfe8'],
    hasVideo: false,
    isNew: true
  },
  {
    id: 'a6000000-0000-0000-0000-000000000006',
    model_name: 'Xiaomi Redmi Note 13 Pro 256GB (8RAM) Midnight Black',
    brand: 'Xiaomi',
    old_price: '699.99 ₼',
    cash_price: '599.99 ₼',
    discount: '-14%',
    credit_tag: '0₼ 12 ay',
    monthly: '50 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=400&q=80',
    colors: ['#18181b', '#60a5fa', '#a78bfa'],
    hasVideo: true
  },
];

const GREAT_OFFERS: Product[] = [
  {
    id: 'g1000000-0000-0000-0000-000000000001',
    model_name: 'Qulaqlıq HUAWEI Freebuds SE 3 S5037990 Beige',
    brand: 'HUAWEI',
    old_price: '119.99 ₼',
    cash_price: '69.99 ₼',
    rawPrice: 69.99,
    discount: '-42%',
    credit_tag: '0₼ 6 ay',
    monthly: '11.6 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?auto=format&fit=crop&w=400&q=80',
    colors: ['#f5f0e8', '#18181b'],
    hasVideo: false,
    category: 'Qulaqlıqlar',
    isOnlineOnly: true,
  },
  {
    id: 'g2000000-0000-0000-0000-000000000002',
    model_name: 'Kondisioner Midea MSAFA-12HRN1 A++ Ion',
    brand: 'Midea',
    old_price: '1 299.99 ₼',
    cash_price: '949.99 ₼',
    rawPrice: 949.99,
    discount: '-27%',
    credit_tag: '0₼ 18 ay',
    monthly: '52.7 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1631567091196-2c5b00113e14?auto=format&fit=crop&w=400&q=80',
    colors: ['#e2e8f0'],
    hasVideo: false,
    category: 'İqlim texnikası',
    isOnlineOnly: true,
  },
  {
    id: 'g3000000-0000-0000-0000-000000000003',
    model_name: 'Smart TV Samsung UE50CU7000UXRU 50" 4K Ultra HD',
    brand: 'Samsung',
    old_price: '1 399.99 ₼',
    cash_price: '999.99 ₼',
    rawPrice: 999.99,
    discount: '-29%',
    credit_tag: '0₼ 12 ay',
    monthly: '83.3 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&w=400&q=80',
    colors: ['#18181b'],
    hasVideo: true,
    category: 'Televizorlar',
    isOnlineOnly: false,
  },
  {
    id: 'g4000000-0000-0000-0000-000000000004',
    model_name: 'Noutbuk ASUS Vivobook 15X i5 12500H/16GB/512SSD',
    brand: 'ASUS',
    old_price: '1 799.99 ₼',
    cash_price: '1 399.99 ₼',
    rawPrice: 1399.99,
    discount: '-22%',
    credit_tag: '0₼ 12 ay',
    monthly: '116.6 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=400&q=80',
    colors: ['#18181b', '#d1d5db'],
    hasVideo: false,
    category: 'Noutbuklar',
    isOnlineOnly: true,
  },
  {
    id: 'g5000000-0000-0000-0000-000000000005',
    model_name: 'PlayStation 5 Slim Digital 1TB White',
    brand: 'Sony',
    old_price: '1 199.99 ₼',
    cash_price: '999.99 ₼',
    rawPrice: 999.99,
    discount: '-17%',
    credit_tag: '0₼ 12 ay',
    monthly: '83.3 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=400&q=80',
    colors: ['#e2e8f0'],
    hasVideo: true,
    category: 'Oyun konsolları',
    isOnlineOnly: true,
  },
  {
    id: 'g6000000-0000-0000-0000-000000000006',
    model_name: 'Robot tozsoran Xiaomi Robot Vacuum E10 BHR6963EU White',
    brand: 'Xiaomi',
    old_price: '599.99 ₼',
    cash_price: '469.99 ₼',
    rawPrice: 469.99,
    discount: '-22%',
    credit_tag: '0₼ 12 ay',
    monthly: '39.1 ₼/ay',
    badge: 'Free Delivery',
    image: 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=400&q=80',
    colors: ['#e2e8f0'],
    hasVideo: false,
    category: 'Ev texnikası',
    isOnlineOnly: false,
  },
];


/* ═══════════════════════════════════════════════════
   DRAGGABLE SLIDER COMPONENT (Mouse Drag & Touch Scroll)
   ═══════════════════════════════════════════════════ */
function DraggableSlider({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return;
    setIsDown(true);
    setStartX(e.pageX - sliderRef.current.offsetLeft);
    setScrollLeft(sliderRef.current.scrollLeft);
  };

  const handleMouseLeave = () => setIsDown(false);
  const handleMouseUp = () => setIsDown(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDown || !sliderRef.current) return;
    e.preventDefault();
    const x = e.pageX - sliderRef.current.offsetLeft;
    const walk = (x - startX) * 1.8;
    sliderRef.current.scrollLeft = scrollLeft - walk;
  };

  return (
    <div
      ref={sliderRef}
      onMouseDown={handleMouseDown}
      onMouseLeave={handleMouseLeave}
      onMouseUp={handleMouseUp}
      onMouseMove={handleMouseMove}
      className={`flex overflow-x-auto gap-4 scrollbar-hide py-2 select-none snap-x snap-mandatory scroll-smooth ${isDown ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
    >
      {children}
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   HORIZONTAL PRODUCT CARD (Möhtəşəm fürsətlər)
   ═══════════════════════════════════════════════════ */
function HorizontalProductCard({
  product,
  onToggleFavorite,
  onToggleCart,
  onToggleCompare,
  onCreditClick,
  onSelectProduct,
  isFav,
  isInCart,
  isCompared,
  isDarkMode = false,
}: {
  product: Product;
  onToggleFavorite: (id: string) => void;
  onToggleCart: (product: Product) => void;
  onToggleCompare: (id: string) => void;
  onCreditClick: (product: Product) => void;
  onSelectProduct?: (product: Product) => void;
  isFav: boolean;
  isInCart: boolean;
  isCompared: boolean;
  isDarkMode?: boolean;
}) {
  const [selectedMonths, setSelectedMonths] = useState<number>(12);
  const rawPrice = product.rawPrice || parseFloat(String(product.cash_price).replace(/[^\d.]/g, '')) || 100;
  const calculatedMonthly = (rawPrice / selectedMonths).toFixed(1);

  return (
    <div className={`rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 p-4 sm:p-5 md:p-6 flex flex-col md:flex-row items-stretch gap-3.5 md:gap-6 relative group w-full h-[475px] sm:h-[490px] md:h-[275px] min-h-[475px] sm:min-h-[490px] md:min-h-[275px] max-h-[475px] sm:max-h-[490px] md:max-h-[275px] justify-between ${
      isDarkMode
        ? 'bg-slate-900 border-slate-800 hover:border-[#4f533b]/50 text-white'
        : 'bg-white border-slate-200/90 hover:border-[#4f533b]/50 text-slate-900'
    }`}>
      {/* LEFT: Uniform Clean White Spotlight Image Container */}
      <div
        className="w-full md:w-52 h-44 sm:h-48 md:h-full bg-white rounded-2xl border border-slate-100 dark:border-slate-800/80 flex items-center justify-center p-3 relative flex-shrink-0 cursor-pointer shadow-2xs"
        onClick={() => onSelectProduct?.(product)}
      >
        {product.discount && (
          <span className="absolute top-2 left-2 bg-[#4f533b] text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-md z-10">
            {product.discount}
          </span>
        )}
        <img
          src={product.image || undefined}
          alt={product.model_name}
          className="max-h-36 sm:max-h-40 md:max-h-48 w-auto max-w-full object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 z-10" onClick={e => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => onToggleFavorite(product.id)}
            className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer shadow-xs ${
              isFav
                ? 'border-[#4f533b] text-[#4f533b] bg-[#f4f5f0] dark:bg-stone-900/60'
                : isDarkMode
                ? 'border-slate-700 text-slate-400 hover:text-[#4f533b] hover:border-[#4f533b] bg-slate-800/80 backdrop-blur-sm'
                : 'border-slate-200 text-slate-400 hover:text-[#4f533b] hover:border-[#4f533b] bg-white/90 backdrop-blur-sm'
            }`}
            title="Bəyən"
          >
            <Heart className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isFav ? 'fill-[#4f533b]' : ''}`} />
          </button>
          <button
            type="button"
            onClick={() => onToggleCompare(product.id)}
            className={`p-1.5 sm:p-2 rounded-xl border transition cursor-pointer shadow-xs ${
              isCompared
                ? 'border-[#4f533b] text-[#4f533b] bg-[#f4f5f0] dark:bg-stone-900/60'
                : isDarkMode
                ? 'border-slate-700 text-slate-400 hover:text-[#4f533b] hover:border-[#4f533b] bg-slate-800/80 backdrop-blur-sm'
                : 'border-slate-200 text-slate-400 hover:text-[#4f533b] hover:border-[#4f533b] bg-white/90 backdrop-blur-sm'
            }`}
            title="Müqayisə et"
          >
            <Scale className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isCompared ? 'text-[#4f533b]' : ''}`} />
          </button>
        </div>
      </div>

      {/* RIGHT: Detailed Information & Interactive Calculator */}
      <div className="flex-1 flex flex-col justify-between h-full w-full min-w-0">
        <div>
          {/* Brand & Badge row */}
          <div className="flex items-center justify-between gap-2 mb-1 h-5">
            <span className="text-xs font-bold text-slate-400 truncate">
              {product.brand}
            </span>
            {product.isOnlineOnly ? (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black border flex items-center gap-1 flex-shrink-0 ${
                isDarkMode ? 'bg-stone-900/80 text-[#a3a886] border-emerald-800' : 'bg-[#f4f5f0] text-[#4f533b] border-[#4f533b]/30'
              }`}>
                <Zap className="w-3 h-3 text-[#4f533b]" /> Yalnız onlayn
              </span>
            ) : (
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                0% komissiya
              </span>
            )}
          </div>

          {/* Fixed 2-Line Height Title */}
          <h3
            onClick={() => onSelectProduct?.(product)}
            className={`font-bold text-sm sm:text-base leading-snug line-clamp-2 cursor-pointer hover:text-[#4f533b] transition h-10 sm:h-11 flex items-start ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}
          >
            {product.model_name}
          </h3>

          {/* Ultra-Clean Modern Credit Selector */}
          <div className="mt-1.5 sm:mt-2.5">
            <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs mb-1">
              <span className={`font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Hissə-hissə:</span>
              <span className="font-black text-[#4f533b] dark:text-[#a3a886] text-xs sm:text-sm">{calculatedMonthly} ₼/ay</span>
            </div>
            
            <div className={`p-1 rounded-xl flex items-center gap-1 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
              {[6, 12, 18].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setSelectedMonths(m)}
                  className={`flex-1 py-1 sm:py-1.5 rounded-lg text-[11px] font-black transition cursor-pointer text-center ${
                    selectedMonths === m
                      ? 'bg-[#4f533b] text-white shadow-xs'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {m} ay
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Ultra-Clean Modern Price & Action Row (Never wraps or breaks alignment) */}
        <div className={`mt-2 pt-2 border-t flex items-center justify-between gap-2 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex flex-col min-w-0">
            {product.old_price ? (
              <span className="line-through text-[11px] font-medium text-slate-400 leading-tight">
                {product.old_price}
              </span>
            ) : (
              <span className="text-[10px] text-transparent leading-tight select-none">
                -
              </span>
            )}
            <span className={`text-lg sm:text-xl font-black tracking-tight leading-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {product.cash_price}
            </span>
          </div>

          <button
            type="button"
            onClick={() => onToggleCart(product)}
            className={`px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl font-black text-xs transition flex items-center gap-1.5 shadow-sm cursor-pointer flex-shrink-0 active:scale-95 ${
              isInCart
                ? 'bg-[#3e4230] hover:bg-[#2d3023] text-white'
                : 'bg-[#4f533b] hover:bg-[#3e4230] text-white shadow-[#4f533b]/20'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>{isInCart ? 'Səbətdə ✓' : 'Səbətə at'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}





/* ═══════════════════════════════════════════════════
   PRODUCT DETAIL PAGE (Kontakt.az Reference Style)
   ═══════════════════════════════════════════════════ */
function ProductDetailPage({
  product,
  onBack,
  onToggleFavorite,
  onToggleCart,
  onToggleCompare,
  onCreditClick,
  isFav,
  isInCart,
  isCompared,
  isDarkMode = false,
}: {
  product: Product;
  onBack: () => void;
  onToggleFavorite: (id: string) => void;
  onToggleCart: (product: Product) => void;
  onToggleCompare: (id: string) => void;
  onCreditClick: (product: Product) => void;
  isFav: boolean;
  isInCart: boolean;
  isCompared: boolean;
  isDarkMode?: boolean;
}) {
  const [activeImage, setActiveImage] = useState<string>(product.image);
  const [selectedColor, setSelectedColor] = useState<string>('Cosmic Orange');
  const [selectedStorage, setSelectedStorage] = useState<string>('256 GB');
  const [selectedMonths, setSelectedMonths] = useState<number>(18);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'faqs' | 'bundled' | 'alternatives' | 'services'>('details');
  const [expressOrdered, setExpressOrdered] = useState<boolean>(false);
  const [selectedService, setSelectedService] = useState<string>('warranty_1y');
  const [bundleCart, setBundleCart] = useState<string[]>([]);
  const [showAllSpecs, setShowAllSpecs] = useState<boolean>(false);

  const [productFaqs, setProductFaqs] = useState<any[]>([]);
  const [faqAuthor, setFaqAuthor] = useState('');
  const [faqQuestion, setFaqQuestion] = useState('');
  const [faqSubmitted, setFaqSubmitted] = useState(false);

  useEffect(() => {
    const loadFaqs = () => {
      try {
        const saved = localStorage.getItem('technomania_product_faqs');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            const matched = parsed.filter((f: any) => String(f.product_id) === String(product.id) || f.product_name === product.model_name);
            setProductFaqs(matched);
            return;
          }
        }
        
        setProductFaqs([]);
      } catch (e) {}
    };

    loadFaqs();
    window.addEventListener('techno_faqs_updated', loadFaqs);
    window.addEventListener('storage', loadFaqs);
    return () => {
      window.removeEventListener('techno_faqs_updated', loadFaqs);
      window.removeEventListener('storage', loadFaqs);
    };
  }, [product.id, product.model_name]);

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqQuestion.trim()) return;

    const newFaq = {
      id: 'faq-' + Date.now(),
      product_id: product.id,
      product_name: product.model_name,
      author_name: faqAuthor.trim() || 'Müştəri',
      question: faqQuestion.trim(),
      created_at: new Date().toISOString(),
    };

    try {
      const saved = localStorage.getItem('technomania_product_faqs');
      const allFaqs = saved ? JSON.parse(saved) : [];
      const updated = [newFaq, ...allFaqs];
      localStorage.setItem('technomania_product_faqs', JSON.stringify(updated));
      window.dispatchEvent(new Event('techno_faqs_updated'));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {}

    setProductFaqs(prev => [newFaq, ...prev]);
    setFaqQuestion('');
    setFaqSubmitted(true);
    setTimeout(() => setFaqSubmitted(false), 4000);
  };

  const rawPrice = product.rawPrice || parseFloat(product.cash_price.replace(/[^\d.]/g, '')) || 1000;
  const calculatedMonthly = (rawPrice / selectedMonths).toFixed(2);

  const galleryImages = [
    product.image,
    'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1523206489230-c012c64b2b48?auto=format&fit=crop&w=600&q=80',
  ];

  const BUNDLED_PRODUCTS: Product[] = [
    {
      id: 'bundle-001', model_name: 'Adapter Apple 15W USB-C', brand: 'Apple',
      old_price: '89.99 ₼', cash_price: '69.99 ₼', rawPrice: 69.99,
      discount: '-22%', credit_tag: '', monthly: '', badge: '',
      image: 'https://images.unsplash.com/photo-1603539629634-cdb0b2a89e6e?auto=format&fit=crop&w=300&q=80',
      colors: ['#e2e8f0'],
    },
    {
      id: 'bundle-002', model_name: 'SmartWatch Apple Ultra 2 49mm Black', brand: 'Apple',
      old_price: '2299.99 ₼', cash_price: '1999.99 ₼', rawPrice: 1999.99,
      discount: '-13%', credit_tag: '', monthly: '', badge: '',
      image: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80',
      colors: ['#18181b', '#d1d5db'],
    },
  ];

  const ALTERNATIVE_PRODUCTS: Product[] = [
    {
      id: 'alt-001', model_name: 'iPhone 17 Pro Max 512GB Blue Titanium', brand: 'Apple',
      old_price: '5199.99 ₼', cash_price: '4359.99 ₼', rawPrice: 4359.99,
      discount: '-16%', credit_tag: '', monthly: '', badge: '',
      image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=300&q=80',
      colors: ['#1e3a5f', '#d1d5db'],
    },
    {
      id: 'alt-002', model_name: 'iPhone 17 Pro Max 1TB Cosmic Blue', brand: 'Apple',
      old_price: '3799.99 ₼', cash_price: '3299.99 ₼', rawPrice: 3299.99,
      discount: '-13%', credit_tag: '', monthly: '', badge: '',
      image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=300&q=80',
      colors: ['#1e3a5f'],
    },
  ];

  const SPECS_ALL = [
    { key: 'Brand', val: product.brand },
    { key: 'Daxili yaddaş', val: selectedStorage },
    { key: 'Operativ yaddaş (RAM)', val: '12 GB' },
    { key: 'Əsas kamera', val: '48 MP + 48 MP + 48 MP' },
    { key: 'Ön kamera', val: '18 MP' },
    { key: 'Nüvə sayı', val: '8 Nüvəli' },
    { key: 'SIM-kart növü', val: 'Nano SIM + eSIM' },
    { key: 'Prosessorun adı', val: `${product.brand} A19 Pro Bionic` },
    { key: 'Yaxınlaşdırma sensoru', val: 'Var (Optical Zoom 5x)' },
    { key: 'Optik sabitləşmə', val: 'Var (OIS)' },
    { key: 'Video formatı', val: '4K Dolby Vision HDR @ 120 fps' },
    { key: 'Bluetooth versiyası', val: '6.0' },
    { key: 'Autofokus əsas kamera', val: 'Var' },
    { key: 'Video sürəti', val: '4K, 24-240 kadr/s' },
    { key: 'Rəng', val: selectedColor },
    { key: 'Enerji toplama növü', val: 'USB-C' },
    { key: 'Şəbəkə standartı', val: '5G / LTE / Wi-Fi 7' },
    { key: 'Ekran ölçüsü', val: '6.9"' },
    { key: 'Ekran texnologiyası', val: 'Super Retina XDR OLED' },
    { key: 'Batareya tutumu', val: '4685 mAh' },
  ];
  const specs = showAllSpecs ? SPECS_ALL : SPECS_ALL.slice(0, 10);

  const SERVICES = [
    { id: 'warranty_1y', label: 'Zəmanət 1 il', price: 'Pulsuz', icon: '🛡️', desc: 'Rəsmi istehsalçı zəmanəti' },
    { id: 'warranty_2y', label: 'Zəmanət 2 il', price: '59.99 ₼', icon: '🛡️🛡️', desc: 'Uzadılmış servis zəmanəti' },
    { id: 'warranty_3y', label: 'Zəmanət 3 il', price: '99.99 ₼', icon: '🛡️🛡️🛡️', desc: 'Premium uzadılmış zəmanət' },
    { id: 'apple_care', label: 'AppleCare+', price: '149.99 ₼', icon: '🍎', desc: 'Bütün zərərlər üçün sığorta' },
  ];

  const REVIEWS = [
    { author: 'Murad R.', rating: 5, date: '18 iyul 2026', text: 'Əla məhsuldur! Kamerasının keyfiyyəti çox yaxşıdır, batareyası da uzun çəkir. Dizaynı çox bəyəndim.' },
    { author: 'Leyla M.', rating: 5, date: '12 iyul 2026', text: 'Çox gözəl telefondur. Rengi çox əla görünür, real həyatda şəkildən daha gözəldir. Tövsiyə edirəm!' },
  ];

  return (
    <div className={`w-full min-h-screen py-6 px-4 sm:px-6 lg:px-8 transition-colors ${isDarkMode ? 'bg-[#0f172a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      {/* 1. BREADCRUMB & BACK */}
      <div className="w-full mb-4 flex flex-wrap items-center gap-2 text-xs overflow-x-auto scrollbar-hide">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 font-bold text-[#4f533b] hover:underline cursor-pointer bg-[#f4f5f0] px-3 py-1.5 rounded-lg border border-[#4f533b]/20 flex-shrink-0"
        >
          ← Ana səhifə
        </button>
        {['Telefoniya', 'Smartfonlar', product.model_name].map((crumb, i) => (
          <span key={i} className="flex items-center gap-2">
            <span className="text-slate-300">/</span>
            <span className={`${i === 2 ? 'font-black text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'} whitespace-nowrap`}>{crumb}</span>
          </span>
        ))}
      </div>

      {/* 2. MAIN PDP GRID */}
      <div className={`rounded-3xl border shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-0 mb-6 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>

        {/* LEFT COLUMN: Gallery (5 cols) */}
        <div className={`lg:col-span-5 p-5 sm:p-7 flex flex-col border-b lg:border-b-0 lg:border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
          <div className="flex flex-col-reverse lg:flex-row gap-3.5 items-stretch">
            {/* Vertical Thumbnails */}
            {galleryImages.length > 1 && (
              <div className="flex flex-row lg:flex-col gap-2.5 max-w-full lg:max-h-[420px] overflow-x-auto lg:overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImage(img)}
                    className={`w-14 h-14 rounded-2xl border-2 p-1 transition-all cursor-pointer flex items-center justify-center overflow-hidden shrink-0 select-none ${
                      activeImage === img
                        ? 'border-[#4f533b] dark:border-[#9ba179] bg-white dark:bg-slate-800 shadow-md shadow-[#4f533b]/20 scale-105 z-10'
                        : isDarkMode
                        ? 'border-slate-800 bg-slate-800/80 hover:border-slate-600'
                        : 'border-slate-200/90 bg-slate-50 hover:border-[#4f533b]/50'
                    }`}
                  >
                    <img src={img || undefined} alt={`Şəkil ${idx + 1}`} className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image */}
            <div className={`flex-1 rounded-3xl flex items-center justify-center relative min-h-[340px] sm:min-h-[420px] border overflow-hidden ${
              isDarkMode ? 'bg-slate-800/40 border-slate-700' : 'bg-slate-50/80 border-slate-200/80 shadow-xs'
            }`}>
              {product.discount && (
                <span className="absolute top-3 left-3 bg-[#4f533b] text-white text-xs font-black px-3 py-1.5 rounded-full shadow-md z-10">
                  {product.discount}
                </span>
              )}
              <img
                src={activeImage || product?.image || undefined}
                alt={product.model_name}
                className="max-h-[320px] sm:max-h-[380px] object-contain drop-shadow-md hover:scale-105 transition-transform duration-500 p-4 mix-blend-multiply dark:mix-blend-normal"
              />
              {product.hasVideo && (
                <button className="absolute bottom-3 right-3 bg-black/75 backdrop-blur-sm text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 shadow-xl hover:bg-black/90 transition cursor-pointer">
                  <Video className="w-4 h-4 text-[#4f533b]" /> 3D Video
                </button>
              )}
            </div>
          </div>

          {/* Action icons under gallery */}
          <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => onToggleFavorite(product.id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer ${
                isFav
                  ? 'border-[#4f533b] text-[#4f533b] bg-[#f4f5f0]'
                  : isDarkMode ? 'border-slate-700 text-slate-400 hover:border-[#4f533b] hover:text-[#4f533b]'
                  : 'border-slate-200 text-slate-500 hover:border-[#4f533b] hover:text-[#4f533b]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-[#4f533b]' : ''}`} />
              {isFav ? 'Bəyənildi' : 'Bəyən'}
            </button>
            <button
              onClick={() => onToggleCompare(product.id)}
              className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer ${
                isCompared
                  ? 'border-[#4f533b] text-[#4f533b] bg-[#f4f5f0]'
                  : isDarkMode ? 'border-slate-700 text-slate-400 hover:border-[#4f533b] hover:text-[#4f533b]'
                  : 'border-slate-200 text-slate-500 hover:border-[#4f533b] hover:text-[#4f533b]'
              }`}
            >
              <Scale className={`w-4 h-4 ${isCompared ? 'text-[#4f533b]' : ''}`} />
              Müqayisə
            </button>
            <button className={`flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-xl border transition cursor-pointer ${
              isDarkMode ? 'border-slate-700 text-slate-400 hover:border-slate-500' : 'border-slate-200 text-slate-500 hover:border-slate-300'
            }`}>
              <Share2 className="w-4 h-4" />
              Paylaş
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Info (7 cols) */}
        <div className="lg:col-span-7 p-5 sm:p-8">
          {/* Brand + Code */}
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-[#4f533b] cursor-pointer hover:underline">
              {product.brand} ›
            </span>
            <span className={`text-[11px] font-mono ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
              Kod: TM-{product.id.slice(0, 8)}
            </span>
          </div>

          {/* Title */}
          <h1 className={`text-xl sm:text-2xl font-black leading-tight mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {product.model_name}
          </h1>

          {/* Rating + Stock */}
          <div className="flex items-center gap-3 text-xs mb-4 flex-wrap">
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => <Star key={s} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />)}
              <span className="font-black text-amber-600 ml-1">5.0</span>
              <span className={`ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>| 2 rəy</span>
            </div>
            <span className="text-[#4f533b] font-bold flex items-center gap-1">
              <CheckCircle className="w-3.5 h-3.5" /> Stokda var
            </span>
            <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rəsmi zəmanət: TM-DG-SBP</span>
          </div>

          {/* Color Selector */}
          <div className="mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rəng:</span>
              <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedColor}</span>
            </div>
            <div className="flex items-center gap-2">
              {[{ name: 'Cosmic Orange', hex: '#d97706' }, { name: 'Titanium Silver', hex: '#94a3b8' }, { name: 'Dark Slate', hex: '#1e293b' }].map(c => (
                <button
                  key={c.name}
                  onClick={() => setSelectedColor(c.name)}
                  title={c.name}
                  style={{ backgroundColor: c.hex }}
                  className={`w-8 h-8 rounded-full transition cursor-pointer border-2 ${
                    selectedColor === c.name ? 'border-[#4f533b] ring-2 ring-[#4f533b]/40 scale-110' : 'border-white/60 hover:scale-105'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Storage Selector */}
          <div className="mb-5">
            <span className={`text-xs font-bold mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Yaddaş həcmi:</span>
            <div className="flex items-center gap-2 flex-wrap">
              {['256 GB', '512 GB', '1 TB', '2 TB'].map(st => (
                <button
                  key={st}
                  onClick={() => setSelectedStorage(st)}
                  className={`px-4 py-2 rounded-xl text-xs font-extrabold border transition cursor-pointer ${
                    selectedStorage === st
                      ? 'bg-[#4f533b] text-white border-[#4f533b]'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                  }`}
                >{st}</button>
              ))}
            </div>
          </div>

          {/* Price */}
          <div className="mb-4">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-black text-[#4f533b]">{product.cash_price}</span>
              {product.old_price && <span className="line-through text-slate-400 text-lg">{product.old_price}</span>}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 mb-5 flex-wrap">
            <button
              onClick={() => onToggleCart(product)}
              className={`flex-1 min-w-[140px] py-3.5 px-5 rounded-xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer ${
                isInCart
                  ? 'bg-[#3e4230] hover:bg-[#2d3023] text-white'
                  : 'bg-[#4f533b] hover:bg-[#3e4230] text-white shadow-[#4f533b]/30'
              }`}
            >
              <ShoppingCart className="w-5 h-5" />
              {isInCart ? 'Səbətdə ✓' : 'Səbətə at'}
            </button>
            <button
              onClick={() => setExpressOrdered(true)}
              className={`py-3.5 px-5 rounded-xl font-black text-sm border-2 flex items-center gap-2 transition cursor-pointer ${
                isDarkMode
                  ? 'border-slate-600 text-slate-200 hover:bg-slate-700'
                  : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <Zap className="w-4 h-4" /> Bir kliklə al
            </button>
          </div>

          {expressOrdered && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center justify-between">
              <span>✔ Express sifarişiniz qeydə alındı!</span>
              <button onClick={() => setExpressOrdered(false)} className="text-slate-400 ml-2">✕</button>
            </div>
          )}

          {/* Installment Calculator */}
          <div className={`p-4 rounded-2xl border mb-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                Hissəli alış kalkulyatoru
              </span>
              <span className="text-sm font-black text-[#4f533b]">{calculatedMonthly} ₼/ay</span>
            </div>
            <div className="grid grid-cols-6 gap-1.5 mb-2">
              {[6, 9, 12, 15, 18, 24].map(m => (
                <button
                  key={m}
                  onClick={() => setSelectedMonths(m)}
                  className={`py-2 rounded-lg text-xs font-black border transition cursor-pointer ${
                    selectedMonths === m
                      ? 'bg-[#4f533b] text-white border-[#4f533b]'
                      : isDarkMode
                      ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600'
                      : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'
                  }`}
                >{m} ay</button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">ⓘ Şərtlər ilk dəfə endirimli qiymətə tətbiq olunur. Komissiyasız taksit.</p>
          </div>

          {/* Birkart / Tamkart */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[{ name: 'Birkart', color: 'text-red-600', months: selectedMonths }, { name: 'Tamkart / Leo', color: 'text-yellow-600', months: selectedMonths }].map(card => (
              <div key={card.name} className={`p-3 rounded-xl border flex items-center justify-between ${
                isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'
              }`}>
                <div>
                  <span className={`text-[10px] font-bold block ${card.color}`}>{card.name}</span>
                  <span className="text-xs font-black">{card.months} ay {(rawPrice / card.months).toFixed(1)} ₼</span>
                </div>
                <button onClick={() => onCreditClick(product)} className="text-[10px] font-bold text-[#4f533b] hover:underline cursor-pointer">Faydalan</button>
              </div>
            ))}
          </div>

          {/* Trade-In */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-[#4f533b] to-teal-600 text-white flex items-center justify-between gap-3">
            <div>
              <h4 className="font-black text-sm">Trade-in</h4>
              <p className="text-[11px] text-[#f4f5f0]">Köhnə cihazınızı dəyişin, endirim qazanın</p>
            </div>
            <button className="bg-white text-emerald-800 font-black text-xs px-4 py-2 rounded-xl hover:bg-emerald-50 transition cursor-pointer flex-shrink-0">
              Qiymətləndir
            </button>
          </div>
        </div>
      </div>

      {/* 3. TABBED CONTENT AREA */}
      <div className={`rounded-3xl border shadow-sm mb-6 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
        {/* Tab Bar */}
        <div className={`flex items-center gap-0 border-b overflow-x-auto scrollbar-hide ${
          isDarkMode ? 'border-slate-800' : 'border-slate-100'
        }`}>
          {[
            { id: 'details', label: 'Ətraflı' },
            { id: 'reviews', label: 'Rəylər (2)' },
            { id: 'faqs', label: `Suallar və Cavablar (${productFaqs.length})` },
            { id: 'bundled', label: 'Birgə satılanlar' },
            { id: 'alternatives', label: 'Alternativ seçim' },
            { id: 'services', label: 'Xidmət seçin' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-5 py-4 text-xs font-extrabold whitespace-nowrap transition cursor-pointer border-b-2 ${
                activeTab === tab.id
                  ? 'border-[#4f533b] text-[#4f533b]'
                  : isDarkMode
                  ? 'border-transparent text-slate-400 hover:text-white'
                  : 'border-transparent text-slate-500 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 sm:p-8">

          {/* TAB: Ətraflı (Specs, Description, Video) */}
          {activeTab === 'details' && (
            <div>
              {/* Product Description */}
              {product.description && (
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-xs font-bold text-[#4f533b] mb-2 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Məhsul haqqında açıqlama
                  </h3>
                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
                    {product.description}
                  </p>
                </div>
              )}

              {/* Product Video Review Embed / Player */}
              {(product.video_url || product.hasVideo) && (
                <div className="mb-6 pb-6 border-b border-slate-100 dark:border-slate-800 space-y-3">
                  <h3 className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                    <Video className="w-4 h-4" /> Məhsulun video icmalı
                  </h3>
                  <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-black aspect-video max-w-2xl shadow-md">
                    {product.video_url && product.video_url.includes('youtube') ? (
                      <iframe
                        src={product.video_url.replace('watch?v=', 'embed/')}
                        title="Product Video"
                        className="w-full h-full"
                        allowFullScreen
                      />
                    ) : (
                      <video src={product.video_url} controls className="w-full h-full object-contain" />
                    )}
                  </div>
                </div>
              )}

              <h2 className={`text-lg font-black mb-5 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Sparkles className="w-5 h-5 text-[#4f533b]" /> Xüsusiyyətlər
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                {specs.map((spec, i) => (
                  <div key={i} className={`flex items-center justify-between py-2.5 border-b ${
                    isDarkMode ? 'border-slate-800' : 'border-slate-100'
                  }`}>
                    <span className={`text-xs font-semibold flex items-center gap-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      {spec.key}
                    </span>
                    <span className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{spec.val}</span>
                  </div>
                ))}
              </div>
              {!showAllSpecs && SPECS_ALL.length > 10 && (
                <button
                  onClick={() => setShowAllSpecs(true)}
                  className="mt-5 text-xs font-black text-[#4f533b] flex items-center gap-1 hover:underline cursor-pointer"
                >
                  Hamısına bax → ({SPECS_ALL.length - 10} daha)
                </button>
              )}
            </div>
          )}

          {/* TAB: Rəylər */}
          {activeTab === 'reviews' && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-lg font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> Müştəri rəyləri
                </h2>
                {/* Overall Rating */}
                <div className={`text-center px-5 py-3 rounded-2xl border ${
                  isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50 border-amber-200'
                }`}>
                  <div className="text-3xl font-black text-amber-500">5.0</div>
                  <div className="flex justify-center gap-0.5 mt-1">
                    {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">2 rəy</div>
                </div>
              </div>
              <div className="space-y-4">
                {REVIEWS.map((rev, i) => (
                  <div key={i} className={`p-5 rounded-2xl border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-[#4f533b] flex items-center justify-center text-white font-black text-sm">
                          {rev.author[0]}
                        </div>
                        <div>
                          <div className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{rev.author}</div>
                          <div className="flex gap-0.5 mt-0.5">
                            {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 fill-amber-400 text-amber-400" />)}
                          </div>
                        </div>
                      </div>
                      <span className="text-xs text-slate-400">{rev.date}</span>
                    </div>
                    <p className={`text-xs leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>{rev.text}</p>
                  </div>
                ))}
              </div>
              <button className="mt-5 w-full py-3 rounded-xl border-2 border-[#4f533b] text-[#4f533b] font-black text-sm hover:bg-[#f4f5f0] transition cursor-pointer">
                Rəy əlavə et
              </button>
            </div>
          )}

          {/* TAB: Suallar və Cavablar (Q&A) */}
          {activeTab === 'faqs' && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
                <div>
                  <h2 className={`text-lg font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    <MessageCircle className="w-5 h-5 text-[#4f533b]" /> Məhsul Haqqında Suallar Və Cavablar
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Məhsulla bağlı sizi maraqlandıran sualı verin, mütəxəssislərimiz cavablandırsın.
                  </p>
                </div>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#f4f5f0] text-[#4f533b] border border-[#4f533b]/20 flex-shrink-0">
                  {productFaqs.length} Sual Verilib
                </span>
              </div>

              {/* Ask Question Form */}
              <form onSubmit={handleAskQuestion} className={`p-5 rounded-2xl border space-y-3 ${
                isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-slate-50 border-slate-200'
              }`}>
                <h3 className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                  💬 Məhsulla bağlı sual verin:
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={faqAuthor}
                    onChange={e => setFaqAuthor(e.target.value)}
                    placeholder="Adınız və Soyadınız"
                    className={`px-3.5 py-2.5 rounded-xl text-xs outline-none border transition ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-[#4f533b]' : 'bg-white border-slate-200 text-slate-800 focus:border-[#4f533b]'
                    }`}
                  />
                  <input
                    type="text" required
                    value={faqQuestion}
                    onChange={e => setFaqQuestion(e.target.value)}
                    placeholder="Sualınızı bura yazın (məsələn: Rəsmi zəmanət var?)..."
                    className={`px-3.5 py-2.5 rounded-xl text-xs outline-none border transition ${
                      isDarkMode ? 'bg-slate-900 border-slate-700 text-white focus:border-[#4f533b]' : 'bg-white border-slate-200 text-slate-800 focus:border-[#4f533b]'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  {faqSubmitted ? (
                    <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                      <CheckCircle className="w-4 h-4" /> Sualınız uğurla göndərildi! Menecerlərimiz tezliklə cavablandıracaq.
                    </span>
                  ) : <span />}

                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" /> Sualı Göndər
                  </button>
                </div>
              </form>

              {/* Questions & Answers List */}
              <div className="space-y-4 pt-2">
                {productFaqs.map((faq: any, i: number) => (
                  <div key={faq.id || i} className={`p-5 rounded-2xl border space-y-3 ${
                    isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
                  }`}>
                    {/* Question Header */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-700 dark:text-amber-300 font-black text-xs flex items-center justify-center">
                          S
                        </div>
                        <div>
                          <span className={`text-xs font-bold block ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{faq.author_name}</span>
                          <span className="text-[10px] text-slate-400 font-mono">{new Date(faq.created_at || Date.now()).toLocaleDateString('az-AZ')}</span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500">
                        {faq.answer ? '✓ Cavablandırıldı' : '⏳ Cavab Gözlənilir'}
                      </span>
                    </div>

                    <p className={`text-sm font-extrabold pl-9 ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>
                      "{faq.question}"
                    </p>

                    {/* Answer Box if answered */}
                    {faq.answer ? (
                      <div className={`ml-6 p-4 rounded-xl border flex items-start gap-3 ${
                        isDarkMode ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200' : 'bg-emerald-50/80 border-emerald-200 text-slate-800'
                      }`}>
                        <div className="w-6 h-6 rounded-md bg-emerald-600 text-white flex items-center justify-center flex-shrink-0 text-xs font-black">
                          C
                        </div>
                        <div className="space-y-1 min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-xs font-black text-emerald-800 dark:text-emerald-300">
                              {faq.answered_by || 'Techno Support'}
                            </span>
                            <span className="text-[10px] text-emerald-600 font-mono">Menecer Cavabı</span>
                          </div>
                          <p className="text-xs leading-relaxed font-medium">{faq.answer}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="ml-6 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 text-xs font-medium">
                        ⏳ Sualınız operatorlarımızın növbəsindədir. Tezliklə cavablandırılacaq.
                      </div>
                    )}
                  </div>
                ))}

                {productFaqs.length === 0 && (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    Bu məhsula hələ ki heç bir sual verilməyib. İlk sualı siz verin!
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: Birgə Satılanlar */}
          {activeTab === 'bundled' && (
            <div>
              <h2 className={`text-lg font-black mb-5 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Package className="w-5 h-5 text-[#4f533b]" /> Birgə Satılanlar Və Aksessuarlar
              </h2>
              {(() => {
                const realBundled = Array.isArray(product.bundled_product_ids) && product.bundled_product_ids.length > 0
                  ? product.bundled_product_ids.map((id: string) => (getLiveProducts() || []).find((p: Product) => p.id === id)).filter(Boolean) as Product[]
                  : [];

                const displayItems = realBundled;

                return (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {displayItems.map(bp => (
                      <div key={bp.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${
                        isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                      }`}>
                        <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isDarkMode ? 'bg-slate-700' : 'bg-white'
                        } border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                          <img src={bp.image || undefined} alt={bp.model_name} className="max-h-16 object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{bp.brand}</span>
                          <h4 className={`font-semibold text-xs leading-snug line-clamp-2 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bp.model_name}</h4>
                          <div className="flex items-baseline gap-1.5 mb-2">
                            {bp.old_price && <span className="line-through text-[10px] text-slate-400">{bp.old_price}</span>}
                            <span className="font-black text-sm text-[#4f533b]">{bp.cash_price}</span>
                          </div>
                          <button
                            onClick={() => setBundleCart(prev => prev.includes(bp.id) ? prev.filter(x => x !== bp.id) : [...prev, bp.id])}
                            className={`flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-lg transition cursor-pointer ${
                              bundleCart.includes(bp.id)
                                ? 'bg-[#3e4230] text-white'
                                : 'bg-[#4f533b] hover:bg-[#3e4230] text-white'
                            }`}
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {bundleCart.includes(bp.id) ? 'Əlavə edildi ✓' : 'Səbətə at'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {/* TAB: Alternativ Seçim */}
          {activeTab === 'alternatives' && (
            <div>
              <h2 className={`text-lg font-black mb-5 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <Layers className="w-5 h-5 text-[#4f533b]" /> Alternativ seçim
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ALTERNATIVE_PRODUCTS.map(alt => (
                  <div key={alt.id} className={`p-4 rounded-2xl border flex items-center gap-4 hover:border-[#4f533b]/40 transition ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      isDarkMode ? 'bg-slate-700' : 'bg-white'
                    } border ${isDarkMode ? 'border-slate-600' : 'border-slate-200'}`}>
                      <img src={alt.image || undefined} alt={alt.model_name} className="max-h-16 object-contain" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-[10px] font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-400'}`}>{alt.brand}</span>
                      <h4 className={`font-semibold text-xs leading-snug line-clamp-2 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{alt.model_name}</h4>
                      <div className="flex items-baseline gap-1.5 mb-2">
                        {alt.old_price && <span className="line-through text-[10px] text-slate-400">{alt.old_price}</span>}
                        <span className="font-black text-sm text-[#4f533b]">{alt.cash_price}</span>
                      </div>
                      <button
                        onClick={() => onToggleCart(alt)}
                        className="flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-lg bg-[#4f533b] hover:bg-[#3e4230] text-white transition cursor-pointer"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        Səbətə at
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB: Xidmət Seçin */}
          {activeTab === 'services' && (
            <div>
              <h2 className={`text-lg font-black mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <ShieldCheck className="w-5 h-5 text-[#4f533b]" /> Xidmət seçin
              </h2>
              <p className={`text-xs mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cihazınız üçün ən uyğun zəmanəti seçin</p>
              <div className="space-y-3">
                {SERVICES.map(svc => (
                  <button
                    key={svc.id}
                    onClick={() => setSelectedService(svc.id)}
                    className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition cursor-pointer ${
                      selectedService === svc.id
                        ? 'border-[#4f533b] bg-[#f4f5f0] dark:bg-stone-900/40'
                        : isDarkMode
                        ? 'border-slate-700 bg-slate-800 hover:border-slate-500'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <span className="text-2xl">{svc.icon}</span>
                    <div className="flex-1">
                      <div className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{svc.label}</div>
                      <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{svc.desc}</div>
                    </div>
                    <div className="text-right">
                      <div className={`font-black text-sm ${
                        svc.price === 'Pulsuz' ? 'text-[#4f533b]' : isDarkMode ? 'text-white' : 'text-slate-900'
                      }`}>{svc.price}</div>
                      {selectedService === svc.id && (
                        <CheckCircle className="w-5 h-5 text-[#4f533b] ml-auto mt-1" />
                      )}
                    </div>
                  </button>
                ))}
              </div>
              <button
                onClick={() => onToggleCart(product)}
                className="mt-5 w-full py-3.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-[#4f533b]/20"
              >
                <ShoppingCart className="w-5 h-5" />
                Seçilmiş xidmətlə səbətə at
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}


/* ═══════════════════════════════════════════════════
   SECTION HEADER COMPONENT
   ═══════════════════════════════════════════════════ */
function SectionHeader({ title, actionText = 'Hamısına bax' }: { title: string; icon?: any; actionText?: string }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">{title}</h2>
      <button className="text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-[#4f533b] dark:hover:text-[#a3a886] transition flex items-center gap-1 cursor-pointer">
        {actionText} <ChevronRight className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}


function HeroBannerSkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`hidden lg:flex lg:flex-1 min-w-0 rounded-2xl overflow-hidden relative flex-col justify-between p-6 sm:p-8 lg:h-[480px] lg:min-h-[480px] lg:max-h-[480px] animate-pulse ${
      isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
    }`}>
      <div className="space-y-4 max-w-sm">
        <div className={`h-6 w-32 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
        <div className={`h-10 w-3/4 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
        <div className={`h-10 w-1/2 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
        <div className={`h-4 w-full rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
      </div>
      <div className={`h-10 w-36 rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'}`} />
    </div>
  );
}

function WeeklyOfferSkeleton({ isDarkMode }: { isDarkMode: boolean }) {
  return (
    <div className={`hidden lg:flex lg:w-[250px] flex-shrink-0 rounded-2xl border overflow-hidden flex-col justify-between p-3.5 lg:h-[480px] lg:min-h-[480px] lg:max-h-[480px] animate-pulse ${
      isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      <div className="space-y-2">
        <div className={`h-5 w-3/4 mx-auto rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
        <div className={`h-6 w-full rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
        <div className={`h-4 w-5/6 mx-auto rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
        <div className={`h-6 w-1/2 mx-auto rounded-lg ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
      </div>
      <div className={`w-full h-36 rounded-2xl my-auto ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
      <div className={`h-10 w-full rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
    </div>
  );
}

function ProductGridSkeleton({ count = 10, isDarkMode }: { count?: number; isDarkMode: boolean }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3.5 sm:gap-4 items-stretch">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`rounded-2xl border p-3 flex flex-col justify-between h-[360px] animate-pulse ${
            isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
          }`}
        >
          <div className="space-y-3">
            <div className={`w-full aspect-square rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <div className={`h-3.5 w-4/5 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <div className={`h-3 w-1/2 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
          </div>
          <div className="space-y-2 pt-2">
            <div className={`h-5 w-2/3 rounded-md ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
            <div className={`h-8 w-full rounded-xl ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

const CAMPAIGNS_DATA = [
  {
    id: 'summer-2026',
    title: 'Xüsusi Yay Fürsətləri 2026',
    badge: 'TOP KAMPANİYA • YAY ENDİRİMLƏRİ',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=1000&q=80',
    days: 4, hours: 14, mins: 37, secs: 22,
    desc: 'Bütün smartfon, aksessuar və məişət texnikasına 24 ayadək 0% ilkin ödənişlə faizsiz taksit imkanı! Kampaniya müddətində nağd alışda əlavə 15% keşbək hədiyyə olunur. Bütün filiallarımızda və rəsmi saytımızda keçərlidir.',
    conditions: [
      '0% İlkin ödəniş, 0% Komissiya',
      '24 aya qədər hissə-hissə faizsiz ödəniş',
      'Ölkə üzrə pulsuz sürətli çatdırılma',
      'Nağd alışda 15% Nağd Keşbək hədiyyə'
    ]
  },
  {
    id: 'flagship-cashback',
    title: 'Smartfonlarda 15% Nağd Keşbək',
    badge: 'KEŞBƏK FLAQMAN',
    image: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=1000&q=80',
    days: 2, hours: 8, mins: 12, secs: 45,
    desc: 'Samsung Galaxy S24 Ultra və iPhone 15 Pro Max flaqman seriyasını nağd və ya tək şəxsiyyət vəsiqəsi ilə müddətli alışda 15%-dək nağd keşbək hesabınıza dərhal köçürülür!',
    conditions: [
      'Rəsmi 1 il istehsalçı zəmanəti',
      'Hədiyyə zərbəyə dözümlü keys və ekran qoruyucu',
      'Ən böyük keşbək dərəcəsi'
    ]
  },
  {
    id: 'laptops-gaming',
    title: 'Noutbuk və Qeyminq Şousu',
    badge: '0₼ İLKİN ÖDƏNİŞ',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1000&q=80',
    days: 6, hours: 19, mins: 55, secs: 10,
    desc: 'Asus ROG, Lenovo Legion, HP Omen və Apple MacBook M3 modellərinə ilkin ödənişsiz 18 ayadək komissiyasız faizsiz kredit kampaniyası start götürdü!',
    conditions: [
      '0₼ İlkin ödəniş, 18 ay faizsiz',
      'Hədiyyə orijinal qeyminq çantası və mausu',
      'Yerində 5 dəqiqəyə rəsmiləşdirmə'
    ]
  }
];

const STORES_DATA = [
  {
    id: 'narimanov',
    name: 'TechnoMania Nərimanov Flaqman Mağazası',
    address: 'Bakı şəhəri, M. Nərimanov küçəsi 15 (Nərimanov metro stansiyasının çıxışı)',
    hours: '09:00 - 21:00 (Hər gün kəsintisiz)',
    phone: '*6060 / +994 12 555 60 60',
    mapUrl: 'https://maps.google.com/maps?q=Narimanov,Baku&t=&z=15&ie=UTF8&iwloc=&output=embed',
    image: 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: '28may',
    name: 'TechnoMania 28 May Mağazası',
    address: 'Bakı şəhəri, 28 May küçəsi 44 (28 Mall ticarət mərkəzinin tam qarşısı)',
    hours: '10:00 - 22:00 (Hər gün kəsintisiz)',
    phone: '*6060 / +994 12 444 28 28',
    mapUrl: 'https://maps.google.com/maps?q=28+May,Baku&t=&z=15&ie=UTF8&iwloc=&output=embed',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'ganclik',
    name: 'TechnoMania Gənclik Mall Mağazası',
    address: 'Bakı şəhəri, Fətəli Xan Xoyski küç. 14 (Gənclik Mall - 1-ci mərtəbə)',
    hours: '10:00 - 22:00 (Hər gün kəsintisiz)',
    phone: '*6060 / +994 12 333 55 55',
    mapUrl: 'https://maps.google.com/maps?q=Ganclik+Mall,Baku&t=&z=15&ie=UTF8&iwloc=&output=embed',
    image: 'https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?auto=format&fit=crop&w=800&q=80'
  },
  {
    id: 'sumqayit',
    name: 'TechnoMania Sumqayıt Mağazası',
    address: 'Sumqayıt şəhəri, Sülh küçəsi 34A (Mərkəzi Meydanın yanı)',
    hours: '09:00 - 20:00 (Hər gün kəsintisiz)',
    phone: '*6060 / +994 18 655 00 00',
    mapUrl: 'https://maps.google.com/maps?q=Sumqayit,Azerbaijan&t=&z=15&ie=UTF8&iwloc=&output=embed',
    image: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?auto=format&fit=crop&w=800&q=80'
  }
];

/* ═══════════════════════════════════════════════════
   MAIN PAGE COMPONENT
   ═══════════════════════════════════════════════════ */
export default function TechnoManiaHomePage() {
  const router = useRouter();
  const [storeBanners, setStoreBanners] = useState<any[]>([]);
  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);
  const [activeLeaderTab, setActiveLeaderTab] = useState('Bütün məhsullar');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isMobileCategoriesOpen, setIsMobileCategoriesOpen] = useState(false);
  const [isCatalogModalOpen, setIsCatalogModalOpen] = useState(false);
  const [selectedBrand, setSelectedBrand] = useState<string>('ALL');
  const t = translations[currentLang] || translations.AZ;

  const [liveProductsList, setLiveProductsList] = useState<Product[]>([]);
  const [siteSettings, setSiteSettings] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      if ((window as any).__SERVER_SITE_SETTINGS__) return (window as any).__SERVER_SITE_SETTINGS__;
      try {
        const saved = localStorage.getItem('technomania_site_settings');
        if (saved) return JSON.parse(saved);
      } catch (e) {}
    }
    return {};
  });
  const [weeklyOfferIndex, setWeeklyOfferIndex] = useState(0);
  const [isMounted, setIsMounted] = useState(false);
  const [isDataLoading, setIsDataLoading] = useState(true);
  const [storesList, setStoresList] = useState<any[]>(STORES_DATA);

  // Modals state
  const [isCampaignsModalOpen, setIsCampaignsModalOpen] = useState(false);
  const [selectedCampaignId, setSelectedCampaignId] = useState('summer-2026');
  const [selectedStoreId, setSelectedStoreId] = useState('narimanov');

  // Credit modal
  const [creditModalProduct, setCreditModalProduct] = useState<Product | null>(null);
  const [creditSubmitted, setCreditSubmitted] = useState(false);
  const [creditForm, setCreditForm] = useState({
    name: '', pin: '', phone: '+994 ', income: '', months: '12'
  });

  // AI Chat
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    {
      sender: 'ai',
      text: 'Salam! 👋 Mən TechnoMania-nın AI Satış Assistentiyəm. İstənilən texnoloji məhsul haqqında suallarınızı verə bilərsiniz!'
    }
  ]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Countdown Timer based on siteSettings weekly offers end_date
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  // Compute live weekly offers from ERP Marketing Settings
  const weeklyOffersList: Product[] = useMemo(() => {
    const rawOffers = siteSettings?.weekly_offers?.items;
    if (Array.isArray(rawOffers) && rawOffers.length > 0) {
      const activeOffers = rawOffers.filter((item: any) => item && item.active !== false);
      if (activeOffers.length > 0) {
        return activeOffers.map((item: any) => {
          const matched = liveProductsList.find(p => String(p.id) === String(item.id));
          const dealPriceNum = typeof item.deal_price === 'number'
            ? item.deal_price
            : (parseFloat(String(item.deal_price)) || 0);
          const origPriceNum = typeof item.original_price === 'number'
            ? item.original_price
            : (parseFloat(String(item.original_price)) || 0);

          const dealPriceStr = dealPriceNum > 0 ? `${dealPriceNum.toFixed(2)} ₼` : (matched?.cash_price ? String(matched.cash_price) : '0.00 ₼');
          const origPriceStr = origPriceNum > 0 ? `${origPriceNum.toFixed(2)} ₼` : (matched?.old_price || '');

          if (matched) {
            return {
              ...matched,
              cash_price: dealPriceStr,
              old_price: origPriceStr || matched.old_price || '',
              rawPrice: dealPriceNum > 0 ? dealPriceNum : (matched.rawPrice || 0),
              credit_tag: item.taksit || matched.credit_tag || '0% 6 ay',
              badge: item.taksit || '0% taksit',
            };
          }

          return {
            id: String(item.id),
            model_name: item.product_name || 'Həftənin Təklifi Məhsulu',
            brand: item.brand || 'Ümumi',
            category: 'Həftənin təklifi',
            image: item.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80',
            cash_price: dealPriceStr,
            old_price: origPriceStr || '',
            rawPrice: dealPriceNum,
            discount: (origPriceNum > dealPriceNum && origPriceNum > 0) ? `-${Math.round(((origPriceNum - dealPriceNum) / origPriceNum) * 100)}%` : '',
            credit_tag: item.taksit || '0% 6 ay',
            monthly: dealPriceNum > 0 ? `${(dealPriceNum / 6).toFixed(1)} ₼/ay` : '0 ₼/ay',
            badge: item.taksit || '0% taksit',
            colors: [],
          } as Product;
        });
      }
    }

    // Fallback if no weekly offers saved in ERP
    const fallback = liveProductsList.find(p => p.discount || (p as any).isHot || p.isNew) || liveProductsList[0];
    return fallback ? [fallback] : [];
  }, [siteSettings?.weekly_offers?.items, liveProductsList]);

  // Auto-slide weekly offers if there are multiple products
  useEffect(() => {
    if (weeklyOffersList.length <= 1) return;
    const timer = setInterval(() => {
      setWeeklyOfferIndex(prev => (prev + 1) % weeklyOffersList.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [weeklyOffersList.length]);

  // Two Hero Banner Sliders State
  const [heroSlider1Index, setHeroSlider1Index] = useState(0);
  const [heroSlider2Index, setHeroSlider2Index] = useState(0);

  const [dynamicCategories, setDynamicCategories] = useState<any[]>(() => {
    const local = getLocalCategories();
    if (local && local.length > 0) {
      const level1Only = local.filter((c: any) => !c.parent_id || c.level === 1)
        .sort((a: any, b: any) => (a.sort_order || 99) - (b.sort_order || 99));
      if (level1Only.length > 0) return level1Only;
    }
    return SIDEBAR_CATEGORIES;
  });

  const [liveBrandsList, setLiveBrandsList] = useState<any[]>([]);

  const fetchStoreBanners = () => {
    if (typeof window !== 'undefined') {
      try {
        const data = localStorage.getItem('techno_erp_banners');
        if (data) {
          const parsed = JSON.parse(data);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setStoreBanners(parsed);
          }
        }
      } catch (e) {}
    }

    fetch('/api/catalog/banners', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
      .then(r => r.json())
      .then(parsed => {
        if (Array.isArray(parsed) && parsed.length > 0) {
          setStoreBanners(parsed);
          try { localStorage.setItem('techno_erp_banners', JSON.stringify(parsed)); } catch (e) {}
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchStoreBanners();
    const handleBannerUpdate = () => fetchStoreBanners();
    window.addEventListener('techno_banners_updated', handleBannerUpdate);
    window.addEventListener('storage', handleBannerUpdate);
    return () => {
      window.removeEventListener('techno_banners_updated', handleBannerUpdate);
      window.removeEventListener('storage', handleBannerUpdate);
    };
  }, []);

  useEffect(() => {
    const heroActive = (storeBanners || []).filter((b: any) => b && b.active !== false && (b.image || b.image_url));
    if (heroActive.length <= 1) return;
    const s1Timer = setInterval(() => {
      setHeroSlider1Index(prev => (prev + 1) % heroActive.length);
    }, 4500);
    return () => clearInterval(s1Timer);
  }, [storeBanners]);

  useEffect(() => {
    const loadSettings = () => {
      if (typeof window !== 'undefined' && (window as any).__SERVER_SITE_SETTINGS__) {
        setSiteSettings((window as any).__SERVER_SITE_SETTINGS__);
      }
      fetch('/api/catalog/settings', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
        .then(r => r.json())
        .then(data => {
          if (data && typeof data === 'object' && !Array.isArray(data) && !data.statusCode && Object.keys(data).length > 0) {
            setSiteSettings(data);
            try { localStorage.setItem('technomania_site_settings', JSON.stringify(data)); } catch (e) {}
          }
        })
        .catch(() => {
          try {
            const saved = localStorage.getItem('technomania_site_settings');
            if (saved) setSiteSettings(JSON.parse(saved));
          } catch (e) {}
        });
    };
    loadSettings();
    window.addEventListener('techno_settings_updated', loadSettings);
    window.addEventListener('technomania_settings_updated', loadSettings);
    window.addEventListener('storage', loadSettings);
    return () => {
      window.removeEventListener('techno_settings_updated', loadSettings);
      window.removeEventListener('technomania_settings_updated', loadSettings);
      window.removeEventListener('storage', loadSettings);
    };
  }, []);

  useEffect(() => {
    setLiveProductsList(getLiveProducts());
    Promise.all([
      fetchLiveProducts(),
      fetchStoreBranchesApi()
    ]).then(([prods, stores]) => {
      if (prods && prods.length > 0) {
        setLiveProductsList(prods);
      }
      if (stores && stores.length > 0) {
        setStoresList(stores.map(s => ({
          id: s.id,
          name: s.name,
          address: s.address,
          hours: s.hours,
          phone: s.phone,
          mapUrl: s.mapEmbedUrl || s.googleMapsUrl || 'https://maps.google.com/maps?q=Baku&t=&z=15&ie=UTF8&iwloc=&output=embed',
          image: s.isMain ? 'https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?auto=format&fit=crop&w=800&q=80' : 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=800&q=80'
        })));
      }
    }).finally(() => {
      setIsDataLoading(false);
    });

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const ref = urlParams.get('ref') || urlParams.get('aff');
      if (ref) {
        localStorage.setItem('technomania_active_ref', ref.toUpperCase().trim());
      }
    }
  }, []);

  const handleSelectCategoryFromModal = (catName: string) => {
    router.push(`/category/${toSlug(catName)}`);
  };

  const resetAllFilters = () => {
    setSearchQuery('');
    setSelectedBrand('ALL');
    setActiveLeaderTab('Bütün məhsullar');
  };

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

  // Real dynamic countdown timer calculated from siteSettings.weekly_offers.end_date
  useEffect(() => {
    const targetDateStr = siteSettings?.weekly_offers?.end_date;
    const calculateCountdown = () => {
      let targetTime: number;
      if (targetDateStr) {
        targetTime = new Date(targetDateStr).getTime();
        if (isNaN(targetTime)) {
          targetTime = Date.now() + 3 * 24 * 60 * 60 * 1000;
        }
      } else {
        targetTime = Date.now() + (1 * 24 + 14) * 60 * 60 * 1000 + 37 * 60 * 1000;
      }

      const diff = Math.max(0, targetTime - Date.now());
      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const secs = Math.floor((diff % (1000 * 60)) / 1000);
      return { days, hours, mins, secs };
    };

    setTimeLeft(calculateCountdown());
    const interval = setInterval(() => {
      setTimeLeft(calculateCountdown());
    }, 1000);

    return () => clearInterval(interval);
  }, [siteSettings?.weekly_offers?.end_date]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleCart = (product: Product) => {
    let updated: Product[];
    if (cart.find(c => c.id === product.id)) {
      updated = cart.filter(c => c.id !== product.id);
    } else {
      updated = [...cart, product];
    }
    setCart(updated);
    localStorage.setItem('technomania_cart', JSON.stringify(updated));
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('technomania_cart');
    if (savedCart) {
      try { setCart(JSON.parse(savedCart)); } catch (e) {}
    }
    const savedFavs = localStorage.getItem('technomania_favorites');
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
    const saved = localStorage.getItem('technomania_compare');
    if (saved) {
      try { setComparedProducts(JSON.parse(saved)); } catch (e) {}
    }

    // Load Level 1 Categories from Backend API & Fallback
    fetchApiCategories().then(allCats => {
      if (allCats && allCats.length > 0) {
        const level1Only = allCats.filter((c: any) => !c.parent_id || c.level === 1)
          .sort((a: any, b: any) => (a.sort_order || 99) - (b.sort_order || 99));
        setDynamicCategories(level1Only);
      }
    });

    // Load Brands from Backend API
    fetch('/api/catalog/brands', {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      },
    })
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setLiveBrandsList(data);
        }
      })
      .catch(() => {});
  }, []);

  const toggleFavorite = (id: string) => {
    let updated: string[];
    let isAdding = false;
    if (favorites.includes(id)) {
      updated = favorites.filter(f => f !== id);
    } else {
      updated = [...favorites, id];
      isAdding = true;
    }
    setFavorites(updated);
    localStorage.setItem('technomania_favorites', JSON.stringify(updated));

    const matchedProd = liveProductsList.find((p: any) => p.id === id);
    if (typeof window !== 'undefined' && matchedProd) {
      window.dispatchEvent(new CustomEvent('techno_toast', {
        detail: {
          type: 'fav',
          title: matchedProd.model_name,
          subtitle: isAdding ? 'Seçilmişlərə əlavə olundu!' : 'Seçilmişlərdən çıxarıldı',
        }
      }));
    }
  };

  const toggleCompare = (id: string) => {
    let updated: string[];
    let isAdding = false;
    if (comparedProducts.includes(id)) {
      updated = comparedProducts.filter(c => c !== id);
    } else {
      if (comparedProducts.length >= 4) {
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('techno_toast', {
            detail: {
              type: 'info',
              title: 'Müqayisə Limiti',
              subtitle: 'Maksimum 4 məhsulu müqayisə edə bilərsiniz.',
            }
          }));
        }
        return;
      }
      updated = [...comparedProducts, id];
      isAdding = true;
    }
    setComparedProducts(updated);
    localStorage.setItem('technomania_compare', JSON.stringify(updated));

    const matchedProd = liveProductsList.find((p: any) => p.id === id);
    if (typeof window !== 'undefined' && matchedProd) {
      window.dispatchEvent(new CustomEvent('techno_toast', {
        detail: {
          type: 'compare',
          title: matchedProd.model_name,
          subtitle: isAdding ? 'Müqayisə siyahısına əlavə olundu!' : 'Müqayisədən çıxarıldı',
        }
      }));
    }
  };

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalProduct) return;
    try {
      await fetch(`${API_BASE}/credit/apply`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          creditorId: 'online_user',
          branchId: 'b1000000-0000-0000-0000-000000000001',
          productId: creditModalProduct.id,
          customerName: creditForm.name,
          customerPin: creditForm.pin,
          customerPhone: creditForm.phone,
          monthlyIncome: Number(creditForm.income),
          requestedMonths: Number(creditForm.months)
        })
      });
    } catch {}
    setCreditSubmitted(true);
  };

  const handleAiSend = () => {
    if (!userInput.trim()) return;
    const updated = [...chatMessages, { sender: 'user', text: userInput }];
    setChatMessages(updated);
    setUserInput('');

    setTimeout(() => {
      setChatMessages([
        ...updated,
        {
          sender: 'ai',
          text: `Sizin üçün ən uyğun modelləri seçirəm... 🔍\n\nBüdcənizə uyğun olaraq bu məhsulları tövsiyə edirəm. Daha ətraflı məlumat üçün "Kreditlə" düyməsinə basa bilərsiniz!`
        }
      ]);
    }, 800);
  };

  const pad = (n: number) => n.toString().padStart(2, '0');

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#f8fafc] text-slate-900'} flex flex-col`}>

      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLang={currentLang}
        setCurrentLang={handleLangChange}
      />

      {/* ═══ MOBILE MENU DRAWER ═══ */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[999] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          {/* Drawer panel */}
          <div className={`absolute left-0 top-0 h-full w-[85vw] max-w-sm flex flex-col shadow-2xl transition-transform duration-300 ${isDarkMode ? 'bg-slate-900 text-slate-100' : 'bg-white text-slate-900'}`}>

            {/* Drawer Header */}
            <div className="bg-gradient-to-r from-[#4f533b] to-[#3e4230] px-5 py-6 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-2xl tracking-tighter text-white">techno</span>
                <span className="font-black text-2xl tracking-tighter text-amber-300">mania</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Settings row */}
            <div className={`flex items-center justify-between px-5 py-3 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <div className="flex items-center gap-2 text-xs font-bold">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={currentLang}
                  onChange={(e) => handleLangChange(e.target.value as Language)}
                  className={`bg-transparent outline-none cursor-pointer font-bold text-xs ${isDarkMode ? 'text-slate-200' : 'text-slate-700'}`}
                >
                  <option value="AZ">AZ — Azərbaycan</option>
                  <option value="EN">EN — English</option>
                  <option value="RU">RU — Русский</option>
                </select>
              </div>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`flex items-center gap-1.5 text-xs font-bold px-2.5 py-1.5 rounded-lg border transition cursor-pointer ${
                  isDarkMode ? 'bg-slate-800 border-slate-700 text-amber-300' : 'bg-slate-100 border-slate-200 text-slate-700'
                }`}
              >
                {isDarkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {isDarkMode ? t.lightTheme : t.darkTheme}
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-4 px-3">
              {[
                { icon: Scale, label: t.compare, path: '/compare', badge: comparedProducts.length },
                { icon: Heart, label: t.wishlist, path: '/wishlist', badge: favorites.length },
                { icon: ShoppingCart, label: t.cart, path: '/cart', badge: cart.length },
                { icon: User, label: t.login, path: '/login', badge: 0 },
              ].map(({ icon: Icon, label, path, badge }) => (
                <button
                  key={path}
                  onClick={() => { router.push(path); setIsMobileMenuOpen(false); }}
                  className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl mb-1.5 transition cursor-pointer text-left ${
                    isDarkMode ? 'hover:bg-slate-800 text-slate-200' : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="relative flex-shrink-0">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                      <Icon className="w-5 h-5 text-[#4f533b]" />
                    </div>
                    {badge > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#4f533b] text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">{badge}</span>
                    )}
                  </div>
                  <span className="font-bold text-sm">{label}</span>
                  <ChevronRight className="w-4 h-4 ml-auto text-slate-400" />
                </button>
              ))}

              {/* Divider */}
              <div className={`my-3 h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />
              <p className={`px-4 text-[10px] font-bold mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                {currentLang === 'RU' ? 'Ссылки' : currentLang === 'EN' ? 'Links' : 'Keçidlər'}
              </p>
              {[
                { label: t.campaigns, href: '#' },
                { label: t.stores, href: '#' },
                { label: t.contact, href: 'tel:*6060' },
              ].map(({ label, href }) => (
                <a
                  key={label}
                  href={href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl mb-1 text-sm font-semibold transition ${isDarkMode ? 'hover:bg-slate-800 text-slate-300' : 'hover:bg-slate-50 text-slate-600'}`}
                >
                  {label}
                </a>
              ))}
            </nav>

            {/* Drawer Footer */}
            <div className={`px-5 py-4 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
              <button
                onClick={() => { router.push('/login'); setIsMobileMenuOpen(false); }}
                className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3 rounded-2xl flex items-center justify-center gap-2 shadow-lg shadow-[#4f533b]/25 transition cursor-pointer text-sm"
              >
                <User className="w-4 h-4" /> {t.login}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ═══ 4. HOMEPAGE CONTENT ═══ */}
      <>
          {/* HERO SECTION: SIDEBAR + BANNER + WEEKLY OFFER */}
          <div className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 mt-4 mb-3 flex flex-col lg:flex-row gap-4 items-start">

        {/* Left Category Sidebar Container */}
        <div className="w-full lg:w-[320px] flex-shrink-0 flex flex-col justify-between lg:h-[480px] lg:min-h-[480px] lg:max-h-[480px]">
          {/* Mobile Hero Banner matching PC Desktop Slides */}
          <MobileTopAdBanner isDarkMode={isDarkMode} />

          {/* Mobile Weekly Offer Card */}
          {(() => {
            if (weeklyOffersList.length === 0) return null;
            const dealProduct = weeklyOffersList[weeklyOfferIndex % weeklyOffersList.length] || weeklyOffersList[0];
            if (!dealProduct) return null;
            const dealTitle = siteSettings?.weekly_offers?.title || t.weeklyOffer || 'Həftənin təklifləri';

            return (
              <div className={`block lg:hidden mb-3.5 rounded-2xl border p-3.5 transition-all shadow-xs ${
                isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/90 shadow-slate-200/40'
              }`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Flame className="w-4 h-4 text-rose-500 animate-pulse flex-shrink-0" />
                    <span className="text-xs font-black tracking-tight text-slate-900 dark:text-white truncate">{dealTitle}</span>
                  </div>
                  {/* Timer */}
                  <div className="flex items-center gap-1 text-[11px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800/50">
                    <Clock className="w-3 h-3 text-emerald-500" />
                    <span>{String(timeLeft.days).padStart(2, '0')}g {String(timeLeft.hours).padStart(2, '0')}s {String(timeLeft.mins).padStart(2, '0')}d</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Link href={`/product/${toSlug(dealProduct.model_name || dealProduct.id)}`} className="w-20 h-20 flex-shrink-0 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-1 flex items-center justify-center border border-slate-100 dark:border-slate-800">
                    {dealProduct.image ? (
                      <img src={dealProduct.image} alt={dealProduct.model_name} className="w-full h-full object-contain mix-blend-multiply dark:mix-blend-normal" />
                    ) : (
                      <span className="text-[10px] text-slate-400">Şəkil yoxdur</span>
                    )}
                  </Link>
                  <div className="flex-1 min-w-0">
                    <Link href={`/product/${toSlug(dealProduct.model_name || dealProduct.id)}`} className="font-bold text-xs text-slate-900 dark:text-white line-clamp-2 hover:text-[#4f533b] transition-colors leading-snug">
                      {dealProduct.model_name}
                    </Link>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-sm font-black text-rose-600 dark:text-rose-400">{dealProduct.cash_price}</span>
                      {dealProduct.old_price && (
                        <span className="line-through text-[11px] text-slate-400 font-semibold">{dealProduct.old_price}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 mt-2">
                      <button
                        type="button"
                        onClick={() => toggleCart(dealProduct)}
                        className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95 ${
                          cart.some(c => c.id === dealProduct.id)
                            ? 'bg-emerald-600 text-white'
                            : 'bg-rose-600 hover:bg-rose-700 text-white'
                        }`}
                      >
                        <ShoppingCart className="w-3 h-3" />
                        <span>{cart.some(c => c.id === dealProduct.id) ? 'Səbətdə' : 'Səbətə at'}</span>
                      </button>
                      <Link href="/weekly-offers" className="text-[11px] font-bold text-[#4f533b] dark:text-[#a3a886] hover:underline">
                        Bütün təkliflər →
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })()}

          <aside className={`rounded-2xl border shadow-md overflow-hidden flex flex-col justify-between transition-colors lg:h-[480px] lg:min-h-[480px] lg:max-h-[480px] ${isDarkMode ? 'bg-slate-900 border-slate-800 shadow-slate-950/50' : 'bg-white border-slate-200/80 shadow-slate-200/50'}`}>
          <button
            onClick={() => setIsMobileCategoriesOpen(!isMobileCategoriesOpen)}
            className="w-full p-3.5 bg-gradient-to-r from-[#4f533b] to-[#3e4230] text-white flex items-center justify-between cursor-pointer lg:cursor-default flex-shrink-0"
          >
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-stone-300" />
              <span className="font-bold text-sm sm:text-base tracking-normal">Kateqoriyalar</span>
            </div>
            <ChevronDown className={`w-5 h-5 lg:hidden transition-transform duration-200 ${isMobileCategoriesOpen ? 'rotate-180' : ''}`} />
          </button>

          <div
            onWheel={(e) => {
              e.stopPropagation();
            }}
            className={`p-2 space-y-1 flex-1 overflow-y-auto overscroll-y-contain scrollbar-thin ${isMobileCategoriesOpen ? 'flex flex-col' : 'hidden lg:flex lg:flex-col lg:justify-start'}`}
            style={{ overscrollBehavior: 'contain' }}
          >
            {dynamicCategories.map((cat, idx) => {
              const isActive = hoveredCategory === cat.slug;
              return (
                <div
                  key={`${cat.slug || cat.id || 'cat'}-${idx}`}
                  onClick={() => handleSelectCategoryFromModal(cat.name)}
                  onMouseEnter={() => setHoveredCategory(cat.slug)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`flex items-center justify-between px-3.5 py-2 rounded-xl cursor-pointer transition-all duration-200 text-sm ${
                    isActive
                      ? 'bg-[#f4f5f0] text-[#4f533b] font-bold shadow-2xs translate-x-0.5'
                      : isDarkMode ? 'text-slate-200 hover:bg-slate-800 font-semibold' : 'text-slate-700 hover:bg-slate-100 font-semibold'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
                      isActive ? 'bg-[#4f533b] text-white shadow-2xs' : isDarkMode ? 'bg-slate-800 text-slate-300' : 'bg-slate-100 text-slate-700'
                    }`}>
                      {renderStorefrontCategoryIcon(cat.icon, cat.icon_url, "w-4 h-4")}
                    </div>
                    <span className="text-sm font-semibold tracking-normal truncate">{cat.name}</span>
                  </div>
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-all ${
                    isActive ? 'text-[#4f533b] translate-x-0.5' : 'text-slate-300'
                  }`} />
                </div>
              );
            })}
          </div>

        </aside>
      </div>

        {/* Banner Slider 1 (lg:flex-1 min-w-0 — Wide Banner with Locked Fixed Height) */}
        {isDataLoading ? (
          <HeroBannerSkeleton isDarkMode={isDarkMode} />
        ) : (() => {
          const heroActive = (storeBanners || []).filter(b => b && b.active !== false && (b.image || b.image_url));
          if (heroActive.length > 0) {
            return (
              <div
                className={`hidden lg:flex lg:flex-1 min-w-0 rounded-2xl overflow-hidden relative flex-col justify-between lg:h-[480px] lg:min-h-[480px] lg:max-h-[480px] transition-all group shadow-sm border-0 bg-transparent select-none ${
                  isDarkMode ? 'bg-slate-900' : 'bg-slate-100'
                }`}
              >
                {/* Slides Layer with Smooth Easing Crossfade */}
                <div className="relative w-full h-full overflow-hidden">
                  {heroActive.map((slide, idx) => {
                    const isCurrent = idx === (heroSlider1Index % heroActive.length);
                    return (
                      <div
                        key={slide.id || idx}
                        onClick={() => {
                          if (slide.link) {
                            if (slide.link.startsWith('http')) window.open(slide.link, '_blank');
                            else router.push(slide.link);
                          }
                        }}
                        className={`absolute inset-0 w-full h-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                          isCurrent
                            ? 'opacity-100 scale-100 z-10 cursor-pointer pointer-events-auto'
                            : 'opacity-0 scale-102 z-0 pointer-events-none'
                        }`}
                      >
                        <img
                          src={slide.image || slide.image_url || undefined}
                          alt={slide.title || 'Banner'}
                          className="w-full h-full object-cover rounded-2xl transition-transform duration-700 ease-out group-hover:scale-102"
                        />
                      </div>
                    );
                  })}
                </div>

                {heroActive.length > 1 && (
                  <>
                    {/* Left Glassmorphic Navigation Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlider1Index(prev => (prev === 0 ? heroActive.length - 1 : prev - 1));
                      }}
                      className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg active:scale-95"
                      aria-label="Əvvəlki banner"
                    >
                      <ChevronLeft className="w-5 h-5 text-white" />
                    </button>

                    {/* Right Glassmorphic Navigation Button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setHeroSlider1Index(prev => (prev + 1) % heroActive.length);
                      }}
                      className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/35 hover:bg-black/70 text-white backdrop-blur-md border border-white/20 flex items-center justify-center transition-all duration-300 cursor-pointer opacity-0 group-hover:opacity-100 hover:scale-110 shadow-lg active:scale-95"
                      aria-label="Növbəti banner"
                    >
                      <ChevronRight className="w-5 h-5 text-white" />
                    </button>

                    {/* Centered Brand-Themed Indicator Dots */}
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-black/40 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 shadow-lg">
                      {heroActive.map((_, idx) => {
                        const isCurrent = idx === (heroSlider1Index % heroActive.length);
                        return (
                          <button
                            key={idx}
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setHeroSlider1Index(idx);
                            }}
                            className={`h-2 rounded-full transition-all duration-400 ease-[cubic-bezier(0.16,1,0.3,1)] cursor-pointer ${
                              isCurrent
                                ? 'w-7 bg-[#4f533b] border border-amber-300/40 shadow-xs ring-1 ring-white/30'
                                : 'w-2 bg-white/60 hover:bg-white'
                            }`}
                            aria-label={`Banner ${idx + 1}`}
                          />
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          }
          return (
            <div className={`hidden lg:flex lg:flex-1 min-w-0 rounded-2xl overflow-hidden relative flex-col justify-between p-6 sm:p-8 lg:h-[480px] lg:min-h-[480px] lg:max-h-[480px] transition-colors group shadow-xs ${
              isDarkMode ? 'bg-slate-900' : 'bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-slate-50'
            }`}>
              {/* Slide 1 */}
              <div className={`transition-all duration-500 flex flex-col justify-between h-full ${heroSlider1Index === 0 ? 'opacity-100' : 'hidden opacity-0'}`}>
                <div className="relative z-10 max-w-sm">
                  <span className="inline-flex items-center gap-1 text-[10.5px] font-black text-[#4f533b] bg-[#f4f5f0] border border-[#4f533b]/20 px-2.5 py-0.5 rounded-full mb-2 shadow-2xs">
                    <Sparkles className="w-3.5 h-3.5" /> technomania.az
                  </span>
                  <h2 className={`text-2xl sm:text-3xl font-black tracking-tight leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    xüsusi yay <br />
                    <span className="text-[#4f533b] inline-block mt-0.5">fürsətləri</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1.5 font-medium">
                    Bütün smartfon və aksessuarlara 24 ayadək komissiyasız faizsiz taksit!
                  </p>
                </div>

                <div className="relative z-10 flex items-center gap-3 mt-4">
                  <button className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs px-5 py-2.5 rounded-xl shadow-md shadow-[#4f533b]/25 transition flex items-center gap-2 cursor-pointer active:scale-95">
                    İndi al <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="absolute right-2 bottom-2 w-44 sm:w-56 opacity-90 pointer-events-none">
                  <img
                    src="https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80"
                    alt="Promo Smartphone"
                    className="w-full h-auto object-contain drop-shadow-xl"
                  />
                </div>
              </div>
            </div>
          );
        })()}

        {/* ═══ RIGHT: HƏFTƏNİN TƏKLİFLƏRİ CARD (Exact match to reference layout & compact width) ═══ */}
        {isDataLoading ? (
          <WeeklyOfferSkeleton isDarkMode={isDarkMode} />
        ) : (() => {
          try {
            const dealProduct = weeklyOffersList[weeklyOfferIndex % weeklyOffersList.length] || weeklyOffersList[0];
            if (!dealProduct) return null;

            const dealTitle = siteSettings?.weekly_offers?.title || t.weeklyOffer || 'Həftənin təklifləri';

            return (
              <div
                className={`hidden lg:flex lg:w-[250px] flex-shrink-0 rounded-2xl border overflow-hidden flex-col justify-between p-3.5 lg:h-[480px] lg:min-h-[480px] lg:max-h-[480px] transition-all shadow-md group relative ${
                  isDarkMode
                    ? 'bg-slate-900 border-slate-800'
                    : 'bg-white border-slate-200/90 shadow-slate-200/50'
                }`}
              >
                {/* 1. Top Section: Title, Pagination Controls & 3-Column Timer */}
                <div>
                  <div className="flex items-center justify-between mb-1.5 px-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <Flame className="w-4 h-4 text-rose-500 flex-shrink-0 animate-pulse" />
                      <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tracking-tight truncate">
                        {dealTitle}
                      </h3>
                    </div>

                    {weeklyOffersList.length > 1 && (
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 mr-0.5">
                          {(weeklyOfferIndex % weeklyOffersList.length) + 1}/{weeklyOffersList.length}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWeeklyOfferIndex(prev => (prev === 0 ? weeklyOffersList.length - 1 : prev - 1));
                          }}
                          className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          aria-label="Əvvəlki təklif"
                        >
                          <ChevronLeft className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setWeeklyOfferIndex(prev => (prev + 1) % weeklyOffersList.length);
                          }}
                          className="w-5 h-5 rounded-md bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 flex items-center justify-center text-slate-600 dark:text-slate-300 transition cursor-pointer"
                          aria-label="Növbəti təklif"
                        >
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Timer (01 gün | 02 saat | 21 dəqiqə) */}
                  <div className="flex items-center justify-center max-w-[210px] mx-auto text-center pb-2">
                    <div className="flex-1 px-1">
                      <span className="block text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {String(timeLeft.days).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">gün</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 px-1">
                      <span className="block text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {String(timeLeft.hours).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">saat</span>
                    </div>
                    <div className="h-4 w-px bg-slate-200 dark:bg-slate-700" />
                    <div className="flex-1 px-1">
                      <span className="block text-xs sm:text-sm font-black text-emerald-600 dark:text-emerald-400">
                        {String(timeLeft.mins).padStart(2, '0')}
                      </span>
                      <span className="text-[9px] font-semibold text-slate-500 dark:text-slate-400">dəqiqə</span>
                    </div>
                  </div>

                  {/* Divider Line */}
                  <div className="border-t border-slate-100 dark:border-slate-800 -mx-3.5 mb-2" />

                  {/* Product Title */}
                  <Link
                    href={`/product/${toSlug(dealProduct.model_name || dealProduct.id)}`}
                    className="font-bold text-xs line-clamp-2 text-center text-slate-900 dark:text-white hover:text-[#4f533b] dark:hover:text-[#a3a886] transition-colors block leading-snug px-0.5"
                  >
                    {dealProduct.model_name}
                  </Link>

                  {/* Prices & Taksit Info */}
                  <div className="text-center mt-1 space-y-0.5">
                    <div className="flex items-center justify-center gap-1.5">
                      <span className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400">
                        {dealProduct.cash_price}
                      </span>
                      {dealProduct.old_price && (
                        <span className="line-through text-[11px] text-slate-400 font-semibold">
                          {dealProduct.old_price}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500">
                      {dealProduct.credit_tag || '0% 6 ay'}
                    </div>
                  </div>
                </div>

                {/* 2. Middle Section: Product Image */}
                <Link
                  href={`/product/${toSlug(dealProduct.model_name || dealProduct.id)}`}
                  className="relative w-full flex-1 flex items-center justify-center py-1 group/img block cursor-pointer min-h-0 my-auto"
                >
                  {dealProduct.image ? (
                    <img
                      src={dealProduct.image}
                      alt={dealProduct.model_name}
                      className="max-h-[135px] w-auto max-w-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover/img:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <div className="text-slate-400 text-xs">Şəkil yoxdur</div>
                  )}
                </Link>

                {/* Dot indicators if multiple items */}
                {weeklyOffersList.length > 1 && (
                  <div className="flex items-center justify-center gap-1.5 py-1">
                    {weeklyOffersList.map((_, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setWeeklyOfferIndex(idx);
                        }}
                        className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                          idx === (weeklyOfferIndex % weeklyOffersList.length)
                            ? 'w-4 bg-rose-500'
                            : 'w-1.5 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300'
                        }`}
                        aria-label={`Təklif ${idx + 1}`}
                      />
                    ))}
                  </div>
                )}

                {/* 3. Bottom Section: Səbətə at Button + Bütün təklifləri gör */}
                <div className="space-y-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => toggleCart(dealProduct)}
                    className={`w-full py-2 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-md active:scale-95 cursor-pointer ${
                      cart.some(c => c.id === dealProduct.id)
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                        : 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-600/20'
                    }`}
                  >
                    <ShoppingCart className="w-3.5 h-3.5" />
                    <span>{cart.some(c => c.id === dealProduct.id) ? 'Səbətdə ✓' : 'Səbətə at'}</span>
                  </button>

                  <Link
                    href="/weekly-offers"
                    className="block text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#4f533b] dark:hover:text-[#a3a886] transition-colors"
                  >
                    Bütün təklifləri gör
                  </Link>
                </div>
              </div>
            );
          } catch (e) {
            return null;
          }
        })()}




      </div>

      {/* ═══ 4. BANNER ALTI ÜSTÜNLÜK BADGELƏRİ (4 ƏDƏD 3D BADGE) ═══ */}
      <FeatureBadges isDarkMode={isDarkMode} />

      {/* ═══ PURE INFINITE BRAND LOGOS MARQUEE (TOP SECTION BELOW BANNERS) ═══ */}
      {(() => {
        const rawBrands = liveBrandsList.length > 0
          ? liveBrandsList
          : Array.from(new Set(liveProductsList.map((p: any) => p.brand).filter(Boolean))).map(b => ({ id: b, name: b, logo_url: '' }));

        const uniqueBrands = Array.from(
          new Map(rawBrands.filter((b: any) => b?.name).map((b: any) => [b.name.toLowerCase().trim(), b])).values()
        );

        if (uniqueBrands.length === 0) return null;

        // Ensure sufficient elements for wide screen marquee
        const baseSet = uniqueBrands.length < 8
          ? [...uniqueBrands, ...uniqueBrands, ...uniqueBrands, ...uniqueBrands]
          : uniqueBrands;

        // Exact 2 identical sets for 100% seamless -50% translateX loop
        const loopItems = [...baseSet, ...baseSet];

        return (
          <div className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 py-2 my-2 overflow-hidden select-none">
            <div className="relative w-full overflow-hidden flex items-center py-2 [mask-image:linear-gradient(to_right,transparent,black_4%,black_96%,transparent)]">
              <div className="flex gap-8 sm:gap-14 animate-marquee items-center whitespace-nowrap">
                {loopItems.map((br: any, idx: number) => {
                  const brandLogo = br.logo_url || br.logo;

                  return (
                    <button
                      key={`${br.id || br.name}-${idx}`}
                      type="button"
                      onClick={() => {
                        setSelectedBrand(br.name);
                        const el = document.getElementById('products-grid-section');
                        el?.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="flex-shrink-0 cursor-pointer group px-3 py-1 focus:outline-none transition-transform duration-200 hover:scale-105 active:scale-95 flex items-center justify-center"
                      title={`${br.name} məhsullarına bax`}
                    >
                      {brandLogo ? (
                        <img
                          src={brandLogo}
                          alt={br.name}
                          className="h-8 sm:h-9 max-w-[130px] object-contain transition-all duration-300 drop-shadow-2xs dark:brightness-120 filter grayscale group-hover:grayscale-0 opacity-80 group-hover:opacity-100"
                        />
                      ) : (
                        <span className="text-sm sm:text-base font-bold text-slate-400 group-hover:text-[#4f533b] dark:text-slate-500 dark:group-hover:text-amber-300 transition-colors px-2 py-1">
                          {br.name}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══ 5. TOP KATEQORİYALAR (Button-like Interactive Cards) ═══ */}
      <div className="hidden md:block w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 my-6">
        <div className="mb-4">
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Top kateqoriyalar
          </h2>
        </div>

        <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-3.5 py-2 max-lg:flex max-lg:overflow-x-auto max-lg:scrollbar-hide">
          {dynamicCategories
            .filter(c => c.is_top !== false)
            .slice(0, 8)
            .map((cat, idx) => {
              const isActive = activeLeaderTab === cat.name;
              return (
                <button
                  key={cat.id || idx}
                  onClick={() => handleSelectCategoryFromModal(cat.name)}
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-start gap-2.5 cursor-pointer group hover:-translate-y-1 w-full min-h-[120px] max-lg:min-w-[135px] max-lg:flex-shrink-0 ${
                    isActive
                      ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-lg shadow-[#4f533b]/25'
                      : isDarkMode
                      ? 'bg-slate-900 border-slate-800 text-slate-200 hover:border-[#4f533b]/50 hover:bg-slate-800'
                      : 'bg-white border-slate-200/80 text-slate-700 hover:border-[#4f533b]/50 hover:bg-emerald-50/50 shadow-2xs'
                  }`}
                >
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : 'bg-[#f4f5f0] text-[#4f533b] dark:bg-slate-800 dark:text-[#a3a886]'
                  }`}>
                    {renderStorefrontCategoryIcon(cat.icon, cat.icon_url, "w-5 h-5")}
                  </div>
                  <span className="text-xs sm:text-[13px] font-semibold tracking-normal text-center leading-snug break-words w-full line-clamp-2 h-[34px] flex items-center justify-center">
                    {cat.name}
                  </span>
                </button>
              );
            })}
        </div>
      </div>

      {/* ═══ 6. SATIŞ LİDERLƏRİ VƏ AXTARIŞ NƏTİCƏLƏRİ ═══ */}
      <div id="products-grid-section" className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 my-6 scroll-mt-24">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3 font-semibold">
          <Link href="/" className="hover:text-[#4f533b] transition">Ana səhifə</Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-[#4f533b] font-bold">
            {searchQuery ? `Axtarış: "${searchQuery}"` : activeLeaderTab}
          </span>
        </div>

        {/* Section Header (No product count badge) */}
        {(() => {
          let ALL_PRODUCTS = liveProductsList.length > 0 ? liveProductsList : getLiveProducts();

          // Dynamic Homepage Featured Products ordering (latest, selected, mixed)
          const featuredMode = siteSettings?.featured_mode || 'latest';
          const featuredIds: string[] = siteSettings?.featured_product_ids || [];

          if (!searchQuery.trim() && activeLeaderTab === 'Bütün məhsullar' && selectedBrand === 'ALL') {
            if (featuredMode === 'selected' && featuredIds.length > 0) {
              const selectedProds = featuredIds
                .map(id => ALL_PRODUCTS.find(p => p.id === id))
                .filter(Boolean) as Product[];
              if (selectedProds.length > 0) {
                ALL_PRODUCTS = selectedProds;
              }
            } else if (featuredMode === 'mixed' && featuredIds.length > 0) {
              const selectedProds = featuredIds
                .map(id => ALL_PRODUCTS.find(p => p.id === id))
                .filter(Boolean) as Product[];
              const remainingProds = ALL_PRODUCTS.filter(p => !featuredIds.includes(p.id));
              
              const mixed: Product[] = [];
              let sIdx = 0;
              let rIdx = 0;
              while (sIdx < selectedProds.length || rIdx < remainingProds.length) {
                if (sIdx < selectedProds.length) mixed.push(selectedProds[sIdx++]);
                if (rIdx < remainingProds.length) mixed.push(remainingProds[rIdx++]);
                if (rIdx < remainingProds.length) mixed.push(remainingProds[rIdx++]);
              }
              ALL_PRODUCTS = mixed;
            }
          }

          const filteredList = ALL_PRODUCTS.filter((prod: any) => {


            if (searchQuery.trim()) {
              const q = searchQuery.toLowerCase().trim();
              const matchesName = String(prod?.model_name || '').toLowerCase().includes(q);
              const matchesBrand = String(prod?.brand || '').toLowerCase().includes(q);
              const matchesCat = String(prod?.category || '').toLowerCase().includes(q);
              const matchesDesc = String(prod?.description || '').toLowerCase().includes(q);
              if (!matchesName && !matchesBrand && !matchesCat && !matchesDesc) return false;
            }

            if (selectedBrand && selectedBrand !== 'ALL') {
              if (String(prod?.brand || '').toLowerCase() !== String(selectedBrand || '').toLowerCase()) return false;
            }

            if (!searchQuery.trim() && activeLeaderTab && activeLeaderTab !== 'HAMISI' && activeLeaderTab !== 'Bütün məhsullar') {
              const tab = String(activeLeaderTab || '').toLowerCase().trim();
              const cat = String(prod?.category || '').toLowerCase().trim();
              const model = String(prod?.model_name || '').toLowerCase().trim();
              if (cat !== tab && !cat.includes(tab) && !tab.includes(cat) && !model.includes(tab)) {
                return false;
              }
            }

            return true;
          });

          return (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {searchQuery ? `Axtarış Nəticələri` : (activeLeaderTab === 'Bütün məhsullar' ? 'TOP Məhsullar' : activeLeaderTab)}
                </h2>
              </div>

              {/* Active Filter Badges Bar */}
              {(searchQuery || selectedBrand !== 'ALL') && (
                <div className="mb-5 flex flex-wrap items-center gap-2 bg-slate-100/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 p-3 rounded-2xl">
                  <span className="text-xs font-bold text-slate-500">Seçilmiş filtrlər:</span>
                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 text-xs font-black bg-white dark:bg-slate-800 text-[#4f533b] px-3 py-1 rounded-xl border border-emerald-500/30 shadow-2xs">
                      Axtarış: "{searchQuery}"
                      <button onClick={() => setSearchQuery('')} className="hover:text-rose-500 ml-1 cursor-pointer">✕</button>
                    </span>
                  )}
                  {selectedBrand !== 'ALL' && (
                    <span className="inline-flex items-center gap-1 text-xs font-black bg-white dark:bg-slate-800 text-[#4f533b] px-3 py-1 rounded-xl border border-emerald-500/30 shadow-2xs">
                      Brend: {selectedBrand}
                      <button onClick={() => setSelectedBrand('ALL')} className="hover:text-rose-500 ml-1 cursor-pointer">✕</button>
                    </span>
                  )}
                  <button
                    onClick={resetAllFilters}
                    className="text-xs font-black text-rose-600 dark:text-rose-400 hover:underline ml-auto cursor-pointer"
                  >
                    Bütün filtrləri sıfırla ↺
                  </button>
                </div>
              )}

              {/* Category Tab Pills Scrollable (Smooth Animated) */}
              {!searchQuery && (
                <DraggableSlider className="pb-2.5 mb-2.5">
                  {['Bütün məhsullar', ...dynamicCategories.map((c: any) => c.name)].map((tab) => {
                    const isActive = activeLeaderTab === tab;
                    return (
                      <button
                        key={tab}
                        onClick={() => setActiveLeaderTab(tab)}
                        className={`px-4 sm:px-5 py-2.5 rounded-full text-xs sm:text-sm font-black whitespace-nowrap transition-all duration-300 cursor-pointer flex-shrink-0 active:scale-95 ${
                          isActive
                            ? 'bg-[#4f533b] text-white shadow-md shadow-[#4f533b]/25 scale-102 ring-2 ring-[#4f533b]/20'
                            : isDarkMode
                            ? 'bg-slate-900 text-slate-200 border border-slate-800 hover:bg-slate-800 hover:text-[#4f533b] hover:border-[#4f533b]/40'
                            : 'bg-white text-slate-800 border border-slate-200 hover:bg-[#f4f5f0] hover:text-[#4f533b] hover:border-[#4f533b]/40'
                        }`}
                      >
                        {tab}
                      </button>
                    );
                  })}
                </DraggableSlider>
              )}

              {/* Brand Filter Pills Bar (Dynamically rendered from ERP with Logos) */}
              {(() => {
                const erpBrands = Array.from(new Set(liveProductsList.map((p: any) => p.brand).filter(Boolean)));
                const availableBrands = ['ALL', ...erpBrands];
                return (
                  <DraggableSlider className="pb-3 mb-4">
                    <span className="text-xs sm:text-sm font-black text-slate-400 dark:text-slate-400 whitespace-nowrap mr-1 flex-shrink-0">Brend:</span>
                    {availableBrands.map((b) => (
                      <button
                        key={b}
                        onClick={() => setSelectedBrand(b)}
                        className={`px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-black transition cursor-pointer whitespace-nowrap border flex-shrink-0 flex items-center justify-center ${
                          String(selectedBrand || '').toLowerCase() === String(b || '').toLowerCase()
                            ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-xs'
                            : isDarkMode
                            ? 'bg-slate-900 text-slate-200 border-slate-800 hover:bg-slate-800 hover:text-[#4f533b]'
                            : 'bg-white text-slate-800 border-slate-200 hover:bg-[#f4f5f0] hover:text-[#4f533b]'
                        }`}
                      >
                        <span>{b === 'ALL' ? 'Bütün brendlər' : b}</span>
                      </button>
                    ))}
                  </DraggableSlider>
                );
              })()}

              {/* Product Grid / Empty State Container */}
              {isDataLoading ? (
                <ProductGridSkeleton isDarkMode={isDarkMode} />
              ) : filteredList.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3.5 sm:gap-4 items-stretch">
                  {filteredList.map((prod: any) => (

                    <ProductCard
                      key={prod.id}
                      product={prod}
                      onToggleFavorite={toggleFavorite}
                      onToggleCart={toggleCart}
                      onToggleCompare={toggleCompare}
                      onSelectProduct={(p) => router.push(`/product/${toSlug(p.model_name)}`)}
                      onCreditClick={(p) => { setCreditModalProduct(p); setCreditSubmitted(false); }}
                      isFav={favorites.includes(prod.id)}
                      isInCart={!!cart.find(c => c.id === prod.id)}
                      isCompared={comparedProducts.includes(prod.id)}
                      isDarkMode={isDarkMode}
                    />
                  ))}
                </div>
              ) : (
                /* EMPTY STATE (Kontakt.az Reference Style) */
                <div className="py-16 px-6 text-center rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-800 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md my-4 shadow-sm">
                  <div className="w-20 h-20 rounded-3xl bg-[#f4f5f0] dark:bg-stone-900 text-[#4f533b] flex items-center justify-center mx-auto mb-4 border border-[#4f533b]/20 shadow-inner">
                    <SearchX className="w-10 h-10" />
                  </div>
                  <h3 className="font-black text-xl sm:text-2xl text-slate-900 dark:text-white mb-2 tracking-tight">
                    {liveProductsList.length === 0 ? "Mağaza Hazır Vəziyyətdədir" : "Axtarışa uyğun nəticə tapılmadı!"}
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6 font-medium leading-relaxed">
                    {liveProductsList.length === 0
                      ? "Verilənlər bazası təmizləndi və sistem canlı istifadəyə hazırdır. ERP paneli (və ya Central API) vasitəsilə əlavə olunan bütün real məhsullar burada avtomatik gösteriləcək."
                      : `Daxil etdiyiniz "${searchQuery || activeLeaderTab}" sorğusuna uyğun məhsul tapılmadı.`}
                  </p>
                  <button
                    onClick={resetAllFilters}
                    className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-[#4f533b]/25 transition cursor-pointer inline-flex items-center gap-2 active:scale-95"
                  >
                    <RotateCcw className="w-4 h-4" /> Filtrləri təmizlə və bütün məhsullara bax
                  </button>
                </div>
              )}
            </>
          );
        })()}
      </div>

      {/* ═══ 7. MÖHTƏŞƏM FÜRSƏTLƏR (Horizontal Draggable Slider) ═══ */}
      <div className="w-full max-w-[1560px] mx-auto px-3 sm:px-5 lg:px-6 my-6">
        <SectionHeader title="Möhtəşəm fürsətlər" />
        <DraggableSlider className="gap-4 sm:gap-6 pt-3 pb-8 px-4 sm:px-2 -mx-3 sm:-mx-2 snap-x snap-mandatory">
          {liveProductsList.map((prod: any) => (
            <div key={prod.id} className="w-[85vw] max-w-[340px] sm:w-[500px] sm:max-w-[500px] flex-shrink-0 snap-center h-full">
              <HorizontalProductCard
                product={prod}
                onToggleFavorite={toggleFavorite}
                onToggleCart={toggleCart}
                onToggleCompare={toggleCompare}
                onSelectProduct={(p) => router.push(`/product/${toSlug(p.model_name)}`)}
                onCreditClick={(p) => { setCreditModalProduct(p); setCreditSubmitted(false); }}
                isFav={favorites.includes(prod.id)}
                isInCart={!!cart.find(c => c.id === prod.id)}
                isCompared={comparedProducts.includes(prod.id)}
                isDarkMode={isDarkMode}
              />
            </div>
          ))}
        </DraggableSlider>
      </div>

      {/* ═══ 8. YOUTUBE KANALIMIZ & TEXNO İCMALLAR ═══ */}
      <YouTubeReviewsSection isDarkMode={isDarkMode} />

      {/* ═══ 9. XƏBƏRLƏR VƏ BLOQ (4 XƏBƏR VƏ EMAIL BÜLLETEN) ═══ */}
      <NewsSection isDarkMode={isDarkMode} />
      </>


      {/* ═══ CREDIT MODAL ═══ */}
      {creditModalProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" onClick={() => setCreditModalProduct(null)}>
          <div className={`rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#4f533b] to-[#3e4230] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">Onlayn Kredit Müraciəti</h3>
                <p className="text-white/80 text-xs mt-0.5">{creditModalProduct.model_name}</p>
              </div>
              <button onClick={() => setCreditModalProduct(null)} className="text-white/60 hover:text-white transition cursor-pointer">
                <X className="w-6 h-6" />
              </button>
            </div>

            {!creditSubmitted ? (
              <form onSubmit={handleCreditSubmit} className="p-6 space-y-4">
                <div className={`rounded-xl p-4 flex items-center justify-between border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#f4f5f0] border-[#4f533b]/20'}`}>
                  <div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Məhsul qiyməti</p>
                    <p className="font-black text-xl text-[#4f533b]">{creditModalProduct.cash_price}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-500 dark:text-slate-400">Aylıq ödəniş</p>
                    <p className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{creditModalProduct.monthly}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Ad Soyad</label>
                    <input
                      required
                      value={creditForm.name}
                      onChange={e => setCreditForm({ ...creditForm, name: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4f533b] transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      placeholder="Ad Soyad"
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>FİN kod</label>
                    <input
                      required
                      value={creditForm.pin}
                      onChange={e => setCreditForm({ ...creditForm, pin: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4f533b] transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      placeholder="7 simvol"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Telefon</label>
                    <input
                      required
                      value={creditForm.phone}
                      onChange={e => setCreditForm({ ...creditForm, phone: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4f533b] transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Aylıq gəlir (₼)</label>
                    <input
                      required
                      type="number"
                      value={creditForm.income}
                      onChange={e => setCreditForm({ ...creditForm, income: e.target.value })}
                      className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4f533b] transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
                      placeholder="1000"
                    />
                  </div>
                </div>

                <div>
                  <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Kredit müddəti</label>
                  <div className="flex gap-2">
                    {['3', '6', '9', '12', '18', '24'].map(m => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setCreditForm({ ...creditForm, months: m })}
                        className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                          creditForm.months === m
                            ? 'bg-[#4f533b] text-white shadow'
                            : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {m} ay
                      </button>
                    ))}
                  </div>
                </div>

                <button type="submit" className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3 rounded-xl shadow-lg shadow-[#4f533b]/30 transition text-sm cursor-pointer">
                  Müraciət göndər →
                </button>
              </form>
            ) : (
              <div className="p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-stone-900/80 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-10 h-10 text-[#4f533b]" />
                </div>
                <h3 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Müraciət qəbul edildi!</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">AI kredit sistemi müraciətinizi dəyərləndirir. 30 saniyə içində nəticə SMS ilə göndəriləcək.</p>
                <button
                  onClick={() => setCreditModalProduct(null)}
                  className="mt-6 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold px-8 py-2.5 rounded-xl transition text-sm cursor-pointer"
                >
                  Bağla
                </button>
              </div>
            )}
          </div>
        </div>
      )}


      {/* ═══ FLOATING COMPARE DRAWER BAR ═══ */}
      {comparedProducts.length > 0 && (
        <div className="fixed bottom-6 left-6 z-40">
          <div className={`p-3 rounded-2xl border shadow-2xl backdrop-blur-md flex items-center gap-3 ${
            isDarkMode ? 'bg-slate-900/95 border-slate-700 text-white' : 'bg-white/95 border-slate-200 text-slate-900 shadow-xl'
          }`}>
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-[#f4f5f0] dark:bg-stone-900/80 text-[#4f533b] flex items-center justify-center flex-shrink-0 font-bold border border-[#4f533b]/20">
                <Scale className="w-5 h-5" />
              </div>
              <div>
                <span className="font-extrabold text-xs block leading-tight">Müqayisə siyahısı</span>
                <span className="text-[10px] text-slate-400 font-semibold">{comparedProducts.length} məhsul seçilib</span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-800">
              <button
                onClick={() => router.push('/compare')}
                className="bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold text-xs px-3.5 py-2 rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer active:scale-95 whitespace-nowrap"
              >
                Müqayisə et ({comparedProducts.length}) →
              </button>
              <button
                onClick={() => { setComparedProducts([]); localStorage.removeItem('technomania_compare'); }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition cursor-pointer"
                title="Təmizlə"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}






      {/* ═══ FOOTER ═══ */}
      <Footer isDarkMode={isDarkMode} />

      {/* ═══ KAMPANİYALAR MODAL ═══ */}
      {isCampaignsModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-md transition-opacity"
            onClick={() => setIsCampaignsModalOpen(false)}
          />

          {/* Modal Card */}
          <div className={`relative w-full max-w-4xl rounded-3xl shadow-2xl overflow-hidden z-10 transition-all border my-8 ${
            isDarkMode ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#4f533b] to-[#3e4230] px-6 py-5 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg sm:text-xl tracking-tight leading-none">Aktual Kampaniyalar</h3>
                  <p className="text-white/80 text-xs mt-1">Ən son endirim və taksit fürsətlərindən yararlanın</p>
                </div>
              </div>
              <button
                onClick={() => setIsCampaignsModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white cursor-pointer hover:bg-white/25 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Campaign Selection Tabs */}
            <div className={`p-4 border-b flex gap-2 overflow-x-auto scrollbar-hide ${isDarkMode ? 'bg-slate-950/50 border-slate-800' : 'bg-slate-50 border-slate-100'}`}>
              {CAMPAIGNS_DATA.map((camp) => (
                <button
                  key={camp.id}
                  onClick={() => setSelectedCampaignId(camp.id)}
                  className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-black whitespace-nowrap transition cursor-pointer border ${
                    selectedCampaignId === camp.id
                      ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-md shadow-[#4f533b]/20'
                      : isDarkMode
                      ? 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50'
                  }`}
                >
                  {camp.title}
                </button>
              ))}
            </div>

            {/* Active Campaign Detail View */}
            {(() => {
              const currentCamp = CAMPAIGNS_DATA.find(c => c.id === selectedCampaignId) || CAMPAIGNS_DATA[0];
              return (
                <div className="p-6 sm:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
                  {/* 1. Campaign Image */}
                  <div className="relative rounded-2xl overflow-hidden shadow-xl border border-slate-200/50 dark:border-slate-800 group">
                    <img
                      src={currentCamp.image || undefined}
                      alt={currentCamp.title}
                      className="w-full h-56 sm:h-72 object-cover transform group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
                    <span className="absolute top-4 left-4 bg-amber-400 text-slate-950 text-xs font-bold px-3.5 py-1.5 rounded-xl shadow-md">
                      {currentCamp.badge}
                    </span>
                    <h2 className="absolute bottom-4 left-4 right-4 text-xl sm:text-3xl font-black text-white leading-tight">
                      {currentCamp.title}
                    </h2>
                  </div>

                  {/* 2. Countdown Timer Directly Under Image */}
                  <div className={`p-4 sm:p-5 rounded-2xl border text-center ${
                    isDarkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-emerald-50/80 border-[#4f533b]/20'
                  }`}>
                    <p className={`text-xs font-bold mb-3 ${isDarkMode ? 'text-[#a3a886]' : 'text-[#4f533b]'}`}>
                      ⏳ Kampaniyanın bitməsinə qalan vaxt:
                    </p>
                    <div className="flex items-center justify-center gap-3 sm:gap-6">
                      <div className="flex flex-col items-center">
                        <span className="bg-[#4f533b] text-white font-black text-xl sm:text-3xl px-3 sm:px-4 py-2 rounded-xl shadow-md min-w-[52px] sm:min-w-[64px]">
                          {String(timeLeft.days).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1">gün</span>
                      </div>
                      <span className="font-black text-2xl text-[#4f533b] -mt-4">:</span>
                      <div className="flex flex-col items-center">
                        <span className="bg-[#4f533b] text-white font-black text-xl sm:text-3xl px-3 sm:px-4 py-2 rounded-xl shadow-md min-w-[52px] sm:min-w-[64px]">
                          {String(timeLeft.hours).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1">saat</span>
                      </div>
                      <span className="font-black text-2xl text-[#4f533b] -mt-4">:</span>
                      <div className="flex flex-col items-center">
                        <span className="bg-[#4f533b] text-white font-black text-xl sm:text-3xl px-3 sm:px-4 py-2 rounded-xl shadow-md min-w-[52px] sm:min-w-[64px]">
                          {String(timeLeft.mins).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1">dəqiqə</span>
                      </div>
                      <span className="font-black text-2xl text-[#4f533b] -mt-4">:</span>
                      <div className="flex flex-col items-center">
                        <span className="bg-amber-400 text-slate-950 font-black text-xl sm:text-3xl px-3 sm:px-4 py-2 rounded-xl shadow-md min-w-[52px] sm:min-w-[64px] animate-pulse">
                          {String(timeLeft.secs).padStart(2, '0')}
                        </span>
                        <span className="text-[10px] sm:text-xs font-bold text-slate-400 mt-1">saniyə</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. Detailed Campaign Information Text */}
                  <div className="space-y-4">
                    <h4 className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      Kampaniya haqqında ümumi məlumat
                    </h4>
                    <p className={`text-sm sm:text-base leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {currentCamp.desc}
                    </p>

                    {/* Conditions checklist */}
                    <div className="space-y-2 pt-2">
                      <h5 className="text-xs font-bold text-[#4f533b]">Kampaniya şərtləri və üstünlüklər:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {currentCamp.conditions.map((cond, idx) => (
                          <div key={idx} className={`flex items-center gap-2 p-3 rounded-xl border ${
                            isDarkMode ? 'bg-slate-800/50 border-slate-700 text-slate-200' : 'bg-slate-50 border-slate-200 text-slate-800'
                          }`}>
                            <CheckCircle className="w-5 h-5 text-[#4f533b] flex-shrink-0" />
                            <span className="text-xs sm:text-sm font-bold">{cond}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Button */}
                    <div className="pt-4 flex items-center justify-end gap-3">
                      <button
                        onClick={() => {
                          setIsCampaignsModalOpen(false);
                          const el = document.getElementById('products-grid-section');
                          el?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="w-full sm:w-auto bg-[#4f533b] hover:bg-[#3e4230] text-white font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-[#4f533b]/30 transition text-sm cursor-pointer active:scale-95 flex items-center justify-center gap-2"
                      >
                        Kampaniyadan İndi Yararlan →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
