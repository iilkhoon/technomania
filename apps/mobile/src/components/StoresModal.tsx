import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Linking,
  Platform,
  RefreshControl,
  Animated,
  Easing,
  Dimensions,
  PanResponder,
} from 'react-native';
import {
  Store,
  MapPin,
  Phone,
  Clock,
  X,
  Search,
  Navigation,
  PhoneCall,
  Sparkles,
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { fetchStores } from '../api/client';
import { useTheme } from '../context/ThemeContext';
import { StoreLocation } from '../types';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface StoresModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function StoresModal({ visible, onClose }: StoresModalProps) {
  const { colors } = useTheme();
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalMounted, setIsModalMounted] = useState(visible);

  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const loadStores = useCallback(async () => {
    try {
      const data = await fetchStores();
      setStores(data || []);
    } catch (e) {
      console.warn('Stores load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setIsModalMounted(false);
      onClose();
    });
  }, [slideAnim, fadeAnim, onClose]);

  useEffect(() => {
    if (visible) {
      setIsModalMounted(true);
      setLoading(true);
      loadStores();

      slideAnim.setValue(SCREEN_HEIGHT);
      fadeAnim.setValue(0);

      Animated.parallel([
        Animated.spring(slideAnim, {
          toValue: 0,
          friction: 8,
          tension: 65,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]).start();
    } else if (isModalMounted) {
      handleClose();
    }
  }, [visible]);

  // Gesture responder to allow swiping down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => gestureState.dy > 5,
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 120 || gestureState.vy > 0.8) {
          handleClose();
        } else {
          Animated.spring(slideAnim, {
            toValue: 0,
            friction: 7,
            tension: 70,
            useNativeDriver: true,
          }).start();
        }
      },
    })
  ).current;

  const onRefresh = async () => {
    setRefreshing(true);
    await loadStores();
  };

  const handleCall = (phone?: string) => {
    if (!phone) return;
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    const cleanPhone = phone.replace(/[^\d+*#]/g, '');
    Linking.openURL(`tel:${cleanPhone}`);
  };

  const handleOpenMap = (store: StoreLocation) => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}
    if (store.location_url) {
      Linking.openURL(store.location_url);
    } else {
      const query = encodeURIComponent(`${store.name} ${store.address}`);
      Linking.openURL(`https://maps.google.com/?q=${query}`);
    }
  };

  const filteredStores = stores.filter(s => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      (s.name || '').toLowerCase().includes(q) ||
      (s.address || '').toLowerCase().includes(q) ||
      (s.phone || '').toLowerCase().includes(q)
    );
  });

  if (!isModalMounted) return null;

  return (
    <Modal
      visible={isModalMounted}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        {/* Animated Dimming Backdrop */}
        <Animated.View
          style={[
            styles.backdrop,
            { opacity: fadeAnim },
          ]}
        >
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={handleClose}
          />
        </Animated.View>

        {/* Animated Sliding Bottom Sheet (slides up on open, slides down on close) */}
        <Animated.View
          style={[
            styles.modalSheet,
            {
              backgroundColor: colors.card,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Top Drag Indicator Handle */}
          <View style={styles.dragHeader} {...panResponder.panHandlers}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
          </View>

          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Store size={19} color="#ffffff" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Mağazalarımız</Text>
                <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                  Rəsmi satış və xidmət mərkəzləri
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surface }]}
              onPress={handleClose}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Search Box (if stores exist) */}
          {stores.length > 2 && (
            <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <Search size={16} color={colors.textSecondary} />
              <TextInput
                style={[styles.searchInput, { color: colors.text }]}
                placeholder="Mağaza və ya ünvan axtar..."
                placeholderTextColor={colors.textSecondary}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {searchQuery.length > 0 && (
                <TouchableOpacity onPress={() => setSearchQuery('')}>
                  <X size={15} color={colors.textSecondary} />
                </TouchableOpacity>
              )}
            </View>
          )}

          {/* Stores List */}
          {loading ? (
            <View style={styles.loadingBox}>
              <ActivityIndicator size="large" color="#4f533b" />
              <Text style={[styles.loadingText, { color: colors.textSecondary }]}>
                Mağazalar yüklənir...
              </Text>
            </View>
          ) : filteredStores.length === 0 ? (
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconCircle}>
                <Store size={36} color="#94a3b8" />
              </View>
              <Text style={[styles.emptyTitle, { color: colors.text }]}>
                {searchQuery ? 'Axtarışa uyğun mağaza tapılmadı' : 'Hal-hazırda aktiv mağaza yoxdur'}
              </Text>
              <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                {searchQuery
                  ? 'Fərqli axtarış sözü daxil etməyə çalışın'
                  : 'ERP sistemində əlavə edilmiş mağazalar burada sıralanacaq'}
              </Text>
            </View>
          ) : (
            <ScrollView
              style={styles.storesScroll}
              contentContainerStyle={styles.storesScrollContent}
              showsVerticalScrollIndicator={false}
              refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#4f533b" />
              }
            >
              {filteredStores.map((store, index) => (
                <View
                  key={store.id || `store-${index}`}
                  style={[
                    styles.storeCard,
                    {
                      backgroundColor: colors.surface,
                      borderColor: store.is_main ? '#4f533b' : colors.border,
                    },
                  ]}
                >
                  {/* Top: Name & Main Store Badge */}
                  <View style={styles.cardHeaderRow}>
                    <View style={styles.storeNameBox}>
                      <Text style={[styles.storeName, { color: colors.text }]}>
                        {store.name}
                      </Text>
                      {store.is_main ? (
                        <View style={styles.mainBadge}>
                          <Sparkles size={11} color="#ffffff" />
                          <Text style={styles.mainBadgeText}>Baş Mağaza</Text>
                        </View>
                      ) : null}
                    </View>
                  </View>

                  {/* Address */}
                  {store.address ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <MapPin size={15} color="#4f533b" />
                      </View>
                      <Text style={[styles.detailText, { color: colors.text }]}>
                        {store.address}
                      </Text>
                    </View>
                  ) : null}

                  {/* Working Hours */}
                  {store.hours ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <Clock size={14} color="#64748b" />
                      </View>
                      <Text style={[styles.detailSubText, { color: colors.textSecondary }]}>
                        İş saatları: {store.hours}
                      </Text>
                    </View>
                  ) : null}

                  {/* Phone */}
                  {store.phone ? (
                    <View style={styles.detailRow}>
                      <View style={styles.detailIconBox}>
                        <Phone size={14} color="#64748b" />
                      </View>
                      <Text style={[styles.detailSubText, { color: colors.textSecondary }]}>
                        Əlaqə: {store.phone}
                      </Text>
                    </View>
                  ) : null}

                  {/* Action Buttons */}
                  <View style={styles.cardActionsRow}>
                    {store.phone ? (
                      <TouchableOpacity
                        style={styles.callBtn}
                        activeOpacity={0.8}
                        onPress={() => handleCall(store.phone)}
                      >
                        <PhoneCall size={14} color="#ffffff" />
                        <Text style={styles.callBtnText}>Zəng et</Text>
                      </TouchableOpacity>
                    ) : null}

                    <TouchableOpacity
                      style={[
                        styles.mapBtn,
                        {
                          backgroundColor: colors.card,
                          borderColor: colors.border,
                        },
                      ]}
                      activeOpacity={0.8}
                      onPress={() => handleOpenMap(store)}
                    >
                      <Navigation size={14} color="#4f533b" />
                      <Text style={[styles.mapBtnText, { color: colors.text }]}>
                        Xəritədə bax
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}

              <View style={{ height: 20 }} />
            </ScrollView>
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '85%',
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  dragHeader: {
    width: '100%',
    paddingTop: 10,
    paddingBottom: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dragHandle: {
    width: 44,
    height: 4.5,
    borderRadius: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    marginTop: 2,
  },
  closeBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    marginHorizontal: 18,
    marginTop: 14,
    paddingHorizontal: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    paddingVertical: 0,
  },
  loadingBox: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_600SemiBold',
  },
  emptyBox: {
    padding: 36,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  emptyIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_700Bold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 17,
  },
  storesScroll: {
    maxHeight: 520,
  },
  storesScrollContent: {
    paddingHorizontal: 18,
    paddingTop: 14,
    gap: 12,
  },
  storeCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 14,
    gap: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  storeNameBox: {
    flex: 1,
    gap: 4,
  },
  storeName: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.2,
  },
  mainBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 4,
    backgroundColor: '#4f533b',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 8,
    marginTop: 2,
  },
  mainBadgeText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailIconBox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailText: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    flex: 1,
    lineHeight: 17,
  },
  detailSubText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_600SemiBold',
    flex: 1,
  },
  cardActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.06)',
  },
  callBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 11,
    backgroundColor: '#4f533b',
    gap: 6,
  },
  callBtnText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  mapBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 38,
    borderRadius: 11,
    borderWidth: 1,
    gap: 6,
  },
  mapBtnText: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
});
