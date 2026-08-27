import React, { useState, useEffect } from 'react';
import {
  View, Text, StyleSheet, Modal, TouchableOpacity,
  TextInput, ScrollView, ActivityIndicator, Alert
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { X, CheckCircle2, Truck, CreditCard, Banknote, ShieldCheck } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useCart } from '../context/CartContext';
import { submitOrder } from '../api/client';
import { Product } from '../types';

interface CheckoutModalProps {
  visible: boolean;
  onClose: () => void;
  directProduct?: Product;
  selectedServices?: Array<{ id: string; name: string; price: number }>;
}

export default function CheckoutModal({ visible, onClose, directProduct, selectedServices }: CheckoutModalProps) {
  const { colors } = useTheme();
  const { cart, totalAmount, clearCart } = useCart();

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('+994 ');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'credit'>('cash');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [successOrder, setSuccessOrder] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('@technomania_mobile_user').then(val => {
      if (val) {
        try {
          const user = JSON.parse(val);
          if (user.name) setFullName(user.name);
          if (user.phone) setPhone(user.phone);
          if (user.address) setAddress(user.address);
        } catch (e) {}
      }
    });
  }, [visible]);

  const servicesTotal = (selectedServices || []).reduce((sum, s) => sum + s.price, 0);

  const baseProductPrice = directProduct
    ? (typeof directProduct.cash_price === 'number'
        ? directProduct.cash_price
        : parseFloat(String(directProduct.cash_price).replace(/[^\d.]/g, '')) || 0)
    : totalAmount;

  const checkoutTotal = baseProductPrice + servicesTotal;

  const handleSubmit = async () => {
    if (!fullName.trim() || phone.trim().length < 9 || !address.trim()) {
      Alert.alert('Diqqət', 'Zəhmət olmasa Ad, Əlaqə nömrəsi və Çatdırılma ünvanını daxil edin.');
      return;
    }

    setLoading(true);

    const productItems = directProduct
      ? [{
          id: directProduct.id,
          name: directProduct.model_name || directProduct.name,
          price: typeof directProduct.cash_price === 'number' ? directProduct.cash_price : parseFloat(String(directProduct.cash_price).replace(/[^\d.]/g, '')) || 0,
          quantity: 1,
          image: directProduct.image || undefined,
        }]
      : cart.map(item => ({
          id: item.product.id,
          name: item.product.model_name || item.product.name,
          price: typeof item.product.cash_price === 'number' ? item.product.cash_price : parseFloat(String(item.product.cash_price).replace(/[^\d.]/g, '')) || 0,
          quantity: item.quantity,
          image: item.product.image || undefined,
        }));

    const serviceItems = (selectedServices || []).map(s => ({
      id: s.id,
      name: `Xidmət: ${s.name}`,
      price: s.price,
      quantity: 1,
    }));

    const items = [...productItems, ...serviceItems];

    const res = await submitOrder({
      customer: fullName,
      phone,
      address,
      paymentMethod,
      total: checkoutTotal,
      items,
      notes,
    });

    setLoading(false);

    if (res?.success) {
      if (!directProduct) clearCart();
      setSuccessOrder(res.id || 'TM-' + Math.floor(100000 + Math.random() * 900000));
    } else {
      Alert.alert('Xəta', 'Sifariş göndərilərkən xəta baş verdi. Zəhmət olmasa yenidən yoxlayın.');
    }
  };

  const handleResetAndClose = () => {
    setSuccessOrder(null);
    setFullName('');
    setPhone('+994 ');
    setAddress('');
    setNotes('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={handleResetAndClose}
    >
      <View style={styles.overlay}>
        <View style={[styles.sheet, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {successOrder ? 'Sifariş Qəbul Edildi!' : 'Sifarişi Rəsmiləşdir'}
            </Text>
            <TouchableOpacity
              onPress={handleResetAndClose}
              style={styles.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {successOrder ? (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <CheckCircle2 size={54} color="#16a34a" />
              </View>
              <Text style={[styles.successTitle, { color: colors.text }]}>
                Təbriklər! Sifarişiniz qəbul olundu.
              </Text>
              <Text style={[styles.successSub, { color: colors.textSecondary }]}>
                Sifariş nömrəniz: <Text style={styles.orderNumber}>{successOrder}</Text>
              </Text>
              <Text style={[styles.successDesc, { color: colors.textSecondary }]}>
                Menecerimiz 15 dəqiqə ərzində sizinlə əlaqə saxlayaraq çatdırılmanı təsdiqləyəcək.
              </Text>
              <TouchableOpacity
                style={styles.completeBtn}
                onPress={handleResetAndClose}
                activeOpacity={0.85}
              >
                <Text style={styles.completeBtnText}>Alış-verişə davam et</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.formContent}>
              {/* Total summary */}
              <View style={[styles.summaryBox, { backgroundColor: colors.surface }]}>
                <Text style={[styles.summaryLabel, { color: colors.textSecondary }]}>Yekun Məbləğ:</Text>
                <Text style={[styles.summaryValue, { color: colors.text }]}>
                  {checkoutTotal.toLocaleString()} ₼
                </Text>
              </View>

              {/* Form Inputs */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Ad və Soyad *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Məs: Əli Əliyev"
                placeholderTextColor={colors.textMuted}
                value={fullName}
                onChangeText={setFullName}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Əlaqə Nömrəsi *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="+994 50 123 45 67"
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
              />

              <Text style={[styles.inputLabel, { color: colors.text }]}>Çatdırılma Ünvanı *</Text>
              <TextInput
                style={[styles.input, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Şəhər, küçə, bina, mənzil"
                placeholderTextColor={colors.textMuted}
                value={address}
                onChangeText={setAddress}
              />

              {/* Payment Method */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Ödəniş Üsulu</Text>
              <View style={styles.paymentRow}>
                <TouchableOpacity
                  style={[
                    styles.payOption,
                    { backgroundColor: colors.surface, borderColor: paymentMethod === 'cash' ? '#4f533b' : colors.border },
                    paymentMethod === 'cash' && styles.activePayOption,
                  ]}
                  onPress={() => setPaymentMethod('cash')}
                >
                  <Banknote size={20} color={paymentMethod === 'cash' ? '#4f533b' : colors.textMuted} />
                  <Text style={[styles.payText, { color: colors.text }]}>Qapıda Nağd</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.payOption,
                    { backgroundColor: colors.surface, borderColor: paymentMethod === 'card' ? '#4f533b' : colors.border },
                    paymentMethod === 'card' && styles.activePayOption,
                  ]}
                  onPress={() => setPaymentMethod('card')}
                >
                  <CreditCard size={20} color={paymentMethod === 'card' ? '#4f533b' : colors.textMuted} />
                  <Text style={[styles.payText, { color: colors.text }]}>Qapıda Kartla</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.payOption,
                    { backgroundColor: colors.surface, borderColor: paymentMethod === 'credit' ? '#4f533b' : colors.border },
                    paymentMethod === 'credit' && styles.activePayOption,
                  ]}
                  onPress={() => setPaymentMethod('credit')}
                >
                  <ShieldCheck size={20} color={paymentMethod === 'credit' ? '#4f533b' : colors.textMuted} />
                  <Text style={[styles.payText, { color: colors.text }]}>Kredit / Hissəli</Text>
                </TouchableOpacity>
              </View>

              {/* Notes */}
              <Text style={[styles.inputLabel, { color: colors.text }]}>Qeyd (İstəyə bağlı)</Text>
              <TextInput
                style={[styles.textArea, { backgroundColor: colors.surface, color: colors.text, borderColor: colors.border }]}
                placeholder="Kuryer üçün əlavə qeyd..."
                placeholderTextColor={colors.textMuted}
                multiline
                numberOfLines={3}
                value={notes}
                onChangeText={setNotes}
              />

              {/* Submit Button */}
              <TouchableOpacity
                style={styles.submitBtn}
                onPress={handleSubmit}
                disabled={loading}
                activeOpacity={0.85}
              >
                {loading ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.submitBtnText}>
                    Sifarişi Təsdiqlə ({checkoutTotal.toLocaleString()} ₼)
                  </Text>
                )}
              </TouchableOpacity>
            </ScrollView>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  sheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: -0.3,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  formContent: {
    padding: 20,
  },
  summaryBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4f533b',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '800',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '600',
  },
  textArea: {
    height: 72,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 10,
    fontSize: 13,
    fontWeight: '600',
    textAlignVertical: 'top',
  },
  paymentRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 4,
  },
  payOption: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: 12,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  activePayOption: {
    borderColor: '#4f533b',
    backgroundColor: '#f4f6ee',
  },
  payText: {
    fontSize: 10.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  submitBtn: {
    backgroundColor: '#4f533b',
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitBtnText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '900',
  },
  successContainer: {
    padding: 30,
    alignItems: 'center',
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 99,
    backgroundColor: '#dcfce7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 19,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 8,
  },
  successSub: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 12,
  },
  orderNumber: {
    fontWeight: '900',
    color: '#4f533b',
  },
  successDesc: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 24,
  },
  completeBtn: {
    backgroundColor: '#4f533b',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 14,
    width: '100%',
    alignItems: 'center',
  },
  completeBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '900',
  },
});
