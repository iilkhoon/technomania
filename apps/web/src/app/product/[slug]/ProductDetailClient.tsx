'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ShoppingCartIcon as ShoppingCart,
  HeartIcon as Heart,
  PhoneIcon as PhoneCall,
  SparklesIcon as Sparkles,
  CpuChipIcon as Bot,
  ChevronRightIcon as ChevronRight,
  ChevronLeftIcon as ChevronLeft,
  ChevronUpIcon as ChevronUp,
  ChevronDownIcon as ChevronDown,
  ArrowsPointingOutIcon as Expand,
  MagnifyingGlassPlusIcon as ZoomIn,
  XMarkIcon as X,
  CreditCardIcon as CreditCard,
  CheckCircleIcon as CheckCircle,
  Bars3Icon as Menu,
  PaperAirplaneIcon as Send,
  MagnifyingGlassIcon as Search,
  DevicePhoneMobileIcon as Smartphone,
  ComputerDesktopIcon as Laptop,
  TvIcon as Tv,
  HomeIcon,
  ArrowRightIcon as ArrowRight,
  FireIcon as Flame,
  StarIcon as Star,
  ArrowsRightLeftIcon as Scale,
  VideoCameraIcon as Video,
  MapPinIcon as MapPin,
  EnvelopeIcon as Mail,
  PhoneIcon as Phone,
  BoltIcon as Zap,
  GlobeAltIcon as Globe,
  ShareIcon as Share2,
  ArrowTrendingUpIcon as TrendingUp,
  CubeIcon as Package,
  TagIcon as BadgePercent,
  SunIcon as Sun,
  MoonIcon as Moon,
  ShieldCheckIcon as ShieldCheck,
  TruckIcon as Truck,
  ExclamationTriangleIcon as AlertTriangle,
  QuestionMarkCircleIcon as HelpCircle,
  ChatBubbleLeftRightIcon as MessageCircle,
} from '@heroicons/react/24/outline';
import {
  StarIcon as StarSolid,
  PlayIcon,
  PauseIcon,
  SpeakerWaveIcon as SpeakerWave,
  SpeakerXMarkIcon as SpeakerXMark,
} from '@heroicons/react/24/solid';
import { validateCoupon } from '../../utils/couponManager';

const Gamepad2 = Sparkles;
const Coffee = Sparkles;
const Watch = Sparkles;
const Utensils = Sparkles;
const Scissors = Sparkles;
const Armchair = HomeIcon;
const Bike = Sparkles;
const Shirt = Sparkles;
const Grid = Sparkles;
const Layers = Sparkles;
import { Button } from '@heroui/react';
import {
  Product,
  getQuickSpecs,
  toSlug,
  getLiveProducts,
  fetchLiveProducts,
  getProductBySlug,
  getSimilarProducts,
} from '../../data/products';
import { translations, Language } from '../../data/translations';
import {
  calculateProductRatingStats,
  getProductAnsweredQuestions,
  ProductReview,
  getLocalReviews,
  saveLocalReviews,
  ProductQuestion,
  getLocalQuestions,
  saveLocalQuestions,
} from '../../utils/reviewManager';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProductCard from '../../components/ProductCard';

const trackProductView = (id?: string, name?: string) => {};
const trackCategoryView = (cat?: string, catName?: string) => {};

// ── Category sidebar data ─────────────────────────
const SIDEBAR_CATEGORIES = [
  { name: 'Yay fürsətləri', icon: Sun, slug: 'summer' },
  { name: 'Gamer zone', icon: Gamepad2, slug: 'gaming' },
  { name: 'Qəhvə texnikası', icon: Coffee, slug: 'coffee' },
  { name: 'Smartfonlar və aksessuarlar', icon: Smartphone, slug: 'smartphones', active: true },
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

// ── Draggable Slider ──────────────────────────────
function DraggableSlider({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const sliderRef = useRef<HTMLDivElement>(null);
  const [isDown, setIsDown] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  return (
    <div
      ref={sliderRef}
      onMouseDown={e => { setIsDown(true); setStartX(e.pageX - (sliderRef.current?.offsetLeft ?? 0)); setScrollLeft(sliderRef.current?.scrollLeft ?? 0); }}
      onMouseLeave={() => setIsDown(false)}
      onMouseUp={() => setIsDown(false)}
      onMouseMove={e => {
        if (!isDown || !sliderRef.current) return;
        e.preventDefault();
        sliderRef.current.scrollLeft = scrollLeft - (e.pageX - (sliderRef.current.offsetLeft ?? 0) - startX) * 1.8;
      }}
      className={`flex overflow-x-auto gap-4 scrollbar-hide py-2 select-none ${isDown ? 'cursor-grabbing' : 'cursor-grab'} ${className}`}
    >
      {children}
    </div>
  );
}

// ── Mini Product Card (for similar / offers) ──────
function MiniProductCard({
  product,
  isDarkMode,
  onAddToCart,
  isInCart,
}: {
  product: Product;
  isDarkMode: boolean;
  onAddToCart: (p: Product) => void;
  isInCart: boolean;
}) {
  if (!product) return null;
  const slug = toSlug(product.model_name);
  const quickSpecs = getQuickSpecs(product);

  return (
    <div className="relative h-full min-w-[180px] sm:min-w-0 z-0 hover:z-20">
      <div
        className={`absolute top-0 left-0 right-0 z-10 group-hover:z-20 rounded-2xl border transition-all duration-300 ease-out hover:shadow-2xl hover:shadow-[#4f533b]/20 hover:border-[#4f533b] flex flex-col justify-between group ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200/80 text-slate-900'
        }`}
      >
        <Link href={`/product/${slug}`} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} className="block">
          <div className={`relative flex items-center justify-center h-36 rounded-t-2xl overflow-hidden ${isDarkMode ? 'bg-slate-800/50' : 'bg-white'}`}>
            {product.discount && (
              <span className="absolute top-2 left-2 bg-[#4f533b] text-white text-[10px] font-black px-2 py-0.5 rounded-full z-10">
                {product.discount}
              </span>
            )}
            <img
              src={product.image || undefined}
              alt={product.model_name}
              className="max-h-28 object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
            />
          </div>
          <div className="p-3 pb-0">
            <h4 className={`text-xs font-bold line-clamp-2 mb-1.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {product.model_name}
            </h4>
            <div className="flex items-baseline gap-1.5 mb-2">
              {product.old_price && (
                <span className="line-through text-[10px] text-slate-400">{product.old_price}</span>
              )}
              <span className="font-black text-sm text-[#4f533b]">{product.cash_price}</span>
            </div>
          </div>
        </Link>

        <div className="p-3 pt-0">
          <button
            onClick={e => { e.preventDefault(); onAddToCart(product); }}
            className={`w-full flex items-center justify-center gap-1 text-xs font-black py-2 rounded-xl transition cursor-pointer active:scale-95 ${
              isInCart
                ? 'bg-emerald-700 text-white'
                : 'bg-[#4f533b] hover:bg-[#3e4230] text-white shadow-md shadow-[#4f533b]/20'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            {isInCart ? 'Səbətdə ✓' : 'Səbətə at'}
          </button>

          {/* Integrated Hover Specs Drawer */}
          <div className="max-h-0 opacity-0 group-hover:max-h-[300px] group-hover:opacity-100 transition-all duration-300 ease-out overflow-hidden">
            <div className="pt-2.5 mt-2.5 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-between pb-1.5 mb-1.5">
                <span className="text-[9px] font-bold text-[#4f533b] flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#4f533b]" /> Xüsusiyyətlər
                </span>
                <span className="text-[8px] font-extrabold text-emerald-700 dark:text-stone-400 bg-emerald-50 dark:bg-emerald-950/80 px-1.5 py-0.5 rounded-full">
                  Stokda var
                </span>
              </div>

              <div className="space-y-1 text-[10px]">
                {quickSpecs.slice(0, 3).map((spec, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50/80 dark:bg-slate-800/60 px-2 py-1 rounded-lg border border-slate-100 dark:border-slate-700/60">
                    <span className="text-slate-500 dark:text-slate-400 font-semibold text-[9px]">{spec.label}:</span>
                    <span className="font-bold truncate max-w-[95px] text-slate-800 dark:text-slate-100">{spec.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Horizontal Offer Card ─────────────────────────
function HorizontalOfferCard({
  product,
  isDarkMode,
  onAddToCart,
  isInCart,
}: {
  product: Product;
  isDarkMode: boolean;
  onAddToCart: (p: Product) => void;
  isInCart: boolean;
}) {
  if (!product) return null;
  const slug = toSlug(product.model_name);
  return (
    <Link
      href={`/product/${slug}`}
      onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })}
      className={`rounded-3xl border transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 p-5 flex flex-col md:flex-row items-center gap-5 group min-w-[320px] sm:min-w-[460px] ${
        isDarkMode
          ? 'bg-slate-900 border-slate-800 hover:border-[#4f533b]/40 text-white'
          : 'bg-white border-slate-200 hover:border-[#4f533b]/40 text-slate-900'
      }`}
    >
      <div className={`w-full md:w-44 h-44 flex items-center justify-center rounded-2xl flex-shrink-0 border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-100'}`}>
        {product.discount && (
          <span className="sr-only">{product.discount}</span>
        )}
        <img src={product.image || undefined} alt={product.model_name} className="max-h-36 object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500" />
      </div>
      <div className="flex-1 w-full">
        {product.isOnlineOnly && (
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full mb-2 inline-block ${isDarkMode ? 'bg-emerald-950 text-stone-400' : 'bg-[#eaecdb] text-[#4f533b]'}`}>
            <Zap className="w-3 h-3 inline mr-0.5" />Yalnız onlayn
          </span>
        )}
        <h3 className={`font-semibold text-base leading-snug line-clamp-2 mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
          {product.model_name}
        </h3>
        <div className="flex items-baseline gap-2 mb-3">
          {product.old_price && <span className="line-through text-sm text-slate-400">{product.old_price}</span>}
          <span className="font-black text-xl text-[#4f533b]">{product.cash_price}</span>
          {product.discount && (
            <span className="bg-[#4f533b] text-white text-xs font-black px-2 py-0.5 rounded-full">{product.discount}</span>
          )}
        </div>
        <button
          onClick={e => { e.preventDefault(); onAddToCart(product); }}
          className={`flex items-center gap-1.5 text-sm font-black px-5 py-2.5 rounded-xl transition cursor-pointer ${
            isInCart ? 'bg-emerald-700 text-white' : 'bg-[#4f533b] hover:bg-[#3e4230] text-white shadow-md shadow-[#4f533b]/20'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {isInCart ? 'Səbətdə ✓' : 'Səbətə at'}
        </button>
      </div>
    </Link>
  );
}

// ══════════════════════════════════════════════════
//  MAIN CLIENT COMPONENT
// ══════════════════════════════════════════════════
export default function ProductDetailClient({
  product: initialProduct,
  similarProducts: initialSimilarProducts,
  greatOffers,
  slug,
}: {
  product: Product | null;
  similarProducts: Product[];
  greatOffers: Product[];
  slug?: string;
}) {
  const router = useRouter();
  const [product, setProduct] = useState<Product | null>(initialProduct || null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>(initialSimilarProducts || []);
  const [catalogList, setCatalogList] = useState<Product[]>([]);
  const [isResolving, setIsResolving] = useState(!initialProduct);

  useEffect(() => {
    fetchLiveProducts().then(list => {
      if (Array.isArray(list)) setCatalogList(list);
    }).catch(() => {});
  }, []);

  const [cart, setCart] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [comparedProducts, setComparedProducts] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentLang, setCurrentLang] = useState<Language>('AZ');
  const t = translations[currentLang] || translations.AZ;

  // Custom Video Player States
  const videoElementRef = useRef<HTMLVideoElement>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  const togglePlayVideo = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!videoElementRef.current) return;
    if (videoElementRef.current.paused) {
      videoElementRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoElementRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const toggleMuteVideo = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!videoElementRef.current) return;
    videoElementRef.current.muted = !videoElementRef.current.muted;
    setIsVideoMuted(videoElementRef.current.muted);
  };

  // One-Click Buy Modal States ("Bir kliklə al")
  const [isOneClickModalOpen, setIsOneClickModalOpen] = useState(false);
  const [oneClickPaymentType, setOneClickPaymentType] = useState<'cash' | 'installment'>('cash');
  const [oneClickMonths, setOneClickMonths] = useState<number>(12);
  const [oneClickPhone, setOneClickPhone] = useState<string>('');
  const [oneClickFullName, setOneClickFullName] = useState<string>('');
  const [oneClickIdCard, setOneClickIdCard] = useState<string>('');
  const [oneClickFin, setOneClickFin] = useState<string>('');
  const [oneClickPromoCode, setOneClickPromoCode] = useState<string>('');
  const [appliedPromoDiscount, setAppliedPromoDiscount] = useState<number>(0);
  const [appliedPromoCoupon, setAppliedPromoCoupon] = useState<any>(null);
  const [promoMessage, setPromoMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [isSubmittingOneClick, setIsSubmittingOneClick] = useState(false);
  const [oneClickSuccessOrder, setOneClickSuccessOrder] = useState<any>(null);
  const [oneClickError, setOneClickError] = useState<string | null>(null);

  const handlePhoneDigitsChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 9);
    setOneClickPhone(digits);
  };

  useEffect(() => {
    if (!product && typeof window !== 'undefined') {
      let targetSlug = slug || window.location.pathname.split('/').pop() || '';
      try {
        targetSlug = decodeURIComponent(targetSlug);
      } catch (e) {}
      const resolved = getProductBySlug(targetSlug);
      if (resolved) {
        setProduct(resolved);
        setSimilarProducts(getSimilarProducts(resolved, 6));
        setIsResolving(false);
      } else {
        fetchLiveProducts().then(liveList => {
          let decoded = targetSlug;
          try {
            decoded = decodeURIComponent(targetSlug);
          } catch (e) {}
          const found = (liveList || []).find(p => p && (toSlug(p.model_name) === decoded || String(p.id) === decoded || toSlug(p.id) === decoded));
          if (found) {
            setProduct(found);
            setSimilarProducts(getSimilarProducts(found, 6));
          }
          setIsResolving(false);
        }).catch(() => {
          setIsResolving(false);
        });
      }
    } else {
      setIsResolving(false);
    }
  }, [slug]);

  useEffect(() => {
    if (product) {
      trackProductView(product.id, product.model_name);
      if (product.category) {
        trackCategoryView(toSlug(product.category), product.category);
      }
    }
  }, [product]);

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
  const [searchQuery, setSearchQuery] = useState('');

  // Product page state
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number>(0);
  const [activeImage, setActiveImage] = useState<string | undefined>(product?.image || undefined);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxZoom, setLightboxZoom] = useState(false);
  const thumbnailScrollRef = useRef<HTMLDivElement>(null);
  const [selectedColor, setSelectedColor] = useState<string>('Cosmic Orange');
  const [selectedStorage, setSelectedStorage] = useState<string>('256 GB');
  const [selectedMonths, setSelectedMonths] = useState<number>(18);
  const [activeTab, setActiveTab] = useState<'details' | 'reviews' | 'qa' | 'bundled' | 'alternatives' | 'services'>('details');
  const [expressOrdered, setExpressOrdered] = useState(false);
  const [selectedService, setSelectedService] = useState('warranty_1y');
  const [bundleCart, setBundleCart] = useState<string[]>([]);
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  // Credit modal
  const [creditModalProduct, setCreditModalProduct] = useState<Product | null>(null);
  const [creditSubmitted, setCreditSubmitted] = useState(false);
  const [creditForm, setCreditForm] = useState({ name: '', pin: '', phone: '+994 ', income: '', months: '12' });

  // AI Chat
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<{ sender: string; text: string }[]>([
    { sender: 'ai', text: 'Salam! 👋 Mən TechnoMania-nın AI Satış Assistentiyəm. İstənilən texnoloji məhsul haqqında suallarınızı verə bilərsiniz!' },
  ]);
  const [userInput, setUserInput] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Scroll to top on mount and whenever product/slug changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    setSelectedMediaIdx(0);
    setIsLightboxOpen(false);
    setLightboxZoom(false);
    if (product?.image) {
      setActiveImage(product.image);
    }
  }, [product?.id, slug]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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
  }, []);

  // ── Product Reviews & Rating State ──────────────────────────────
  const [reviewsVersion, setReviewsVersion] = useState(0);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewUserName, setReviewUserName] = useState('');
  const [reviewUserEmail, setReviewUserEmail] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSuccessMsg, setReviewSuccessMsg] = useState('');
  const [loginRequiredMsg, setLoginRequiredMsg] = useState(false);

  useEffect(() => {
    const updateHandler = () => setReviewsVersion(v => v + 1);
    window.addEventListener('storage', updateHandler);
    window.addEventListener('techno_reviews_updated', updateHandler);
    return () => {
      window.removeEventListener('storage', updateHandler);
      window.removeEventListener('techno_reviews_updated', updateHandler);
    };
  }, []);

  // ── Product Q&A State ──────────────────────────────
  const [qaVersion, setQaVersion] = useState(0);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [qAuthorName, setQAuthorName] = useState('');
  const [qAuthorEmail, setQAuthorEmail] = useState('');
  const [qQuestionText, setQQuestionText] = useState('');
  const [qSuccessMsg, setQSuccessMsg] = useState('');

  useEffect(() => {
    const updateQaHandler = () => setQaVersion(v => v + 1);
    window.addEventListener('storage', updateQaHandler);
    window.addEventListener('techno_faqs_updated', updateQaHandler);
    return () => {
      window.removeEventListener('storage', updateQaHandler);
      window.removeEventListener('techno_faqs_updated', updateQaHandler);
    };
  }, []);

  const ratingStats = calculateProductRatingStats(product?.id || product?.model_name || '');
  const answeredQuestions = getProductAnsweredQuestions(product?.id || product?.model_name || '');
  const [shareToast, setShareToast] = useState(false);

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    const title = product?.model_name || (product as any)?.name || 'TechnoMania';
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title,
          text: `${title} - TechnoMania mağazasında`,
          url,
        });
        return;
      } catch (err) {
        // User canceled or fallback
      }
    }
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      } catch (e) {}
    }
  };

  const handleOpenReviewModal = () => {
    const loggedUser = typeof window !== 'undefined' ? localStorage.getItem('technomania_user') : null;
    if (!loggedUser) {
      setLoginRequiredMsg(true);
      setTimeout(() => setLoginRequiredMsg(false), 4500);
      return;
    }
    try {
      const u = JSON.parse(loggedUser);
      if (u.name) setReviewUserName(u.name);
      if (u.email) setReviewUserEmail(u.email);
    } catch (e) {}
    setIsReviewModalOpen(true);
  };

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewComment.trim() || !reviewUserName.trim()) return;

    const newRev: ProductReview = {
      id: 'rev-' + Date.now(),
      product_id: String(product.id),
      product_name: product.model_name || (product as any).name || 'Məhsul',
      user_name: reviewUserName.trim(),
      user_email: reviewUserEmail.trim() || 'user@mail.az',
      rating: Number(reviewRating) || 5,
      comment: reviewComment.trim(),
      status: 'pending',
      created_at: new Date().toISOString(),
    };

    const existing = getLocalReviews();
    saveLocalReviews([newRev, ...existing]);

    setReviewSuccessMsg('Rəyiniz uğurla göndərildi! Admin təsdiqlədikdən sonra məhsulun altında yayımlanacaq Və ulduz reytinqinə təsir göstərəcək.');
    setTimeout(() => {
      setIsReviewModalOpen(false);
      setReviewSuccessMsg('');
      setReviewComment('');
    }, 2500);
  };

  const handleOpenQuestionModal = () => {
    const loggedUser = typeof window !== 'undefined' ? localStorage.getItem('technomania_user') : null;
    if (!loggedUser) {
      setLoginRequiredMsg(true);
      setTimeout(() => setLoginRequiredMsg(false), 4500);
      return;
    }
    try {
      const u = JSON.parse(loggedUser);
      if (u.name) setQAuthorName(u.name);
      if (u.email) setQAuthorEmail(u.email);
    } catch (e) {}
    setIsQuestionModalOpen(true);
  };

  const handleSubmitQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !qQuestionText.trim() || !qAuthorName.trim()) return;

    const newQ: ProductQuestion = {
      id: 'faq-' + Date.now(),
      product_id: String(product.id),
      product_name: product.model_name || (product as any).name || 'Məhsul',
      author_name: qAuthorName.trim(),
      author_email: qAuthorEmail.trim() || 'user@mail.az',
      question: qQuestionText.trim(),
      created_at: new Date().toISOString(),
    };

    const existing = getLocalQuestions();
    saveLocalQuestions([newQ, ...existing]);

    setQSuccessMsg('Sualınız uğurla göndərildi! Menecer tərəfindən cavablandırıldıqdan sonra burada yayımlanacaq.');
    setTimeout(() => {
      setIsQuestionModalOpen(false);
      setQSuccessMsg('');
      setQQuestionText('');
    }, 2500);
  };

  const handleAiSend = () => {
    if (!userInput.trim()) return;
    const updated = [...chatMessages, { sender: 'user', text: userInput }];
    setChatMessages(updated);
    setUserInput('');
    setTimeout(() => {
      setChatMessages([...updated, { sender: 'ai', text: 'Sizin üçün ən uyğun modelləri seçirəm... 🔍\n\nBüdcənizə uyğun olaraq bu məhsulları tövsiyə edirəm!' }]);
    }, 800);
  };

  const toggleCart = (p: Product) => {
    const isAdding = !cart.find(c => c.id === p.id);
    setCart(prev => {
      const updated = prev.find(c => c.id === p.id) ? prev.filter(c => c.id !== p.id) : [...prev, p];
      localStorage.setItem('technomania_cart', JSON.stringify(updated));
      return updated;
    });

    if (typeof window !== 'undefined' && isAdding) {
      window.dispatchEvent(new CustomEvent('techno_toast', {
        detail: {
          type: 'cart',
          title: p.model_name,
          subtitle: `${p.cash_price} • Səbətə əlavə olundu!`,
          image: p.image,
        }
      }));
    }
  };

  const toggleFavorite = (id: string) => {
    const isAdding = !favorites.includes(id);
    setFavorites(prev => {
      const updated = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem('technomania_favorites', JSON.stringify(updated));
      return updated;
    });

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('techno_toast', {
        detail: {
          type: 'fav',
          title: product?.model_name || 'Məhsul',
          subtitle: isAdding ? 'Seçilmişlərə əlavə olundu! ❤️' : 'Seçilmişlərdən çıxarıldı',
          image: product?.image,
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

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('techno_toast', {
        detail: {
          type: 'compare',
          title: product?.model_name || 'Məhsul',
          subtitle: isAdding ? 'Müqayisə siyahısına əlavə olundu! ⚖️' : 'Müqayisədən çıxarıldı',
          image: product?.image,
        }
      }));
    }
  };

  const [availableServicesList, setAvailableServicesList] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/catalog/services')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setAvailableServicesList(data);
        }
      })
      .catch(() => {});
  }, []);

  // 1. Comprehensive Gallery Media Items (Main Image, Images Array, Additional Images, Color Images, Videos)
  const galleryItems = useMemo(() => {
    const list: Array<{ type: 'image' | 'video'; url: string; title?: string }> = [];
    const seenUrls = new Set<string>();

    const addImage = (url: any) => {
      if (typeof url === 'string' && url.trim().length > 5 && !seenUrls.has(url.trim())) {
        seenUrls.add(url.trim());
        list.push({ type: 'image', url: url.trim() });
      }
    };

    // Main image
    if (product?.image) addImage(product.image);

    // Images array
    let imgs = (product as any)?.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
    }
    if (Array.isArray(imgs)) {
      imgs.forEach(addImage);
    }

    // Additional images
    let addImgs = (product as any)?.additional_images || (product as any)?.additionalImages;
    if (typeof addImgs === 'string') {
      try { addImgs = JSON.parse(addImgs); } catch (e) { addImgs = []; }
    }
    if (Array.isArray(addImgs)) {
      addImgs.forEach(addImage);
    }

    // Color variant images
    let colors = (product as any)?.colors;
    if (typeof colors === 'string') {
      try { colors = JSON.parse(colors); } catch (e) { colors = []; }
    }
    if (Array.isArray(colors)) {
      colors.forEach(c => {
        if (c?.image) addImage(c.image);
      });
    }

    // Videos if present (up to 2 videos or legacy video_url)
    let prodVideos = (product as any)?.videos;
    if (typeof prodVideos === 'string') {
      try { prodVideos = JSON.parse(prodVideos); } catch (e) { prodVideos = []; }
    }
    if (Array.isArray(prodVideos) && prodVideos.length > 0) {
      prodVideos.forEach((v, idx) => {
        if (v && v.url && typeof v.url === 'string' && v.url.trim().length > 5) {
          list.push({
            type: 'video',
            url: v.url.trim(),
            title: v.button_text || v.title || `Video İcmal ${idx + 1}`
          });
        }
      });
    } else {
      const videoUrl = (product as any)?.video_url || (product as any)?.video || (product as any)?.youtube_video_url;
      if (videoUrl && typeof videoUrl === 'string' && videoUrl.trim().length > 5) {
        list.push({ type: 'video', url: videoUrl.trim(), title: (product as any)?.youtube_button_text || 'Video İcmal' });
      } else if ((product as any)?.hasVideo) {
        list.push({ type: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', title: 'Video Baxış' });
      }
    }

    if (list.length === 0) {
      list.push({ type: 'image', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=400&q=80' });
    }

    return list;
  }, [product]);

  // Backward compatibility helper
  const galleryImages = useMemo(() => {
    return galleryItems.filter(i => i.type === 'image').map(i => i.url);
  }, [galleryItems]);

  // Gallery Navigation Handlers
  const handlePrevMedia = () => {
    setSelectedMediaIdx((prev) => {
      const nextIdx = prev <= 0 ? (galleryItems?.length ? galleryItems.length - 1 : 0) : prev - 1;
      const item = galleryItems?.[nextIdx];
      if (item && item.type === 'image') setActiveImage(item.url);
      return nextIdx;
    });
  };

  const handleNextMedia = () => {
    setSelectedMediaIdx((prev) => {
      const nextIdx = prev >= (galleryItems?.length ? galleryItems.length - 1 : 0) ? 0 : prev + 1;
      const item = galleryItems?.[nextIdx];
      if (item && item.type === 'image') setActiveImage(item.url);
      return nextIdx;
    });
  };

  const scrollThumbnails = (direction: 'up' | 'down') => {
    if (thumbnailScrollRef.current) {
      const scrollAmount = direction === 'up' ? -120 : 120;
      thumbnailScrollRef.current.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  };

  // Lightbox keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isLightboxOpen) {
        if (e.key === 'Escape') {
          setIsLightboxOpen(false);
          setLightboxZoom(false);
        } else if (e.key === 'ArrowLeft') {
          handlePrevMedia();
        } else if (e.key === 'ArrowRight') {
          handleNextMedia();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen, galleryItems]);

  // 2. Storage Variants & Dynamic Pricing
  const availableStorageVariants = useMemo(() => {
    if (!product) return [];

    // Check if explicitly provided in product
    let variants = (product as any)?.storage_variants || (product as any)?.variants;
    if (typeof variants === 'string') {
      try { variants = JSON.parse(variants); } catch (e) { variants = []; }
    }
    if (Array.isArray(variants) && variants.length > 0) {
      const parsed = variants.map(v => {
        if (typeof v === 'string') {
          return { size: v, price: (product as any).rawPrice || Number(String(product.cash_price).replace(/[^0-9.]/g, '')) || 0 };
        }
        return {
          size: v.size || v.name || v.storage || '',
          price: Number(v.price) || (product as any).rawPrice || Number(String(product.cash_price).replace(/[^0-9.]/g, '')) || 0,
          old_price: v.old_price ? Number(v.old_price) : undefined,
        };
      }).filter(v => v.size);
      if (parsed.length > 0) return parsed;
    }

    // Check product category & model name to decide if storage is applicable
    const cat = String(product.category || '').toLowerCase();
    const model = String(product.model_name || '').toLowerCase();
    const isStorageDevice = cat.includes('smartfon') || cat.includes('telefon') || cat.includes('noutbuk') || cat.includes('planşet') || cat.includes('kompüter') || model.includes('iphone') || model.includes('galaxy') || model.includes('macbook') || model.includes('ipad');

    if (!isStorageDevice) {
      return []; // Non-storage products (vacuums, blenders, headphones, TVs, etc.) have NO storage options
    }

    const basePrice = (product as any).rawPrice || Number(String(product.cash_price).replace(/[^0-9.]/g, '')) || 1000;
    if (model.includes('pro max') || model.includes('ultra') || model.includes('macbook')) {
      return [
        { size: '256 GB', price: basePrice, old_price: Math.round(basePrice * 1.15) },
        { size: '512 GB', price: Math.round(basePrice * 1.18), old_price: Math.round(basePrice * 1.32) },
        { size: '1 TB', price: Math.round(basePrice * 1.38), old_price: Math.round(basePrice * 1.55) },
      ];
    } else {
      return [
        { size: '128 GB', price: basePrice, old_price: Math.round(basePrice * 1.15) },
        { size: '256 GB', price: Math.round(basePrice * 1.14), old_price: Math.round(basePrice * 1.28) },
        { size: '512 GB', price: Math.round(basePrice * 1.32), old_price: Math.round(basePrice * 1.48) },
      ];
    }
  }, [product]);

  // Active Storage Variant
  const activeStorageVariant = useMemo(() => {
    if (availableStorageVariants.length === 0) return null;
    return availableStorageVariants.find(v => v.size === selectedStorage) || availableStorageVariants[0];
  }, [availableStorageVariants, selectedStorage]);

  // Set default selectedStorage
  useEffect(() => {
    if (availableStorageVariants.length > 0) {
      if (!selectedStorage || !availableStorageVariants.some(v => v.size === selectedStorage)) {
        setSelectedStorage(availableStorageVariants[0].size);
      }
    }
  }, [availableStorageVariants]);

  // Dynamic Prices based on Selected Storage Variant
  const dynamicCashPrice = activeStorageVariant
    ? `${activeStorageVariant.price.toLocaleString()} ₼`
    : product?.cash_price || '0 ₼';

  const dynamicOldPrice = activeStorageVariant?.old_price
    ? `${activeStorageVariant.old_price.toLocaleString()} ₼`
    : product?.old_price
    ? (activeStorageVariant ? `${Math.round(activeStorageVariant.price * 1.15).toLocaleString()} ₼` : product.old_price)
    : undefined;

  const dynamicRawPrice = activeStorageVariant
    ? activeStorageVariant.price
    : ((product as any)?.rawPrice || Number(String(product?.cash_price || '0').replace(/[^0-9.]/g, '')) || 0);

  const dynamicMonthlyPrice = `${Math.round(dynamicRawPrice / selectedMonths)} ₼`;

  const activeServicesList = useMemo(() => {
    let assignedIds = (product as any)?.service_ids || (product as any)?.serviceIds;
    if (typeof assignedIds === 'string') {
      try { assignedIds = JSON.parse(assignedIds); } catch (e) { assignedIds = []; }
    }
    if (!Array.isArray(assignedIds)) assignedIds = [];

    const baseList = availableServicesList.length > 0 ? availableServicesList : [
      { id: 'warranty_1y', name: 'Zəmanət 1 il', price: 'Pulsuz', icon: '🛡️', description: 'Rəsmi istehsalçı zəmanəti' },
      { id: 'warranty_2y', name: 'Zəmanət 2 il', price: '59.99 ₼', icon: '🛡️🛡️', description: 'Uzadılmış servis zəmanəti' },
      { id: 'warranty_3y', name: 'Zəmanət 3 il', price: '99.99 ₼', icon: '🛡️🛡️🛡️', description: 'Premium uzadılmış zəmanət' },
    ];

    if (assignedIds.length > 0) {
      const filtered = baseList.filter(s => assignedIds.includes(s.id));
      if (filtered.length > 0) return filtered;
    }
    return baseList;
  }, [availableServicesList, (product as any)?.service_ids]);

  if (isResolving) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentLang={currentLang}
          setCurrentLang={handleLangChange}
        />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#4f533b] border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-bold text-slate-400">Məhsul məlumatları yüklənir...</span>
          </div>
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    );
  }

  if (!product) {
    return (
      <div className={`min-h-screen flex flex-col ${isDarkMode ? 'bg-slate-950 text-slate-100' : 'bg-[#f8fafc] text-slate-900'}`}>
        <Header
          isDarkMode={isDarkMode}
          setIsDarkMode={setIsDarkMode}
          currentLang={currentLang}
          setCurrentLang={handleLangChange}
        />
        <main className="flex-1 flex items-center justify-center py-20 px-4">
          <div className="max-w-md w-full text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-[#4f533b]/10 border border-[#4f533b]/20 text-[#4f533b] flex items-center justify-center mx-auto">
              <Package className="w-8 h-8 text-[#4f533b]" />
            </div>
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Məhsul Tapılmadı</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Axtardığınız məhsul bazada tapılmadı. Zəhmət olmasa mağaza kataloquna keçid edin.
            </p>
            <div className="pt-2 flex justify-center gap-3">
              <Link href="/" className="px-5 py-2.5 rounded-xl bg-[#4f533b] text-white text-xs font-bold shadow-md hover:bg-[#3e4230] transition">
                Ana Səhifəyə Keç
              </Link>
              <Link href="/catalog" className="px-5 py-2.5 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold transition hover:bg-slate-300">
                Kataloqa Bax
              </Link>
            </div>
          </div>
        </main>
        <Footer isDarkMode={isDarkMode} />
      </div>
    );
  }

  const productId = String(product?.id || '');
  const isFav = favorites.includes(productId);
  const isInCart = !!cart.find(c => String(c?.id) === productId);
  const isCompared = comparedProducts.includes(productId);

  const cashPriceStr = String(product?.cash_price || '');
  const rawPrice = dynamicRawPrice || product.rawPrice || (parseFloat(cashPriceStr.replace(/[^\d.]/g, '')) || 1000);
  const calculatedMonthly = Math.round(rawPrice / selectedMonths);

  const BUNDLED_PRODUCTS: Product[] =
    Array.isArray((product as any).bundled_product_ids) && (product as any).bundled_product_ids.length > 0
      ? (product as any).bundled_product_ids
          .map((id: string) => catalogList.find(p => p && String(p.id) === String(id)))
          .filter(Boolean) as Product[]
      : (greatOffers || []).slice(0, 4);

  const ALTERNATIVE_PRODUCTS: Product[] =
    Array.isArray((product as any).alternative_product_ids) && (product as any).alternative_product_ids.length > 0
      ? (product as any).alternative_product_ids
          .map((id: string) => catalogList.find(p => p && String(p.id) === String(id)))
          .filter(Boolean) as Product[]
      : (similarProducts || []).slice(0, 4);

  const attrEntries = Object.entries(product.attributes || {});
  const explicitSpecs = (product.specs || []).map(s => ({ key: s.label, val: s.value }));
  const SPECS_ALL = [
    { key: 'Brend', val: product.brand || 'Ümumi' },
    { key: 'Kateqoriya', val: product.category || 'Ümumi' },
    ...explicitSpecs,
    ...attrEntries.map(([k, v]) => ({ key: k, val: String(v) }))
  ];
  const specs = showAllSpecs ? SPECS_ALL : SPECS_ALL.slice(0, 10);

  const REVIEWS: { author: string; rating: number; date: string; text: string }[] = (product as any).reviews || [];

  const handleCreditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!creditModalProduct) return;
    try {
      await fetch('/api/credit/apply', {
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
          requestedMonths: Number(creditForm.months),
        }),
      });
    } catch { /* offline fallback */ }
    setCreditSubmitted(true);
  };

  const handleApplyOneClickPromo = () => {
    setPromoMessage(null);
    if (!oneClickPromoCode.trim()) {
      setPromoMessage({ text: 'Zəhmət olmasa promo kod daxil edin.', isError: true });
      return;
    }
    const currentPrice = dynamicRawPrice || 0;
    const res = validateCoupon(oneClickPromoCode.trim(), currentPrice);
    if (res.valid) {
      setAppliedPromoCoupon(res.coupon);
      setAppliedPromoDiscount(res.discountAmount);
      setPromoMessage({ text: `✓ ${res.discountAmount.toFixed(2)} ₼ endirim tətbiq edildi!`, isError: false });
    } else {
      setAppliedPromoCoupon(null);
      setAppliedPromoDiscount(0);
      setPromoMessage({ text: res.message || 'Promo kod etibarsızdır və ya müddəti bitib.', isError: true });
    }
  };

  const handleOneClickSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOneClickError(null);

    if (!oneClickFullName.trim()) {
      setOneClickError('Zəhmət olmasa Ad və Soyadınızı daxil edin.');
      return;
    }
    if (oneClickPhone.length < 9) {
      setOneClickError('Zəhmət olmasa 9 rəqəmli əlaqə nömrənizi daxil edin (məs: 50 123 45 67).');
      return;
    }
    if (!oneClickIdCard.trim()) {
      setOneClickError('Zəhmət olmasa Şəxsiyyət Vəsiqənizin seriya və nömrəsini daxil edin.');
      return;
    }
    if (oneClickFin.trim().length !== 7) {
      setOneClickError('Zəhmət olmasa 7 simvollu FİN kodunuzu daxil edin.');
      return;
    }

    const currentBasePrice = dynamicRawPrice || 0;
    const finalAmount = Math.max(0, currentBasePrice - appliedPromoDiscount);
    const calculatedMonthlyPayment = Math.round((finalAmount / oneClickMonths) * 100) / 100;

    setIsSubmittingOneClick(true);
    try {
      const orderId = 'TM-' + Math.floor(100000 + Math.random() * 900000);
      const orderPayload = {
        id: orderId,
        customer: oneClickFullName.trim(),
        phone: `+994${oneClickPhone.trim()}`,
        address: 'Bir kliklə express sifariş',
        total: finalAmount,
        status: 'Yeni',
        date: new Date().toISOString(),
        payment: oneClickPaymentType === 'cash' ? 'Nağd (Bir kliklə al)' : `Hissə-hissə (${oneClickMonths} ay x ${calculatedMonthlyPayment} ₼)`,
        order_type: 'Bir kliklə al',
        fin: oneClickFin.trim().toUpperCase(),
        id_card: oneClickIdCard.trim().toUpperCase(),
        promo_code: appliedPromoCoupon ? appliedPromoCoupon.code : (oneClickPromoCode.trim() || undefined),
        installment_months: oneClickPaymentType === 'installment' ? oneClickMonths : undefined,
        monthly_payment: oneClickPaymentType === 'installment' ? calculatedMonthlyPayment : undefined,
        items: [
          {
            id: product?.id,
            name: product?.model_name || product?.name,
            price: finalAmount,
            qty: 1,
            color: selectedColor || undefined,
            storage: selectedStorage || undefined,
            image: activeImage || product?.image,
          }
        ],
        notes: `Bir kliklə express sifariş. FİN: ${oneClickFin.trim().toUpperCase()}, Ş/V: ${oneClickIdCard.trim().toUpperCase()}${appliedPromoCoupon ? `, Promo: ${appliedPromoCoupon.code}` : ''}`
      };

      const res = await fetch('/api/catalog/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      });

      if (res.ok) {
        setOneClickSuccessOrder(orderPayload);
        try {
          const savedOrders = JSON.parse(localStorage.getItem('technomania_orders') || '[]');
          localStorage.setItem('technomania_orders', JSON.stringify([orderPayload, ...savedOrders]));
          localStorage.setItem('techno_erp_orders', JSON.stringify([orderPayload, ...savedOrders]));
          window.dispatchEvent(new Event('techno_orders_updated'));
        } catch (e) {}
      } else {
        throw new Error('Sifarişi qeyd etmək mümkün olmadı.');
      }
    } catch (err: any) {
      setOneClickError(err.message || 'Xəta baş verdi. Zəhmət olmasa yenidən cəhd edin.');
    } finally {
      setIsSubmittingOneClick(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${isDarkMode ? 'bg-slate-950 text-slate-100 dark' : 'bg-[#f8fafc] text-slate-900'}`}>
      <Header
        isDarkMode={isDarkMode}
        setIsDarkMode={setIsDarkMode}
        currentLang={currentLang}
        setCurrentLang={handleLangChange}
      />

      {/* ══ MAIN CONTENT ═════════════════════════════ */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-6">

        {/* Breadcrumb */}
        <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-xs overflow-x-auto scrollbar-hide">
          <Link href="/" className="flex items-center gap-1.5 font-bold text-[#4f533b] hover:underline bg-[#eaecdb] px-3 py-1.5 rounded-lg border border-[#4f533b]/20 flex-shrink-0">
            ← Ana səhifə
          </Link>
          {['Telefoniya', product.category ?? 'Smartfonlar', product.model_name].map((crumb, i) => (
            <span key={i} className="flex items-center gap-1.5">
              <span className="text-slate-300">/</span>
              <span className={`${i === 2 ? 'font-black text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-[#4f533b] cursor-pointer'} whitespace-nowrap`}>
                {crumb}
              </span>
            </span>
          ))}
        </nav>

        {/* ── Main PDP Grid ─────────────────────────── */}
        <div className={`rounded-3xl border shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-0 mb-6 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>

          {/* LEFT: Gallery */}
          <div className={`lg:col-span-5 p-4 sm:p-6 lg:p-7 flex flex-col justify-between border-b lg:border-b-0 lg:border-r ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
            {(() => {
              const activeMedia = galleryItems[selectedMediaIdx] || galleryItems[0] || { type: 'image', url: activeImage || product.image };
              return (
                <div className="flex flex-col-reverse lg:flex-row gap-3.5 sm:gap-4 items-stretch">
                  {/* Thumbnails list */}
                  {galleryItems.length > 1 && (
                    <div className="relative flex lg:flex-col items-center shrink-0">
                      {/* Desktop Scroll Up Button if many items */}
                      {galleryItems.length > 5 && (
                        <button
                          type="button"
                          onClick={() => scrollThumbnails('up')}
                          className="hidden lg:flex items-center justify-center w-full py-1 mb-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                          title="Yuxarı sürüşdür"
                        >
                          <ChevronUp className="w-4 h-4" />
                        </button>
                      )}

                      {/* Thumbnails Container with ample padding to prevent ring/border clipping */}
                      <div
                        ref={thumbnailScrollRef}
                        className="flex flex-row lg:flex-col gap-2.5 max-w-full lg:max-h-[440px] overflow-x-auto lg:overflow-y-auto p-1.5 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 scrollbar-track-transparent rounded-2xl"
                      >
                        {galleryItems.map((item, idx: number) => {
                          const isSelected = selectedMediaIdx === idx;
                          return (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setSelectedMediaIdx(idx);
                                if (item.type === 'image') setActiveImage(item.url);
                              }}
                              className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-2xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-center p-1.5 shrink-0 select-none overflow-hidden ${
                                isSelected
                                  ? 'border-[#4f533b] dark:border-[#9ba179] bg-white dark:bg-slate-800 shadow-md shadow-[#4f533b]/20 scale-[1.03] z-10'
                                  : isDarkMode
                                  ? 'border-slate-800 bg-slate-800/60 hover:border-slate-600 hover:bg-slate-800'
                                  : 'border-slate-200/90 bg-slate-50/90 hover:border-[#4f533b]/50 hover:bg-white'
                              }`}
                              title={item.type === 'video' ? 'Video icmal' : `Şəkil ${idx + 1}`}
                            >
                              {isSelected && (
                                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#4f533b] dark:bg-[#9ba179] rounded-r-full hidden lg:block" />
                              )}
                              {item.type === 'video' ? (
                                <div className="w-full h-full bg-slate-900 text-white rounded-xl flex flex-col items-center justify-center text-[9px] font-bold">
                                  <Video className="w-4 h-4 text-rose-500 mb-0.5 animate-pulse" />
                                  <span>Video</span>
                                </div>
                              ) : (
                                <img
                                  src={item.url}
                                  alt={`Şəkil ${idx + 1}`}
                                  className="max-h-full max-w-full object-contain mix-blend-multiply dark:mix-blend-normal transition-transform duration-300 group-hover:scale-105"
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {/* Desktop Scroll Down Button if many items */}
                      {galleryItems.length > 5 && (
                        <button
                          type="button"
                          onClick={() => scrollThumbnails('down')}
                          className="hidden lg:flex items-center justify-center w-full py-1 mt-1 text-slate-400 hover:text-slate-700 dark:hover:text-white transition cursor-pointer"
                          title="Aşağı sürüşdür"
                        >
                          <ChevronDown className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Main image / Video viewport */}
                  <div className={`flex-1 rounded-3xl flex items-center justify-center relative min-h-[340px] sm:min-h-[420px] lg:min-h-[440px] border transition-all duration-300 group/main-img select-none overflow-hidden ${
                    isDarkMode
                      ? 'bg-gradient-to-b from-slate-800/40 via-slate-900/60 to-slate-900/80 border-slate-800'
                      : 'bg-gradient-to-b from-slate-50/90 via-white to-slate-50/50 border-slate-200/80'
                  }`}>
                    {/* Top Left: Badges */}
                    <div className="absolute top-3.5 left-3.5 z-20 flex flex-col gap-1.5">
                      {product.discount && (
                        <span className="bg-[#4f533b] text-white text-xs font-black px-3 py-1 rounded-full shadow-md backdrop-blur-xs flex items-center gap-1">
                          {product.discount}
                        </span>
                      )}
                      {(product as any)?.isOnlineOnly && (
                        <span className="bg-slate-800 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow-xs">
                          Onlayn Özəl
                        </span>
                      )}
                    </div>

                    {/* Top Right: Counter & Lightbox Zoom Trigger */}
                    <div className="absolute top-3.5 right-3.5 z-20 flex items-center gap-1.5">
                      {galleryItems.length > 1 && (
                        <span className="bg-slate-900/70 dark:bg-slate-800/90 backdrop-blur-md text-white text-[10px] sm:text-[11px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                          {selectedMediaIdx + 1} / {galleryItems.length}
                        </span>
                      )}
                      {activeMedia.type === 'image' && (
                        <button
                          type="button"
                          onClick={() => setIsLightboxOpen(true)}
                          className="p-2 rounded-full bg-white/90 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 hover:text-[#4f533b] dark:hover:text-white hover:scale-110 shadow-md backdrop-blur-md transition-all cursor-pointer"
                          title="Böyüt (Tam ekran)"
                        >
                          <Expand className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                        </button>
                      )}
                    </div>

                    {/* Next / Previous Navigation Arrows on Image */}
                    {galleryItems.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={handlePrevMedia}
                          className="absolute left-2.5 sm:left-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-[#4f533b] hover:scale-110 shadow-md backdrop-blur-md transition-all flex items-center justify-center cursor-pointer opacity-70 group-hover/main-img:opacity-100"
                          title="Əvvəlki"
                        >
                          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button
                          type="button"
                          onClick={handleNextMedia}
                          className="absolute right-2.5 sm:right-3 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-white dark:hover:bg-slate-700 hover:text-[#4f533b] hover:scale-110 shadow-md backdrop-blur-md transition-all flex items-center justify-center cursor-pointer opacity-70 group-hover/main-img:opacity-100"
                          title="Növbəti"
                        >
                          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                      </>
                    )}

                    {/* Image or Video Renderer */}
                    {activeMedia.type === 'video' ? (
                      <div
                        className="relative w-full h-full min-h-[340px] sm:min-h-[420px] flex items-center justify-center bg-black cursor-pointer group/vid overflow-hidden"
                        onClick={togglePlayVideo}
                      >
                        {activeMedia.url.includes('youtube.com') || activeMedia.url.includes('youtu.be') ? (
                          <iframe
                            src={activeMedia.url.includes('youtube.com/watch?v=') ? activeMedia.url.replace('watch?v=', 'embed/') : (activeMedia.url.includes('youtu.be/') ? activeMedia.url.replace('youtu.be/', 'www.youtube.com/embed/') : activeMedia.url)}
                            title="Məhsul Videosu"
                            className="w-full h-full min-h-[340px] sm:min-h-[420px] border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        ) : (
                          <>
                            <video
                              ref={videoElementRef}
                              src={activeMedia.url}
                              autoPlay
                              loop
                              muted={isVideoMuted}
                              playsInline
                              controls={false}
                              onPlay={() => setIsVideoPlaying(true)}
                              onPause={() => setIsVideoPlaying(false)}
                              className="w-full h-full max-h-[380px] object-contain"
                            />

                            {/* Center Play/Pause button in site's primary color */}
                            <button
                              type="button"
                              onClick={togglePlayVideo}
                              className={`absolute inset-0 m-auto w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#4f533b] hover:bg-[#3e4230] text-white flex items-center justify-center shadow-2xl transition-all duration-300 transform active:scale-95 cursor-pointer z-30 ${
                                isVideoPlaying ? 'opacity-0 group-hover/vid:opacity-90 scale-90 group-hover/vid:scale-100' : 'opacity-100 scale-100'
                              }`}
                              title={isVideoPlaying ? 'Dayandır (Pause)' : 'Başlat (Play)'}
                              aria-label="Play / Pause"
                            >
                              {isVideoPlaying ? (
                                <PauseIcon className="w-7 h-7 fill-white text-white" />
                              ) : (
                                <PlayIcon className="w-7 h-7 fill-white text-white translate-x-0.5" />
                              )}
                            </button>

                            {/* Corner Mute / Unmute Button */}
                            <button
                              type="button"
                              onClick={toggleMuteVideo}
                              className="absolute bottom-3 left-3 z-30 p-2.5 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition shadow-md cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                              title={isVideoMuted ? 'Səsi aç' : 'Səsi bağla'}
                              aria-label="Mute / Unmute"
                            >
                              {isVideoMuted ? (
                                <>
                                  <SpeakerXMark className="w-4 h-4 text-rose-400" />
                                  <span className="text-[10px] pr-1">Səssiz</span>
                                </>
                              ) : (
                                <>
                                  <SpeakerWave className="w-4 h-4 text-emerald-400" />
                                  <span className="text-[10px] pr-1">Səsli</span>
                                </>
                              )}
                            </button>
                          </>
                        )}
                      </div>
                    ) : (
                      <div
                        onClick={() => setIsLightboxOpen(true)}
                        className="w-full h-full flex items-center justify-center cursor-zoom-in p-4 sm:p-6 relative z-10"
                      >
                        <img
                          src={activeMedia.url || activeImage || product?.image || undefined}
                          alt={product.model_name}
                          className="max-h-[320px] sm:max-h-[380px] w-auto max-w-full object-contain mix-blend-multiply dark:mix-blend-normal"
                        />
                      </div>
                    )}

                    {/* Bottom Right: Video badge shortcut if videos exist */}
                    {galleryItems.some(i => i.type === 'video') && activeMedia.type !== 'video' && (
                      <button
                        type="button"
                        onClick={() => {
                          const vIdx = galleryItems.findIndex(i => i.type === 'video');
                          if (vIdx !== -1) setSelectedMediaIdx(vIdx);
                        }}
                        className="absolute bottom-3.5 right-3.5 bg-slate-900/80 backdrop-blur-md text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-2 shadow-lg cursor-pointer hover:bg-slate-900 transition z-20"
                      >
                        <Video className="w-4 h-4 text-[#4f533b]" /> 3D / Video
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Action icons under gallery */}
            <div className="flex items-center gap-2.5 sm:gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => toggleFavorite(product.id)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 shadow-2xs ${
                  isFav
                    ? 'border-[#4f533b] text-[#4f533b] bg-[#4f533b]/10 dark:bg-[#4f533b]/20 dark:text-[#a3a886]'
                    : isDarkMode
                    ? 'border-slate-700/80 text-slate-300 hover:border-[#4f533b] hover:text-[#4f533b] bg-slate-800/40'
                    : 'border-slate-200 text-slate-600 hover:border-[#4f533b] hover:text-[#4f533b] bg-white'
                }`}
              >
                <Heart className={`w-4 h-4 ${isFav ? 'fill-[#4f533b] text-[#4f533b] dark:fill-[#a3a886] dark:text-[#a3a886]' : ''}`} />
                <span>{isFav ? 'Bəyənildi' : 'Bəyən'}</span>
              </button>
              <button
                type="button"
                onClick={() => toggleCompare(product.id)}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 shadow-2xs ${
                  isCompared
                    ? 'border-[#4f533b] text-[#4f533b] bg-[#4f533b]/10 dark:bg-[#4f533b]/20 dark:text-[#a3a886]'
                    : isDarkMode
                    ? 'border-slate-700/80 text-slate-300 hover:border-[#4f533b] hover:text-[#4f533b] bg-slate-800/40'
                    : 'border-slate-200 text-slate-600 hover:border-[#4f533b] hover:text-[#4f533b] bg-white'
                }`}
              >
                <Scale className={`w-4 h-4 ${isCompared ? 'text-[#4f533b] dark:text-[#a3a886]' : ''}`} />
                <span>Müqayisə</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className={`flex-1 sm:flex-initial flex items-center justify-center gap-1.5 text-xs font-bold px-3.5 py-2.5 rounded-2xl border transition-all cursor-pointer active:scale-95 shadow-2xs ${
                  isDarkMode
                    ? 'border-slate-700/80 text-slate-300 hover:border-slate-500 bg-slate-800/40'
                    : 'border-slate-200 text-slate-700 hover:border-slate-300 bg-white'
                }`}
              >
                <Share2 className="w-4 h-4 text-[#4f533b] dark:text-[#a3a886]" />
                <span>Paylaş</span>
              </button>
            </div>
          </div>

          {/* RIGHT: Info */}
          <div className="lg:col-span-7 p-5 sm:p-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-black text-[#4f533b] tracking-wider cursor-pointer hover:underline">{product.brand} ›</span>
              <span className={`text-[11px] font-mono font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Kod: {product.id}</span>
            </div>

            <h1 className={`text-xl sm:text-2xl font-black leading-tight mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{product.model_name}</h1>

            <div className="flex items-center gap-3 text-xs mb-5 flex-wrap">
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => (
                  <Star
                    key={s}
                    className={`w-3.5 h-3.5 ${
                      s <= Math.round(ratingStats.avgRating || 5)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-slate-300'
                    }`}
                  />
                ))}
                <span className="font-black text-amber-600 ml-1">
                  {ratingStats.reviewCount > 0 ? ratingStats.avgRating.toFixed(1) : '5.0'}
                </span>
                <span className={`ml-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {ratingStats.reviewCount > 0 ? `| ${ratingStats.reviewCount} rəy` : '| Hələ ki rəy yoxdur'}
                </span>
              </div>
              {(() => {
                const stockNum = typeof (product as any).stock === 'number'
                  ? (product as any).stock
                  : (parseInt(String((product as any).stock || 0), 10) || 0);

                if (stockNum > 0 && stockNum < 10) {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25 shadow-2xs">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      Yalnız {stockNum} ədəd qaldı!
                    </span>
                  );
                } else if (stockNum === 0) {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 border border-slate-200 dark:border-slate-700">
                      <span className="w-2 h-2 rounded-full bg-slate-400" />
                      Stokda yoxdur
                    </span>
                  );
                } else {
                  return (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Stokda var
                    </span>
                  );
                }
              })()}
              <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rəsmi zəmanət</span>
            </div>

            {/* Color selector */}
            {(() => {
              let rawColors = (product as any).colors;
              if (typeof rawColors === 'string') {
                try {
                  rawColors = JSON.parse(rawColors);
                } catch (e) {
                  rawColors = [];
                }
              }
              let colorsList: Array<{ name: string; hex: string; slug?: string; productId?: string }> = [];
              if (Array.isArray(rawColors) && rawColors.length > 0) {
                colorsList = rawColors
                  .filter(Boolean)
                  .map((c: any) => {
                    if (typeof c === 'string') {
                      return { name: c, hex: '#4f533b' };
                    }
                    if (c && typeof c === 'object') {
                      return {
                        name: String(c.name || c.label || c.color || 'Standart'),
                        hex: String(c.hex || c.colorCode || '#4f533b'),
                        slug: c.slug ? String(c.slug) : undefined,
                        productId: c.productId ? String(c.productId) : undefined,
                      };
                    }
                    return { name: 'Standart', hex: '#4f533b' };
                  });
              } else {
                colorsList = [
                  { name: 'Cosmic Orange', hex: '#d97706' },
                  { name: 'Titanium Silver', hex: '#94a3b8' },
                  { name: 'Dark Slate', hex: '#1e293b' },
                ];
              }

              return (
                <div className="mb-5">
                  <div className="flex items-center gap-2 mb-2.5">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Rəng:</span>
                    <span className={`text-xs font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{selectedColor || colorsList[0]?.name || ''}</span>
                  </div>
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {colorsList.map((c, i) => {
                      const colorName = String(c?.name || '').trim();
                      const curSelected = String(selectedColor || '').trim();
                      const isSelected = curSelected.length > 0 && colorName.length > 0
                        ? curSelected.toLowerCase() === colorName.toLowerCase()
                        : i === 0;
                      return (
                        <button
                          key={i}
                          type="button"
                          onClick={() => {
                            setSelectedColor(c.name);
                            if (c.slug || c.productId) {
                              router.push(`/product/${toSlug(c.slug || c.productId)}`);
                            }
                          }}
                          title={c.name}
                          className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                            isSelected
                              ? 'border-[#4f533b] bg-[#eaecdb]/70 text-[#4f533b] shadow-xs'
                              : isDarkMode
                              ? 'border-slate-700 bg-slate-800 text-slate-300 hover:border-slate-500'
                              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                          }`}
                        >
                          <span
                            className="w-4 h-4 rounded-full border border-black/15 shrink-0 shadow-2xs"
                            style={{ backgroundColor: c.hex || '#4f533b' }}
                          />
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })()}

            {/* Storage selector - ONLY rendered if product actually has storage variants */}
            {availableStorageVariants.length > 0 && (
              <div className="mb-5">
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Yaddaş həcmi:</span>
                  {activeStorageVariant && (
                    <span className="text-xs font-black text-[#4f533b] dark:text-[#a3a886]">
                      {activeStorageVariant.size} — {activeStorageVariant.price.toLocaleString()} ₼
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {availableStorageVariants.map(st => (
                    <button
                      key={st.size}
                      onClick={() => setSelectedStorage(st.size)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-extrabold border transition cursor-pointer flex items-center gap-1.5 ${
                        selectedStorage === st.size
                          ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-md shadow-[#4f533b]/20'
                          : isDarkMode
                          ? 'bg-slate-800 text-slate-300 border-slate-700 hover:border-slate-500'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-slate-400'
                      }`}
                    >
                      <span>{st.size}</span>
                      <span className={`text-[10px] font-bold ${selectedStorage === st.size ? 'text-white/80' : 'text-slate-400'}`}>
                        ({st.price.toLocaleString()} ₼)
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Dynamic Price */}
            <div className="mb-5 p-4 sm:p-5 rounded-2xl bg-[#eaecdb]/60 dark:bg-stone-900/60 border border-[#4f533b]/15 flex items-baseline justify-between flex-wrap gap-2">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-[#4f533b] tracking-tight">{dynamicCashPrice}</span>
                {dynamicOldPrice && <span className="line-through text-slate-400 text-lg font-semibold">{dynamicOldPrice}</span>}
              </div>
              {product.discount && (
                <span className="bg-[#4f533b] text-white text-xs font-black px-3 py-1 rounded-full shadow-sm">
                  {product.discount}
                </span>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 mb-5 flex-wrap">
              <Button
                variant="primary"
                onPress={() => {
                  const productToAdd: Product = {
                    ...product,
                    cash_price: dynamicCashPrice,
                    old_price: dynamicOldPrice || product.old_price || '',
                    ...(selectedColor ? { selectedColor } as any : {}),
                    ...(availableStorageVariants.length > 0 ? { selectedStorage } as any : {}),
                  };
                  toggleCart(productToAdd);
                }}
                className={`flex-1 min-w-[140px] py-4 px-6 h-14 rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg transition cursor-pointer active:scale-[0.98] ${isInCart ? 'bg-[#3e4230] text-white' : 'bg-[#4f533b] hover:bg-[#3e4230] text-white shadow-[#4f533b]/30'}`}
              >
                <ShoppingCart className="w-5 h-5" />
                {isInCart ? 'Səbətdə ✓' : 'Səbətə at'}
              </Button>
              <Button
                variant="outline"
                onPress={() => {
                  setOneClickError(null);
                  setOneClickSuccessOrder(null);
                  setIsOneClickModalOpen(true);
                }}
                className={`py-4 px-6 h-14 rounded-2xl font-black text-sm border-2 flex items-center gap-2 transition cursor-pointer active:scale-[0.98] ${isDarkMode ? 'border-slate-600 text-slate-200 hover:bg-slate-700' : 'border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white'}`}
              >
                <Zap className="w-4 h-4 text-amber-500" /> Bir kliklə al
              </Button>
            </div>

            {expressOrdered && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-stone-300 text-emerald-700 text-xs font-bold flex items-center justify-between animate-fadeIn">
                <span>✔ Express sifarişiniz qeydə alındı! Ən qısa zamanda sizinlə əlaqə saxlanılacaq.</span>
                <button onClick={() => setExpressOrdered(false)} className="text-slate-400 hover:text-slate-600 ml-2 cursor-pointer">✕</button>
              </div>
            )}

            {/* Installment Calculator */}
            <div className={`p-4 sm:p-5 rounded-2xl border mb-2 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`text-xs font-black tracking-wide ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>Hissəli alış kalkulyatoru</span>
                <span className="text-base font-black text-[#4f533b]">{calculatedMonthly} ₼/ay</span>
              </div>
              <div className="grid grid-cols-6 gap-1.5 mb-3">
                {[6, 9, 12, 15, 18, 24].map(m => (
                  <button
                    key={m}
                    onClick={() => setSelectedMonths(m)}
                    className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${selectedMonths === m ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-md shadow-[#4f533b]/20' : isDarkMode ? 'bg-slate-700 text-slate-300 border-slate-600 hover:bg-slate-600' : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400'}`}
                  >{m} ay</button>
                ))}
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                <p className="text-[11px] text-slate-400">ⓘ Komissiyasız və faizsiz hissə-hissə ödəniş imkanı.</p>
                <button
                  onClick={() => setCreditModalProduct(product)}
                  className="text-xs font-black text-[#4f533b] hover:underline cursor-pointer flex items-center gap-1"
                >
                  Kreditlə sifariş et →
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── Tabbed Content ────────────────────────── */}
        <div className={`rounded-3xl border shadow-sm mb-8 overflow-hidden ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
          {/* Tab bar */}
          <div className={`p-2 border-b overflow-x-auto scrollbar-hide flex items-center gap-1.5 ${isDarkMode ? 'bg-slate-950 border-slate-800' : 'bg-slate-50/80 border-slate-100'}`}>
            {[
              { id: 'details', label: 'Ətraflı' },
              { id: 'reviews', label: `Rəylər (${ratingStats.reviewCount})` },
              { id: 'qa', label: `Suallar Və Cavablar (${answeredQuestions.length})` },
              { id: 'bundled', label: 'Birgə satılanlar' },
              { id: 'alternatives', label: 'Alternativ seçim' },
              { id: 'services', label: 'Xidmət seçin' },
            ].map(tab => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-5 py-2.5 rounded-2xl text-xs font-black whitespace-nowrap transition-all duration-200 cursor-pointer active:scale-95 ${
                    isActive
                      ? 'bg-[#4f533b] text-white shadow-md shadow-[#4f533b]/25'
                      : isDarkMode
                      ? 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-6 sm:p-8">
            {/* Specs tab */}
            {activeTab === 'details' && (
              <div>
                <h2 className={`text-lg font-black mb-5 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Sparkles className="w-5 h-5 text-[#4f533b]" /> Xüsusiyyətlər
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12">
                  {specs.map((spec, i) => (
                    <div key={i} className={`flex items-center justify-between py-2.5 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                      <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{spec.key}</span>
                      <span className={`text-xs font-extrabold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{spec.val}</span>
                    </div>
                  ))}
                </div>
                {!showAllSpecs && SPECS_ALL.length > 10 && (
                  <button onClick={() => setShowAllSpecs(true)} className="mt-5 text-xs font-black text-[#4f533b] flex items-center gap-1 hover:underline cursor-pointer">
                    Hamısına bax → ({SPECS_ALL.length - 10} daha)
                  </button>
                )}
              </div>
            )}

            {/* Reviews tab */}
            {activeTab === 'reviews' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className={`text-lg font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <Star className="w-5 h-5 fill-amber-400 text-amber-400" /> Müştəri Rəyləri Və Qiymətləndirmə
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Rəsmi təsdiqlənmiş alıcı rəyləri və real ulduz balları
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`text-center px-5 py-2.5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-amber-50/60 border-amber-200'}`}>
                      <div className="text-2xl font-black text-amber-500">{ratingStats.avgRating}</div>
                      <div className="flex justify-center gap-0.5 mt-0.5">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-3 h-3 ${
                              s <= Math.round(ratingStats.avgRating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                      <div className="text-[10px] text-slate-500 mt-0.5 font-bold">{ratingStats.reviewCount} təsdiqlənmiş rəy</div>
                    </div>

                    <button
                      onClick={handleOpenReviewModal}
                      className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-extrabold px-4 py-3 rounded-2xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Rəy Və Ulduz Yaz
                    </button>
                  </div>
                </div>

                {/* Approved Reviews List */}
                {ratingStats.reviews.length === 0 ? (
                  <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <Star className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Hələ ki bu məhsul üçün təsdiqlənmiş rəy yazılmayıb.</p>
                    <p className="text-xs text-slate-400 mt-1">Bu məhsul haqqında fikirlərinizi bölüşən ilk alıcı siz olun!</p>
                    <button
                      onClick={handleOpenReviewModal}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-[#4f533b] text-white text-xs font-bold shadow-xs hover:bg-[#3e4230] transition cursor-pointer"
                    >
                      + İlk Rəyi Siz Yazın
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3.5">
                    {ratingStats.reviews.map((rev) => (
                      <div key={rev.id} className={`p-5 rounded-2xl border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-100 shadow-2xs'}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-[#4f533b] text-white font-black text-sm flex items-center justify-center shadow-xs">
                              {rev.user_name[0]?.toUpperCase() || 'U'}
                            </div>
                            <div>
                              <div className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{rev.user_name}</div>
                              <div className="flex gap-0.5 mt-0.5">
                                {[1, 2, 3, 4, 5].map(s => (
                                  <Star
                                    key={s}
                                    className={`w-3 h-3 ${
                                      s <= (rev.rating || 5) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {new Date(rev.created_at).toLocaleDateString('az-AZ')}
                          </span>
                        </div>
                        <p className={`text-xs leading-relaxed font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>"{rev.comment}"</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Questions & Answers Tab */}
            {activeTab === 'qa' && (
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                  <div>
                    <h2 className={`text-lg font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      <HelpCircle className="w-5 h-5 text-[#4f533b]" /> Məhsul Haqqında Suallar Və Cavablar
                    </h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Məhsulun xüsusiyyətləri, istifadəsi və zəmanəti haqqında mütəxəssis cavabları
                    </p>
                  </div>

                  <button
                    onClick={handleOpenQuestionModal}
                    className="bg-[#4f533b] hover:bg-[#3e4230] text-white text-xs font-extrabold px-4 py-3 rounded-2xl shadow-md transition cursor-pointer flex items-center gap-1.5 active:scale-95 flex-shrink-0"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-300" /> + Məhsul Haqqında Sual Ver
                  </button>
                </div>

                {answeredQuestions.length === 0 ? (
                  <div className={`p-8 text-center rounded-2xl border ${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                    <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                    <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      Hələ ki bu məhsul üçün verilmiş sual yoxdur.
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Məhsul haqqında sualınız varsa çəkinmədən yazın, ən qısa zamanda cavablandıraq!
                    </p>
                    <button
                      onClick={handleOpenQuestionModal}
                      className="mt-4 px-5 py-2.5 rounded-xl bg-[#4f533b] text-white text-xs font-bold shadow-xs hover:bg-[#3e4230] transition cursor-pointer"
                    >
                      + İlk Sualı Siz Verin
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {answeredQuestions.map((q) => {
                      const author = q.author_name || q.user_name || 'Müştəri';
                      const responder = q.answered_by || 'Rəsmi Cavab';
                      return (
                        <div
                          key={q.id}
                          className={`p-5 rounded-2xl border ${
                            isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200 shadow-2xs'
                          } space-y-3.5`}
                        >
                          {/* Question Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                                {author[0]?.toUpperCase() || 'M'}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className={`font-extrabold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {author}
                                  </span>
                                  <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded-md font-bold">
                                    Sual
                                  </span>
                                </div>
                                <p className={`text-xs font-bold mt-1 ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}>
                                  "{q.question}"
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {new Date(q.created_at).toLocaleDateString('az-AZ')}
                            </span>
                          </div>

                          {/* Answer Box */}
                          {q.answer && (
                            <div className="bg-[#eaecdb]/60 dark:bg-[#4f533b]/20 border border-[#4f533b]/20 p-4 rounded-xl space-y-1.5 ml-4 sm:ml-10">
                              <div className="flex items-center gap-2">
                                <span className="text-[10px] font-black bg-[#4f533b] text-white px-2 py-0.5 rounded-md flex items-center gap-1">
                                  ✓ TechnoMania Dəstək
                                </span>
                                <span className="text-[10px] text-slate-400">
                                  {responder}
                                </span>
                              </div>
                              <p className="text-xs text-slate-800 dark:text-slate-100 font-medium leading-relaxed">
                                {q.answer}
                              </p>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Bundled tab */}
            {activeTab === 'bundled' && (
              <div>
                <h2 className={`text-lg font-black mb-5 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Package className="w-5 h-5 text-[#4f533b]" /> Birgə satılanlar
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {BUNDLED_PRODUCTS.map(bp => (
                    <div key={bp.id} className={`p-4 rounded-2xl border flex items-center gap-4 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>
                        <img src={bp.image || undefined} alt={bp.model_name} className="max-h-16 object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400">{bp.brand}</span>
                        <h4 className={`font-black text-xs line-clamp-2 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{bp.model_name}</h4>
                        <div className="flex items-baseline gap-1.5 mb-2">
                          {bp.old_price && <span className="line-through text-[10px] text-slate-400">{bp.old_price}</span>}
                          <span className="font-black text-sm text-[#4f533b]">{bp.cash_price}</span>
                        </div>
                        <button
                          onClick={() => setBundleCart(prev => prev.includes(bp.id) ? prev.filter(x => x !== bp.id) : [...prev, bp.id])}
                          className={`flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-lg transition cursor-pointer ${bundleCart.includes(bp.id) ? 'bg-emerald-700 text-white' : 'bg-[#4f533b] hover:bg-[#3e4230] text-white'}`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          {bundleCart.includes(bp.id) ? 'Əlavə edildi ✓' : 'Səbətə at'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Alternatives tab */}
            {activeTab === 'alternatives' && (
              <div>
                <h2 className={`text-lg font-black mb-5 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <Layers className="w-5 h-5 text-[#4f533b]" /> Alternativ seçim
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {ALTERNATIVE_PRODUCTS.map(alt => (
                    <Link href={`/product/${toSlug(alt.model_name)}`} onClick={() => window.scrollTo({ top: 0, left: 0, behavior: 'instant' })} key={alt.id} className={`p-4 rounded-2xl border flex items-center gap-4 hover:border-[#4f533b]/40 transition ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                      <div className={`w-20 h-20 rounded-xl flex items-center justify-center flex-shrink-0 border ${isDarkMode ? 'bg-slate-700 border-slate-600' : 'bg-white border-slate-200'}`}>
                        <img src={alt.image || undefined} alt={alt.model_name} className="max-h-16 object-contain mix-blend-multiply dark:mix-blend-normal" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-bold text-slate-400">{alt.brand}</span>
                        <h4 className={`font-black text-xs line-clamp-2 mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{alt.model_name}</h4>
                        <div className="flex items-baseline gap-1.5 mb-2">
                          {alt.old_price && <span className="line-through text-[10px] text-slate-400">{alt.old_price}</span>}
                          <span className="font-black text-sm text-[#4f533b]">{alt.cash_price}</span>
                        </div>
                        <span className="flex items-center gap-1 text-xs font-black px-3 py-1.5 rounded-lg bg-[#4f533b] hover:bg-[#3e4230] text-white transition w-fit">
                          <ShoppingCart className="w-3.5 h-3.5" /> Bax
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Services tab */}
            {activeTab === 'services' && (
              <div>
                <h2 className={`text-lg font-black mb-2 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  <ShieldCheck className="w-5 h-5 text-[#4f533b]" /> Xidmət seçin
                </h2>
                <p className={`text-xs mb-5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Cihazınız üçün ən uyğun zəmanət və servis paketini seçin</p>
                <div className="space-y-3">
                  {activeServicesList.map((svc: any) => (
                    <button
                      key={svc.id}
                      onClick={() => setSelectedService(svc.id)}
                      className={`w-full p-4 rounded-2xl border-2 flex items-center gap-4 text-left transition cursor-pointer ${selectedService === svc.id ? 'border-[#4f533b] bg-[#eaecdb] dark:bg-emerald-950/40' : isDarkMode ? 'border-slate-700 bg-slate-800 hover:border-slate-500' : 'border-slate-200 bg-white hover:border-slate-300'}`}
                    >
                      <span className="text-2xl">{svc.icon || '🛡️'}</span>
                      <div className="flex-1">
                        <div className={`font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{svc.name || svc.label}</div>
                        <div className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>{svc.description || svc.desc}</div>
                      </div>
                      <div className="text-right">
                        <div className={`font-black text-sm ${svc.price === 'Pulsuz' || svc.price === '0 ₼' ? 'text-[#4f533b]' : isDarkMode ? 'text-white' : 'text-slate-900'}`}>{svc.price}</div>
                        {selectedService === svc.id && <CheckCircle className="w-5 h-5 text-[#4f533b] ml-auto mt-1" />}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => toggleCart(product)}
                  className="mt-5 w-full py-3.5 rounded-xl bg-[#4f533b] hover:bg-[#3e4230] text-white font-black text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-lg shadow-[#4f533b]/20"
                >
                  <ShoppingCart className="w-5 h-5" /> Seçilmiş xidmətlə səbətə at
                </button>
              </div>
            )}
          </div>
        </div>

        {/* ── Açıqlama (Description) ────────────────── */}
        {product.description && (
          <div className={`rounded-3xl border shadow-sm mb-8 p-6 sm:p-8 ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200/80'}`}>
            <h2 className={`text-xl font-black mb-4 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-5 h-5 text-[#4f533b]" /> Məhsul haqqında
            </h2>
            <div className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
              <div
                className="prose dark:prose-invert max-w-none text-sm leading-relaxed mb-4"
                dangerouslySetInnerHTML={{ __html: product.description }}
              />
              <div className={`mt-5 p-4 rounded-2xl border-l-4 border-[#4f533b] ${isDarkMode ? 'bg-slate-800/60' : 'bg-[#eaecdb]/60'}`}>
                <p className={`text-xs font-bold ${isDarkMode ? 'text-stone-400' : 'text-[#4f533b]'} mb-1`}>Əsas xüsusiyyətlər</p>
                <ul className="space-y-1 text-xs">
                  <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#4f533b] mt-0.5 flex-shrink-0" />Rəsmi Azərbaycan distribütoru vasitəsilə idxal edilib</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#4f533b] mt-0.5 flex-shrink-0" />Qutuda: cihaz, şarj kabeli, sənədlər</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#4f533b] mt-0.5 flex-shrink-0" />1 il rəsmi istehsalçı zəmanəti</li>
                  <li className="flex items-start gap-2"><CheckCircle className="w-3.5 h-3.5 text-[#4f533b] mt-0.5 flex-shrink-0" />Azərbaycan rəsmi nümayəndəliyi dəstəyi</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* ── Bənzər Məhsullar ─────────────────────── */}
        {similarProducts.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h2 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                <TrendingUp className="w-5 h-5 text-[#4f533b]" /> Bənzər məhsullar
              </h2>
              <Link href="/" className={`text-xs font-bold flex items-center gap-1 hover:text-[#4f533b] transition ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                Hamısına bax <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-5 gap-3.5 sm:gap-4 items-stretch">
              {similarProducts.filter(Boolean).map(p => (
                <ProductCard
                  key={String(p.id)}
                  product={p}
                  onToggleFavorite={toggleFavorite}
                  onToggleCart={toggleCart}
                  onToggleCompare={toggleCompare}
                  onSelectProduct={(prod) => {
                    router.push(`/product/${toSlug(prod.model_name)}`);
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  }}
                  onCreditClick={(prod) => { setCreditModalProduct(prod); setCreditSubmitted(false); }}
                  isFav={favorites.includes(String(p.id))}
                  isInCart={!!cart.find(c => String(c?.id) === String(p.id))}
                  isCompared={comparedProducts.includes(String(p.id))}
                  isDarkMode={isDarkMode}
                />
              ))}
            </div>
          </div>
        )}

        {/* ── Möhtəşəm Fürsətlər ────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-5">
            <h2 className={`text-xl font-black flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              <Sparkles className="w-5 h-5 text-[#4f533b]" /> Möhtəşəm fürsətlər
            </h2>
            <Link href="/" className={`text-xs font-bold flex items-center gap-1 hover:text-[#4f533b] transition ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              Hamısına bax <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <DraggableSlider className="gap-5 pb-4">
            {greatOffers.map(offer => (
              <HorizontalOfferCard
                key={offer.id}
                product={offer}
                isDarkMode={isDarkMode}
                onAddToCart={toggleCart}
                isInCart={!!cart.find(c => c.id === offer.id)}
              />
            ))}
          </DraggableSlider>
        </div>

      </main>

      <Footer isDarkMode={isDarkMode} />

      {/* ══ CREDIT MODAL ═════════════════════════════ */}
      {creditModalProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4" onClick={() => setCreditModalProduct(null)}>
          <div className={`rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'}`} onClick={e => e.stopPropagation()}>
            <div className="bg-gradient-to-r from-[#4f533b] to-[#3e4230] text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-black text-lg">Onlayn Kredit Müraciəti</h3>
                <p className="text-white/80 text-xs mt-0.5">{creditModalProduct.model_name}</p>
              </div>
              <button onClick={() => setCreditModalProduct(null)} className="text-white/60 hover:text-white transition cursor-pointer"><X className="w-6 h-6" /></button>
            </div>
            {!creditSubmitted ? (
              <form onSubmit={handleCreditSubmit} className="p-6 space-y-4">
                <div className={`rounded-xl p-4 flex items-center justify-between border ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-[#eaecdb] border-[#4f533b]/20'}`}>
                  <div><p className="text-xs text-slate-500">Məhsul qiyməti</p><p className="font-black text-xl text-[#4f533b]">{creditModalProduct.cash_price}</p></div>
                  <div className="text-right"><p className="text-xs text-slate-500">Aylıq ödəniş</p><p className={`font-black text-lg ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{creditModalProduct.monthly || `${((creditModalProduct.rawPrice ?? 0) / 12).toFixed(1)} ₼`}</p></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Ad Soyad</label>
                    <input required value={creditForm.name} onChange={e => setCreditForm({ ...creditForm, name: e.target.value })} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4f533b] transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} placeholder="Ad Soyad" />
                  </div>
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>FİN kod</label>
                    <input required value={creditForm.pin} onChange={e => setCreditForm({ ...creditForm, pin: e.target.value })} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4f533b] transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} placeholder="7 simvol" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Telefon</label>
                    <input required value={creditForm.phone} onChange={e => setCreditForm({ ...creditForm, phone: e.target.value })} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4f533b] transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} />
                  </div>
                  <div>
                    <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Aylıq gəlir (₼)</label>
                    <input required type="number" value={creditForm.income} onChange={e => setCreditForm({ ...creditForm, income: e.target.value })} className={`w-full border rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#4f533b] transition ${isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`} placeholder="1000" />
                  </div>
                </div>
                <div>
                  <label className={`text-xs font-bold mb-1 block ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>Kredit müddəti</label>
                  <div className="flex gap-2">
                    {['3', '6', '9', '12', '18', '24'].map(m => (
                      <button key={m} type="button" onClick={() => setCreditForm({ ...creditForm, months: m })} className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${creditForm.months === m ? 'bg-[#4f533b] text-white' : isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{m} ay</button>
                    ))}
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3 rounded-xl shadow-lg transition text-sm cursor-pointer">Müraciət göndər →</button>
              </form>
            ) : (
              <div className="p-10 text-center">
                <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4"><CheckCircle className="w-10 h-10 text-[#4f533b]" /></div>
                <h3 className={`font-black text-xl ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Müraciət qəbul edildi!</h3>
                <p className="text-slate-500 text-sm mt-2">AI kredit sistemi müraciətinizi dəyərləndirir. 30 saniyə içində nəticə SMS ilə göndəriləcək.</p>
                <button onClick={() => setCreditModalProduct(null)} className="mt-6 bg-[#4f533b] hover:bg-[#3e4230] text-white font-bold px-8 py-2.5 rounded-xl transition text-sm cursor-pointer">Bağla</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ ONE-CLICK BUY POP-UP MODAL ("BİR KLİKLƏ AL") ═════════════════════ */}
      {isOneClickModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => {
            if (!isSubmittingOneClick) setIsOneClickModalOpen(false);
          }}
        >
          <div
            className={`rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden border my-auto ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-[#4f533b] to-[#3e4230] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-300/30 flex items-center justify-center text-amber-300">
                  <Zap className="w-5 h-5 fill-amber-300 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-black text-lg">Bir Kliklə Express Alış</h3>
                  <p className="text-white/80 text-xs truncate max-w-[280px] sm:max-w-md">
                    {product?.model_name || product?.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsOneClickModalOpen(false)}
                className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            {oneClickSuccessOrder ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-700 flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                  <CheckCircle className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-xl font-black text-slate-900 dark:text-white">
                    Sifarişiniz Uğurla Qeydə Alındı!
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Əməkdaşımız 15 dəqiqə ərzində sizinlə əlaqə saxlayaraq sifarişi təsdiq edəcək.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-left text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Sifariş Kodu:</span>
                    <span className="font-mono font-black text-[#4f533b]">{oneClickSuccessOrder.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Müştəri:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{oneClickSuccessOrder.customer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Telefon:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{oneClickSuccessOrder.phone}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ödəniş Növü:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{oneClickSuccessOrder.payment}</span>
                  </div>
                  <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-2 text-sm">
                    <span className="font-extrabold text-slate-600 dark:text-slate-300">Yekun Məbləğ:</span>
                    <span className="font-black text-[#4f533b]">{oneClickSuccessOrder.total} ₼</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsOneClickModalOpen(false)}
                  className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-extrabold py-3.5 rounded-2xl shadow-lg transition active:scale-98 cursor-pointer text-sm"
                >
                  Tamamla və Bağla
                </button>
              </div>
            ) : (
              <form onSubmit={handleOneClickSubmit} className="p-5 sm:p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                {/* 1. PAYMENT TYPE TOGGLE */}
                <div>
                  <label className="text-xs font-bold mb-1.5 block text-slate-600 dark:text-slate-300">
                    Ödəniş üsulunu seçin
                  </label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <button
                      type="button"
                      onClick={() => setOneClickPaymentType('cash')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        oneClickPaymentType === 'cash'
                          ? 'bg-white dark:bg-slate-700 text-[#4f533b] shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>💵 Nağd / Kartla</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setOneClickPaymentType('installment')}
                      className={`py-2.5 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                        oneClickPaymentType === 'installment'
                          ? 'bg-white dark:bg-slate-700 text-[#4f533b] shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                      }`}
                    >
                      <span>💳 Hissə-hissə (Kredit)</span>
                    </button>
                  </div>
                </div>

                {/* If Installment: Months selector */}
                {oneClickPaymentType === 'installment' && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center justify-between text-xs font-bold text-amber-900 dark:text-amber-300">
                      <span>Müddət: {oneClickMonths} ay</span>
                      <span>
                        Aylıq:{' '}
                        <strong>
                          {Math.round(Math.max(0, dynamicRawPrice - appliedPromoDiscount) / oneClickMonths)} ₼/ay
                        </strong>
                      </span>
                    </div>
                    <div className="grid grid-cols-5 gap-1.5">
                      {[3, 6, 12, 18, 24].map(m => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setOneClickMonths(m)}
                          className={`py-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                            oneClickMonths === m
                              ? 'bg-[#4f533b] text-white border-[#4f533b] shadow-xs'
                              : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300'
                          }`}
                        >
                          {m} ay
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 2. CUSTOMER INPUTS */}
                <div className="space-y-3">
                  {/* Phone Input with IMMUTABLE +994 Prefix */}
                  <div>
                    <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">
                      Əlaqə nömrəsi <span className="text-rose-500">*</span>
                    </label>
                    <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 overflow-hidden focus-within:border-[#4f533b] transition">
                      <span className="px-3.5 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-extrabold text-xs border-r border-slate-200 dark:border-slate-600 select-none">
                        +994
                      </span>
                      <input
                        type="tel"
                        required
                        value={oneClickPhone}
                        onChange={e => handlePhoneDigitsChange(e.target.value)}
                        placeholder="50 123 45 67"
                        className="flex-1 px-3 py-2.5 text-xs font-bold bg-transparent text-slate-900 dark:text-white outline-none placeholder:text-slate-400 font-mono"
                      />
                    </div>
                  </div>

                  {/* Full Name */}
                  <div>
                    <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">
                      Ad Soyad <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={oneClickFullName}
                      onChange={e => setOneClickFullName(e.target.value)}
                      placeholder="Məs: Əli Məmmədov"
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#4f533b] transition placeholder:text-slate-400"
                    />
                  </div>

                  {/* ID Card Serial & Number + FIN Code */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">
                        Ş/V Seriya və Nömrə <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={oneClickIdCard}
                        onChange={e => setOneClickIdCard(e.target.value.toUpperCase())}
                        placeholder="Məs: AZE 12345678"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-900 dark:text-white outline-none focus:border-[#4f533b] transition placeholder:text-slate-400 uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">
                        FİN Kod (7 simvol) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={7}
                        value={oneClickFin}
                        onChange={e => setOneClickFin(e.target.value.toUpperCase().slice(0, 7))}
                        placeholder="Məs: 7ABC123"
                        className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#4f533b] transition placeholder:text-slate-400 uppercase tracking-wider"
                      />
                    </div>
                  </div>

                  {/* 3. PROMO CODE INPUT */}
                  <div>
                    <label className="text-xs font-bold mb-1 block text-slate-700 dark:text-slate-300">
                      Promo Kod (Əgər varsa)
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={oneClickPromoCode}
                        onChange={e => setOneClickPromoCode(e.target.value.toUpperCase())}
                        placeholder="Məs: TECHNO10"
                        className="flex-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-slate-900 dark:text-white outline-none focus:border-[#4f533b] transition uppercase tracking-wider placeholder:text-slate-400"
                      />
                      <button
                        type="button"
                        onClick={handleApplyOneClickPromo}
                        className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-black transition active:scale-95 cursor-pointer shadow-2xs"
                      >
                        Tətbiq et
                      </button>
                    </div>
                    {promoMessage && (
                      <p className={`text-[11px] font-bold mt-1 ${promoMessage.isError ? 'text-rose-500' : 'text-emerald-600'}`}>
                        {promoMessage.text}
                      </p>
                    )}
                  </div>
                </div>

                {/* 4. ORDER SUMMARY & FINAL PRICE */}
                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-500 dark:text-slate-400">
                    <span>Məhsul qiyməti:</span>
                    <span>{dynamicRawPrice.toLocaleString()} ₼</span>
                  </div>
                  {appliedPromoDiscount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promo endirim:</span>
                      <span>-{appliedPromoDiscount.toLocaleString()} ₼</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-2">
                    <span className="font-extrabold text-slate-800 dark:text-slate-200">Yekun məbləğ:</span>
                    <div className="text-right">
                      <span className="text-lg font-black text-[#4f533b]">
                        {Math.max(0, dynamicRawPrice - appliedPromoDiscount).toLocaleString()} ₼
                      </span>
                      {oneClickPaymentType === 'installment' && (
                        <span className="block text-[11px] font-bold text-slate-500">
                          ({Math.round(Math.max(0, dynamicRawPrice - appliedPromoDiscount) / oneClickMonths)} ₼/ay x {oneClickMonths} ay)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Error Banner */}
                {oneClickError && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 text-xs font-bold flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 shrink-0" />
                    <span>{oneClickError}</span>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmittingOneClick}
                  className="w-full bg-[#4f533b] hover:bg-[#3e4230] text-white font-black py-3.5 rounded-2xl shadow-lg transition active:scale-98 cursor-pointer text-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 fill-amber-300 text-amber-300" />
                  <span>{isSubmittingOneClick ? 'Sifariş göndərilir...' : 'Bir Kliklə Sifarişi Tamamla →'}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ LOGIN REQUIRED TOAST ═════════════════════ */}
      {loginRequiredMsg && (
        <div className="fixed top-20 right-5 z-[99999] bg-amber-500 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-fadeIn border border-amber-600">
          <Star className="w-5 h-5 fill-white text-white" />
          <div>
            <h4 className="font-extrabold text-sm">Giriş Tələb Olunur</h4>
            <p className="text-xs text-white/90">Rəy və ulduz yazmaq üçün zəhmət olmasa hesabınıza daxil olun.</p>
          </div>
        </div>
      )}

      {/* ══ CUSTOMER REVIEW SUBMISSION MODAL ═════════════════════ */}
      {isReviewModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          onClick={() => setIsReviewModalOpen(false)}
        >
          <div
            className={`rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 border animate-fadeIn relative ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                <h3 className="font-black text-base">Məhsula Rəy Və Ulduz Yaz</h3>
              </div>
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reviewSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-black text-base text-emerald-600">Rəyiniz Qəbul Olundu!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                  {reviewSuccessMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Reytinqiniz (1 - 5 Ulduz)</label>
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
                    {[1, 2, 3, 4, 5].map(s => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setReviewRating(s)}
                        className="p-1 cursor-pointer transition transform hover:scale-125 active:scale-95"
                      >
                        <Star
                          className={`w-7 h-7 ${
                            s <= reviewRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300 dark:text-slate-600'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-sm font-black text-amber-500 ml-2">{reviewRating}.0 / 5.0</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Adınız / Soyadınız</label>
                    <input
                      type="text"
                      required
                      value={reviewUserName}
                      onChange={e => setReviewUserName(e.target.value)}
                      placeholder="Ad Soyad"
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#4f533b] ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">E-poçt Ünvanınız</label>
                    <input
                      type="email"
                      value={reviewUserEmail}
                      onChange={e => setReviewUserEmail(e.target.value)}
                      placeholder="user@mail.az"
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#4f533b] ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Fikirləriniz (Məhsul haqqında rəyiniz)</label>
                  <textarea
                    rows={4}
                    required
                    value={reviewComment}
                    onChange={e => setReviewComment(e.target.value)}
                    placeholder="Məhsulun keyfiyyəti, istifadə rahatlığı və çatdırılması haqqında fikirlərinizi yazın..."
                    className={`w-full border rounded-2xl p-3.5 text-xs outline-none focus:border-[#4f533b] ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsReviewModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#4f533b] hover:bg-[#3e4230] text-white transition cursor-pointer shadow-md active:scale-95"
                  >
                    Rəyi Admin Təsdiqinə Göndər →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ══ CUSTOMER QUESTION SUBMISSION MODAL ═════════════════════ */}
      {isQuestionModalOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          onClick={() => setIsQuestionModalOpen(false)}
        >
          <div
            className={`rounded-3xl shadow-2xl max-w-lg w-full p-6 sm:p-8 space-y-4 border animate-fadeIn relative ${
              isDarkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
            }`}
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <HelpCircle className="w-5 h-5 text-[#4f533b]" />
                <h3 className="font-black text-base">Məhsul Haqqında Sual Verin</h3>
              </div>
              <button
                onClick={() => setIsQuestionModalOpen(false)}
                className="p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {qSuccessMsg ? (
              <div className="py-8 text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle className="w-8 h-8" />
                </div>
                <h4 className="font-black text-base text-emerald-600">Sualınız Göndərildi!</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto font-medium">
                  {qSuccessMsg}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitQuestion} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Adınız / Soyadınız</label>
                    <input
                      type="text"
                      required
                      value={qAuthorName}
                      onChange={e => setQAuthorName(e.target.value)}
                      placeholder="Ad Soyad"
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#4f533b] ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">E-poçt Ünvanınız</label>
                    <input
                      type="email"
                      value={qAuthorEmail}
                      onChange={e => setQAuthorEmail(e.target.value)}
                      placeholder="user@mail.az"
                      className={`w-full border rounded-xl px-3.5 py-2.5 text-xs outline-none focus:border-[#4f533b] ${
                        isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 mb-1">Məhsul Haqqında Sualınız</label>
                  <textarea
                    rows={4}
                    required
                    value={qQuestionText}
                    onChange={e => setQQuestionText(e.target.value)}
                    placeholder="Məhsulun taksit şərtləri, çatdırılması və ya xüsusiyyətləri haqqında sualınızı qeyd edin..."
                    className={`w-full border rounded-2xl p-3.5 text-xs outline-none focus:border-[#4f533b] ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setIsQuestionModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    Ləğv et
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-black bg-[#4f533b] hover:bg-[#3e4230] text-white transition cursor-pointer shadow-md active:scale-95"
                  >
                    Sualı Menecerə Göndər →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
      {/* ══ FULLSCREEN LIGHTBOX MODAL ════════════════ */}
      {isLightboxOpen && (
        <div className="fixed inset-0 z-[100000] flex flex-col justify-between bg-black/95 backdrop-blur-xl p-4 sm:p-6 animate-in fade-in duration-200">
          {/* Lightbox Header */}
          <div className="flex items-center justify-between w-full max-w-6xl mx-auto z-20">
            <div className="flex items-center gap-3">
              <span className="text-white font-black text-sm sm:text-base line-clamp-1 max-w-md">
                {product.model_name}
              </span>
              {galleryItems.length > 1 && (
                <span className="text-xs text-slate-400 font-mono bg-white/10 px-2.5 py-1 rounded-full">
                  {selectedMediaIdx + 1} / {galleryItems.length}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setLightboxZoom(!lightboxZoom)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                title={lightboxZoom ? "Kiçilt" : "Böyüt"}
              >
                <ZoomIn className="w-5 h-5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsLightboxOpen(false);
                  setLightboxZoom(false);
                }}
                className="p-2.5 rounded-full bg-white/10 hover:bg-rose-600 text-white transition cursor-pointer"
                title="Bağla (ESC)"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Lightbox Main Stage */}
          <div className="relative flex-1 flex items-center justify-center w-full max-w-6xl mx-auto my-auto overflow-hidden">
            {galleryItems.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevMedia}
                  className="absolute left-2 sm:left-6 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                  title="Əvvəlki"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>
                <button
                  type="button"
                  onClick={handleNextMedia}
                  className="absolute right-2 sm:right-6 z-30 p-3 rounded-full bg-white/10 hover:bg-white/25 text-white backdrop-blur-md transition-all cursor-pointer hover:scale-110"
                  title="Növbəti"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}

            {(() => {
              const currentMedia = galleryItems[selectedMediaIdx] || galleryItems[0];
              if (currentMedia.type === 'video') {
                return (
                  <div className="w-full max-w-4xl h-[60vh] rounded-2xl overflow-hidden shadow-2xl">
                    <iframe
                      src={currentMedia.url.includes('youtube.com/watch?v=') ? currentMedia.url.replace('watch?v=', 'embed/') : (currentMedia.url.includes('youtu.be/') ? currentMedia.url.replace('youtu.be/', 'www.youtube.com/embed/') : currentMedia.url)}
                      title="Məhsul Videosu"
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  </div>
                );
              }
              return (
                <div
                  className={`transition-transform duration-300 flex items-center justify-center p-4 ${lightboxZoom ? 'scale-150 cursor-zoom-out' : 'scale-100 cursor-zoom-in'}`}
                  onClick={() => setLightboxZoom(!lightboxZoom)}
                >
                  <img
                    src={currentMedia.url}
                    alt={product.model_name}
                    className="max-h-[70vh] max-w-[85vw] object-contain select-none drop-shadow-2xl"
                  />
                </div>
              );
            })()}
          </div>

          {/* Lightbox Bottom Thumbnails Carousel */}
          {galleryItems.length > 1 && (
            <div className="w-full max-w-3xl mx-auto z-20">
              <div className="flex items-center justify-center gap-2 overflow-x-auto p-2 scrollbar-none">
                {galleryItems.map((item, idx: number) => {
                  const isSelected = selectedMediaIdx === idx;
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setSelectedMediaIdx(idx);
                        if (item.type === 'image') setActiveImage(item.url);
                      }}
                      className={`w-14 h-14 rounded-xl border-2 p-1 transition-all cursor-pointer flex-shrink-0 flex items-center justify-center overflow-hidden ${
                        isSelected
                          ? 'border-[#9ba179] bg-white/20 scale-105 shadow-lg shadow-[#9ba179]/30'
                          : 'border-white/20 bg-white/5 hover:border-white/40'
                      }`}
                    >
                      {item.type === 'video' ? (
                        <Video className="w-5 h-5 text-rose-500" />
                      ) : (
                        <img src={item.url} alt={`Thumb ${idx + 1}`} className="max-h-full max-w-full object-contain" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ══ SHARE COPIED TOAST ═════════════════════ */}
      {shareToast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[99999] bg-slate-900/95 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 border border-slate-700/80 animate-in fade-in slide-in-from-bottom-3 duration-200">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Məhsul linki kopyalandı!</span>
        </div>
      )}

      {/* ══ MOBILE STICKY BOTTOM ACTION BAR ════════════ */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border-t border-slate-200/90 dark:border-slate-800 p-3 px-4 shadow-[0_-8px_24px_rgba(0,0,0,0.12)] flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] text-slate-400 font-bold block">Qiymət:</span>
          <span className="text-base font-black text-[#4f533b] dark:text-[#a3a886]">
            {product.cash_price}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            size="sm"
            variant={isFav ? "primary" : "outline"}
            onPress={() => toggleFavorite(product.id)}
            className={`w-10 h-10 rounded-xl ${isFav ? 'bg-[#4f533b]/15 text-[#4f533b]' : ''}`}
            aria-label="Bəyən"
          >
            <Heart className={`w-4 h-4 ${isFav ? 'fill-[#4f533b]' : ''}`} />
          </Button>
          <Button
            size="md"
            variant="primary"
            onPress={() => toggleCart(product)}
            className={`h-10 px-5 rounded-xl font-black text-xs text-white shadow-md flex items-center gap-1.5 active:scale-95 ${
              isInCart ? 'bg-[#3e4230]' : 'bg-[#4f533b] hover:bg-[#3e4230]'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>{isInCart ? 'Səbətdədir' : 'Səbətə at'}</span>
          </Button>
        </div>
      </div>

    </div>
  );
}
