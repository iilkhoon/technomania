import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  Image,
  Linking,
  Animated,
  PanResponder,
  Easing,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Banner } from '../types';
import { resolveImageUrl } from '../api/client';

interface BannerSliderProps {
  banners: Banner[];
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 32;
const CARD_HEIGHT = CARD_WIDTH * 0.52; // Standard 16:9 ratio for mobile

export default function BannerSlider({ banners }: BannerSliderProps) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentIndexRef = useRef(0);
  currentIndexRef.current = currentIndex;

  const activeBanners = (banners || []).filter(
    b => b.active !== false && (b.image || (b as any).image_url)
  );

  // Animated values for each banner slide (opacity & scale)
  const animValues = useRef<
    { opacity: Animated.Value; scale: Animated.Value }[]
  >([]).current;

  // Initialize or synchronize animValues when activeBanners count changes
  if (animValues.length !== activeBanners.length) {
    animValues.length = 0;
    activeBanners.forEach((_, idx) => {
      animValues.push({
        opacity: new Animated.Value(idx === 0 ? 1 : 0),
        scale: new Animated.Value(idx === 0 ? 1 : 1.03),
      });
    });
  }

  // Smooth transition function between slides (matching web Crossfade + Scale animation)
  const goToSlide = (nextIndex: number) => {
    if (activeBanners.length <= 1) return;
    const targetIndex = (nextIndex + activeBanners.length) % activeBanners.length;
    const fromIndex = currentIndexRef.current;
    if (targetIndex === fromIndex) return;

    const prevAnim = animValues[fromIndex];
    const nextAnim = animValues[targetIndex];

    if (prevAnim && nextAnim) {
      nextAnim.scale.setValue(1.03);

      Animated.parallel([
        // Fade out previous slide
        Animated.timing(prevAnim.opacity, {
          toValue: 0,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Fade in and scale down new slide (luxury zoom easing)
        Animated.timing(nextAnim.opacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(nextAnim.scale, {
          toValue: 1,
          duration: 650,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start();
    }

    setCurrentIndex(targetIndex);
  };

  // Auto-advance timer (every 4.5s)
  useEffect(() => {
    if (activeBanners.length <= 1) return;
    const timer = setInterval(() => {
      const current = currentIndexRef.current;
      const next = (current + 1) % activeBanners.length;
      goToSlide(next);
    }, 4500);

    return () => clearInterval(timer);
  }, [activeBanners.length]);

  // Swipe PanResponder for smooth mobile touch gestures
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 15 && Math.abs(gestureState.dy) < 25;
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dx < -35) {
          // Swipe Left -> Next slide
          goToSlide(currentIndexRef.current + 1);
        } else if (gestureState.dx > 35) {
          // Swipe Right -> Previous slide
          goToSlide(currentIndexRef.current - 1);
        }
      },
    })
  ).current;

  const handleBannerPress = (item: Banner) => {
    if (!item.link) return;
    const link = item.link.trim();
    if (link.startsWith('/category/')) {
      const slug = link.replace('/category/', '');
      router.push({ pathname: '/category/[slug]', params: { slug } });
    } else if (link.startsWith('/product/')) {
      const id = link.replace('/product/', '');
      router.push({ pathname: '/product/[id]', params: { id } });
    } else if (link.startsWith('http://') || link.startsWith('https://')) {
      Linking.openURL(link);
    } else if (link.startsWith('/')) {
      try {
        router.push(link as any);
      } catch (e) {}
    }
  };

  if (!activeBanners || activeBanners.length === 0) return null;

  const currentBanner = activeBanners[currentIndex] || activeBanners[0];

  return (
    <View style={styles.container}>
      {/* Banner Card with Crossfade Layering */}
      <View style={styles.bannerWrapper} {...panResponder.panHandlers}>
        <TouchableOpacity
          activeOpacity={0.94}
          style={styles.bannerCard}
          onPress={() => handleBannerPress(currentBanner)}
        >
          {activeBanners.map((item, idx) => {
            const isVisible = idx === currentIndex;
            const anim = animValues[idx];

            return (
              <Animated.View
                key={item.id || String(idx)}
                style={[
                  styles.slideLayer,
                  {
                    opacity: anim ? anim.opacity : isVisible ? 1 : 0,
                    transform: [{ scale: anim ? anim.scale : isVisible ? 1 : 1.03 }],
                    zIndex: isVisible ? 2 : 1,
                  },
                ]}
                pointerEvents={isVisible ? 'auto' : 'none'}
              >
                <Image
                  source={{ uri: resolveImageUrl(item.image || (item as any).image_url) }}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
              </Animated.View>
            );
          })}
        </TouchableOpacity>
      </View>

      {/* Smooth Indicator Pill Dots */}
      {activeBanners.length > 1 && (
        <View style={styles.dotsRow}>
          {activeBanners.map((_, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <TouchableOpacity
                key={idx}
                activeOpacity={0.7}
                onPress={() => goToSlide(idx)}
                style={[
                  styles.dot,
                  isCurrent ? styles.activeDot : styles.inactiveDot,
                ]}
              />
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  bannerWrapper: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.14,
    shadowRadius: 10,
    elevation: 5,
    backgroundColor: '#e2e8f0',
  },
  bannerCard: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  slideLayer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 10,
  },
  dot: {
    height: 5,
    borderRadius: 99,
  },
  activeDot: {
    width: 22,
    backgroundColor: '#4f533b',
  },
  inactiveDot: {
    width: 6,
    backgroundColor: '#cbd5e1',
  },
});
