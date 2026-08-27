import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Dimensions
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ArrowLeft, SlidersHorizontal, ArrowUpDown, SearchX } from 'lucide-react-native';
import NativeBackButton from '../../src/components/NativeBackButton';
import ProductCard from '../../src/components/ProductCard';
import LogoLoader from '../../src/components/LogoLoader';
import { useTheme } from '../../src/context/ThemeContext';
import { fetchProducts } from '../../src/api/client';
import { Product } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type SortOption = 'popular' | 'price_asc' | 'price_desc';

export default function CategoryProductsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ slug: string; name?: string; brand?: string }>();
  const { colors } = useTheme();

  const topInset = Platform.OS === 'ios' ? Math.max(insets.top, 14) : insets.top > 0 ? insets.top : 10;

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [selectedBrand, setSelectedBrand] = useState<string | null>(params.brand || null);

  useEffect(() => {
    if (params.brand) {
      setSelectedBrand(params.brand);
    }
  }, [params.brand]);

  useEffect(() => {
    fetchProducts().then(all => {
      // Filter by category slug or category name
      const catSlug = (params.slug || '').toLowerCase();
      const filtered = all.filter(p => {
        const pCat = (p.category_name || '').toLowerCase();
        const pCatId = (p.category_id || '').toLowerCase();
        return pCat.includes(catSlug) || pCatId.includes(catSlug) || catSlug.includes(pCat);
      });
      setProducts(filtered.length > 0 ? filtered : all);
      setLoading(false);
    });
  }, [params.slug]);

  const brands = Array.from(new Set(products.map(p => p.brand).filter(Boolean)));

  let displayProducts = selectedBrand
    ? products.filter(p => p.brand.toLowerCase() === selectedBrand.toLowerCase())
    : products;

  if (sortBy === 'price_asc') {
    displayProducts = [...displayProducts].sort((a, b) => {
      const pa = typeof a.cash_price === 'number' ? a.cash_price : parseFloat(String(a.cash_price).replace(/[^\d.]/g, '')) || 0;
      const pb = typeof b.cash_price === 'number' ? b.cash_price : parseFloat(String(b.cash_price).replace(/[^\d.]/g, '')) || 0;
      return pa - pb;
    });
  } else if (sortBy === 'price_desc') {
    displayProducts = [...displayProducts].sort((a, b) => {
      const pa = typeof a.cash_price === 'number' ? a.cash_price : parseFloat(String(a.cash_price).replace(/[^\d.]/g, '')) || 0;
      const pb = typeof b.cash_price === 'number' ? b.cash_price : parseFloat(String(b.cash_price).replace(/[^\d.]/g, '')) || 0;
      return pb - pa;
    });
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={[]}>
      {/* Top Header */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topInset }]}>
        <NativeBackButton />
        <View style={styles.titleCol}>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            {params.name || 'Məhsullar'}
          </Text>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>
            {displayProducts.length} məhsul
          </Text>
        </View>
      </View>

      {/* Filter / Sort Chips */}
      <View style={[styles.filterBar, { backgroundColor: colors.card, borderBottomColor: colors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          {/* Sort button */}
          <TouchableOpacity
            style={[styles.chip, { backgroundColor: colors.surface, borderColor: colors.border }]}
            onPress={() => {
              if (sortBy === 'popular') setSortBy('price_asc');
              else if (sortBy === 'price_asc') setSortBy('price_desc');
              else setSortBy('popular');
            }}
          >
            <ArrowUpDown size={14} color="#4f533b" />
            <Text style={[styles.chipText, { color: colors.text }]}>
              {sortBy === 'popular' ? 'Məşhurluq' : sortBy === 'price_asc' ? 'Əvvəlcə ucuz' : 'Əvvəlcə baha'}
            </Text>
          </TouchableOpacity>

          {/* Brand filter chips */}
          {brands.map(b => (
            <TouchableOpacity
              key={b}
              style={[
                styles.chip,
                { backgroundColor: selectedBrand === b ? '#4f533b' : colors.surface, borderColor: selectedBrand === b ? '#4f533b' : colors.border },
              ]}
              onPress={() => setSelectedBrand(selectedBrand === b ? null : b)}
            >
              <Text style={[styles.chipText, { color: selectedBrand === b ? '#ffffff' : colors.text }]}>
                {b}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product Grid */}
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]} showsVerticalScrollIndicator={false}>
        {loading ? (
          <LogoLoader fullScreen message="Məhsullar hazırlanır..." />
        ) : displayProducts.length > 0 ? (
          <View style={styles.grid}>
            {displayProducts.map(prod => (
              <View key={prod.id} style={styles.gridItem}>
                <ProductCard product={prod} />
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.centerLoader}>
            <SearchX size={48} color={colors.textMuted} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Məhsul tapılmadı</Text>
          </View>
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCol: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  headerSub: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 1,
  },
  filterBar: {
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  filterScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  chipText: {
    fontSize: 12,
    fontWeight: '800',
  },
  container: {
    flex: 1,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 44) / 2,
  },
  centerLoader: {
    padding: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 12,
  },
});
