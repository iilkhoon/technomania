import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import {
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
  Truck,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
} from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useCart } from '../../src/context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import CheckoutModal from '../../src/components/CheckoutModal';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const FREE_SHIPPING_THRESHOLD = 100;

export default function CartScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();
  const { cart, removeFromCart, updateQuantity, clearCart, totalAmount, itemCount } = useCart();

  const [couponCode, setCouponCode] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);
  const [checkoutVisible, setCheckoutVisible] = useState(false);

  const topInset = Platform.OS === 'ios' ? Math.max(insets.top, 14) : insets.top > 0 ? insets.top : 10;

  const applyCoupon = () => {
    const code = couponCode.trim().toUpperCase();
    if (code === 'TECHNO10') {
      setDiscountPercent(10);
      Alert.alert('Kupon Tətbiq Edildi!', '10% endirim uğurla tətbiq olundu! 🎉');
    } else if (code === 'MANIA5') {
      setDiscountPercent(5);
      Alert.alert('Kupon Tətbiq Edildi!', '5% endirim uğurla tətbiq olundu! 🎉');
    } else {
      setDiscountPercent(0);
      Alert.alert('Xəta', 'Yanlış və ya bitmiş promokod.');
    }
  };

  const discountAmount = (totalAmount * discountPercent) / 100;
  const finalTotal = Math.max(0, totalAmount - discountAmount);
  const freeShippingProgress = Math.min(1, totalAmount / FREE_SHIPPING_THRESHOLD);
  const amountToFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={[]}>
      {/* ═══ CENTERED HEADER ═══ */}
      <View style={[styles.header, { borderBottomColor: colors.border, paddingTop: topInset }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Səbətim</Text>
        {cart.length > 0 && (
          <TouchableOpacity onPress={clearCart} style={[styles.clearBtn, { top: topInset }]} activeOpacity={0.7}>
            <Trash2 size={15} color="#ef4444" />
            <Text style={styles.clearBtnText}>Təmizlə</Text>
          </TouchableOpacity>
        )}
      </View>

      {cart.length === 0 ? (
        <View style={[styles.emptyContainer, { backgroundColor: colors.background }]}>
          <View style={styles.emptyIconCircle}>
            <ShoppingBag size={48} color="#94a3b8" />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Səbətiniz boşdur</Text>
          <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
            Bəyəndiyiniz elektronika və məişət texnikasını seçərək səbətə əlavə edin.
          </Text>
          <TouchableOpacity
            style={styles.exploreBtn}
            onPress={() => router.push('/(tabs)/catalog')}
            activeOpacity={0.88}
          >
            <Text style={styles.exploreBtnText}>Kataloqa Keç və Alış-verişə Başla</Text>
            <ArrowRight size={18} color="#ffffff" />
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          style={[styles.container, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Free Delivery Progress Banner */}
          <View style={[styles.deliveryBanner, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={styles.deliveryTopRow}>
              <View style={styles.deliveryIconBg}>
                <Truck size={16} color="#4f533b" />
              </View>
              <Text style={[styles.deliveryTitle, { color: colors.text }]}>
                {amountToFreeShipping === 0
                  ? 'Təbriklər! Pulsuz çatdırılma aktivdir 🎉'
                  : `Pulsuz çatdırılma üçün ${amountToFreeShipping.toFixed(2)} ₼ qaldı`}
              </Text>
            </View>
            <View style={styles.progressBarBg}>
              <View style={[styles.progressBarFill, { width: `${freeShippingProgress * 100}%` }]} />
            </View>
          </View>

          {/* Cart Item Cards */}
          <View style={styles.itemsList}>
            {cart.map(item => {
              const itemPrice =
                typeof item.product.cash_price === 'number'
                  ? item.product.cash_price
                  : parseFloat(String(item.product.cash_price).replace(/[^\d.]/g, '')) || 0;

              return (
                <View
                  key={item.product.id}
                  style={[styles.itemCard, { backgroundColor: colors.card, borderColor: colors.border }]}
                >
                  {/* Product Image */}
                  <View style={styles.imageBox}>
                    <Image
                      source={{
                        uri:
                          item.product.image ||
                          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300',
                      }}
                      style={styles.productImage}
                      resizeMode="contain"
                    />
                  </View>

                  {/* Product Info */}
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemBrand}>{item.product.brand || 'TechnoMania'}</Text>
                    <Text style={[styles.itemTitle, { color: colors.text }]} numberOfLines={2}>
                      {item.product.model_name || item.product.name}
                    </Text>

                    {/* Price and Quantity Controls */}
                    <View style={styles.itemBottomRow}>
                      <Text style={[styles.itemPrice, { color: colors.text }]}>
                        {(itemPrice * item.quantity).toFixed(2)} ₼
                      </Text>

                      <View style={[styles.quantityControl, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.product.id, item.quantity - 1)}
                        >
                          <Minus size={14} color="#4f533b" />
                        </TouchableOpacity>

                        <Text style={[styles.qtyNumber, { color: colors.text }]}>{item.quantity}</Text>

                        <TouchableOpacity
                          style={styles.qtyBtn}
                          onPress={() => updateQuantity(item.product.id, item.quantity + 1)}
                        >
                          <Plus size={14} color="#4f533b" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* Promo Code Box */}
          <View style={[styles.couponCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.couponInputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Tag size={16} color="#4f533b" />
              <TextInput
                style={[styles.couponInput, { color: colors.text }]}
                placeholder="Promokod (Məs: TECHNO10)"
                placeholderTextColor={colors.textMuted}
                value={couponCode}
                onChangeText={setCouponCode}
                autoCapitalize="characters"
              />
              <TouchableOpacity style={styles.couponApplyBtn} onPress={applyCoupon}>
                <Text style={styles.couponApplyText}>Tətbiq Et</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Order Summary Card */}
          <View style={[styles.summaryCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.summaryTitle, { color: colors.text }]}>Sifarişin Xülasəsi</Text>

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Məhsullar ({itemCount} ədəd):</Text>
              <Text style={[styles.summaryVal, { color: colors.text }]}>{totalAmount.toFixed(2)} ₼</Text>
            </View>

            {discountPercent > 0 && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: '#16a34a' }]}>Endirim ({discountPercent}%):</Text>
                <Text style={[styles.summaryVal, { color: '#16a34a' }]}>-{discountAmount.toFixed(2)} ₼</Text>
              </View>
            )}

            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Çatdırılma:</Text>
              <Text style={[styles.summaryVal, { color: '#16a34a' }]}>0.00 ₼ (Pulsuz)</Text>
            </View>

            <View style={[styles.summaryTotalRow, { borderTopColor: colors.border }]}>
              <Text style={[styles.summaryTotalLabel, { color: colors.text }]}>Yekun Məbləğ:</Text>
              <Text style={styles.summaryTotalVal}>{finalTotal.toFixed(2)} ₼</Text>
            </View>

            {/* Checkout CTA Button */}
            <TouchableOpacity
              style={styles.checkoutBtn}
              onPress={() => setCheckoutVisible(true)}
              activeOpacity={0.88}
            >
              <Text style={styles.checkoutBtnText}>Sifarişi Rəsmiləşdir ({finalTotal.toFixed(2)} ₼)</Text>
              <ArrowRight size={18} color="#ffffff" />
            </TouchableOpacity>
          </View>

          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Checkout Modal */}
      <CheckoutModal visible={checkoutVisible} onClose={() => setCheckoutVisible(false)} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    position: 'relative',
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.3,
    textAlign: 'center',
  },
  clearBtn: {
    position: 'absolute',
    right: 16,
    top: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    padding: 6,
  },
  clearBtnText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },
  deliveryBanner: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 12,
    gap: 8,
  },
  deliveryTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  deliveryIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#f4f6ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryTitle: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  progressBarBg: {
    height: 5,
    backgroundColor: '#e2e8f0',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#4f533b',
    borderRadius: 99,
  },
  itemsList: {
    gap: 10,
  },
  itemCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 12,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  imageBox: {
    width: 78,
    height: 78,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  itemInfo: {
    flex: 1,
    gap: 3,
  },
  itemBrand: {
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
    textTransform: 'uppercase',
  },
  itemTitle: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_700Bold',
    lineHeight: 16,
  },
  itemBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  itemPrice: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  quantityControl: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 10,
    borderWidth: 1,
    paddingHorizontal: 4,
    paddingVertical: 2,
    gap: 8,
  },
  qtyBtn: {
    padding: 4,
  },
  qtyNumber: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    minWidth: 16,
    textAlign: 'center',
  },
  couponCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 10,
  },
  couponInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 4,
    gap: 8,
  },
  couponInput: {
    flex: 1,
    fontSize: 12.5,
    fontFamily: 'Inter_600SemiBold',
    padding: 0,
    height: 38,
  },
  couponApplyBtn: {
    backgroundColor: '#4f533b',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  couponApplyText: {
    color: '#ffffff',
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  summaryCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
  },
  summaryVal: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  summaryTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  summaryTotalLabel: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  summaryTotalVal: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
  },
  checkoutBtn: {
    backgroundColor: '#4f533b',
    borderRadius: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
    gap: 12,
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle: {
    fontSize: 18,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  emptySub: {
    fontSize: 13,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
  exploreBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f533b',
    paddingHorizontal: 20,
    paddingVertical: 13,
    borderRadius: 16,
    marginTop: 8,
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  exploreBtnText: {
    color: '#ffffff',
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
});
