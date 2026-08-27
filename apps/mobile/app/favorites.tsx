import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { ArrowLeft, Heart, Trash2, Sparkles, ArrowRight, ShoppingBag } from 'lucide-react-native';
import { useTheme } from '../src/context/ThemeContext';
import { useWishlist } from '../src/context/WishlistContext';
import { fetchProducts } from '../src/api/client';
import { Product } from '../src/types';
import NativeBackButton from '../src/components/NativeBackButton';
import ProductCard from '../src/components/ProductCard';
import LogoLoader from '../src/components/LogoLoader';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { favorites, toggleFavorite } = useWishlist();

  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const topInset = Platform.OS === 'ios' ? Math.max(insets.top, 14) : insets.top > 0 ? insets.top : 10;

  useEffect(() => {
    fetchProducts().then(prods => {
      setAllProducts(prods);
      setLoading(false);
    });
  }, []);

  const favoriteProducts = allProducts.filter(p => favorites.includes(p.id));

  const handleClearAll = () => {
    Alert.alert(
      'Sevimliləri Təmizlə',
      'Bütün bəyənilən məhsullar siyahıdan silinsin?',
      [
        { text: 'Xeyr', style: 'cancel' },
        {
          text: 'Bəli, Təmizlə',
          style: 'destructive',
          onPress: () => {
            favorites.forEach(id => toggleFavorite(id));
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={[]}>
      {/* ═══ HEADER ═══ */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topInset }]}>
        <NativeBackButton />

        <View style={styles.titleCenter}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Sevimlilərim</Text>
          {favorites.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{favorites.length}</Text>
            </View>
          )}
        </View>

        {favorites.length > 0 ? (
          <TouchableOpacity
            style={styles.clearBtn}
            onPress={handleClearAll}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            activeOpacity={0.7}
          >
            <Trash2 size={16} color="#ef4444" />
          </TouchableOpacity>
        ) : (
          <View style={{ width: 36 }} />
        )}
      </View>

      {/* ═══ BODY ═══ */}
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <LogoLoader message="Sevimli məhsullarınız hazırlanır..." />
        ) : favoriteProducts.length === 0 ? (
          /* EMPTY STATE */
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <Heart size={44} color="#ef4444" />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              Hələ heç bir məhsul bəyənməmisiniz
            </Text>
            <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
              Bəyəndiyiniz elektronika və cihazların üzərindəki ürək ikonuna klikləyərək onları burada toplaya bilərsiniz.
            </Text>
            <TouchableOpacity
              style={styles.exploreBtn}
              onPress={() => router.push('/(tabs)/catalog')}
              activeOpacity={0.88}
            >
              <Text style={styles.exploreBtnText}>Kataloqa Keç və Seç</Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>
        ) : (
          /* FAVORITE PRODUCTS GRID */
          <View style={styles.gridContainer}>
            <View style={styles.gridHeader}>
              <Text style={[styles.gridCountText, { color: colors.textSecondary }]}>
                Bəyənilən məhsullar: <Text style={{ color: colors.text, fontWeight: '800' }}>{favoriteProducts.length}</Text>
              </Text>
            </View>

            <View style={styles.grid}>
              {favoriteProducts.map(prod => (
                <View key={prod.id} style={styles.gridItem}>
                  <ProductCard product={prod} />
                </View>
              ))}
            </View>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.3,
  },
  countBadge: {
    backgroundColor: '#ef4444',
    borderRadius: 99,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  countBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  clearBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 80,
  },
  emptyIconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#fff1f2',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#fecdd3',
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 19,
    marginBottom: 24,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f533b',
    paddingHorizontal: 22,
    paddingVertical: 14,
    borderRadius: 14,
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  gridContainer: {
    width: '100%',
  },
  gridHeader: {
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  gridCountText: {
    fontSize: 13,
    fontFamily: 'Inter_600SemiBold',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (SCREEN_WIDTH - 38) / 2,
  },
});
