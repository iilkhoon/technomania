import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Home, Layers, Search, ShoppingBag, User } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

const TAB_CONFIG = [
  { name: 'index', label: 'Ana səhifə', Icon: Home },
  { name: 'catalog', label: 'Kataloq', Icon: Layers },
  { name: 'search', label: 'Axtarış', Icon: Search },
  { name: 'cart', label: 'Səbət', Icon: ShoppingBag },
  { name: 'profile', label: 'Profil', Icon: User },
];

function TabItemButton({
  route,
  isFocused,
  config,
  itemCount,
  activeColor,
  inactiveColor,
  isDark,
  onPress,
}: {
  route: any;
  isFocused: boolean;
  config: any;
  itemCount: number;
  activeColor: string;
  inactiveColor: string;
  isDark: boolean;
  onPress: () => void;
}) {
  const scaleAnim = React.useRef(new Animated.Value(isFocused ? 1.06 : 1)).current;

  React.useEffect(() => {
    Animated.spring(scaleAnim, {
      toValue: isFocused ? 1.06 : 1,
      friction: 6,
      tension: 100,
      useNativeDriver: true,
    }).start();
  }, [isFocused]);

  const { Icon, label } = config;
  const isCart = route.name === 'cart';

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityState={isFocused ? { selected: true } : {}}
      onPress={onPress}
      activeOpacity={0.75}
      style={styles.tabBtn}
    >
      <Animated.View
        style={[
          styles.iconPill,
          isFocused && (isDark ? styles.activeIconPillDark : styles.activeIconPillLight),
          { transform: [{ scale: scaleAnim }] },
        ]}
      >
        <View style={styles.iconBox}>
          <Icon
            size={20}
            color={isFocused ? activeColor : inactiveColor}
            strokeWidth={isFocused ? 2.4 : 1.8}
          />

          {/* iOS Style Notification Badge */}
          {isCart && itemCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {itemCount > 99 ? '99+' : itemCount}
              </Text>
            </View>
          )}
        </View>
      </Animated.View>

      <Text
        style={[
          styles.tabLabel,
          {
            color: isFocused ? activeColor : inactiveColor,
            fontWeight: isFocused ? '800' : '600',
          },
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function CustomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const { itemCount } = useCart();
  const { isDark, colors } = useTheme();

  const activeColor = colors.primary || '#4f533b';
  const inactiveColor = isDark ? '#94a3b8' : '#8e9aa8';

  const bottomPadding = Platform.OS === 'ios' ? Math.max(insets.bottom, 16) : 16;

  return (
    <View style={[styles.outerContainer, { paddingBottom: bottomPadding }]} pointerEvents="box-none">
      <View
        style={[
          styles.floatingBar,
          {
            borderColor: isDark ? 'rgba(255, 255, 255, 0.16)' : 'rgba(226, 232, 240, 0.9)',
            backgroundColor: isDark ? 'rgba(24, 24, 27, 0.88)' : 'rgba(255, 255, 255, 0.88)',
          },
        ]}
      >
        {/* iOS Liquid Glass Frosted Blur Layer */}
        {Platform.OS === 'ios' ? (
          <BlurView
            tint={isDark ? 'dark' : 'light'}
            intensity={95}
            style={StyleSheet.absoluteFill}
          />
        ) : (
          <View
            style={[
              StyleSheet.absoluteFill,
              { backgroundColor: isDark ? 'rgba(24, 24, 27, 0.96)' : 'rgba(255, 255, 255, 0.96)' },
            ]}
          />
        )}

        {/* Tab Items Row */}
        <View style={styles.tabsRow}>
          {state.routes.map((route, index) => {
            const isFocused = state.index === index;
            const config = TAB_CONFIG.find(c => c.name === route.name) || {
              label: route.name,
              Icon: Home,
            };

            const onPress = () => {
              try {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              } catch (e) {}

              const event = navigation.emit({
                type: 'tabPress',
                target: route.key,
                canPreventDefault: true,
              });

              if (!isFocused && !event.defaultPrevented) {
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItemButton
                key={route.key}
                route={route}
                isFocused={isFocused}
                config={config}
                itemCount={itemCount}
                activeColor={activeColor}
                inactiveColor={inactiveColor}
                isDark={isDark}
                onPress={onPress}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  outerContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: 12,
    zIndex: 99999,
    elevation: 20,
  },
  floatingBar: {
    width: '100%',
    maxWidth: 440,
    height: 64,
    borderRadius: 32,
    borderWidth: 1.2,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 16,
  },
  tabsRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    gap: 3,
  },
  iconPill: {
    width: 38,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconPillLight: {
    backgroundColor: '#eaecdb',
  },
  activeIconPillDark: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
  },
  iconBox: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -9,
    backgroundColor: '#ff3b30', // Apple systemRed
    borderRadius: 99,
    minWidth: 16,
    height: 16,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  badgeText: {
    color: '#ffffff',
    fontSize: 9,
    fontWeight: '800',
    lineHeight: 11,
  },
  tabLabel: {
    fontSize: 10,
    letterSpacing: -0.2,
  },
});
