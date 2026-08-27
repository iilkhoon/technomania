import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
  ActivityIndicator,
  Modal,
  Switch,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Platform } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import { FontAwesome5 } from '@expo/vector-icons';
import {
  User,
  Heart,
  ShoppingBag,
  MapPin,
  PhoneCall,
  MessageCircle,
  ChevronRight,
  Sparkles,
  Lock,
  Mail,
  Phone,
  LogOut,
  UserPlus,
  Scale,
  Globe,
  Bell,
  Info,
  Send,
  Trash2,
  CreditCard,
  ExternalLink,
  X,
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Package,
  Play,
  Camera,
  Calendar,
  Building,
  CreditCard as IdCardIcon,
  ShoppingBag as CartIcon,
} from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import { useWishlist } from '../../src/context/WishlistContext';
import { useCart } from '../../src/context/CartContext';
import {
  customerLogin,
  customerRegister,
  customerUpdateProfile,
  customerDeleteAccount,
  fetchCustomerOrders,
  fetchStores,
  submitFeedback,
  fetchProducts,
} from '../../src/api/client';
import { CustomerUser, CustomerOrder, StoreLocation, Product } from '../../src/types';
import LogoLoader from '../../src/components/LogoLoader';
import Logo from '../../src/components/Logo';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const topInset = Platform.OS === 'ios' ? Math.max(insets.top, 14) : insets.top > 0 ? insets.top : 10;
  const { favorites, comparedProducts, removeFromCompare, clearCompare } = useWishlist();
  const { addToCart } = useCart();

  // User Auth State
  const [user, setUser] = useState<CustomerUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');
  const [loadingAuth, setLoadingAuth] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Login Form
  const [loginPhoneOrEmail, setLoginPhoneOrEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+994 ');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Modals State
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isOrdersModalOpen, setIsOrdersModalOpen] = useState(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [isStoresModalOpen, setIsStoresModalOpen] = useState(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [isLanguageModalOpen, setIsLanguageModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);

  // Real Database Data
  const [customerOrders, setCustomerOrders] = useState<CustomerOrder[]>([]);
  const [stores, setStores] = useState<StoreLocation[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);

  // Complete PostgreSQL Profile Form
  const [editName, setEditName] = useState('');
  const [editFatherName, setEditFatherName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editFinCode, setEditFinCode] = useState('');
  const [editIdSerial, setEditIdSerial] = useState('');
  const [editBirthDate, setEditBirthDate] = useState('');
  const [editWorkplace, setEditWorkplace] = useState('');
  const [editCity, setEditCity] = useState('Bakı');
  const [editAddress, setEditAddress] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Feedback Form State
  const [feedbackName, setFeedbackName] = useState('');
  const [feedbackPhone, setFeedbackPhone] = useState('');
  const [feedbackTopic, setFeedbackTopic] = useState('Təklif');
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // Notification Switch
  const [notifOrders, setNotifOrders] = useState(true);

  // Language
  const [selectedLanguage, setSelectedLanguage] = useState<'az' | 'en' | 'ru'>('az');

  // Load Saved User on Mount
  useEffect(() => {
    loadSavedSession();
    fetchStores().then(setStores);
    fetchProducts().then(setAllProducts);
  }, []);

  const loadSavedSession = async () => {
    try {
      const saved = await AsyncStorage.getItem('@technomania_mobile_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(parsed);
        initProfileForm(parsed);
        loadOrders(parsed.phone || parsed.email);
      }
    } catch (e) {}
  };

  const initProfileForm = (u: CustomerUser) => {
    setEditName(u.name || '');
    setEditFatherName(u.father_name || '');
    setEditPhone(u.phone || '');
    setEditEmail(u.email || '');
    setEditFinCode(u.fin_code || '');
    setEditIdSerial(u.id_serial || '');
    setEditBirthDate(u.birth_date || '');
    setEditWorkplace(u.workplace || '');
    setEditCity(u.city || 'Bakı');
    setEditAddress(u.address || '');
    setAvatarUrl(u.avatar_url || '');
  };

  const loadOrders = async (phoneOrEmail?: string) => {
    setLoadingOrders(true);
    const data = await fetchCustomerOrders(phoneOrEmail);
    setCustomerOrders(data);
    setLoadingOrders(false);
  };

  // Profile Image Picker (Immediately persists to PostgreSQL Server & DB)
  const pickProfileImage = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permissionResult.granted) {
        Alert.alert('İcazə lazımdır', 'Profil şəkli seçmək üçün qalereyaya giriş icazəsi verilməlidir.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.65,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const imageUri = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : asset.uri;
        setAvatarUrl(imageUri);

        // If logged in, update immediately on server & PostgreSQL DB
        if (user && user.id) {
          const updatedUser = { ...user, avatar_url: imageUri };
          setUser(updatedUser);
          await AsyncStorage.setItem('@technomania_mobile_user', JSON.stringify(updatedUser));

          const res = await customerUpdateProfile({
            id: user.id,
            avatar_url: imageUri,
          });

          if (res.success && res.customer) {
            setUser(res.customer);
            await AsyncStorage.setItem('@technomania_mobile_user', JSON.stringify(res.customer));
            Alert.alert('Uğurlu', 'Profil şəkli serverə yazıldı və bazada saxlanıldı! 📸');
          }
        }
      }
    } catch (err) {
      Alert.alert('Xəta', 'Şəkil seçilərkən xəta baş verdi.');
    }
  };

  // Handle Login
  const handleLogin = async () => {
    if (!loginPhoneOrEmail.trim()) {
      Alert.alert('Diqqət', 'Zəhmət olmasa telefon nömrənizi və ya e-poçtunuzu daxil edin.');
      return;
    }
    setLoadingAuth(true);
    const res = await customerLogin({
      phoneOrEmail: loginPhoneOrEmail.trim(),
      password: loginPassword,
    });
    setLoadingAuth(false);

    if (res.success && res.customer) {
      setUser(res.customer);
      initProfileForm(res.customer);
      await AsyncStorage.setItem('@technomania_mobile_user', JSON.stringify(res.customer));
      loadOrders(res.customer.phone || res.customer.email);
      setIsAuthModalOpen(false);
      Alert.alert('Uğurlu Giriş', `Xoş gəldiniz, ${res.customer.name}! ✨`);
    } else {
      Alert.alert('Giriş Xətası', res.error || res.message || 'Nömrə və ya şifrə yanlışdır.');
    }
  };

  // Handle Register
  const handleRegister = async () => {
    if (!regName.trim() || !regPhone.trim()) {
      Alert.alert('Diqqət', 'Ad və telefon nömrəsi mütləq qeyd olunmalıdır.');
      return;
    }
    setLoadingAuth(true);
    const res = await customerRegister({
      name: regName.trim(),
      phone: regPhone.trim(),
      email: regEmail.trim(),
      password: regPassword,
    });
    setLoadingAuth(false);

    if (res.success && res.customer) {
      setUser(res.customer);
      initProfileForm(res.customer);
      await AsyncStorage.setItem('@technomania_mobile_user', JSON.stringify(res.customer));
      setIsAuthModalOpen(false);
      Alert.alert('Qeydiyyat Tamamlandı', `Xoş gəldiniz, ${res.customer.name}! Hesabınız yaradıldı. 🎉`);
    } else {
      Alert.alert('Qeydiyyat Xətası', res.error || res.message || 'Bu nömrə ilə artıq qeydiyyat mövcuddur.');
    }
  };

  // Social Auth Mock Handlers
  const handleSocialAuth = (provider: 'Google' | 'Apple') => {
    const mockUser: CustomerUser = {
      id: `cust-${Date.now()}`,
      name: provider === 'Apple' ? 'Apple İstifadəçisi' : 'Google İstifadəçisi',
      email: `${provider.toLowerCase()}@technomania.az`,
      phone: '+994 50 123 45 67',
    };
    setUser(mockUser);
    initProfileForm(mockUser);
    AsyncStorage.setItem('@technomania_mobile_user', JSON.stringify(mockUser));
    setIsAuthModalOpen(false);
    Alert.alert('Uğurlu Giriş', `${provider} ilə hesabınıza uğurla daxil oldunuz! ✨`);
  };

  // Handle Profile Update (PostgreSQL synchronization)
  const handleSaveProfile = async () => {
    if (!user) return;
    setIsSavingProfile(true);
    const res = await customerUpdateProfile({
      id: user.id,
      name: editName,
      father_name: editFatherName,
      phone: editPhone,
      email: editEmail,
      fin_code: editFinCode,
      id_serial: editIdSerial,
      birth_date: editBirthDate,
      workplace: editWorkplace,
      city: editCity,
      address: editAddress,
      avatar_url: avatarUrl,
    });
    setIsSavingProfile(false);

    if (res.success && res.customer) {
      setUser(res.customer);
      await AsyncStorage.setItem('@technomania_mobile_user', JSON.stringify(res.customer));
      setIsAccountModalOpen(false);
      Alert.alert('Uğurlu Yenilənmə', 'Profil məlumatlarınız PostgreSQL bazasında uğurla saxlanıldı! ✅');
    } else {
      Alert.alert('Xəta', res.error || res.message || 'Yadda saxlamaq mümkün olmadı.');
    }
  };

  // Handle Logout
  const handleLogout = () => {
    Alert.alert(
      'Çıxış',
      'Hesabınızdan çıxmaq istədiyinizə əminsiniz?',
      [
        { text: 'Xeyr', style: 'cancel' },
        {
          text: 'Bəli, Çıx',
          style: 'destructive',
          onPress: async () => {
            await AsyncStorage.removeItem('@technomania_mobile_user');
            setUser(null);
          },
        },
      ]
    );
  };

  // Handle Delete Account
  const handleDeleteAccount = () => {
    if (!user) return;
    Alert.alert(
      'Hesabın Silinməsi',
      'Hesabınızı birdəfəlik silmək istəyirsiniz? Bu əməliyyat geri qaytarılmır.',
      [
        { text: 'Ləğv et', style: 'cancel' },
        {
          text: 'Sil',
          style: 'destructive',
          onPress: async () => {
            await customerDeleteAccount(user.id);
            await AsyncStorage.removeItem('@technomania_mobile_user');
            setUser(null);
            Alert.alert('Hesab Silindi', 'Hesabınız sistemdən uğurla silindi.');
          },
        },
      ]
    );
  };

  // Submit Feedback
  const handleSendFeedback = async () => {
    if (!feedbackMessage.trim()) {
      Alert.alert('Diqqət', 'Zəhmət olmasa təklif və ya mesajınızı qeyd edin.');
      return;
    }

    setIsSendingFeedback(true);
    await submitFeedback({
      name: feedbackName || user?.name || 'Mobil İstifadəçi',
      phone: feedbackPhone || user?.phone || '',
      topic: feedbackTopic,
      message: feedbackMessage.trim(),
    });

    setIsSendingFeedback(false);
    setFeedbackMessage('');
    setIsFeedbackModalOpen(false);
    Alert.alert('Təşəkkür edirik!', 'Təklifiniz qeydə alındı və rəhbərliyə çatdırıldı. ✨');
  };

  const openSocialLink = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (e) {
      console.warn('Cannot open url:', url);
    }
  };

  // Full products for comparison
  const comparedProductObjects = comparedProducts
    .map(id => allProducts.find(p => p.id === id))
    .filter(Boolean) as Product[];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.card }]} edges={[]}>
      {/* ═══ CENTERED HEADER ═══ */}
      <View style={[styles.headerBar, { borderBottomColor: colors.border, paddingTop: topInset }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Profil və İdarəetmə</Text>
      </View>

      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ═══ TOP USER CARD (HORIZONTAL) ═══ */}
        {user ? (
          /* LOGGED IN USER CARD */
          <TouchableOpacity
            style={[styles.userRowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => setIsAccountModalOpen(true)}
          >
            {/* Avatar Circle with Uploaded Image or Initials (Tap to change) */}
            <TouchableOpacity
              style={styles.avatarWrapper}
              activeOpacity={0.8}
              onPress={pickProfileImage}
            >
              {user.avatar_url ? (
                <Image source={{ uri: user.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarLetter}>
                    {user.name ? user.name.charAt(0).toUpperCase() : 'T'}
                  </Text>
                </View>
              )}
              <View style={styles.verifiedBadge}>
                <Camera size={10} color="#ffffff" />
              </View>
            </TouchableOpacity>

            {/* Center: Name & Subtitle Link */}
            <View style={styles.userCenterInfo}>
              <Text style={[styles.userNameTitle, { color: colors.text }]} numberOfLines={1}>
                {user.name} {user.surname || ''}
              </Text>
              <Text style={[styles.userSubText, { color: colors.textSecondary }]}>
                {user.phone || user.email}
              </Text>
              <Text style={styles.accountLinkText}>Hesab məlumatlarım &gt;</Text>
            </View>

            {/* Right: Chevron */}
            <ChevronRight size={20} color={colors.textMuted} />
          </TouchableOpacity>
        ) : (
          /* NOT LOGGED IN CARD -> OPENS DEDICATED LOGIN SCREEN */
          <TouchableOpacity
            style={[styles.userRowCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            activeOpacity={0.8}
            onPress={() => {
              setAuthView('login');
              setIsAuthModalOpen(true);
            }}
          >
            <View style={styles.guestAvatarCircle}>
              <User size={26} color="#4f533b" />
            </View>
            <View style={styles.userCenterInfo}>
              <Text style={[styles.userNameTitle, { color: colors.text }]}>Daxil Ol</Text>
              <Text style={[styles.userSubText, { color: colors.textSecondary }]}>
                Sifarişləri izləmək və xüsusi fürsətlər üçün
              </Text>
            </View>
            <View style={styles.loginArrowCircle}>
              <ArrowRight size={18} color="#ffffff" />
            </View>
          </TouchableOpacity>
        )}

        {/* ═══ 1. MƏHSUL İDARƏETMƏ VƏ MÜQAYİSƏ ═══ */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>ALIŞ-VERİŞ VƏ FÜRSƏTLƏR</Text>

          {/* Sifarişlərim */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => {
              if (!user) {
                setAuthView('login');
                setIsAuthModalOpen(true);
              } else {
                setIsOrdersModalOpen(true);
              }
            }}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#f0fdf4' }]}>
                <ShoppingBag size={18} color="#16a34a" />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Sifarişlərim</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                  {user ? `${customerOrders.length} aktiv sifariş` : 'Sifariş tarixçənizə baxın'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Sevimli Məhsullar -> Opens dedicated /favorites screen */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => router.push('/favorites')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#fff1f2' }]}>
                <Heart size={18} color="#e11d48" />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Sevimli Məhsullar</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                  {favorites.length} bəyənilən məhsul
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Məhsul Müqayisəsi */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => setIsCompareModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#f5f3ff' }]}>
                <Scale size={18} color="#7c3aed" />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Məhsul Müqayisəsi</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                  {comparedProducts.length > 0 ? `${comparedProducts.length} məhsul seçilib` : 'Məhsulları parametrlərinə görə müqayisə edin'}
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Taksit və Kreditlər (Informational, disabled click) */}
          <TouchableOpacity
            style={styles.menuRow}
            activeOpacity={1}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#fffbeb' }]}>
                <CreditCard size={18} color="#d97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Taksit və Kreditlər</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                  0% komissiya ilə 18 ayadək hissəli ödəniş
                </Text>
              </View>
            </View>
            <View style={styles.creditInfoTag}>
              <Text style={styles.creditInfoTagText}>Aktiv</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ═══ 2. ŞİRKƏT VƏ DƏSTƏK ═══ */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>MÜŞTƏRİ XİDMƏTLƏRİ</Text>

          {/* Mağazalar və Filiallar */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => setIsStoresModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#f0f9ff' }]}>
                <MapPin size={18} color="#0284c7" />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Mağazalar və Filiallar</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                  Ünvanlar, iş saatları və xəritə
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Müştəri Dəstəyi */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => setIsSupportModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#ecfdf5' }]}>
                <PhoneCall size={18} color="#059669" />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Müştəri Dəstəyi</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                  *0101 Qaynar Xətt və WhatsApp
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Təklif və Şikayətlər */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => setIsFeedbackModalOpen(true)}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#fefce8' }]}>
                <Send size={18} color="#ca8a04" />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Təklif və Şikayət</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                  Rəhbərliyə birbaşa müraciət edin
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ═══ 3. RƏSMİ SOSİAL ŞƏBƏKƏLƏRİMİZ (CLEAN & SIMPLE REAL LOGOS) ═══ */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>RƏSMİ SOSİAL ŞƏBƏKƏLƏR</Text>

          <View style={styles.socialGrid2x2}>
            {/* Instagram */}
            <TouchableOpacity
              style={[styles.socialTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openSocialLink('https://instagram.com/technomania.az')}
              activeOpacity={0.7}
            >
              <View style={[styles.socialIconBadge, { backgroundColor: '#fdf2f8' }]}>
                <FontAwesome5 name="instagram" size={20} color="#E1306C" />
              </View>
              <View style={styles.socialTileTextCol}>
                <Text style={[styles.socialTileName, { color: colors.text }]}>Instagram</Text>
                <Text style={[styles.socialTileHandle, { color: colors.textSecondary }]}>@technomania.az</Text>
              </View>
            </TouchableOpacity>

            {/* TikTok */}
            <TouchableOpacity
              style={[styles.socialTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openSocialLink('https://tiktok.com/@technomania')}
              activeOpacity={0.7}
            >
              <View style={[styles.socialIconBadge, { backgroundColor: '#f1f5f9' }]}>
                <FontAwesome5 name="tiktok" size={18} color="#0f172a" />
              </View>
              <View style={styles.socialTileTextCol}>
                <Text style={[styles.socialTileName, { color: colors.text }]}>TikTok</Text>
                <Text style={[styles.socialTileHandle, { color: colors.textSecondary }]}>@technomania</Text>
              </View>
            </TouchableOpacity>

            {/* YouTube */}
            <TouchableOpacity
              style={[styles.socialTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openSocialLink('https://youtube.com/@technomania')}
              activeOpacity={0.7}
            >
              <View style={[styles.socialIconBadge, { backgroundColor: '#fef2f2' }]}>
                <FontAwesome5 name="youtube" size={18} color="#FF0000" />
              </View>
              <View style={styles.socialTileTextCol}>
                <Text style={[styles.socialTileName, { color: colors.text }]}>YouTube</Text>
                <Text style={[styles.socialTileHandle, { color: colors.textSecondary }]}>TechnoMania TV</Text>
              </View>
            </TouchableOpacity>

            {/* WhatsApp (VP) */}
            <TouchableOpacity
              style={[styles.socialTile, { backgroundColor: colors.surface, borderColor: colors.border }]}
              onPress={() => openSocialLink('https://wa.me/994502881717')}
              activeOpacity={0.7}
            >
              <View style={[styles.socialIconBadge, { backgroundColor: '#f0fdf4' }]}>
                <FontAwesome5 name="whatsapp" size={20} color="#25D366" />
              </View>
              <View style={styles.socialTileTextCol}>
                <Text style={[styles.socialTileName, { color: colors.text }]}>WhatsApp</Text>
                <Text style={[styles.socialTileHandle, { color: colors.textSecondary }]}>050 288 17 17</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ 4. TƏTBİQ PARAMETRLƏRİ ═══ */}
        <View style={[styles.menuSection, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.sectionHeading, { color: colors.textSecondary }]}>TƏTBİQ PARAMETRLƏRİ</Text>

          {/* Bildirişlər Switch */}
          <View style={[styles.menuRow, { borderBottomColor: colors.border }]}>
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#fef2f2' }]}>
                <Bell size={18} color="#dc2626" />
              </View>
              <View style={{ flex: 1, paddingRight: 10 }}>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Sifariş Bildirişləri</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]} numberOfLines={1}>
                  Status yenilənmələri barədə dərhal xəbərdar olun
                </Text>
              </View>
            </View>
            <Switch
              value={notifOrders}
              onValueChange={setNotifOrders}
              trackColor={{ false: '#cbd5e1', true: '#4f533b' }}
              thumbColor="#ffffff"
            />
          </View>

          {/* Dil Seçimi */}
          <TouchableOpacity
            style={[styles.menuRow, { borderBottomColor: colors.border }]}
            onPress={() => Alert.alert('Dil Seçimi', 'Hal-hazırda sistem yalnız Azərbaycan dilində fəaliyyət göstərir.')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#f0fdfa' }]}>
                <Globe size={18} color="#0d9488" />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Tətbiq Dili</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>Azərbaycan dili (AZ)</Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>

          {/* Tətbiq Haqqında */}
          <TouchableOpacity
            style={styles.menuRow}
            onPress={() => Alert.alert('TechnoMania', 'Versiya: 1.0.0 Pro Max\nBütün hüquqlar qorunur © 2026')}
            activeOpacity={0.7}
          >
            <View style={styles.menuRowLeft}>
              <View style={[styles.menuIconBg, { backgroundColor: '#f1f5f9' }]}>
                <Info size={18} color="#475569" />
              </View>
              <View>
                <Text style={[styles.menuRowTitle, { color: colors.text }]}>Tətbiq Haqqında</Text>
                <Text style={[styles.menuRowSub, { color: colors.textSecondary }]}>
                  Versiya: 1.0.0 Pro Max
                </Text>
              </View>
            </View>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* ═══ 5. LOGOUT SECTION (IF LOGGED IN) ═══ */}
        {user && (
          <View style={styles.accountActionSection}>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
              <LogOut size={18} color="#e11d48" />
              <Text style={styles.logoutBtnText}>Hesabdan Çıxış Et</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteAccountBtn} onPress={handleDeleteAccount} activeOpacity={0.8}>
              <Trash2 size={15} color="#94a3b8" />
              <Text style={styles.deleteAccountText}>Hesabımı Birdəfəlik Sil</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ DEDICATED FULL AUTH SCREEN (LOGIN / REGISTER) ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal visible={isAuthModalOpen} animationType="slide" onRequestClose={() => setIsAuthModalOpen(false)}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.card }]} edges={[]}>
          <View style={[styles.authTopNav, { borderBottomColor: colors.border, paddingTop: topInset }]}>
            <TouchableOpacity
              onPress={() => setIsAuthModalOpen(false)}
              style={styles.authNavCloseBtn}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <X size={22} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.authNavTitle, { color: colors.text }]}>
              {authView === 'login' ? 'Daxil Ol' : 'Qeydiyyat'}
            </Text>
            <View style={{ width: 32 }} />
          </View>

          <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.authScrollContent}>
            <View style={styles.authLogoHeader}>
              <Logo size="lg" />
              <Text style={[styles.authMainHeading, { color: colors.text }]}>
                {authView === 'login' ? 'Xoş Gəlmisiniz!' : 'Yeni Hesab Yarat'}
              </Text>
              <Text style={[styles.authSubHeading, { color: colors.textSecondary }]}>
                {authView === 'login'
                  ? 'Sifarişlərinizi izləmək və xüsusi fürsətlər üçün daxil olun'
                  : 'TechnoMania ailəsinə qoşularaq eksklüziv endirimlərdən yararlanın'}
              </Text>
            </View>

            {authView === 'login' ? (
              /* LOGIN VIEW */
              <View style={[styles.authBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Telefon və ya E-poçt</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Phone size={17} color="#4f533b" />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="+994 50 123 45 67"
                      placeholderTextColor={colors.textMuted}
                      value={loginPhoneOrEmail}
                      onChangeText={setLoginPhoneOrEmail}
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şifrə</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Lock size={17} color="#4f533b" />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="••••••••"
                      placeholderTextColor={colors.textMuted}
                      value={loginPassword}
                      onChangeText={setLoginPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryAuthBtn, loadingAuth && styles.btnDisabled]}
                  onPress={handleLogin}
                  disabled={loadingAuth}
                  activeOpacity={0.88}
                >
                  {loadingAuth ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryAuthBtnText}>Daxil Ol</Text>
                      <ArrowRight size={18} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.authDividerRow}>
                  <View style={[styles.authDividerLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.authDividerText, { color: colors.textSecondary }]}>və ya sosial şəbəkələrlə</Text>
                  <View style={[styles.authDividerLine, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.socialAuthButtonsRow}>
                  <TouchableOpacity
                    style={[styles.socialAuthBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={() => handleSocialAuth('Google')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.googleIconBg}>
                      <Text style={styles.googleGText}>G</Text>
                    </View>
                    <Text style={[styles.socialAuthBtnText, { color: colors.text }]}>Google ilə daxil ol</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialAuthBtn, { borderColor: colors.border, backgroundColor: '#0f172a' }]}
                    onPress={() => handleSocialAuth('Apple')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.appleLogoIcon}></Text>
                    <Text style={[styles.socialAuthBtnText, { color: '#ffffff' }]}>Apple ilə daxil ol</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.authSwitchRow}>
                  <Text style={[styles.authSwitchPrompt, { color: colors.textSecondary }]}>
                    Hesabınız yoxdur?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => setAuthView('register')}>
                    <Text style={styles.authSwitchAction}>Qeydiyyatdan keçin</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              /* REGISTER VIEW */
              <View style={[styles.authBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Ad və Soyad</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <User size={17} color="#4f533b" />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Məs: Əli Əliyev"
                      placeholderTextColor={colors.textMuted}
                      value={regName}
                      onChangeText={setRegName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobil Telefon</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Phone size={17} color="#4f533b" />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="+994 50 123 45 67"
                      placeholderTextColor={colors.textMuted}
                      value={regPhone}
                      onChangeText={setRegPhone}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>E-poçt (İstəyə bağlı)</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Mail size={17} color="#4f533b" />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="example@gmail.com"
                      placeholderTextColor={colors.textMuted}
                      value={regEmail}
                      onChangeText={setRegEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şifrə Təyin Edin</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Lock size={17} color="#4f533b" />
                    <TextInput
                      style={[styles.textInput, { color: colors.text }]}
                      placeholder="Ən az 6 simvol"
                      placeholderTextColor={colors.textMuted}
                      value={regPassword}
                      onChangeText={setRegPassword}
                      secureTextEntry={!showPassword}
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                      {showPassword ? <EyeOff size={18} color="#64748b" /> : <Eye size={18} color="#64748b" />}
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity
                  style={[styles.primaryAuthBtn, loadingAuth && styles.btnDisabled]}
                  onPress={handleRegister}
                  disabled={loadingAuth}
                  activeOpacity={0.88}
                >
                  {loadingAuth ? (
                    <ActivityIndicator color="#ffffff" size="small" />
                  ) : (
                    <>
                      <Text style={styles.primaryAuthBtnText}>Hesab Yarat</Text>
                      <UserPlus size={18} color="#ffffff" />
                    </>
                  )}
                </TouchableOpacity>

                <View style={styles.authDividerRow}>
                  <View style={[styles.authDividerLine, { backgroundColor: colors.border }]} />
                  <Text style={[styles.authDividerText, { color: colors.textSecondary }]}>və ya sosial şəbəkələrlə</Text>
                  <View style={[styles.authDividerLine, { backgroundColor: colors.border }]} />
                </View>

                <View style={styles.socialAuthButtonsRow}>
                  <TouchableOpacity
                    style={[styles.socialAuthBtn, { borderColor: colors.border, backgroundColor: colors.surface }]}
                    onPress={() => handleSocialAuth('Google')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.googleIconBg}>
                      <Text style={styles.googleGText}>G</Text>
                    </View>
                    <Text style={[styles.socialAuthBtnText, { color: colors.text }]}>Google ilə qeydiyyat</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.socialAuthBtn, { borderColor: colors.border, backgroundColor: '#0f172a' }]}
                    onPress={() => handleSocialAuth('Apple')}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.appleLogoIcon}></Text>
                    <Text style={[styles.socialAuthBtnText, { color: '#ffffff' }]}>Apple ilə qeydiyyat</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.authSwitchRow}>
                  <Text style={[styles.authSwitchPrompt, { color: colors.textSecondary }]}>
                    Artıq hesabınız var?{' '}
                  </Text>
                  <TouchableOpacity onPress={() => setAuthView('login')}>
                    <Text style={styles.authSwitchAction}>Daxil olun</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL: HESAB MƏLUMATLARIM (POSTGRESQL SYNC + PHOTO UPLOAD) ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Modal visible={isAccountModalOpen} animationType="slide" onRequestClose={() => setIsAccountModalOpen(false)}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.card }]} edges={[]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: topInset }]}>
            <TouchableOpacity onPress={() => setIsAccountModalOpen(false)} style={styles.modalBackBtn}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Hesab Məlumatlarım</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.modalContent}>
            {/* PHOTO UPLOAD AVATAR HERO */}
            <View style={[styles.profilePhotoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={styles.avatarPickerWrapper}>
                {avatarUrl ? (
                  <Image source={{ uri: avatarUrl }} style={styles.avatarLargeImage} />
                ) : (
                  <View style={styles.avatarLargeCircle}>
                    <Text style={styles.avatarLargeLetter}>
                      {editName ? editName.charAt(0).toUpperCase() : 'T'}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={styles.cameraBtn} onPress={pickProfileImage} activeOpacity={0.8}>
                  <Camera size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
              <Text style={[styles.photoCardTitle, { color: colors.text }]}>Profil Şəkli</Text>
              <Text style={[styles.photoCardSub, { color: colors.textSecondary }]}>
                Şəkli dəyişmək üçün kameraya toxunun
              </Text>
            </View>

            {/* FULL POSTGRESQL FORM */}
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Şəxsi və Müqavilə Məlumatları</Text>

              {/* Ad və Soyad */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Ad və Soyad *</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <User size={16} color="#4f533b" />
                  <TextInput style={[styles.textInput, { color: colors.text }]} value={editName} onChangeText={setEditName} placeholder="Məs: Əli Əliyev" />
                </View>
              </View>

              {/* Ata Adı */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Ata Adı</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <User size={16} color="#4f533b" />
                  <TextInput style={[styles.textInput, { color: colors.text }]} value={editFatherName} onChangeText={setEditFatherName} placeholder="Məs: Məmməd oğlu" />
                </View>
              </View>

              {/* Mobil Nömrə */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mobil Telefon *</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Phone size={16} color="#4f533b" />
                  <TextInput style={[styles.textInput, { color: colors.text }]} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
                </View>
              </View>

              {/* E-poçt */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>E-poçt Ünvanı</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <Mail size={16} color="#4f533b" />
                  <TextInput style={[styles.textInput, { color: colors.text }]} value={editEmail} onChangeText={setEditEmail} keyboardType="email-address" />
                </View>
              </View>

              {/* FİN Kod & Şəxsiyyət Vəsiqəsi */}
              <View style={styles.twoColumnRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>FİN Kod</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <IdCardIcon size={15} color="#4f533b" />
                    <TextInput style={[styles.textInput, { color: colors.text }]} value={editFinCode} onChangeText={setEditFinCode} placeholder="7ABC123" maxLength={7} autoCapitalize="characters" />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Seriya №</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <IdCardIcon size={15} color="#4f533b" />
                    <TextInput style={[styles.textInput, { color: colors.text }]} value={editIdSerial} onChangeText={setEditIdSerial} placeholder="AA1234567" autoCapitalize="characters" />
                  </View>
                </View>
              </View>

              {/* Doğum Tarixi & İş Yeri */}
              <View style={styles.twoColumnRow}>
                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Doğum Tarixi</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Calendar size={15} color="#4f533b" />
                    <TextInput style={[styles.textInput, { color: colors.text }]} value={editBirthDate} onChangeText={setEditBirthDate} placeholder="01.01.1995" />
                  </View>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>İş Yeri / Vəzifə</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                    <Building size={15} color="#4f533b" />
                    <TextInput style={[styles.textInput, { color: colors.text }]} value={editWorkplace} onChangeText={setEditWorkplace} placeholder="Şirkət adı" />
                  </View>
                </View>
              </View>

              {/* Şəhər / Rayon */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Şəhər / Rayon</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <MapPin size={16} color="#4f533b" />
                  <TextInput style={[styles.textInput, { color: colors.text }]} value={editCity} onChangeText={setEditCity} />
                </View>
              </View>

              {/* Çatdırılma Ünvanı */}
              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Faktiki Yaşayış Ünvanı</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <MapPin size={16} color="#4f533b" />
                  <TextInput style={[styles.textInput, { color: colors.text }]} value={editAddress} onChangeText={setEditAddress} placeholder="Küçə, bina, mənzil..." />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryAuthBtn, isSavingProfile && styles.btnDisabled]}
                onPress={handleSaveProfile}
                disabled={isSavingProfile}
              >
                {isSavingProfile ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.primaryAuthBtnText}>Məlumatları Yadda Saxla (Postgres)</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ MODAL: SİFARİŞLƏRİM (ORDERS HISTORY) ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal visible={isOrdersModalOpen} animationType="slide" onRequestClose={() => setIsOrdersModalOpen(false)}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.card }]} edges={[]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: topInset }]}>
            <TouchableOpacity onPress={() => setIsOrdersModalOpen(false)} style={styles.modalBackBtn}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Sifariş Tarixçəsi</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.modalContent}>
            {loadingOrders ? (
              <LogoLoader message="Sifarişlər yüklənir..." />
            ) : customerOrders.length === 0 ? (
              <View style={styles.emptyBox}>
                <Package size={48} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Hələ heç bir sifarişiniz yoxdur</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Kataloqdan istədiyiniz məhsulları seçərək sifariş verə bilərsiniz.
                </Text>
              </View>
            ) : (
              customerOrders.map(order => (
                <View key={order.id} style={[styles.orderCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                  <View style={styles.orderCardHeader}>
                    <View>
                      <Text style={[styles.orderNumber, { color: colors.text }]}>Sifariş #{order.id}</Text>
                      <Text style={styles.orderDate}>
                        {new Date(order.createdAt).toLocaleDateString('az-AZ', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </Text>
                    </View>
                    <View style={styles.orderStatusBadge}>
                      <Text style={styles.orderStatusText}>{order.status || 'İcrada'}</Text>
                    </View>
                  </View>

                  <View style={styles.orderItemsList}>
                    {(order.items || []).map((item, i) => (
                      <View key={i} style={styles.orderItemRow}>
                        <Text style={[styles.orderItemName, { color: colors.text }]} numberOfLines={1}>
                          {item.name} × {item.quantity}
                        </Text>
                        <Text style={[styles.orderItemPrice, { color: colors.text }]}>
                          {(item.price * item.quantity).toFixed(2)} ₼
                        </Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.orderTotalRow, { borderTopColor: colors.border }]}>
                    <Text style={[styles.orderTotalLabel, { color: colors.textSecondary }]}>Yekun Məbləğ:</Text>
                    <Text style={styles.orderTotalVal}>{order.totalAmount.toFixed(2)} ₼</Text>
                  </View>
                </View>
              ))
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════════════════════════════════════════════════════════ */}
      {/* ═══ MODAL: MƏHSUL MÜQAYİSƏSİ (CLEAN REDESIGN & FIXED HEADER) ═══ */}
      {/* ═══════════════════════════════════════════════════════════════════ */}
      <Modal visible={isCompareModalOpen} animationType="slide" onRequestClose={() => setIsCompareModalOpen(false)}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.card }]} edges={[]}>
          {/* Fixed & Centered Modal Header */}
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: topInset }]}>
            <TouchableOpacity onPress={() => setIsCompareModalOpen(false)} style={styles.modalBackBtn}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Məhsul Müqayisəsi</Text>
            {comparedProducts.length > 0 ? (
              <TouchableOpacity onPress={clearCompare} style={styles.modalActionTextBtn}>
                <Text style={styles.clearCompareText}>Təmizlə</Text>
              </TouchableOpacity>
            ) : (
              <View style={{ width: 24 }} />
            )}
          </View>

          <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.compareModalContent}>
            {comparedProductObjects.length === 0 ? (
              <View style={styles.emptyBox}>
                <Scale size={52} color={colors.textMuted} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>Müqayisə üçün məhsul seçilməyib</Text>
                <Text style={[styles.emptySub, { color: colors.textSecondary }]}>
                  Məhsul kartında tərəzi ikonuna klikləyərək istədiyiniz məhsulları yan-yana xüsusiyyətlərinə görə müqayisə edə bilərsiniz.
                </Text>
                <TouchableOpacity
                  style={styles.exploreCompareBtn}
                  onPress={() => {
                    setIsCompareModalOpen(false);
                    router.push('/(tabs)/catalog');
                  }}
                >
                  <Text style={styles.exploreCompareBtnText}>Kataloqa Keç və Məhsul Seç</Text>
                  <ArrowRight size={16} color="#ffffff" />
                </TouchableOpacity>
              </View>
            ) : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.compareHorizontalContainer}>
                {comparedProductObjects.map(p => {
                  const price =
                    typeof p.cash_price === 'number'
                      ? p.cash_price
                      : parseFloat(String(p.cash_price || 0).replace(/[^\d.]/g, '')) || 0;
                  const monthlyPrice = Math.round(price / 12);

                  return (
                    <View key={p.id} style={[styles.compareProductCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                      {/* Delete from comparison button */}
                      <TouchableOpacity onPress={() => removeFromCompare(p.id)} style={styles.removeCompareBadge}>
                        <X size={15} color="#ef4444" />
                      </TouchableOpacity>

                      {/* Product Image */}
                      <View style={styles.compareImageBox}>
                        <Image
                          source={{
                            uri:
                              p.image ||
                              'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400',
                          }}
                          style={styles.compareImage}
                          resizeMode="contain"
                        />
                      </View>

                      {/* Info & Price */}
                      <Text style={styles.compareBrand}>{p.brand || 'TechnoMania'}</Text>
                      <Text style={[styles.compareTitle, { color: colors.text }]} numberOfLines={2}>
                        {p.model_name || p.name}
                      </Text>

                      <View style={styles.comparePriceBox}>
                        <Text style={styles.comparePriceText}>{price.toFixed(2)} ₼</Text>
                        <Text style={styles.compareMonthlyText}>12 ay × {monthlyPrice} ₼/ay</Text>
                      </View>

                      {/* Add to Cart CTA */}
                      <TouchableOpacity
                        style={styles.compareCartBtn}
                        onPress={() => {
                          addToCart(p, 1);
                          Alert.alert('Səbətə Əlavə Edildi', `${p.name} səbətinizə əlavə olundu! 🛍️`);
                        }}
                      >
                        <CartIcon size={14} color="#ffffff" />
                        <Text style={styles.compareCartBtnText}>Səbətə At</Text>
                      </TouchableOpacity>

                      {/* Technical Comparison Specs */}
                      <View style={[styles.compareSpecsTable, { borderTopColor: colors.border }]}>
                        <View style={styles.specRow}>
                          <Text style={styles.specLabel}>Brend</Text>
                          <Text style={[styles.specValue, { color: colors.text }]}>{p.brand || '—'}</Text>
                        </View>
                        <View style={styles.specRow}>
                          <Text style={styles.specLabel}>Kateqoriya</Text>
                          <Text style={[styles.specValue, { color: colors.text }]}>{p.category_name || 'Elektronika'}</Text>
                        </View>
                        <View style={styles.specRow}>
                          <Text style={styles.specLabel}>Anbar</Text>
                          <Text style={[styles.specValue, { color: '#16a34a' }]}>Mövcuddur</Text>
                        </View>
                        <View style={styles.specRow}>
                          <Text style={styles.specLabel}>Rəsmi Zəmanət</Text>
                          <Text style={[styles.specValue, { color: colors.text }]}>12 Ay Rəsmi</Text>
                        </View>
                        <View style={styles.specRow}>
                          <Text style={styles.specLabel}>Çatdırılma</Text>
                          <Text style={[styles.specValue, { color: '#16a34a' }]}>Pulsuz</Text>
                        </View>
                      </View>
                    </View>
                  );
                })}
              </ScrollView>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ MODAL: MAĞAZALAR VƏ FİLİALLAR ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal visible={isStoresModalOpen} animationType="slide" onRequestClose={() => setIsStoresModalOpen(false)}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.card }]} edges={[]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: topInset }]}>
            <TouchableOpacity onPress={() => setIsStoresModalOpen(false)} style={styles.modalBackBtn}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Mağazalar və Filiallar</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.modalContent}>
            {stores.map(s => (
              <View key={s.id} style={[styles.storeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <View style={styles.storeCardTop}>
                  <View style={styles.storeIconCircle}>
                    <MapPin size={18} color="#ffffff" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.storeName, { color: colors.text }]}>{s.name}</Text>
                    <Text style={[styles.storeAddress, { color: colors.textSecondary }]}>{s.address}</Text>
                  </View>
                </View>
                <View style={[styles.storeCardBottom, { borderTopColor: colors.border }]}>
                  <Text style={[styles.storeHours, { color: colors.textSecondary }]}>İş saatları: {s.hours || '10:00 - 21:00'}</Text>
                  <TouchableOpacity
                    style={styles.mapBtn}
                    onPress={() => Linking.openURL(s.location_url || `https://maps.google.com/?q=${encodeURIComponent(s.address)}`)}
                  >
                    <ExternalLink size={13} color="#4f533b" />
                    <Text style={styles.mapBtnText}>Xəritədə Bax</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ MODAL: TƏKLİF VƏ ŞİKAYƏT ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal visible={isFeedbackModalOpen} animationType="slide" onRequestClose={() => setIsFeedbackModalOpen(false)}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.card }]} edges={[]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: topInset }]}>
            <TouchableOpacity onPress={() => setIsFeedbackModalOpen(false)} style={styles.modalBackBtn}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Təklif və Şikayət</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.modalContent}>
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Fikirləriniz Bizim Üçün Dəyərlidir</Text>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Adınız və Soyadınız</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput style={[styles.textInput, { color: colors.text }]} value={feedbackName} onChangeText={setFeedbackName} placeholder="Məs: Rəşad Məmmədov" placeholderTextColor={colors.textMuted} />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Əlaqə Nömrəsi</Text>
                <View style={[styles.inputWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput style={[styles.textInput, { color: colors.text }]} value={feedbackPhone} onChangeText={setFeedbackPhone} placeholder="+994 50 000 00 00" placeholderTextColor={colors.textMuted} keyboardType="phone-pad" />
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mövzu</Text>
                <View style={styles.feedbackTopicRow}>
                  {['Təklif', 'Şikayət', 'Əməkdaşlıq', 'Digər'].map(t => (
                    <TouchableOpacity
                      key={t}
                      style={[
                        styles.topicChip,
                        { backgroundColor: feedbackTopic === t ? '#4f533b' : colors.surface, borderColor: colors.border },
                      ]}
                      onPress={() => setFeedbackTopic(t)}
                    >
                      <Text style={[styles.topicChipText, { color: feedbackTopic === t ? '#ffffff' : colors.text }]}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={[styles.inputLabel, { color: colors.textSecondary }]}>Mesajınız</Text>
                <View style={[styles.textAreaWrapper, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                  <TextInput
                    style={[styles.textAreaInput, { color: colors.text }]}
                    value={feedbackMessage}
                    onChangeText={setFeedbackMessage}
                    placeholder="Müraciətinizi ətraflı qeyd edin..."
                    placeholderTextColor={colors.textMuted}
                    multiline
                    numberOfLines={5}
                  />
                </View>
              </View>

              <TouchableOpacity
                style={[styles.primaryAuthBtn, isSendingFeedback && styles.btnDisabled]}
                onPress={handleSendFeedback}
                disabled={isSendingFeedback}
              >
                {isSendingFeedback ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.primaryAuthBtnText}>Müraciəti Göndər</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ MODAL: MÜŞTƏRİ DƏSTƏYİ ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal visible={isSupportModalOpen} animationType="slide" onRequestClose={() => setIsSupportModalOpen(false)}>
        <SafeAreaView style={[styles.modalSafeArea, { backgroundColor: colors.card }]} edges={[]}>
          <View style={[styles.modalHeader, { borderBottomColor: colors.border, paddingTop: topInset }]}>
            <TouchableOpacity onPress={() => setIsSupportModalOpen(false)} style={styles.modalBackBtn}>
              <ArrowLeft size={20} color={colors.text} />
            </TouchableOpacity>
            <Text style={[styles.modalHeaderTitle, { color: colors.text }]}>Müştəri Dəstəyi</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.modalContent}>
            <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={[styles.cardTitle, { color: colors.text }]}>Bizimlə 7/24 Əlaqə</Text>

              <TouchableOpacity style={styles.supportChannelBtn} onPress={() => Linking.openURL('tel:*0101')}>
                <PhoneCall size={20} color="#4f533b" />
                <View>
                  <Text style={[styles.supportChannelTitle, { color: colors.text }]}>Qaynar Xətt: *0101</Text>
                  <Text style={styles.supportChannelSub}>Bütün operatorlardan ödənişsiz zəng</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportChannelBtn} onPress={() => Linking.openURL('https://wa.me/994502881717')}>
                <MessageCircle size={20} color="#25d366" />
                <View>
                  <Text style={[styles.supportChannelTitle, { color: colors.text }]}>WhatsApp Canlı Dəstək</Text>
                  <Text style={styles.supportChannelSub}>Sualınızı dərhal operatora yazın</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.supportChannelBtn} onPress={() => Linking.openURL('mailto:destek@technomania.az')}>
                <Mail size={20} color="#2563eb" />
                <View>
                  <Text style={[styles.supportChannelTitle, { color: colors.text }]}>E-poçt Dəstəyi</Text>
                  <Text style={styles.supportChannelSub}>destek@technomania.az</Text>
                </View>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ MODAL: TƏTBİQ HAQQINDA ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal visible={isAboutModalOpen} transparent animationType="fade" onRequestClose={() => setIsAboutModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>TechnoMania Mobile</Text>
            <Text style={[styles.dialogVersion, { color: colors.textSecondary }]}>Versiya 1.0.0 Pro Max • 2026</Text>
            <Text style={[styles.dialogBody, { color: colors.textSecondary }]}>
              TechnoMania elektronika və məişət texnikasının rəsmi onlayn və offline satış şəbəkəsidir. Bütün məhsullara rəsmi zəmanət verilir.
            </Text>
            <TouchableOpacity style={styles.dialogCloseBtn} onPress={() => setIsAboutModalOpen(false)}>
              <Text style={styles.dialogCloseText}>Bağla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════════════ */}
      {/* ═══ MODAL: DİL SEÇİMİ ═══ */}
      {/* ═══════════════════════════════════════════════════ */}
      <Modal visible={isLanguageModalOpen} transparent animationType="fade" onRequestClose={() => setIsLanguageModalOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.dialogCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <Text style={[styles.dialogTitle, { color: colors.text }]}>Tətbiqin Dilini Seçin</Text>
            {[
              { id: 'az', name: 'Azərbaycanca (AZ)' },
              { id: 'en', name: 'English (EN)' },
              { id: 'ru', name: 'Русский (RU)' },
            ].map(l => (
              <TouchableOpacity
                key={l.id}
                style={[styles.langItem, selectedLanguage === l.id && styles.langItemActive]}
                onPress={() => {
                  setSelectedLanguage(l.id as any);
                  setIsLanguageModalOpen(false);
                }}
              >
                <Text style={[styles.langText, { color: colors.text }, selectedLanguage === l.id && styles.langTextActive]}>
                  {l.name}
                </Text>
                {selectedLanguage === l.id && <Check size={16} color="#4f533b" />}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.dialogCloseBtn} onPress={() => setIsLanguageModalOpen(false)}>
              <Text style={styles.dialogCloseText}>Bağla</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  headerBar: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
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
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    gap: 14,
  },

  // Top User Row Card
  userRowCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
  },
  guestAvatarCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#f4f6ee',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    color: '#ffffff',
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  verifiedBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#16a34a',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  userCenterInfo: {
    flex: 1,
    gap: 2,
  },
  userNameTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  userSubText: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
  },
  accountLinkText: {
    color: '#4f533b',
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_700Bold',
    marginTop: 2,
  },
  loginArrowCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Menu Sections
  menuSection: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 6,
  },
  sectionHeading: {
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  menuRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  menuIconBg: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowTitle: {
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  menuRowSub: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  creditInfoTag: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  creditInfoTagText: {
    color: '#d97706',
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // Social Cards 2x2 Clean Grid
  socialGrid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  socialTile: {
    width: (SCREEN_WIDTH - 64 - 8) / 2,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 14,
    borderWidth: 1,
  },
  socialIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  socialTileTextCol: {
    flex: 1,
  },
  socialTileName: {
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  socialTileHandle: {
    fontSize: 10.5,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },

  // Switch Row (No Overlap)
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  switchRowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    marginRight: 10,
  },
  switchTextCol: {
    flex: 1,
  },

  // Account Actions
  accountActionSection: {
    gap: 10,
    marginTop: 4,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#fecdd3',
    backgroundColor: '#fff1f2',
  },
  logoutBtnText: {
    color: '#e11d48',
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  deleteAccountBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 6,
  },
  deleteAccountText: {
    color: '#94a3b8',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },

  // Auth Full Screen Modal
  modalSafeArea: {
    flex: 1,
  },
  authTopNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  authNavCloseBtn: {
    padding: 6,
  },
  authNavTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  authScrollContent: {
    padding: 20,
    gap: 16,
  },
  authLogoHeader: {
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    paddingBottom: 6,
  },
  authMainHeading: {
    fontSize: 22,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    letterSpacing: -0.4,
    marginTop: 8,
  },
  authSubHeading: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  authBox: {
    borderRadius: 22,
    borderWidth: 1,
    padding: 18,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  inputGroup: {
    gap: 5,
  },
  twoColumnRow: {
    flexDirection: 'row',
    gap: 10,
  },
  inputLabel: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 13.5,
    fontFamily: 'Inter_400Regular',
    padding: 0,
  },
  eyeBtn: {
    padding: 4,
  },
  primaryAuthBtn: {
    backgroundColor: '#4f533b',
    borderRadius: 14,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 3,
  },
  primaryAuthBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  btnDisabled: {
    opacity: 0.7,
  },

  // Social Auth Divider & Buttons
  authDividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginVertical: 4,
  },
  authDividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
  },
  authDividerText: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  socialAuthButtonsRow: {
    gap: 10,
  },
  socialAuthBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 12,
    borderRadius: 13,
    borderWidth: 1,
  },
  googleIconBg: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ea4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleGText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '900',
  },
  appleLogoIcon: {
    color: '#ffffff',
    fontSize: 17,
  },
  socialAuthBtnText: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  authSwitchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  authSwitchPrompt: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
  },
  authSwitchAction: {
    color: '#4f533b',
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },

  // Modals Common
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
    textAlign: 'center',
    flex: 1,
  },
  modalBackBtn: {
    padding: 6,
  },
  modalActionTextBtn: {
    padding: 4,
  },
  clearCompareText: {
    color: '#ef4444',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  modalContent: {
    padding: 16,
    gap: 14,
  },

  // Profile Photo Upload Card
  profilePhotoCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  avatarPickerWrapper: {
    position: 'relative',
    marginBottom: 4,
  },
  avatarLargeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLargeImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  avatarLargeLetter: {
    color: '#ffffff',
    fontSize: 32,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  cameraBtn: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4f533b',
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  photoCardTitle: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  photoCardSub: {
    fontSize: 11.5,
    fontFamily: 'Inter_400Regular',
  },

  // Form Card
  formCard: {
    borderRadius: 18,
    borderWidth: 1,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    marginBottom: 4,
  },
  textAreaWrapper: {
    borderWidth: 1,
    borderRadius: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  textAreaInput: {
    fontSize: 13.5,
    fontFamily: 'Inter_400Regular',
    textAlignVertical: 'top',
    minHeight: 80,
  },
  feedbackTopicRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  topicChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },
  topicChipText: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // Orders
  orderCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 10,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderNumber: {
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  orderDate: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  orderStatusBadge: {
    backgroundColor: '#fef3c7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  orderStatusText: {
    color: '#d97706',
    fontSize: 11,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  orderItemsList: {
    gap: 4,
  },
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  orderItemName: {
    fontSize: 12,
    fontFamily: 'Inter_400Regular',
    flex: 1,
    marginRight: 8,
  },
  orderItemPrice: {
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  orderTotalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  orderTotalLabel: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
  },
  orderTotalVal: {
    fontSize: 14,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
  },

  // Support
  supportChannelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0, 0, 0, 0.06)',
  },
  supportChannelTitle: {
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  supportChannelSub: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'Inter_400Regular',
  },

  // Compare Modal & Cards
  compareModalContent: {
    padding: 16,
    gap: 14,
  },
  compareHorizontalContainer: {
    gap: 14,
    paddingRight: 16,
  },
  compareProductCard: {
    width: 220,
    borderRadius: 20,
    borderWidth: 1,
    padding: 14,
    gap: 8,
    position: 'relative',
  },
  removeCompareBadge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  compareImageBox: {
    width: '100%',
    height: 130,
    backgroundColor: '#ffffff',
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 6,
    marginTop: 10,
  },
  compareImage: {
    width: '100%',
    height: '100%',
  },
  compareBrand: {
    fontSize: 10.5,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
    textTransform: 'uppercase',
  },
  compareTitle: {
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
    lineHeight: 17,
    minHeight: 34,
  },
  comparePriceBox: {
    gap: 2,
    marginVertical: 2,
  },
  comparePriceText: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
  },
  compareMonthlyText: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    color: '#64748b',
  },
  compareCartBtn: {
    backgroundColor: '#4f533b',
    borderRadius: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 2,
  },
  compareCartBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  compareSpecsTable: {
    borderTopWidth: 1,
    paddingTop: 8,
    gap: 6,
  },
  specRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  specLabel: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    color: '#64748b',
  },
  specValue: {
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  exploreCompareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#4f533b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 8,
  },
  exploreCompareBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // Stores
  storeCard: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 14,
    gap: 12,
  },
  storeCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  storeIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeName: {
    fontSize: 13.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  storeAddress: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  storeCardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  storeHours: {
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
  },
  mapBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mapBtnText: {
    color: '#4f533b',
    fontSize: 11.5,
    fontFamily: 'PlusJakartaSans_700Bold',
  },

  // Generic Dialog Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  dialogCard: {
    width: '100%',
    maxWidth: 340,
    borderRadius: 22,
    borderWidth: 1,
    padding: 20,
    gap: 12,
    alignItems: 'center',
  },
  dialogTitle: {
    fontSize: 17,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
  },
  dialogVersion: {
    fontSize: 11.5,
    fontFamily: 'Inter_600SemiBold',
    marginTop: -6,
  },
  dialogBody: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 18,
  },
  dialogCloseBtn: {
    backgroundColor: '#4f533b',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 24,
    marginTop: 6,
    width: '100%',
    alignItems: 'center',
  },
  dialogCloseText: {
    color: '#ffffff',
    fontSize: 13,
    fontFamily: 'PlusJakartaSans_700Bold',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  langItemActive: {
    backgroundColor: 'rgba(79, 83, 59, 0.08)',
  },
  langText: {
    fontSize: 13.5,
    fontFamily: 'Inter_600SemiBold',
  },
  langTextActive: {
    color: '#4f533b',
    fontFamily: 'PlusJakartaSans_800ExtraBold',
  },
  emptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    paddingHorizontal: 24,
    gap: 10,
  },
  emptyTitle: {
    fontSize: 16,
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    textAlign: 'center',
  },
  emptySub: {
    fontSize: 12.5,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    lineHeight: 17,
  },
});
