import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Dimensions,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import {
  Search,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  ArrowRight,
  X,
  Package,
  Layers,
  Flame,
  Tag,
  SlidersHorizontal,
} from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { fetchCategories, fetchProducts, fetchBrands } from '../../src/api/client';
import { Category, Product } from '../../src/types';
import { renderCategoryIcon, getCategoryPriority } from '../../src/components/CategoryRow';
import LogoLoader from '../../src/components/LogoLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 8 Palette variations for stylish category row cards
const CARD_PALETTES = [
  { bg: '#f4f6ee', border: '#e2e8db', iconBg: '#e9ede0', accent: '#4f533b' },
  { bg: '#f0fdf4', border: '#dcfce7', iconBg: '#dcfce7', accent: '#16a34a' },
  { bg: '#f5f3ff', border: '#ede9fe', iconBg: '#ede9fe', accent: '#7c3aed' },
  { bg: '#fffbeb', border: '#fef3c7', iconBg: '#fef3c7', accent: '#d97706' },
  { bg: '#f0f9ff', border: '#e0f2fe', iconBg: '#e0f2fe', accent: '#0284c7' },
  { bg: '#fff1f2', border: '#ffe4e6', iconBg: '#ffe4e6', accent: '#e11d48' },
  { bg: '#fdf2f8', border: '#fce7f3', iconBg: '#fce7f3', accent: '#db2777' },
  { bg: '#f8fafc', border: '#e2e8f0', iconBg: '#e2e8f0', accent: '#334155' },
];

export default function CatalogScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // ── Hierarchical Drill-Down State ─────────────────────────────────────────
  // Step 1: Root list (selectedLevel1 is null)
  // Step 2: 2nd-level subcategories (selectedLevel1 is set, selectedLevel2 is null)
  // Step 3: 3rd-level / Brands list (both selectedLevel1 and selectedLevel2 are set)
  const [selectedLevel1, setSelectedLevel1] = useState<Category | null>(null);
  const [selectedLevel2, setSelectedLevel2] = useState<Category | null>(null);

  const topInset = Platform.OS === 'ios' ? Math.max(insets.top, 14) : insets.top > 0 ? insets.top : 10;

  useEffect(() => {
    Promise.all([fetchCategories(), fetchProducts(), fetchBrands()]).then(([cats, prods, brs]) => {
      setCategories(cats);
      setProducts(prods);
      setBrands(brs);
      setLoading(false);
    });
  }, []);

  // Level 1 Root Categories (deduplicated)
  const level1Categories = useMemo(() => {
    const seen = new Set<string>();
    return (categories || [])
      .filter(c => {
        const isRoot = !c.parent_id || c.parent_id === 'root' || c.parent_id === '' || c.level === 1;
        if (!isRoot) return false;
        const key = (c.slug || c.id || '').toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .sort((a, b) => getCategoryPriority(a) - getCategoryPriority(b));
  }, [categories]);

  // Level 2 Subcategories of current Level 1
  const level2Subcategories = useMemo(() => {
    if (!selectedLevel1) return [];

    const directChildren = categories.filter(
      c => c.parent_id === selectedLevel1.id || (c.parent_id && c.parent_id === selectedLevel1.slug)
    );
    if (directChildren.length > 0) return directChildren;

    // Fallback seed subcategories for major root categories if DB has no children
    const s = (selectedLevel1.slug || '').toLowerCase();
    if (s.includes('smart') || s.includes('phone')) {
      return [
        { id: 'sub-smartphones', name: 'Smartfonlar', slug: 'smartphones', icon: 'Smartphone' },
        { id: 'sub-tablets', name: 'Planşetlər', slug: 'tablets', icon: 'Smartphone' },
        { id: 'sub-watches', name: 'Smart Saatlar', slug: 'smart-watches', icon: 'Watch' },
        { id: 'sub-audio-acc', name: 'Qulaqlıqlar', slug: 'headphones', icon: 'Headphones' },
        { id: 'sub-powerbanks', name: 'Powerbank və Adapterlər', slug: 'powerbanks', icon: 'Sparkles' },
      ];
    }
    if (s.includes('laptop') || s.includes('pc') || s.includes('noutbuk')) {
      return [
        { id: 'sub-laptops', name: 'Noutbuklar', slug: 'laptops', icon: 'Laptop' },
        { id: 'sub-gaming-laptops', name: 'Gaming Noutbuklar', slug: 'gaming-laptops', icon: 'Laptop' },
        { id: 'sub-monitors', name: 'Monitorlar', slug: 'monitors', icon: 'Tv' },
        { id: 'sub-pc-parts', name: 'Kompüter Hissələri', slug: 'pc-parts', icon: 'Layers' },
        { id: 'sub-pc-acc', name: 'Siçan və Klaviaturalar', slug: 'pc-accessories', icon: 'Laptop' },
      ];
    }
    if (s.includes('tv') || s.includes('audio') || s.includes('televizor')) {
      return [
        { id: 'sub-tvs', name: 'Televizorlar', slug: 'tv-audio', icon: 'Tv' },
        { id: 'sub-soundbars', name: 'Saundbar və Akustika', slug: 'soundbars', icon: 'Headphones' },
        { id: 'sub-projectors', name: 'Proyektorlar', slug: 'projectors', icon: 'Tv' },
      ];
    }
    if (s.includes('climate') || s.includes('iqlim') || s.includes('kondisioner')) {
      return [
        { id: 'sub-ac', name: 'Kondisionerlər', slug: 'air-conditioners', icon: 'Wind' },
        { id: 'sub-heaters', name: 'Qızdırıcılar', slug: 'heaters', icon: 'Flame' },
        { id: 'sub-fans', name: 'Ventilyatorlar', slug: 'fans', icon: 'Wind' },
      ];
    }
    if (s.includes('meiset') || s.includes('məişət') || s.includes('appliances') || s.includes('home')) {
      return [
        { id: 'sub-washers', name: 'Paltaryuyanlar', slug: 'washing-machines', icon: 'Layers' },
        { id: 'sub-fridges', name: 'Soyuducular', slug: 'refrigerators', icon: 'Package' },
        { id: 'sub-vacuums', name: 'Tozsoranlar', slug: 'vacuum-cleaners', icon: 'Sparkles' },
        { id: 'sub-kitchen', name: 'Mətbəx Texnikası', slug: 'kitchen-appliances', icon: 'Coffee' },
      ];
    }
    return [];
  }, [selectedLevel1, categories]);

  // Level 3 Subcategories of current Level 2
  const level3Subcategories = useMemo(() => {
    if (!selectedLevel2) return [];
    return categories.filter(
      c => c.parent_id === selectedLevel2.id || (c.parent_id && c.parent_id === selectedLevel2.slug)
    );
  }, [selectedLevel2, categories]);

  // Brands applicable to the selected category / subcategory
  const categoryBrands = useMemo(() => {
    const targetSlug = (selectedLevel2?.slug || selectedLevel1?.slug || '').toLowerCase();
    const targetName = (selectedLevel2?.name || selectedLevel1?.name || '').toLowerCase();

    // 1. Extract brands from products matching category
    const relevantProducts = products.filter(p => {
      if (!targetSlug && !targetName) return true;
      const pCat = (p.category_name || '').toLowerCase();
      const pCatId = (p.category_id || '').toLowerCase();
      return pCat.includes(targetSlug) || pCatId.includes(targetSlug) || targetSlug.includes(pCat) || pCat.includes(targetName);
    });

    const productBrands = Array.from(new Set(relevantProducts.map(p => p.brand).filter(Boolean)));

    if (productBrands.length > 0) {
      return productBrands.map(bName => {
        const count = relevantProducts.filter(p => (p.brand || '').toLowerCase() === bName.toLowerCase()).length;
        const brandObj = brands.find(b => (b.name || '').toLowerCase() === bName.toLowerCase());
        return {
          name: bName,
          count,
          logo: brandObj?.logo_url || null,
        };
      });
    }

    // Default popular brands if none strictly mapped
    const popularNames = ['Apple', 'Samsung', 'Xiaomi', 'Sony', 'Asus', 'Lenovo', 'HP', 'LG', 'Bosch', 'Philips', 'Dyson'];
    return popularNames.map(bName => {
      const brandObj = brands.find(b => (b.name || '').toLowerCase() === bName.toLowerCase());
      const count = products.filter(p => (p.brand || '').toLowerCase() === bName.toLowerCase()).length;
      return {
        name: bName,
        count: count || 3,
        logo: brandObj?.logo_url || null,
      };
    });
  }, [selectedLevel1, selectedLevel2, products, brands]);

  // Helper count of products for a category
  const getProductCountForCat = (catSlug?: string, catName?: string) => {
    if (!catSlug && !catName) return products.length;
    const s = (catSlug || '').toLowerCase();
    const n = (catName || '').toLowerCase();
    return products.filter(p => {
      const pCat = (p.category_name || '').toLowerCase();
      const pCatId = (p.category_id || '').toLowerCase();
      return pCat.includes(s) || pCatId.includes(s) || s.includes(pCat) || (n && pCat.includes(n));
    }).length;
  };

  // ── Hierarchical Drill-Down State & Animated Navigation ─────────────────
  const [navDirection, setNavDirection] = useState<'forward' | 'back'>('forward');
  const animValue = useRef(new Animated.Value(1)).current;

  const triggerTransition = (direction: 'forward' | 'back', updateState: () => void) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    setNavDirection(direction);
    animValue.setValue(0);
    updateState();
    Animated.timing(animValue, {
      toValue: 1,
      duration: 220,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  };

  const handleSelectLevel1 = (cat: Category) => {
    triggerTransition('forward', () => {
      setSelectedLevel1(cat);
      setSelectedLevel2(null);
    });
  };

  const handleSelectLevel2 = (subCat: Category) => {
    triggerTransition('forward', () => {
      setSelectedLevel2(subCat);
    });
  };

  const handleBackToLevel1 = () => {
    triggerTransition('back', () => {
      setSelectedLevel2(null);
    });
  };

  const handleBackToRoot = () => {
    triggerTransition('back', () => {
      setSelectedLevel1(null);
      setSelectedLevel2(null);
    });
  };

  const handleSearchAllInCurrentCat = (cat: Category) => {
    router.push({
      pathname: '/category/[slug]',
      params: { slug: cat.slug, name: cat.name },
    });
  };

  const handleSelectBrand = (brandName: string) => {
    const activeCat = selectedLevel2 || selectedLevel1;
    router.push({
      pathname: '/category/[slug]',
      params: {
        slug: activeCat?.slug || 'all',
        name: activeCat ? `${activeCat.name} - ${brandName}` : brandName,
        brand: brandName,
      },
    });
  };

  // Filtered search inside current level
  const filteredLevel1 = useMemo(() => {
    if (!searchQuery.trim()) return level1Categories;
    const q = searchQuery.toLowerCase();
    return level1Categories.filter(c => (c.name || '').toLowerCase().includes(q) || (c.slug || '').toLowerCase().includes(q));
  }, [level1Categories, searchQuery]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
        <View style={{ paddingTop: topInset }} />
        <LogoLoader fullScreen message="Kataloq yüklənir..." />
      </SafeAreaView>
    );
  }

  const contentTranslateX = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [navDirection === 'forward' ? 24 : -24, 0],
  });

  const contentOpacity = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  const contentScale = animValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.985, 1],
  });

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
      {/* ── Top App Header Bar ────────────────────────────────────────────── */}
      <View style={[styles.headerContainer, { backgroundColor: colors.card, borderBottomColor: colors.border, paddingTop: topInset }]}>
        <View style={styles.headerRow}>
          {selectedLevel2 ? (
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.7}
              onPress={handleBackToLevel1}
            >
              <ChevronLeft size={22} color="#4f533b" />
              <Text style={styles.backBtnText}>Geri</Text>
            </TouchableOpacity>
          ) : selectedLevel1 ? (
            <TouchableOpacity
              style={styles.backBtn}
              activeOpacity={0.7}
              onPress={handleBackToRoot}
            >
              <ChevronLeft size={22} color="#4f533b" />
              <Text style={styles.backBtnText}>Kataloq</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.titleRow}>
              <View style={styles.titleBadge}>
                <Layers size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Kataloq</Text>
                <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
                  {level1Categories.length} əsas kateqoriya
                </Text>
              </View>
            </View>
          )}

          {/* Current Drill-down title when navigated */}
          {(selectedLevel1 || selectedLevel2) && (
            <Animated.View style={[styles.currentNavHeader, { opacity: contentOpacity }]}>
              <Text style={[styles.currentNavTitle, { color: colors.text }]} numberOfLines={1}>
                {selectedLevel2 ? selectedLevel2.name : selectedLevel1?.name}
              </Text>
              <Text style={[styles.currentNavSub, { color: colors.textSecondary }]}>
                {selectedLevel2 ? 'Brendlər və alt seçimlər' : 'Alt kateqoriyanı seçin'}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Search Filter Bar */}
        {!selectedLevel1 && (
          <View style={[styles.searchBox, { backgroundColor: colors.background, borderColor: colors.border }]}>
            <Search size={17} color="#4f533b" />
            <TextInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Kateqoriyalar üzrə axtar..."
              placeholderTextColor={colors.textSecondary}
              style={[styles.searchInput, { color: colors.text }]}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={16} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>

      {/* ── Main Dynamic Drill-Down View with Animated Transitions ────────── */}
      <Animated.View
        style={{
          flex: 1,
          opacity: contentOpacity,
          transform: [
            { translateX: contentTranslateX },
            { scale: contentScale },
          ],
        }}
      >
        {/* ========================================================================= */}
        {/* STEP 1: Root Level-1 Categories List */}
        {/* ========================================================================= */}
        {!selectedLevel1 && (
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.listContainer}>
              {filteredLevel1.map((cat, idx) => {
                const palette = CARD_PALETTES[idx % CARD_PALETTES.length];
                const prodCount = getProductCountForCat(cat.slug, cat.name);

                return (
                  <TouchableOpacity
                    key={cat.id || cat.slug}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectLevel1(cat)}
                  >
                    {/* Icon container */}
                    <View style={[styles.cardIconBox, { backgroundColor: palette.iconBg }]}>
                      {renderCategoryIcon(cat.icon, cat.slug, cat.name, cat.icon_url, palette.accent, 24)}
                    </View>

                    {/* Info */}
                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {cat.name}
                      </Text>
                      <Text style={[styles.cardCount, { color: colors.textSecondary }]}>
                        {prodCount > 0 ? `${prodCount} məhsul` : 'Bütün çeşidlər'}
                      </Text>
                    </View>

                    {/* Arrow */}
                    <View style={[styles.cardChevron, { backgroundColor: colors.background }]}>
                      <ChevronRight size={18} color="#4f533b" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
            <View style={{ height: 100 }} />
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* STEP 2: Level-2 Subcategories List */}
        {/* ========================================================================= */}
        {selectedLevel1 && !selectedLevel2 && (
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Category Hero Banner Card */}
            <View style={[styles.heroCatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.heroCatIcon}>
                {renderCategoryIcon(selectedLevel1.icon, selectedLevel1.slug, selectedLevel1.name, selectedLevel1.icon_url, '#4f533b', 28)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroCatTitle, { color: colors.text }]}>{selectedLevel1.name}</Text>
                <Text style={[styles.heroCatSub, { color: colors.textSecondary }]}>
                  {level2Subcategories.length} alt-kateqoriya mövcuddur
                </Text>
              </View>
            </View>

            {/* View All Products in Category CTA Banner */}
            <TouchableOpacity
              style={styles.viewAllCatBanner}
              activeOpacity={0.88}
              onPress={() => handleSearchAllInCurrentCat(selectedLevel1)}
            >
              <View style={styles.viewAllIconBox}>
                <Package size={18} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.viewAllTitle}>
                  Bütün {selectedLevel1.name} Məhsulları
                </Text>
                <Text style={styles.viewAllSub}>
                  Kateqoriya üzrə bütün çeşidlərə baxın
                </Text>
              </View>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>

            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              ALT KATEQORİYALAR
            </Text>

            <View style={styles.listContainer}>
              {level2Subcategories.map((subCat, idx) => {
                const palette = CARD_PALETTES[(idx + 2) % CARD_PALETTES.length];
                const subCount = getProductCountForCat(subCat.slug, subCat.name);

                return (
                  <TouchableOpacity
                    key={subCat.id || subCat.slug}
                    style={[
                      styles.categoryCard,
                      {
                        backgroundColor: colors.card,
                        borderColor: colors.border,
                      },
                    ]}
                    activeOpacity={0.7}
                    onPress={() => handleSelectLevel2(subCat)}
                  >
                    <View style={[styles.cardIconBox, { backgroundColor: palette.iconBg }]}>
                      {renderCategoryIcon(subCat.icon, subCat.slug, subCat.name, subCat.icon_url, palette.accent, 22)}
                    </View>

                    <View style={styles.cardInfo}>
                      <Text style={[styles.cardTitle, { color: colors.text }]}>
                        {subCat.name}
                      </Text>
                      <Text style={[styles.cardCount, { color: colors.textSecondary }]}>
                        {subCount > 0 ? `${subCount} məhsul` : 'Modellər və brendlər'}
                      </Text>
                    </View>

                    <View style={[styles.cardChevron, { backgroundColor: colors.background }]}>
                      <ChevronRight size={18} color="#4f533b" />
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>
        )}

        {/* ========================================================================= */}
        {/* STEP 3: Level-3 Subcategories + Brands Screen */}
        {/* ========================================================================= */}
        {selectedLevel2 && (
          <ScrollView
            style={styles.scrollList}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Level 2 Subcategory Banner */}
            <View style={[styles.heroCatCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.heroCatIcon}>
                {renderCategoryIcon(selectedLevel2.icon, selectedLevel2.slug, selectedLevel2.name, selectedLevel2.icon_url, '#4f533b', 26)}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.heroCatTitle, { color: colors.text }]}>{selectedLevel2.name}</Text>
                <Text style={[styles.heroCatSub, { color: colors.textSecondary }]}>
                  {selectedLevel1?.name} / {selectedLevel2.name}
                </Text>
              </View>
            </View>

            {/* View All Products in Subcategory CTA Banner */}
            <TouchableOpacity
              style={styles.viewAllCatBanner}
              activeOpacity={0.88}
              onPress={() => handleSearchAllInCurrentCat(selectedLevel2)}
            >
              <View style={styles.viewAllIconBox}>
                <Package size={18} color="#ffffff" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.viewAllTitle}>
                  Bütün {selectedLevel2.name} Məhsulları
                </Text>
                <Text style={styles.viewAllSub}>
                  Bu alt-kateqoriyadakı bütün çeşidlərə baxın
                </Text>
              </View>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>

            {/* 3rd Level Subcategories (if any) */}
            {level3Subcategories.length > 0 && (
              <View style={{ marginBottom: 8 }}>
                <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
                  ALT SEÇİMLƏR
                </Text>
                <View style={styles.listContainer}>
                  {level3Subcategories.map((lvl3, idx) => (
                    <TouchableOpacity
                      key={lvl3.id || lvl3.slug}
                      style={[styles.categoryCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                      activeOpacity={0.7}
                      onPress={() => handleSearchAllInCurrentCat(lvl3)}
                    >
                      <View style={[styles.cardIconBox, { backgroundColor: '#f4f6ee' }]}>
                        <Sparkles size={20} color="#4f533b" />
                      </View>
                      <View style={styles.cardInfo}>
                        <Text style={[styles.cardTitle, { color: colors.text }]}>{lvl3.name}</Text>
                        <Text style={[styles.cardCount, { color: colors.textSecondary }]}>Bütün modellər</Text>
                      </View>
                      <ChevronRight size={18} color="#4f533b" />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Brands Section for this category */}
            <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>
              MƏŞHUR BRENDLƏR
            </Text>

            <View style={styles.brandsGrid}>
              {categoryBrands.map((b) => (
                <TouchableOpacity
                  key={b.name}
                  style={[styles.brandCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                  activeOpacity={0.75}
                  onPress={() => handleSelectBrand(b.name)}
                >
                  <View style={styles.brandBadgeIcon}>
                    <Tag size={16} color="#4f533b" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.brandName, { color: colors.text }]} numberOfLines={1}>
                      {b.name}
                    </Text>
                    <Text style={[styles.brandCount, { color: colors.textSecondary }]}>
                      {b.count} məhsul
                    </Text>
                  </View>
                  <ChevronRight size={16} color="#94a3b8" />
                </TouchableOpacity>
              ))}
            </View>

            <View style={{ height: 110 }} />
          </ScrollView>
        )}
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    gap: 12,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 44,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  titleBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.4,
  },
  headerSubtitle: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 1,
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    backgroundColor: '#f4f6ee',
    gap: 2,
  },
  backBtnText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#4f533b',
  },
  currentNavHeader: {
    flex: 1,
    alignItems: 'flex-end',
    paddingLeft: 10,
  },
  currentNavTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'right',
  },
  currentNavSub: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'right',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    borderRadius: 14,
    borderWidth: 1,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    paddingVertical: 0,
  },
  scrollList: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 12,
  },
  listContainer: {
    gap: 10,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    gap: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  cardIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.2,
  },
  cardCount: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  cardChevron: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroCatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    gap: 14,
    marginBottom: 6,
  },
  heroCatIcon: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: '#f4f6ee',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8db',
  },
  heroCatTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.3,
  },
  heroCatSub: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 0.5,
    marginTop: 8,
    marginBottom: 4,
    paddingHorizontal: 4,
  },
  brandsGrid: {
    gap: 10,
  },
  brandCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    gap: 12,
  },
  brandBadgeIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#f4f6ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  brandCount: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 1,
  },
  viewAllCatBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#4f533b',
    gap: 12,
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 4,
  },
  viewAllIconBox: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewAllTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#ffffff',
    letterSpacing: -0.2,
  },
  viewAllSub: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    color: 'rgba(255, 255, 255, 0.85)',
    marginTop: 2,
  },
});

