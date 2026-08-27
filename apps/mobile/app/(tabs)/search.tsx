import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import {
  Search,
  X,
  SlidersHorizontal,
  SearchX,
  RotateCcw,
  Sparkles,
  Check,
} from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import ProductCard from '../../src/components/ProductCard';
import LogoLoader from '../../src/components/LogoLoader';
import { useTheme } from '../../src/context/ThemeContext';
import { searchProducts, fetchCategories } from '../../src/api/client';
import { Product, Category } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const POPULAR_TAGS = [
  'iPhone 15',
  'Galaxy S24',
  'MacBook Pro',
  'PlayStation 5',
  'Tozsoran',
  'Qulaqlıq',
  'Smart Saat',
  'Kondisioner',
];

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ brand?: string; q?: string }>();

  const topInset = Platform.OS === 'ios' ? Math.max(insets.top, 14) : insets.top > 0 ? insets.top : 10;

  const [query, setQuery] = useState(params.q || '');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(params.brand || null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<'default' | 'price_asc' | 'price_desc' | 'popular'>('default');

  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCategories().then(setCategories);
  }, []);

  useEffect(() => {
    if (params.brand) setSelectedBrand(params.brand);
    if (params.q) setQuery(params.q);
  }, [params.brand, params.q]);

  // Execute Search & Filtering
  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      const res = await searchProducts(query.trim(), {
        brand: selectedBrand || undefined,
        categoryId: selectedCategory || undefined,
        minPrice: minPrice ? parseFloat(minPrice) : undefined,
        maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      });

      let sorted = [...(res?.hits || [])];
      if (onlyInStock) {
        sorted = sorted.filter(p => Number(p.stock) > 0);
      }
      if (sortBy === 'price_asc') {
        sorted.sort((a, b) => (Number(a.cash_price) || 0) - (Number(b.cash_price) || 0));
      } else if (sortBy === 'price_desc') {
        sorted.sort((a, b) => (Number(b.cash_price) || 0) - (Number(a.cash_price) || 0));
      } else if (sortBy === 'popular') {
        sorted.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));
      }

      setResults(sorted);
      setLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [query, selectedBrand, selectedCategory, minPrice, maxPrice, onlyInStock, sortBy]);

  const hasActiveFilters = Boolean(
    selectedBrand || selectedCategory || minPrice || maxPrice || onlyInStock || sortBy !== 'default'
  );

  const resetFilters = () => {
    setSelectedBrand(null);
    setSelectedCategory(null);
    setMinPrice('');
    setMaxPrice('');
    setOnlyInStock(false);
    setSortBy('default');
  };

  const allBrands = Array.from(new Set(results.map(p => p.brand).filter(Boolean)));

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={[]}>
      {/* ═══ CENTERED HEADER ═══ */}
      <View style={[styles.headerContainer, { borderBottomColor: colors.border, paddingTop: topInset }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Məhsul Axtarışı</Text>
      </View>

      {/* ═══ SEARCH INPUT BAR ═══ */}
      <View style={[styles.searchBarRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <Search size={18} color="#4f533b" />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder="Məhsul, brend və ya model axtarın..."
            placeholderTextColor={colors.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtn}>
              <X size={16} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Toggle Button */}
        <TouchableOpacity
          style={[styles.filterToggleBtn, hasActiveFilters && styles.activeFilterToggleBtn]}
          onPress={() => setIsFilterModalOpen(true)}
          activeOpacity={0.8}
        >
          <SlidersHorizontal size={18} color={hasActiveFilters ? '#ffffff' : '#4f533b'} />
        </TouchableOpacity>
      </View>

      {/* ═══ POPULAR SEARCH TAGS ═══ */}
      <View style={[styles.tagsRow, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tagsContent}>
          {selectedBrand && (
            <TouchableOpacity style={styles.activeTagBadge} onPress={() => setSelectedBrand(null)}>
              <Text style={styles.activeTagText}>Brend: {selectedBrand}</Text>
              <X size={12} color="#ffffff" />
            </TouchableOpacity>
          )}

          {selectedCategory && (
            <TouchableOpacity style={styles.activeTagBadge} onPress={() => setSelectedCategory(null)}>
              <Text style={styles.activeTagText}>Kateqoriya</Text>
              <X size={12} color="#ffffff" />
            </TouchableOpacity>
          )}

          {POPULAR_TAGS.map(tag => (
            <TouchableOpacity
              key={tag}
              style={[styles.tagChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => setQuery(tag)}
            >
              <Text style={[styles.tagText, { color: colors.text }]}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* ═══ SEARCH RESULTS BODY ═══ */}
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {loading ? (
          <LogoLoader message="Məhsullar axtarılır..." />
        ) : results.length > 0 ? (
          <View style={styles.resultsContainer}>
            <View style={styles.resultsHeader}>
              <Text style={[styles.resultsCount, { color: colors.textSecondary }]}>
                Tapılan məhsullar: <Text style={[styles.boldCount, { color: colors.text }]}>{results.length}</Text>
              </Text>
            </View>

            <View style={styles.grid}>
              {results.map(prod => (
                <View key={prod.id} style={styles.gridItem}>
                  <ProductCard product={prod} />
                </View>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.centerBox}>
            <SearchX size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Heç bir nəticə tapılmadı</Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              "{query}" üçün uyğun məhsul tapılmadı. Fərqli açar sözlərlə və ya filtrləri sıfırlayaraq yenidən yoxlayın.
            </Text>
            {hasActiveFilters && (
              <TouchableOpacity style={styles.resetFiltersBtn} onPress={resetFilters}>
                <RotateCcw size={15} color="#ffffff" />
                <Text style={styles.resetFiltersBtnText}>Filtrləri Sıfırla</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ MODERN FILTER MODAL ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal visible={isFilterModalOpen} animationType="slide" onRequestClose={() => setIsFilterModalOpen(false)}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.card }]} edges={[]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: topInset }]}>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Filtrlər və Çeşidləmə</Text>
            <TouchableOpacity onPress={() => setIsFilterModalOpen(false)} style={styles.modalCloseBtn}>
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.filterModalContent}>
            {/* Sort Options */}
            <View style={[styles.filterGroupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Çeşidləmə Qaydası</Text>
              <View style={styles.chipRow}>
                {[
                  { id: 'default', label: 'Tövsiyə olunan' },
                  { id: 'price_asc', label: 'Əvvəlcə ucuz' },
                  { id: 'price_desc', label: 'Əvvəlcə baha' },
                  { id: 'popular', label: 'Məşhurluq' },
                ].map(s => (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.filterChip,
                      sortBy === s.id && styles.filterChipActive,
                      { borderColor: colors.border, backgroundColor: colors.surface },
                    ]}
                    onPress={() => setSortBy(s.id as any)}
                  >
                    <Text style={[styles.filterChipText, sortBy === s.id && styles.filterChipTextActive]}>
                      {s.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Price Range */}
            <View style={[styles.filterGroupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Qiymət Aralığı (₼)</Text>
              <View style={styles.priceInputsRow}>
                <View style={[styles.priceInputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.priceInput, { color: colors.text }]}
                    placeholder="Min ₼"
                    placeholderTextColor={colors.textMuted}
                    value={minPrice}
                    onChangeText={setMinPrice}
                    keyboardType="numeric"
                  />
                </View>
                <Text style={{ color: colors.textSecondary }}>—</Text>
                <View style={[styles.priceInputBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.priceInput, { color: colors.text }]}
                    placeholder="Max ₼"
                    placeholderTextColor={colors.textMuted}
                    value={maxPrice}
                    onChangeText={setMaxPrice}
                    keyboardType="numeric"
                  />
                </View>
              </View>
            </View>

            {/* In Stock Switch */}
            <View style={[styles.filterGroupCard, styles.switchGroupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View>
                <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Yalnız Anbarda Olanlar</Text>
                <Text style={[styles.switchSub, { color: colors.textSecondary }]}>Mövcud məhsulları göstər</Text>
              </View>
              <Switch
                value={onlyInStock}
                onValueChange={setOnlyInStock}
                trackColor={{ false: '#cbd5e1', true: '#4f533b' }}
              />
            </View>

            {/* Category Select */}
            {categories.length > 0 && (
              <View style={[styles.filterGroupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Kateqoriya Seçimi</Text>
                <View style={styles.chipRow}>
                  {categories.slice(0, 10).map(cat => (
                    <TouchableOpacity
                      key={cat.id || cat.slug}
                      style={[
                        styles.filterChip,
                        selectedCategory === cat.slug && styles.filterChipActive,
                        { borderColor: colors.border, backgroundColor: colors.surface },
                      ]}
                      onPress={() => setSelectedCategory(selectedCategory === cat.slug ? null : cat.slug)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedCategory === cat.slug && styles.filterChipTextActive,
                        ]}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Brand Select */}
            {allBrands.length > 0 && (
              <View style={[styles.filterGroupCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Text style={[styles.filterGroupTitle, { color: colors.text }]}>Brendlər</Text>
                <View style={styles.chipRow}>
                  {allBrands.map(b => (
                    <TouchableOpacity
                      key={b}
                      style={[
                        styles.filterChip,
                        selectedBrand === b && styles.filterChipActive,
                        { borderColor: colors.border, backgroundColor: colors.surface },
                      ]}
                      onPress={() => setSelectedBrand(selectedBrand === b ? null : b)}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          selectedBrand === b && styles.filterChipTextActive,
                        ]}
                      >
                        {b}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}
          </ScrollView>

          {/* Modal Action Buttons */}
          <View style={[styles.modalBottomBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
            <TouchableOpacity style={styles.modalResetBtn} onPress={resetFilters}>
              <Text style={styles.modalResetText}>Sıfırla</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.modalApplyBtn}
              onPress={() => setIsFilterModalOpen(false)}
            >
              <Text style={styles.modalApplyText}>Nəticələri Göstər ({results.length})</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  searchBarRow: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 14,
    borderWidth: 1,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  clearBtn: {
    padding: 2,
  },
  filterToggleBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: '#f4f6ee',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8db',
  },
  activeFilterToggleBtn: {
    backgroundColor: '#4f533b',
    borderColor: '#4f533b',
  },
  tagsRow: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  tagsContent: {
    paddingHorizontal: 14,
    gap: 6,
  },
  activeTagBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#4f533b',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
  },
  activeTagText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  tagChip: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 99,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
  },
  container: {
    flex: 1,
  },
  resultsContainer: {
    padding: 14,
  },
  resultsHeader: {
    marginBottom: 10,
  },
  resultsCount: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
  },
  boldCount: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (SCREEN_WIDTH - 38) / 2,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  emptySub: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
  resetFiltersBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#4f533b',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginTop: 8,
  },
  resetFiltersBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // Modal Styles
  modalSafeArea: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  modalHeaderTitle: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    flex: 1,
    textAlign: 'center',
    marginLeft: 20,
  },
  modalCloseBtn: {
    padding: 4,
  },
  filterModalContent: {
    padding: 14,
    gap: 12,
  },
  filterGroupCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  switchGroupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  filterGroupTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  switchSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 2,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
  },
  filterChipActive: {
    backgroundColor: '#4f533b',
    borderColor: '#4f533b',
  },
  filterChipText: {
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  filterChipTextActive: {
    color: '#ffffff',
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  priceInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  priceInputBox: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  priceInput: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  modalBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
    borderTopWidth: 1,
  },
  modalResetBtn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  modalResetText: {
    color: '#dc2626',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  modalApplyBtn: {
    flex: 1,
    backgroundColor: '#4f533b',
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  modalApplyText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
});
