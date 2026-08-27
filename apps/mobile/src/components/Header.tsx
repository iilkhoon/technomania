import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Search, ShoppingBag, Heart } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import Logo from './Logo';

export default function Header() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { itemCount } = useCart();
  const { favorites } = useWishlist();

  // Dynamic top padding ensures safe clearance below iPhone Dynamic Island / Notch
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 10) : insets.top > 0 ? insets.top : 8;

  return (
    <View
      style={[
        styles.header,
        {
          backgroundColor: colors.card,
          borderBottomColor: colors.border,
          paddingTop: topPadding,
        },
      ]}
    >
      {/* LEFT: Official Brand Logos */}
      <TouchableOpacity
        style={styles.logoBtn}
        activeOpacity={0.8}
        onPress={() => router.push('/(tabs)')}
      >
        <Logo size="md" />
      </TouchableOpacity>

      {/* RIGHT: Quick Action Icons */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/(tabs)/search')}
          activeOpacity={0.7}
        >
          <Search size={18} color={colors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, { backgroundColor: colors.surface }]}
          onPress={() => router.push('/favorites')}
          activeOpacity={0.7}
        >
          <Heart size={18} color={favorites.length > 0 ? colors.discountBadge : colors.text} />
          {favorites.length > 0 && (
            <View style={[styles.badge, { backgroundColor: colors.discountBadge }]}>
              <Text style={styles.badgeText}>{favorites.length}</Text>
            </View>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.iconBtn, styles.cartBtn]}
          onPress={() => router.push('/(tabs)/cart')}
          activeOpacity={0.7}
        >
          <ShoppingBag size={18} color="#ffffff" />
          {itemCount > 0 && (
            <View style={[styles.cartBadge, { backgroundColor: colors.discountBadge }]}>
              <Text style={styles.cartBadgeText}>{itemCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    width: '100%',
  },
  logoBtn: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginRight: 10,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'flex-end',
    flexShrink: 0,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBtn: {
    backgroundColor: '#4f533b',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#e11d48',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#e11d48',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  cartBadgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
  },
});
