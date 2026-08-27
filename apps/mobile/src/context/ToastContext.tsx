import React, { createContext, useContext, useState, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { CheckCircle2, AlertCircle, Info, ShoppingBag, X } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';

export type ToastType = 'success' | 'info' | 'error' | 'cart';

interface ToastData {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeToast, setActiveToast] = useState<ToastData | null>(null);
  const [visible, setVisible] = useState(false);

  const anim = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const hideToast = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    Animated.timing(anim, {
      toValue: 0,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setVisible(false);
      setActiveToast(null);
    });
  }, [anim]);

  const showToast = useCallback(
    (message: string, type: ToastType = 'success', duration = 2400) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      try {
        Haptics.impactAsync(
          type === 'error'
            ? Haptics.ImpactFeedbackStyle.Medium
            : Haptics.ImpactFeedbackStyle.Light
        );
      } catch (e) {}

      const newToast: ToastData = { id: Date.now(), message, type };
      setActiveToast(newToast);
      setVisible(true);

      anim.setValue(0);
      Animated.spring(anim, {
        toValue: 1,
        friction: 6,
        tension: 75,
        useNativeDriver: true,
      }).start();

      timerRef.current = setTimeout(() => {
        hideToast();
      }, duration);
    },
    [anim, hideToast]
  );

  const translateY = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [42, 0],
  });

  const scale = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.82, 1],
  });

  const opacity = anim.interpolate({
    inputRange: [0, 0.35, 1],
    outputRange: [0, 0.8, 1],
  });

  const getToastIcon = (type: ToastType) => {
    switch (type) {
      case 'cart':
        return <ShoppingBag size={16} color="#ffffff" />;
      case 'success':
        return <CheckCircle2 size={16} color="#ffffff" />;
      case 'error':
        return <AlertCircle size={16} color="#ffffff" />;
      default:
        return <Info size={16} color="#ffffff" />;
    }
  };

  const getBadgeColor = (type: ToastType) => {
    switch (type) {
      case 'cart':
        return '#4f533b';
      case 'success':
        return '#16a34a';
      case 'error':
        return '#dc2626';
      default:
        return '#2563eb';
    }
  };

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}

      {visible && activeToast && (
        <View style={styles.toastBottomContainer} pointerEvents="box-none">
          <Animated.View
            style={[
              styles.toastPill,
              {
                transform: [{ translateY }, { scale }],
                opacity,
              },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: getBadgeColor(activeToast.type) }]}>
              {getToastIcon(activeToast.type)}
            </View>

            <Text style={styles.messageText} numberOfLines={2}>
              {activeToast.message}
            </Text>

            <TouchableOpacity onPress={hideToast} style={styles.closeBtn} activeOpacity={0.7}>
              <X size={14} color="#94a3b8" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  toastBottomContainer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 100 : 88,
    left: 0,
    right: 0,
    zIndex: 99999,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  toastPill: {
    maxWidth: SCREEN_WIDTH - 40,
    backgroundColor: '#0f172a',
    borderRadius: 99,
    paddingVertical: 8,
    paddingLeft: 9,
    paddingRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.32,
    shadowRadius: 10,
    elevation: 10,
    borderWidth: 1.2,
    borderColor: '#334155',
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageText: {
    color: '#ffffff',
    fontSize: 12.5,
    fontFamily: 'PlusJakartaSans_700Bold',
    flexShrink: 1,
    lineHeight: 16,
  },
  closeBtn: {
    padding: 3,
    marginLeft: 2,
  },
});

