import React, { useState, useEffect, useRef } from 'react';
import {
  View, Text, StyleSheet, ScrollView, RefreshControl,
  TouchableOpacity, TextInput, Dimensions, Animated, Easing
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { Search, Flame, Sparkles, ChevronRight, Zap, Award, ChevronUp } from 'lucide-react-native';
import Header from '../../src/components/Header';
import StoryRow from '../../src/components/StoryRow';
import BannerSlider from '../../src/components/BannerSlider';
import CategoryRow from '../../src/components/CategoryRow';
import ProductCard from '../../src/components/ProductCard';
import LogoLoader from '../../src/components/LogoLoader';
import { useTheme } from '../../src/context/ThemeContext';
import { fetchProducts, fetchCategories, fetchBanners, fetchMobileStories } from '../../src/api/client';
import { Product, Category, Banner, MobileStory } from '../../src/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function HomeScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const scrollViewRef = useRef<ScrollView>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [banners, setBanners] = useState<Banner[]>([]);
  const [stories, setStories] = useState<MobileStory[]>([]);
  const [initialLoading, setInitialLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const scrollAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(scrollAnim, {
      toValue: showScrollTop ? 1 : 0,
      duration: 250,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  }, [showScrollTop]);

  const handleScrollToTop = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    scrollViewRef.current?.scrollTo({ y: 0, animated: true });
  };

  const loadData = async () => {
    try {
      const [prods, cats, bans, stors] = await Promise.all([
        fetchProducts(),
        fetchCategories(),
        fetchBanners(),
        fetchMobileStories(),
      ]);
      setProducts(prods);
      setCategories(cats);
      setBanners(bans);
      setStories(stors);
    } catch (e) {
      console.error('Home load error:', e);
    } finally {
      setInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const flashDeals = products.filter(p => p.discount || p.discount_price).slice(0, 6);

  if (initialLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]} edges={[]}>
        <Header />
        <LogoLoader fullScreen message="TechnoMania hazırlanır..." />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={[]}>
      <Header />

      <View style={{ flex: 1 }}>
        <ScrollView
          ref={scrollViewRef}
          style={[styles.container, { backgroundColor: colors.background }]}
          contentContainerStyle={{ paddingBottom: 80 }}
          showsVerticalScrollIndicator={false}
          onScroll={(e) => {
            const y = e.nativeEvent.contentOffset.y;
            setShowScrollTop(y > 280);
          }}
          scrollEventThrottle={16}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f533b" />
          }
        >
          {/* Quick Search Bar Shortcut */}
          <TouchableOpacity
            style={[styles.searchBar, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => router.push('/(tabs)/search')}
          >
            <Search size={18} color="#4f533b" />
            <Text style={[styles.searchPlaceholder, { color: colors.textSecondary }]}>
              Məhsul, brend və ya model axtarın...
            </Text>
          </TouchableOpacity>

          {/* 1. Mobile App Stories Section */}
          <StoryRow stories={stories} />

          {/* 2. Centered Hero Banners */}
          <BannerSlider banners={banners} />

          {/* Categories Horizontal Circles (Level 1 only, deduplicated) */}
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Kateqoriyalar</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/catalog')}>
              <Text style={styles.seeAllText}>Hamısına bax</Text>
            </TouchableOpacity>
          </View>
          <CategoryRow categories={categories} />

          {/* Flash Deals Horizontal Carousel */}
          {flashDeals.length > 0 && (
            <View style={styles.flashSection}>
              <View style={styles.flashHeader}>
                <View style={styles.flashTitleRow}>
                  <View style={styles.flameIcon}>
                    <Flame size={18} color="#ffffff" />
                  </View>
                  <Text style={[styles.sectionTitle, { color: colors.text }]}>
                    Flaş Təkliflər
                  </Text>
                </View>
                <View style={styles.hotBadge}>
                  <Text style={styles.hotBadgeText}>Məhdud sayda</Text>
                </View>
              </View>

              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalScroll}
              >
                {flashDeals.map(item => (
                  <View key={item.id} style={{ width: 175 }}>
                    <ProductCard product={item} />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {/* All Products Endless / Unlimited 2-Column Grid */}
          <View style={styles.sectionHeader}>
            <View style={styles.titleWithIcon}>
              <Sparkles size={18} color="#4f533b" />
              <Text style={[styles.sectionTitle, { color: colors.text }]}>
                Bütün Məhsullar
              </Text>
            </View>
            <Text style={[styles.productCount, { color: colors.textMuted }]}>
              ({products.length} məhsul)
            </Text>
          </View>

          <View style={styles.productGrid}>
            {products.map(item => (
              <View key={item.id} style={styles.gridItem}>
                <ProductCard product={item} />
              </View>
            ))}
          </View>

          {/* Bottom Spacing */}
          <View style={{ height: 110 }} />
        </ScrollView>

        {/* Floating Animated Scroll to Top Button */}
        <Animated.View
          pointerEvents={showScrollTop ? 'auto' : 'none'}
          style={[
            styles.floatingTopBtnWrapper,
            {
              opacity: scrollAnim,
              transform: [
                {
                  scale: scrollAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.6, 1],
                  }),
                },
                {
                  translateY: scrollAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.floatingTopBtn}
            activeOpacity={0.8}
            onPress={handleScrollToTop}
          >
            <ChevronUp size={22} color="#ffffff" strokeWidth={2.5} />
          </TouchableOpacity>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  floatingTopBtnWrapper: {
    position: 'absolute',
    bottom: 96,
    right: 18,
    zIndex: 999,
  },
  floatingTopBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 8,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  searchBar: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 4,
    height: 48,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  searchPlaceholder: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
  },
  titleWithIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
    color: '#4f533b',
  },
  productCount: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  flashSection: {
    marginTop: 16,
  },
  flashHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  flashTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  flameIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#e11d48',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hotBadge: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  hotBadgeText: {
    color: '#e11d48',
    fontSize: 9.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  horizontalScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 16,
    gap: 12,
    marginTop: 4,
  },
  gridItem: {
    width: (SCREEN_WIDTH - 44) / 2,
  },
  brandsSection: {
    marginTop: 18,
  },
  brandList: {
    paddingHorizontal: 16,
    gap: 10,
    paddingVertical: 10,
  },
  brandChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  brandText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  advantagesCard: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  advantagesHeaderTitle: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  advantagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  advantageItem: {
    width: (SCREEN_WIDTH - 64) / 2,
    borderRadius: 14,
    borderWidth: 1,
    padding: 10,
    gap: 4,
  },
  advantageItemTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    marginTop: 2,
  },
  advantageItemDesc: {
    fontSize: 10,
    fontWeight: '500',
  },
});
