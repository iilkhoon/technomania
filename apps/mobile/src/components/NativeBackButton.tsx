import React from 'react';
import { TouchableOpacity, StyleSheet, Text, View, Animated, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useTheme } from '../context/ThemeContext';

interface NativeBackButtonProps {
  label?: string;
  onPress?: () => void;
  color?: string;
  showPill?: boolean;
}

export default function NativeBackButton({
  label,
  onPress,
  color,
  showPill = false,
}: NativeBackButtonProps) {
  const router = useRouter();
  const { colors, isDark } = useTheme();
  const scaleAnim = React.useRef(new Animated.Value(1)).current;

  const btnColor = color || (colors.primary || '#4f533b');

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
      speed: 30,
      bounciness: 4,
    }).start();
  };

  const handlePress = () => {
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (e) {}

    if (onPress) {
      onPress();
    } else {
      if (router.canGoBack()) {
        router.back();
      } else {
        router.replace('/(tabs)');
      }
    }
  };

  return (
    <TouchableOpacity
      accessibilityRole="button"
      accessibilityLabel="Geri qayıt"
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
      hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      style={[
        styles.container,
        showPill && (isDark ? styles.pillDark : styles.pillLight),
      ]}
    >
      <Animated.View style={[styles.innerRow, { transform: [{ scale: scaleAnim }] }]}>
        <ChevronLeft
          size={Platform.OS === 'ios' ? 24 : 22}
          color={btnColor}
          strokeWidth={Platform.OS === 'ios' ? 2.6 : 2.2}
        />
        {label ? (
          <Text style={[styles.label, { color: btnColor }]}>
            {label}
          </Text>
        ) : null}
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingRight: 6,
    paddingLeft: 0,
    borderRadius: 20,
  },
  pillLight: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(226, 232, 240, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  pillDark: {
    backgroundColor: 'rgba(30, 41, 59, 0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 6,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  innerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 1,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
    marginLeft: -2,
  },
});
