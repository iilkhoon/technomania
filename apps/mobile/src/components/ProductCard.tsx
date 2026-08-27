import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, DimensionValue } from 'react-native';
import { useRouter } from 'expo-router';
import { Heart, ShoppingBag, Scale, Sparkles } from 'lucide-react-native';
import { Product } from '../types';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useToast } from '../context/ToastContext';

import { resolveImageUrl } from '../api/client';

interface ProductCardProps {
  product: Product;
  width?: DimensionValue;
}

export default function ProductCard({ product, width }: ProductCardProps) {
  const router = useRouter();
  const { colors } = useTheme();
  const { addToCart } = useCart();
  const { isFavorite, toggleFavorite, isCompared, toggleCompare } = useWishlist();
  const { showToast } = useToast();

  const [selectedMonth, setSelectedMonth] = useState<number>(12);

  if (!product) return null;

  const resolvedImg = resolveImageUrl(product.image);

  const price = typeof product.cash_price === 'number'
    ? product.cash_price
    : parseFloat(String(product.cash_price || 0).replace(/[^\d.]/g, '')) || 0;

  const monthlyPrice = Math.round(price / selectedMonth);
  const isFav = isFavorite(product.id);
  const isComp = isCompared(product.id);

  const handlePress = () => {
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });
  };

  const handleToggleFavorite = (e: any) => {
    e?.stopPropagation?.();
    toggleFavorite(product.id);
    showToast(
      isFav ? 'Sevimlilərdən silindi' : 'Sevimlilərə əlavə edildi ❤️',
      'info'
    );
  };

  const handleToggleCompare = (e: any) => {
    e?.stopPropagation?.();
    toggleCompare(product.id);
    showToast(
      isComp ? 'Müqayisədən silindi' : 'Müqayisəyə əlavə edildi ⚖️',
      'info'
    );
  };

  const handleAddToCart = (e: any) => {
    e?.stopPropagation?.();
    addToCart(product, 1);
    showToast(`${product.model_name || product.name} səbətə əlavə edildi! 🛍️`, 'cart');
  };

  const hasDiscount = Boolean(product.discount && String(product.discount).trim());
  const isNew = Boolean(product.is_new);
  const stockCount = typeof product.stock === 'number' ? product.stock : parseInt(String(product.stock || 0), 10);
  const isLowStock = stockCount > 0 && stockCount < 10;
  const hasOldPrice = Boolean(product.old_price && String(product.old_price).trim());

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border },
        width ? { width } : { flex: 1 },
      ]}
      activeOpacity={0.88}
      onPress={handlePress}
    >
      {/* Top Badges & Side-by-Side Action Buttons (Compare & Favorite) */}
      <View style={styles.topRow}>
        <View style={styles.badgeGroup}>
          {hasDiscount ? (
            <View style={styles.discountBadge}>
              <Text style={styles.discountText}>{String(product.discount)}</Text>
            </View>
          ) : isNew ? (
            <View style={styles.newBadge}>
              <Text style={styles.newText}>YENİ</Text>
            </View>
          ) : null}

          {isLowStock ? (
            <View style={styles.lowStockBadge}>
              <Text style={styles.lowStockText}>{stockCount} ədəd</Text>
            </View>
          ) : null}
        </View>

        {/* Side-by-side action buttons: Compare (Scale) + Favorite (Heart) */}
        <View style={styles.actionsRow}>
          {/* Müqayisə Butonu */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isComp && styles.actionBtnActiveComp,
            ]}
            onPress={handleToggleCompare}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Scale
              size={13}
              color={isComp ? '#7c3aed' : '#64748b'}
            />
          </TouchableOpacity>

          {/* Sevimli Butonu */}
          <TouchableOpacity
            style={[
              styles.actionBtn,
              isFav && styles.actionBtnActiveFav,
            ]}
            onPress={handleToggleFavorite}
            activeOpacity={0.7}
            hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
          >
            <Heart
              size={13}
              color={isFav ? '#ef4444' : '#64748b'}
              fill={isFav ? '#ef4444' : 'transparent'}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Product Image Container */}
      <View style={[styles.imageContainer, { backgroundColor: '#ffffff' }]}>
        {resolvedImg ? (
          <Image
            source={{ uri: resolvedImg }}
            style={styles.image}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.noImage}>
            <Sparkles size={28} color="#94a3b8" />
          </View>
        )}
      </View>

      {/* Product Information */}
      <View style={styles.info}>
        {/* Brand Tag */}
        <Text style={styles.brand}>{product.brand || 'TechnoMania'}</Text>

        {/* Title (2 Lines) */}
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {product.model_name || product.name || 'Məhsul'}
        </Text>

        {/* Comfortable & Easily Clickable Installment Selector */}
        <View style={[styles.creditBox, { backgroundColor: '#f4f6ee', borderColor: '#e2e8db' }]}>
          <View style={styles.creditLabelRow}>
            <Text style={styles.creditLabel}>Hissəli ödəniş:</Text>
            <Text style={styles.creditValue}>
              {monthlyPrice} ₼<Text style={styles.creditMonthSuffix}>/ay</Text>
            </Text>
          </View>

          {/* Month Segment Large Pills */}
          <View style={styles.monthSegment}>
            {[6, 12, 18].map(m => (
              <TouchableOpacity
                key={m}
                style={[
                  styles.monthPill,
                  selectedMonth === m && styles.activeMonthPill,
                ]}
                onPress={() => setSelectedMonth(m)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.monthPillText,
                    selectedMonth === m && styles.activeMonthPillText,
                  ]}
                >
                  {m} ay
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Price & Add to Cart Button */}
        <View style={styles.priceRow}>
          <View style={styles.priceCol}>
            <Text style={[styles.price, { color: colors.text }]}>
              {price.toLocaleString()} ₼
            </Text>
            {hasOldPrice ? (
              <Text style={styles.oldPrice}>
                {String(product.old_price)} ₼
              </Text>
            ) : null}
          </View>

          <TouchableOpacity
            style={styles.cartBtn}
            onPress={handleAddToCart}
            activeOpacity={0.8}
          >
            <ShoppingBag size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 18,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 8,
    paddingBottom: 2,
    minHeight: 28,
  },
  badgeGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  discountBadge: {
    backgroundColor: '#dc2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: -0.2,
  },
  newBadge: {
    backgroundColor: '#4f533b',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  newText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  lowStockBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 6,
  },
  lowStockText: {
    color: '#92400e',
    fontSize: 9,
    fontWeight: '700',
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  actionBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  actionBtnActiveComp: {
    backgroundColor: '#f5f3ff',
    borderColor: '#ddd6fe',
  },
  actionBtnActiveFav: {
    backgroundColor: '#fff1f2',
    borderColor: '#fecdd3',
  },
  imageContainer: {
    width: '100%',
    height: 130,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    padding: 6,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  noImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  info: {
    padding: 10,
    paddingTop: 4,
  },
  brand: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4f533b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 2,
  },
  title: {
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 16,
    height: 32,
    marginBottom: 8,
  },
  creditBox: {
    paddingHorizontal: 8,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 8,
  },
  creditLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  creditLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4f533b',
  },
  creditValue: {
    fontSize: 12,
    fontWeight: '900',
    color: '#4f533b',
  },
  creditMonthSuffix: {
    fontSize: 9,
    fontWeight: '600',
    color: '#71717a',
  },
  monthSegment: {
    flexDirection: 'row',
    gap: 4,
  },
  monthPill: {
    flex: 1,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#d1d5db',
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeMonthPill: {
    backgroundColor: '#4f533b',
    borderColor: '#4f533b',
  },
  monthPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
  },
  activeMonthPillText: {
    color: '#ffffff',
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingTop: 2,
  },
  priceCol: {
    flex: 1,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  oldPrice: {
    fontSize: 10.5,
    color: '#94a3b8',
    textDecorationLine: 'line-through',
    fontWeight: '600',
  },
  cartBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
  },
});
