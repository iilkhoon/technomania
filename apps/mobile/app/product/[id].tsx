import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Share,
  Platform,
  TextInput,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  ArrowLeft,
  Heart,
  Share2,
  ShoppingBag,
  ShieldCheck,
  Truck,
  Sparkles,
  Check,
  ChevronRight,
  Zap,
  RotateCcw,
  Star,
  MessageSquare,
  HelpCircle,
  Plus,
  Tag,
  Flame,
  X,
  FileText,
  ThumbsUp,
  SlidersHorizontal,
  Layers,
  Send,
  Award,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../../src/context/ThemeContext';
import { useCart } from '../../src/context/CartContext';
import { useWishlist } from '../../src/context/WishlistContext';
import { useToast } from '../../src/context/ToastContext';
import { fetchProductById, fetchProducts, resolveImageUrl } from '../../src/api/client';
import { Product } from '../../src/types';
import LogoLoader from '../../src/components/LogoLoader';
import CheckoutModal from '../../src/components/CheckoutModal';
import ProductCard from '../../src/components/ProductCard';
import NativeBackButton from '../../src/components/NativeBackButton';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CREDIT_MONTHS = [6, 12, 18, 24];

interface ExtraService {
  id: string;
  name: string;
  desc: string;
  price: number;
  badge?: string;
}

const AVAILABLE_SERVICES: ExtraService[] = [
  {
    id: 'extra_warranty_1yr',
    name: 'Qızıl Zəmanət (+1 İl Rəsmi Zəmanət)',
    desc: 'İstehsalçı qüsurları, texniki servis və ehtiyat hissələrinə tam təminat',
    price: 39,
    badge: 'Tövsiyə olunur',
  },
  {
    id: 'screen_protection',
    name: '9D Ekran Qoruyucu Şüşə & Peşəkar Yapışdırma',
    desc: 'Zərbəyə və cızılmaya qarşı oleofob örtüklü premium temperli şüşə',
    price: 15,
    badge: 'Populyar',
  },
  {
    id: 'device_setup',
    name: 'İlkin Quraşdırma və Məlumat Köçürmə',
    desc: 'Köhnə telefondan kontakt, foto və tətbiqlərin peşəkar transferi',
    price: 25,
  },
  {
    id: 'vip_delivery',
    name: 'VIP Ekspress Çatdırılma (2 saat ərzində)',
    desc: 'Bakı və Abşeron ərazisində ən cəld fərdi kuryer çatdırılması',
    price: 10,
  },
];

interface CustomerReviewItem {
  id: string;
  author: string;
  rating: number;
  date: string;
  comment: string;
  verified: boolean;
  likes: number;
}

interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export default function ProductDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors } = useTheme();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite } = useWishlist();
  const { showToast } = useToast();

  const scrollViewRef = useRef<ScrollView>(null);
  const imageCarouselRef = useRef<ScrollView>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMonth, setSelectedMonth] = useState(12);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  const [checkoutVisible, setCheckoutVisible] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Active Tab for Technical Details / Reviews / FAQs
  const [detailTab, setDetailTab] = useState<'specs' | 'reviews' | 'faqs'>('specs');

  // Review Submission Modal
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewName, setNewReviewName] = useState('');
  const [newReviewComment, setNewReviewComment] = useState('');

  // FAQ Question Modal
  const [faqModalOpen, setFaqModalOpen] = useState(false);
  const [newFaqQuestion, setNewFaqQuestion] = useState('');
  const [newFaqName, setNewFaqName] = useState('');

  // Initial reviews
  const [reviewsList, setReviewsList] = useState<CustomerReviewItem[]>([
    {
      id: 'rev-1',
      author: 'Rəşad Əliyev',
      rating: 5,
      date: '12 Avqust 2026',
      comment: 'Məhsul əla keyfiyyətdədir. Çatdırılma cəmi 1 saata gəldi. Rəsmi qutuda və zəmanət talonu ilə təhvil verildi.',
      verified: true,
      likes: 14,
    },
    {
      id: 'rev-2',
      author: 'Nigar Məmmədova',
      rating: 5,
      date: '5 Avqust 2026',
      comment: 'Çox bəyəndim! Hissə-hissə ödənişlə aldım, heç bir faiz tutulmadı. Qızıl zəmanət xidmətini də əlavə etmişdim.',
      verified: true,
      likes: 9,
    },
    {
      id: 'rev-3',
      author: 'Elmir Həsənov',
      rating: 4,
      date: '28 İyul 2026',
      comment: 'Parametrləri tam yazıldığı kimidir, orijinal məhsuldur. Qablaşdırma çox səliqəli idi.',
      verified: true,
      likes: 6,
    },
  ]);

  // Initial FAQs
  const [faqsList, setFaqsList] = useState<FaqItem[]>([
    {
      id: 'faq-1',
      question: 'Məhsul orijinaldır və rəsmi zəmanəti varmı?',
      answer: 'Bəli, TechnoMania-da satılan bütün məhsullar 100% orijinaldır və 1 il rəsmi istehsalçı zəmanəti ilə təqdim olunur.',
    },
    {
      id: 'faq-2',
      question: '0% faizsiz hissə-hissə ödəniş (taksit) mümkündürmü?',
      answer: 'Bəli, Birkart, Tamkart, Bolkart və digər taksit kartları ilə 6, 12, 18 və 24 aylıq komissiyasız bərabər hissələrlə ala bilərsiniz.',
    },
    {
      id: 'faq-3',
      question: 'Bakı və regionlara çatdırılma necə həyata keçirilir?',
      answer: 'Bakı şəhəri daxilində eyni gün və ya 2 saatlıq VIP kuryerlə, regionlara isə 1-2 iş günü ərzində sürətli poçtla çatdırılır.',
    },
    {
      id: 'faq-4',
      question: 'Məhsulu bəyənmədikdə və ya qüsur olduqda qaytarmaq olarmı?',
      answer: '14 gün ərzində qüsursuz məhsul dəyişimi və ya tam geri qaytarılma hüququnuz qorunur.',
    },
  ]);

  const topInset = Platform.OS === 'ios' ? Math.max(insets.top, 14) : insets.top > 0 ? insets.top : 10;
  const bottomInset = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : insets.bottom > 0 ? insets.bottom : 12;

  useEffect(() => {
    if (id) {
      setLoading(true);
      setActiveImageIndex(0);
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      imageCarouselRef.current?.scrollTo({ x: 0, animated: false });
      fetchProducts().then(prods => {
        setAllProducts(prods || []);
        const found = (prods || []).find(p => p.id === id || p.model_name === id || p.name === id);
        if (found) {
          setProduct(found);
        } else {
          fetchProductById(id).then(setProduct);
        }
        setLoading(false);
      });
    }
  }, [id]);

  // Extract all product images from images array and primary image
  const productImages = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    const seen = new Set<string>();

    const addImg = (url: any) => {
      const resolved = resolveImageUrl(url);
      if (typeof resolved === 'string' && resolved.trim().length > 5 && !seen.has(resolved.trim())) {
        seen.add(resolved.trim());
        list.push(resolved.trim());
      }
    };

    if (product.image) addImg(product.image);

    let imgs = product.images;
    if (typeof imgs === 'string') {
      try { imgs = JSON.parse(imgs); } catch (e) { imgs = []; }
    }
    if (Array.isArray(imgs)) {
      imgs.forEach(addImg);
    }

    let colors = product.colors;
    if (typeof colors === 'string') {
      try { colors = JSON.parse(colors); } catch (e) { colors = []; }
    }
    if (Array.isArray(colors)) {
      colors.forEach((c: any) => {
        if (c?.image) addImg(c.image);
      });
    }

    if (list.length === 0) {
      list.push('https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500');
    }

    return list;
  }, [product]);

  // All Hooks must be at top level unconditionally
  const basePrice = useMemo(() => {
    if (!product) return 0;
    return typeof product.cash_price === 'number'
      ? product.cash_price
      : parseFloat(String(product.cash_price).replace(/[^\d.]/g, '')) || 0;
  }, [product]);

  const selectedServices = useMemo(() => {
    return AVAILABLE_SERVICES.filter(s => selectedServiceIds.includes(s.id));
  }, [selectedServiceIds]);

  const servicesTotal = useMemo(() => {
    return selectedServices.reduce((sum, s) => sum + s.price, 0);
  }, [selectedServices]);

  const totalPrice = basePrice + servicesTotal;
  const monthlyCalc = Math.round(totalPrice / selectedMonth);
  const isFav = product ? isFavorite(product.id) : false;

  // Similar Products from same category or brand
  const similarProducts = useMemo(() => {
    if (!product) return [];
    return allProducts
      .filter(p => p.id !== product.id && (p.category_id === product.category_id || p.brand === product.brand))
      .slice(0, 8);
  }, [allProducts, product]);

  // Generate structured specs if attributes are sparse
  const technicalSpecs = useMemo(() => {
    if (!product) return [];
    const specsMap: Record<string, string> = {
      'Brend': product.brand || 'TechnoMania Rəsmi',
      'Model': product.model_name || product.name,
      'Kateqoriya': product.category_name || 'Elektronika və Texnika',
      'Zəmanət Müddəti': '1 İl Rəsmi İstehsalçı Zəmanəti',
      'Orijinallıq': '100% Orijinal & Qlobal Versiya',
      'Çatdırılma': 'Ölkədaxili Qapıyadək Çatdırılma',
    };

    if (product.attributes && typeof product.attributes === 'object') {
      Object.entries(product.attributes).forEach(([k, v]) => {
        if (v) specsMap[k] = String(v);
      });
    }

    return Object.entries(specsMap);
  }, [product]);

  const stockCount = typeof product?.stock === 'number' ? product.stock : 12;
  const isLowStock = stockCount > 0 && stockCount <= 5;

  // Toggle Extra Service
  const toggleService = (serviceId: string) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setSelectedServiceIds(prev =>
      prev.includes(serviceId) ? prev.filter(s => s !== serviceId) : [...prev, serviceId]
    );
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `${product.model_name || product.name} — TechnoMania-da ${basePrice.toLocaleString()} ₼!`,
      });
    } catch (e) {}
  };

  const handleAddToCart = () => {
    if (!product) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (e) {}
    addToCart(product, 1);
    showToast(
      servicesTotal > 0
        ? `"${product.model_name || product.name}" (${selectedServices.length} xidmət ilə) səbətə əlavə edildi! 🛍️`
        : `"${product.model_name || product.name}" səbətə əlavə edildi! 🛍️`,
      'cart'
    );
  };

  const handleToggleFavorite = () => {
    if (!product) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    toggleFavorite(product.id);
    showToast(isFav ? 'Sevimlilərdən silindi' : 'Sevimlilərə əlavə edildi ❤️', 'info');
  };

  const handleSubmitReview = () => {
    if (!newReviewName.trim() || !newReviewComment.trim()) {
      Alert.alert('Diqqət', 'Zəhmət olmasa adınızı və rəyinizi qeyd edin.');
      return;
    }
    const newRev: CustomerReviewItem = {
      id: `rev-${Date.now()}`,
      author: newReviewName.trim(),
      rating: newReviewRating,
      date: 'Bu gün',
      comment: newReviewComment.trim(),
      verified: true,
      likes: 1,
    };
    setReviewsList(prev => [newRev, ...prev]);
    setNewReviewName('');
    setNewReviewComment('');
    setReviewModalOpen(false);
    showToast('Rəyiniz uğurla qeydə alındı! Təşəkkür edirik ✨', 'success');
  };

  const handleSubmitFaq = () => {
    if (!newFaqQuestion.trim()) {
      Alert.alert('Diqqət', 'Zəhmət olmasa sualınızı qeyd edin.');
      return;
    }
    const newF: FaqItem = {
      id: `faq-${Date.now()}`,
      question: newFaqQuestion.trim(),
      answer: 'Sualınız mütəxəssislərimizə yönləndirildi. Tezliklə rəsmi cavab burada dərc olunacaq.',
    };
    setFaqsList(prev => [newF, ...prev]);
    setNewFaqQuestion('');
    setNewFaqName('');
    setFaqModalOpen(false);
    showToast('Sualınız qeydə alındı! Tezliklə cavablandırılacaq 💬', 'success');
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
        <LogoLoader fullScreen message="Məhsul məlumatları yüklənir..." />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
        <View style={[styles.centerLoader, { paddingTop: topInset }]}>
          <Text style={[styles.notFoundText, { color: colors.text }]}>Məhsul tapılmadı</Text>
          <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
            <Text style={styles.backBtnText}>Geri qayıt</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={[]}>
      {/* ── Top Floating Navigation ────────────────────────────────────────── */}
      <View style={[styles.topBar, { borderBottomColor: colors.border, paddingTop: topInset }]}>
        <NativeBackButton />

        <Text style={[styles.navTitle, { color: colors.text }]} numberOfLines={1}>
          {product.brand}
        </Text>

        <View style={styles.topActions}>
          <TouchableOpacity style={styles.navIconBtn} onPress={handleShare} activeOpacity={0.7}>
            <Share2 size={18} color={colors.text} />
          </TouchableOpacity>

          <TouchableOpacity style={styles.navIconBtn} onPress={handleToggleFavorite} activeOpacity={0.7}>
            <Heart
              size={19}
              color={isFav ? '#ef4444' : colors.text}
              fill={isFav ? '#ef4444' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Hero Showcase with Dynamic Multi-Image Gallery ──────────────── */}
        <View style={[styles.showcaseCard, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
          {/* Swipeable Main Carousel */}
          <ScrollView
            ref={imageCarouselRef}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={(e) => {
              const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
              if (newIndex >= 0 && newIndex < productImages.length) {
                setActiveImageIndex(newIndex);
              }
            }}
            style={styles.carouselContainer}
          >
            {productImages.map((imgUrl, idx) => (
              <View key={`${imgUrl}-${idx}`} style={[styles.slideItem, { width: SCREEN_WIDTH }]}>
                <Image
                  source={{ uri: imgUrl }}
                  style={styles.mainImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Image Counter Badge if multiple images */}
          {productImages.length > 1 && (
            <View style={styles.imageCounterBadge}>
              <Text style={styles.imageCounterText}>
                {activeImageIndex + 1} / {productImages.length}
              </Text>
            </View>
          )}

          {/* Dynamic Floating Badges Row (Yeni, Son X ədəd, Endirim %, Rəsmi Zəmanət) */}
          <View style={styles.badgeRow}>
            {product.is_new ? (
              <View style={styles.newBadge}>
                <Sparkles size={11} color="#ffffff" />
                <Text style={styles.newText}>Yeni Model</Text>
              </View>
            ) : null}

            {isLowStock ? (
              <View style={styles.lowStockBadge}>
                <Flame size={12} color="#ffffff" />
                <Text style={styles.lowStockText}>Son {stockCount} ədəd!</Text>
              </View>
            ) : null}

            {Boolean(product.discount) ? (
              <View style={styles.discountBadge}>
                <Tag size={11} color="#ffffff" />
                <Text style={styles.discountText}>{String(product.discount)} Endirim</Text>
              </View>
            ) : null}

            <View style={styles.officialBadge}>
              <Award size={11} color="#ffffff" />
              <Text style={styles.officialText}>Rəsmi Zəmanət</Text>
            </View>
          </View>
        </View>

        {/* ── 1.1. Interactive Thumbnail Strip ───────────────────────────── */}
        {productImages.length > 1 && (
          <View style={[styles.thumbnailsWrapper, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.thumbnailsContainer}
            >
              {productImages.map((imgUrl, idx) => {
                const isSelected = activeImageIndex === idx;
                return (
                  <TouchableOpacity
                    key={`thumb-${idx}`}
                    onPress={() => {
                      try {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                      } catch (e) {}
                      setActiveImageIndex(idx);
                      imageCarouselRef.current?.scrollTo({
                        x: idx * SCREEN_WIDTH,
                        animated: true,
                      });
                    }}
                    activeOpacity={0.7}
                    style={[
                      styles.thumbnailBtn,
                      {
                        borderColor: isSelected ? '#4f533b' : colors.border,
                        backgroundColor: isSelected ? '#eaecdb' : colors.surface,
                        borderWidth: isSelected ? 2 : 1,
                      },
                    ]}
                  >
                    <Image
                      source={{ uri: imgUrl }}
                      style={styles.thumbnailImg}
                      resizeMode="contain"
                    />
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* ── 2. Product Title, Rating & Price Block ──────────────────────── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={styles.brandSubtitle}>{product.brand}</Text>
          <Text style={[styles.productTitle, { color: colors.text }]}>
            {product.model_name || product.name}
          </Text>

          {/* Rating Summary Row */}
          <View style={styles.ratingRow}>
            <View style={styles.ratingBadge}>
              <Star size={13} color="#f59e0b" fill="#f59e0b" />
              <Text style={styles.ratingScore}>4.9</Text>
            </View>
            <Text style={[styles.reviewCountText, { color: colors.textSecondary }]}>
              ({reviewsList.length} müştəri rəyi · {faqsList.length} sual)
            </Text>
          </View>

          {/* Stock Indicator */}
          <View style={styles.stockRow}>
            <View style={[styles.pulseDot, { backgroundColor: isLowStock ? '#f59e0b' : '#16a34a' }]} />
            <Text style={[styles.stockLabel, { color: isLowStock ? '#f59e0b' : '#16a34a' }]}>
              {isLowStock ? `Məhdud sayda — Cəmi ${stockCount} ədəd qalıb!` : `Stokda mövcuddur (${stockCount} ədəd)`}
            </Text>
          </View>

          {/* Tag Pills */}
          <View style={styles.tagsPillRow}>
            <View style={[styles.tagPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.tagPillText, { color: colors.textSecondary }]}>#OrijinalMəhsul</Text>
            </View>
            <View style={[styles.tagPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.tagPillText, { color: colors.textSecondary }]}>#0FaizTaksit</Text>
            </View>
            <View style={[styles.tagPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.tagPillText, { color: colors.textSecondary }]}>#SürətliÇatdırılma</Text>
            </View>
            <View style={[styles.tagPill, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Text style={[styles.tagPillText, { color: colors.textSecondary }]}>#1İlZəmanət</Text>
            </View>
          </View>

          {/* Price Block */}
          <View style={styles.priceRow}>
            <View style={styles.priceLeft}>
              <Text style={[styles.cashPrice, { color: colors.text }]}>
                {basePrice.toLocaleString()} ₼
              </Text>
              {Boolean(product.old_price) && (
                <Text style={styles.oldPrice}>
                  {String(product.old_price)} ₼
                </Text>
              )}
            </View>
            <View style={styles.vatBadge}>
              <Text style={styles.vatBadgeText}>ƏDV daxildir</Text>
            </View>
          </View>
        </View>

        {/* ── 3. Segmented Credit & Installment Calculator ─────────────────── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.creditTitleRow}>
            <Zap size={18} color="#4f533b" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>0% Faizsiz Hissə-Hissə Ödəniş</Text>
          </View>

          {/* Segmented Controller */}
          <View style={[styles.segmentContainer, { backgroundColor: colors.surface }]}>
            {CREDIT_MONTHS.map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.segmentBtn,
                  selectedMonth === m && [styles.activeSegmentBtn, { backgroundColor: colors.card }],
                ]}
                onPress={() => setSelectedMonth(m)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.segmentText,
                    selectedMonth === m && styles.activeSegmentText,
                  ]}
                >
                  {m} ay
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Result Highlight Box */}
          <View style={styles.creditCalcResult}>
            <View>
              <Text style={styles.calcIntroText}>0₼ İlkin Ödənişlə:</Text>
              <Text style={styles.calcSubText}>{selectedMonth} ay bərabər hissə ilə taksit</Text>
            </View>
            <Text style={styles.calcAmountText}>
              {monthlyCalc} ₼ <Text style={styles.calcMonthUnit}>/ay</Text>
            </Text>
          </View>
        </View>

        {/* ── 4. Interactive Extra Services Selection ─────────────────────── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.servicesHeaderRow}>
            <View style={styles.iconCircleSmall}>
              <ShieldCheck size={16} color="#ffffff" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>
                Əlavə Xidmət və Zəmanət Paketləri
              </Text>
              <Text style={[styles.sectionSub, { color: colors.textSecondary }]}>
                Məhsulunuzu tam qoruyun və peşəkar servis seçin
              </Text>
            </View>
          </View>

          <View style={styles.servicesList}>
            {AVAILABLE_SERVICES.map(service => {
              const isSelected = selectedServiceIds.includes(service.id);
              return (
                <TouchableOpacity
                  key={service.id}
                  style={[
                    styles.serviceCard,
                    {
                      backgroundColor: isSelected ? '#f4f6ee' : colors.surface,
                      borderColor: isSelected ? '#4f533b' : colors.border,
                    },
                  ]}
                  activeOpacity={0.8}
                  onPress={() => toggleService(service.id)}
                >
                  <View style={styles.serviceCheckbox}>
                    <View
                      style={[
                        styles.checkCircleBox,
                        {
                          backgroundColor: isSelected ? '#4f533b' : 'transparent',
                          borderColor: isSelected ? '#4f533b' : '#94a3b8',
                        },
                      ]}
                    >
                      {isSelected && <Check size={13} color="#ffffff" strokeWidth={3} />}
                    </View>
                  </View>

                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceNameRow}>
                      <Text style={[styles.serviceName, { color: colors.text }]} numberOfLines={1}>
                        {service.name}
                      </Text>
                      {service.badge ? (
                        <View style={styles.serviceBadge}>
                          <Text style={styles.serviceBadgeText}>{service.badge}</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text style={[styles.serviceDesc, { color: colors.textSecondary }]} numberOfLines={2}>
                      {service.desc}
                    </Text>
                  </View>

                  <View style={styles.servicePriceBox}>
                    <Text style={styles.servicePrice}>+{service.price} ₼</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── 5. Product Overview & Description ───────────────────────────── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.descTitleRow}>
            <FileText size={18} color="#4f533b" />
            <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 0 }]}>
              Məhsulun Təsviri və Təfərrüatları
            </Text>
          </View>

          <Text style={[styles.descriptionText, { color: colors.text }]}>
            {product.description ||
              `${product.model_name || product.name} ən müasir texnologiyalar və premium materiallarla istehsal edilmişdir. Yüksək məhsuldarlıq, zərif dizayn və uzunömürlü batareya ömrü ilə gündəlik istifadəniz üçün mükəmməl seçimdir. TechnoMania tərəfindən 100% orijinal keyfiyyət və rəsmi xidmət zəmanəti ilə təmin olunur.`}
          </Text>
        </View>

        {/* ── 6. Segmented Details: Specifications, Reviews, FAQs ─────────── */}
        <View style={[styles.sectionCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          {/* Segment Buttons */}
          <View style={[styles.tabBarRow, { backgroundColor: colors.surface }]}>
            <TouchableOpacity
              style={[styles.tabBtn, detailTab === 'specs' && [styles.activeTabBtn, { backgroundColor: colors.card }]]}
              onPress={() => setDetailTab('specs')}
              activeOpacity={0.7}
            >
              <SlidersHorizontal size={14} color={detailTab === 'specs' ? '#4f533b' : '#64748b'} />
              <Text style={[styles.tabText, detailTab === 'specs' && styles.activeTabText]}>
                Texniki Göstəricilər
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, detailTab === 'reviews' && [styles.activeTabBtn, { backgroundColor: colors.card }]]}
              onPress={() => setDetailTab('reviews')}
              activeOpacity={0.7}
            >
              <Star size={14} color={detailTab === 'reviews' ? '#4f533b' : '#64748b'} />
              <Text style={[styles.tabText, detailTab === 'reviews' && styles.activeTabText]}>
                Rəylər ({reviewsList.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.tabBtn, detailTab === 'faqs' && [styles.activeTabBtn, { backgroundColor: colors.card }]]}
              onPress={() => setDetailTab('faqs')}
              activeOpacity={0.7}
            >
              <HelpCircle size={14} color={detailTab === 'faqs' ? '#4f533b' : '#64748b'} />
              <Text style={[styles.tabText, detailTab === 'faqs' && styles.activeTabText]}>
                Sual-Cavab ({faqsList.length})
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: Technical Specs Grid */}
          {detailTab === 'specs' && (
            <View style={styles.specsContainer}>
              <View style={styles.specsGrid}>
                {technicalSpecs.map(([key, val], index) => (
                  <View
                    key={`${key}-${index}`}
                    style={[styles.specCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <Text style={styles.specCardKey}>{key}</Text>
                    <Text style={[styles.specCardVal, { color: colors.text }]}>{val}</Text>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 2: Customer Reviews */}
          {detailTab === 'reviews' && (
            <View style={styles.reviewsContainer}>
              {/* Rating Summary Card */}
              <View style={[styles.ratingOverviewCard, { backgroundColor: '#f4f6ee' }]}>
                <View style={styles.ratingScoreBigBox}>
                  <Text style={styles.ratingScoreBig}>4.9</Text>
                  <View style={styles.starsRow}>
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} size={15} color="#f59e0b" fill="#f59e0b" />
                    ))}
                  </View>
                  <Text style={styles.ratingTotalReviews}>{reviewsList.length} müştəri qiymətləndirməsi</Text>
                </View>

                <TouchableOpacity
                  style={styles.addReviewBtn}
                  activeOpacity={0.8}
                  onPress={() => setReviewModalOpen(true)}
                >
                  <MessageSquare size={14} color="#ffffff" />
                  <Text style={styles.addReviewBtnText}>Rəy Bildir</Text>
                </TouchableOpacity>
              </View>

              {/* Reviews List */}
              <View style={styles.reviewsList}>
                {reviewsList.map(rev => (
                  <View
                    key={rev.id}
                    style={[styles.reviewItemCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.reviewHeaderRow}>
                      <View style={styles.reviewerInfo}>
                        <View style={styles.reviewerAvatar}>
                          <Text style={styles.reviewerAvatarText}>{rev.author.charAt(0)}</Text>
                        </View>
                        <View>
                          <View style={styles.reviewerNameBox}>
                            <Text style={[styles.reviewerName, { color: colors.text }]}>{rev.author}</Text>
                            {rev.verified && (
                              <View style={styles.verifiedBuyerBadge}>
                                <Check size={10} color="#16a34a" />
                                <Text style={styles.verifiedBuyerText}>Təsdiqlənmiş Alıcı</Text>
                              </View>
                            )}
                          </View>
                          <Text style={styles.reviewDate}>{rev.date}</Text>
                        </View>
                      </View>

                      <View style={styles.starsSmallRow}>
                        {[...Array(rev.rating)].map((_, i) => (
                          <Star key={i} size={12} color="#f59e0b" fill="#f59e0b" />
                        ))}
                      </View>
                    </View>

                    <Text style={[styles.reviewComment, { color: colors.text }]}>{rev.comment}</Text>

                    <View style={styles.reviewFooterRow}>
                      <TouchableOpacity style={styles.likeBtn} activeOpacity={0.7}>
                        <ThumbsUp size={13} color="#64748b" />
                        <Text style={styles.likeCount}>{rev.likes} bəyənmə</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}

          {/* TAB 3: Q&A / FAQs */}
          {detailTab === 'faqs' && (
            <View style={styles.faqsContainer}>
              <View style={[styles.faqIntroCard, { backgroundColor: '#f4f6ee' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.faqIntroTitle}>Sualınız var?</Text>
                  <Text style={styles.faqIntroSub}>Məhsul haqqında sual verin, mütəxəssislərimiz cavablandırsın</Text>
                </View>
                <TouchableOpacity
                  style={styles.addFaqBtn}
                  activeOpacity={0.8}
                  onPress={() => setFaqModalOpen(true)}
                >
                  <Plus size={14} color="#ffffff" />
                  <Text style={styles.addFaqBtnText}>Sual Ver</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.faqsList}>
                {faqsList.map(faq => (
                  <View
                    key={faq.id}
                    style={[styles.faqCard, { backgroundColor: colors.surface, borderColor: colors.border }]}
                  >
                    <View style={styles.faqQuestionRow}>
                      <View style={styles.questionQBadge}>
                        <Text style={styles.questionQText}>S</Text>
                      </View>
                      <Text style={[styles.faqQuestionText, { color: colors.text }]}>{faq.question}</Text>
                    </View>
                    <View style={styles.faqAnswerRow}>
                      <View style={styles.answerABadge}>
                        <Text style={styles.answerAText}>C</Text>
                      </View>
                      <Text style={[styles.faqAnswerText, { color: colors.textSecondary }]}>{faq.answer}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>

        {/* ── 7. Trust & Guarantee Badges ─────────────────────────────────── */}
        <View style={styles.trustContainer}>
          <View style={[styles.trustBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <ShieldCheck size={22} color="#4f533b" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.trustTitle, { color: colors.text }]}>1 İl Rəsmi Zəmanət</Text>
              <Text style={[styles.trustDesc, { color: colors.textSecondary }]}>Orijinal istehsalçı və servis təminatı</Text>
            </View>
          </View>

          <View style={[styles.trustBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Truck size={22} color="#4f533b" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.trustTitle, { color: colors.text }]}>Sürətli Qapıyadək Çatdırılma</Text>
              <Text style={[styles.trustDesc, { color: colors.textSecondary }]}>Bakı və bütün regionlara kuryer xidməti</Text>
            </View>
          </View>

          <View style={[styles.trustBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <RotateCcw size={22} color="#4f533b" />
            <View style={{ flex: 1 }}>
              <Text style={[styles.trustTitle, { color: colors.text }]}>14 Gün Qaytarılma & Dəyişmə</Text>
              <Text style={[styles.trustDesc, { color: colors.textSecondary }]}>Qüsursuz məhsul dəyişimi hüququ</Text>
            </View>
          </View>
        </View>

        {/* ── 8. Similar / Related Products ───────────────────────────────── */}
        {similarProducts.length > 0 && (
          <View style={styles.similarSection}>
            <View style={styles.similarHeaderRow}>
              <View style={styles.similarTitleGroup}>
                <Layers size={18} color="#4f533b" />
                <Text style={[styles.similarTitle, { color: colors.text }]}>Bənzər Məhsullar</Text>
              </View>
              <Text style={[styles.similarCount, { color: colors.textSecondary }]}>
                {similarProducts.length} məhsul
              </Text>
            </View>

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.similarScrollContent}
            >
              {similarProducts.map(simProd => (
                <View key={simProd.id} style={{ width: 175 }}>
                  <ProductCard product={simProd} />
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Bottom Clearance Spacer ensures content never gets hidden behind sticky footer */}
        <View style={{ height: 130 + bottomInset }} />
      </ScrollView>

      {/* ── 9. Sticky Bottom Action Bar with Proper Inset & Service Price ─── */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: colors.card,
            borderTopColor: colors.border,
            paddingBottom: bottomInset,
          },
        ]}
      >
        <View style={styles.bottomPriceGroup}>
          <Text style={[styles.bottomPriceLabel, { color: colors.textSecondary }]}>
            {selectedServices.length > 0 ? `Yekun (+${selectedServices.length} xidmət):` : 'Nağd qiymət:'}
          </Text>
          <Text style={[styles.bottomPriceValue, { color: colors.text }]}>
            {totalPrice.toLocaleString()} ₼
          </Text>
          <Text style={styles.bottomCreditCalc}>
            və ya {monthlyCalc} ₼ / {selectedMonth} ay
          </Text>
        </View>

        <View style={styles.bottomButtons}>
          <TouchableOpacity
            style={[styles.addCartBtn, { borderColor: '#4f533b' }]}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <ShoppingBag size={18} color="#4f533b" />
            <Text style={styles.addCartText}>Səbətə at</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.fastBuyBtn}
            onPress={() => setCheckoutVisible(true)}
            activeOpacity={0.88}
          >
            <Text style={styles.fastBuyText}>1 Kliklə Al</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 10. Direct Checkout Modal ────────────────────────────────────── */}
      <CheckoutModal
        visible={checkoutVisible}
        onClose={() => setCheckoutVisible(false)}
        directProduct={product}
        selectedServices={selectedServices}
      />

      {/* ── 11. Write Review Modal ───────────────────────────────────────── */}
      <Modal
        visible={reviewModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReviewModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.reviewDialog, { backgroundColor: colors.card }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogTitle, { color: colors.text }]}>Məhsula Rəy Yaz</Text>
              <TouchableOpacity onPress={() => setReviewModalOpen(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.dialogSub, { color: colors.textSecondary }]}>
              {product.model_name || product.name}
            </Text>

            {/* Stars Selector */}
            <View style={styles.starPickerRow}>
              {[1, 2, 3, 4, 5].map(star => (
                <TouchableOpacity key={star} onPress={() => setNewReviewRating(star)} activeOpacity={0.7}>
                  <Star
                    size={28}
                    color="#f59e0b"
                    fill={star <= newReviewRating ? '#f59e0b' : 'transparent'}
                  />
                </TouchableOpacity>
              ))}
            </View>

            <TextInput
              style={[styles.inputField, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Adınız və soyadınız..."
              placeholderTextColor={colors.textSecondary}
              value={newReviewName}
              onChangeText={setNewReviewName}
            />

            <TextInput
              style={[
                styles.inputField,
                styles.textAreaField,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Məhsul haqqında təəssüratlarınız..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={newReviewComment}
              onChangeText={setNewReviewComment}
            />

            <TouchableOpacity style={styles.submitModalBtn} activeOpacity={0.85} onPress={handleSubmitReview}>
              <Send size={15} color="#ffffff" />
              <Text style={styles.submitModalBtnText}>Rəyi Dərc Et</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ── 12. Ask Question Modal ───────────────────────────────────────── */}
      <Modal
        visible={faqModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setFaqModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.reviewDialog, { backgroundColor: colors.card }]}>
            <View style={styles.dialogHeader}>
              <Text style={[styles.dialogTitle, { color: colors.text }]}>Məhsul Haqqında Sual Ver</Text>
              <TouchableOpacity onPress={() => setFaqModalOpen(false)}>
                <X size={20} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Text style={[styles.dialogSub, { color: colors.textSecondary }]}>
              {product.model_name || product.name}
            </Text>

            <TextInput
              style={[styles.inputField, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
              placeholder="Adınız..."
              placeholderTextColor={colors.textSecondary}
              value={newFaqName}
              onChangeText={setNewFaqName}
            />

            <TextInput
              style={[
                styles.inputField,
                styles.textAreaField,
                { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border },
              ]}
              placeholder="Sualınızı qeyd edin (məs: qutuda adapter varmı?)..."
              placeholderTextColor={colors.textSecondary}
              multiline
              numberOfLines={3}
              value={newFaqQuestion}
              onChangeText={setNewFaqQuestion}
            />

            <TouchableOpacity style={styles.submitModalBtn} activeOpacity={0.85} onPress={handleSubmitFaq}>
              <Send size={15} color="#ffffff" />
              <Text style={styles.submitModalBtnText}>Sualı Göndər</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
  },
  navIconBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  navTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  container: {
    flex: 1,
  },
  centerLoader: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 12,
  },
  backBtn: {
    backgroundColor: '#4f533b',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  backBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  showcaseCard: {
    height: 300,
    width: '100%',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    overflow: 'hidden',
  },
  carouselContainer: {
    width: '100%',
    height: '100%',
  },
  slideItem: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  mainImage: {
    width: '100%',
    height: '100%',
  },
  imageCounterBadge: {
    position: 'absolute',
    bottom: 12,
    right: 14,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
    zIndex: 10,
  },
  imageCounterText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  thumbnailsWrapper: {
    borderBottomWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  thumbnailsContainer: {
    gap: 8,
    alignItems: 'center',
  },
  thumbnailBtn: {
    width: 56,
    height: 56,
    borderRadius: 12,
    padding: 3,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  thumbnailImg: {
    width: '100%',
    height: '100%',
  },
  badgeRow: {
    position: 'absolute',
    top: 14,
    left: 14,
    right: 14,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  newBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4f533b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  newText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  lowStockBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f59e0b',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  lowStockText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  discountBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ef4444',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  officialBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#2563eb',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  officialText: {
    color: '#ffffff',
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  sectionCard: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    gap: 8,
  },
  brandSubtitle: {
    color: '#4f533b',
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 0.3,
  },
  productTitle: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    lineHeight: 23,
    letterSpacing: -0.2,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  ratingBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#fef3c7',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  ratingScore: {
    color: '#b45309',
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  reviewCountText: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  stockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 4,
  },
  pulseDot: {
    width: 7,
    height: 7,
    borderRadius: 99,
  },
  stockLabel: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  tagsPillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  tagPill: {
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  tagPillText: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  priceRow: {
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  priceLeft: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
  },
  cashPrice: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.5,
  },
  oldPrice: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#94a3b8',
    textDecorationLine: 'line-through',
  },
  vatBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  vatBadgeText: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#64748b',
  },
  cardTitle: {
    fontSize: 14.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.2,
  },
  creditTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
  },
  activeSegmentBtn: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  segmentText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#64748b',
  },
  activeSegmentText: {
    color: '#4f533b',
  },
  creditCalcResult: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f4f6ee',
    padding: 12,
    borderRadius: 12,
    marginTop: 6,
  },
  calcIntroText: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#4f533b',
  },
  calcSubText: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#64748b',
    marginTop: 1,
  },
  calcAmountText: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
  },
  calcMonthUnit: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  servicesHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 4,
  },
  iconCircleSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionSub: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 1,
  },
  servicesList: {
    gap: 8,
    marginTop: 4,
  },
  serviceCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 11,
    borderRadius: 12,
    borderWidth: 1.2,
    gap: 10,
  },
  serviceCheckbox: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkCircleBox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1.8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceInfo: {
    flex: 1,
    gap: 2,
  },
  serviceNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  serviceName: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_700Bold',
    flexShrink: 1,
  },
  serviceBadge: {
    backgroundColor: '#4f533b',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 6,
  },
  serviceBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  serviceDesc: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 14,
  },
  servicePriceBox: {
    paddingLeft: 4,
  },
  servicePrice: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
  },
  descTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  descriptionText: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 19,
  },
  tabBarRow: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    gap: 3,
    marginBottom: 6,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 9,
  },
  activeTabBtn: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  tabText: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#64748b',
  },
  activeTabText: {
    color: '#4f533b',
  },
  specsContainer: {
    marginTop: 4,
  },
  specsGrid: {
    gap: 6,
  },
  specCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
  },
  specCardKey: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#64748b',
    flex: 1,
  },
  specCardVal: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    flex: 1.2,
    textAlign: 'right',
  },
  reviewsContainer: {
    marginTop: 4,
    gap: 12,
  },
  ratingOverviewCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
  },
  ratingScoreBigBox: {
    gap: 3,
  },
  ratingScoreBig: {
    fontSize: 26,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 3,
  },
  ratingTotalReviews: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#64748b',
  },
  addReviewBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f533b',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  addReviewBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  reviewsList: {
    gap: 8,
  },
  reviewItemCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  reviewHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  reviewerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  reviewerAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewerAvatarText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  reviewerNameBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  reviewerName: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  verifiedBuyerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#dcfce7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  verifiedBuyerText: {
    color: '#15803d',
    fontSize: 9,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  reviewDate: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#94a3b8',
  },
  starsSmallRow: {
    flexDirection: 'row',
    gap: 1.5,
  },
  reviewComment: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_500Medium',
    lineHeight: 17,
  },
  reviewFooterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  likeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likeCount: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: '#64748b',
  },
  faqsContainer: {
    marginTop: 4,
    gap: 10,
  },
  faqIntroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  faqIntroTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
  },
  faqIntroSub: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_500Medium',
    color: '#64748b',
    marginTop: 1,
  },
  addFaqBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4f533b',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 9,
  },
  addFaqBtnText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  faqsList: {
    gap: 8,
  },
  faqCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
  },
  faqQuestionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  questionQBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  questionQText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  faqQuestionText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    flex: 1,
    lineHeight: 16,
  },
  faqAnswerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
    paddingLeft: 2,
  },
  answerABadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  answerAText: {
    color: '#334155',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  faqAnswerText: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_500Medium',
    flex: 1,
    lineHeight: 16,
  },
  trustContainer: {
    marginHorizontal: 16,
    marginTop: 12,
    gap: 8,
  },
  trustBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
  },
  trustTitle: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  trustDesc: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_500Medium',
    marginTop: 1,
  },
  similarSection: {
    marginTop: 16,
  },
  similarHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    marginBottom: 10,
  },
  similarTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  similarTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.2,
  },
  similarCount: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  similarScrollContent: {
    paddingHorizontal: 14,
    gap: 10,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    zIndex: 999,
  },
  bottomPriceGroup: {
    flex: 1,
  },
  bottomPriceLabel: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  bottomPriceValue: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.3,
  },
  bottomCreditCalc: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#4f533b',
  },
  bottomButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addCartBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  addCartText: {
    color: '#4f533b',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  fastBuyBtn: {
    backgroundColor: '#4f533b',
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  fastBuyText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  reviewDialog: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 22,
    padding: 20,
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },
  dialogHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dialogTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  dialogSub: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  starPickerRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 4,
  },
  inputField: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  textAreaField: {
    height: 80,
    textAlignVertical: 'top',
  },
  submitModalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f533b',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginTop: 4,
  },
  submitModalBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
