import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Modal,
  Dimensions,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { X, ChevronRight, Sparkles, ShoppingBag } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MobileStory, StorySlide } from '../types';
import { useTheme } from '../context/ThemeContext';
import { resolveImageUrl } from '../api/client';

interface StoryRowProps {
  stories: MobileStory[];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const STORY_DURATION = 4500; // 4.5 seconds per slide

export default function StoryRow({ stories }: StoryRowProps) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { colors } = useTheme();

  const topInset = Platform.OS === 'ios' ? Math.max(insets.top, 20) + 6 : insets.top > 0 ? insets.top + 6 : 16;

  const [selectedStoryIndex, setSelectedStoryIndex] = useState<number | null>(null);
  const [currentSlideIndex, setCurrentSlideIndex] = useState<number>(0);
  const [viewedStoryIds, setViewedStoryIds] = useState<Record<string, boolean>>({});

  // Animation Progress & Continuous Spinning Ring
  const progressAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  const activeStories = (stories || []).filter(s => s.is_active !== false);
  const currentStory = selectedStoryIndex !== null ? activeStories[selectedStoryIndex] : null;

  // Active story's sub-slides (1 or multiple slides)
  const currentSlides: StorySlide[] = (currentStory?.slides && currentStory.slides.length > 0)
    ? currentStory.slides
    : currentStory
    ? [{
        id: currentStory.id,
        image: currentStory.media_url || currentStory.image,
        title: currentStory.title,
        link: currentStory.link,
        button_text: 'Məhsula bax',
      }]
    : [];

  const activeSlide: StorySlide | null = currentSlides[currentSlideIndex] || currentSlides[0] || null;

  // Initial & continuous rotating ring border animation
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 5000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, []);

  // Story slide progress timer
  useEffect(() => {
    if (selectedStoryIndex === null || !currentStory || !activeSlide) {
      progressAnim.setValue(0);
      return;
    }

    setViewedStoryIds(prev => ({ ...prev, [currentStory.id]: true }));

    progressAnim.setValue(0);
    const animation = Animated.timing(progressAnim, {
      toValue: 1,
      duration: STORY_DURATION,
      easing: Easing.linear,
      useNativeDriver: false,
    });

    animation.start(({ finished }) => {
      if (finished) {
        handleNextSlide();
      }
    });

    return () => {
      progressAnim.stopAnimation();
    };
  }, [selectedStoryIndex, currentSlideIndex]);

  const handleOpenStory = (index: number) => {
    setSelectedStoryIndex(index);
    setCurrentSlideIndex(0);
  };

  const handleCloseStory = () => {
    setSelectedStoryIndex(null);
    setCurrentSlideIndex(0);
    progressAnim.setValue(0);
  };

  const handleNextSlide = () => {
    if (selectedStoryIndex === null) return;
    // If current story has more slides, advance slide
    if (currentSlideIndex < currentSlides.length - 1) {
      setCurrentSlideIndex(prev => prev + 1);
    } else if (selectedStoryIndex < activeStories.length - 1) {
      // Advance to next story group
      setSelectedStoryIndex(selectedStoryIndex + 1);
      setCurrentSlideIndex(0);
    } else {
      handleCloseStory();
    }
  };

  const handlePrevSlide = () => {
    if (selectedStoryIndex === null) return;
    // If we have previous slide in current story
    if (currentSlideIndex > 0) {
      setCurrentSlideIndex(prev => prev - 1);
    } else if (selectedStoryIndex > 0) {
      // Go to previous story group's last slide
      const prevStory = activeStories[selectedStoryIndex - 1];
      const prevSlidesCount = (prevStory.slides && prevStory.slides.length > 0) ? prevStory.slides.length : 1;
      setSelectedStoryIndex(selectedStoryIndex - 1);
      setCurrentSlideIndex(prevSlidesCount - 1);
    } else {
      progressAnim.setValue(0);
    }
  };

  const handleStoryAction = () => {
    const link = activeSlide?.link || currentStory?.link;
    if (!link) return;
    const cleanLink = link.trim();
    handleCloseStory();

    setTimeout(() => {
      if (cleanLink.startsWith('/(tabs)/')) {
        router.push(cleanLink as any);
      } else if (cleanLink.startsWith('/category/')) {
        const slug = cleanLink.replace('/category/', '');
        router.push({ pathname: '/category/[slug]', params: { slug } });
      } else if (cleanLink.startsWith('/product/')) {
        const id = cleanLink.replace('/product/', '');
        router.push({ pathname: '/product/[id]', params: { id } });
      } else {
        try {
          router.push(cleanLink as any);
        } catch (e) {}
      }
    }, 250);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  if (!activeStories || activeStories.length === 0) return null;

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContainer}
      >
        {activeStories.map((story, index) => {
          const isViewed = viewedStoryIds[story.id];
          const badgeColor = story.badge_color || '#4f533b';

          return (
            <TouchableOpacity
              key={story.id}
              style={styles.storyItem}
              activeOpacity={0.8}
              onPress={() => handleOpenStory(index)}
            >
              {/* Outer Animated Spinning Ring */}
              <View style={styles.ringWrapper}>
                {!isViewed ? (
                  <Animated.View
                    style={[
                      styles.animatedRingContainer,
                      { transform: [{ rotate: spin }] },
                    ]}
                  >
                    <LinearGradient
                      colors={['#4f533b', '#848b64', '#d4af37', '#4f533b']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.ringGradient}
                    />
                  </Animated.View>
                ) : (
                  <View style={[styles.ringGradient, styles.viewedRing]} />
                )}

                {/* Inner Image Container */}
                <View style={[styles.imageWrapper, { backgroundColor: colors.card }]}>
                  <Image
                    source={{ uri: resolveImageUrl(story.image) }}
                    style={styles.avatarImage}
                    resizeMode="cover"
                  />
                </View>

                {/* Dairənin Tam Altında Xüsusi Rəngli Badge */}
                {story.badge && story.badge.trim() !== '' ? (
                  <View style={[styles.avatarBadge, { backgroundColor: badgeColor }]}>
                    <Text style={styles.avatarBadgeText}>{story.badge}</Text>
                  </View>
                ) : null}
              </View>

              {/* Story Title - Regular & Minimalist */}
              <Text
                style={[
                  styles.storyTitle,
                  { color: isViewed ? colors.textSecondary : colors.text },
                ]}
                numberOfLines={1}
              >
                {story.title}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Full-Screen Multi-Slide Story Viewer Modal */}
      {selectedStoryIndex !== null && currentStory && activeSlide && (
        <Modal
          visible={true}
          transparent={false}
          animationType="fade"
          onRequestClose={handleCloseStory}
          statusBarTranslucent
        >
          <View style={styles.modalContainer}>
            <StatusBar barStyle="light-content" translucent />

            {/* Background Full Media Image */}
            <Image
              source={{ uri: resolveImageUrl(activeSlide.image || currentStory.image) }}
              style={styles.fullMedia}
              resizeMode="cover"
            />

            {/* Top & Bottom Gradient Shadows */}
            <LinearGradient
              colors={['rgba(0,0,0,0.75)', 'transparent']}
              style={styles.topGradient}
            />
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.88)']}
              style={styles.bottomGradient}
            />

            {/* Safe Top Content (Progress Bars & Header) */}
            <SafeAreaView style={[styles.modalHeaderSafe, { paddingTop: topInset }]}>
              {/* Progress Bars Container for Current Story's Slides */}
              <View style={styles.progressRow}>
                {currentSlides.map((s, idx) => {
                  let widthProgress: any = '0%';
                  if (idx < currentSlideIndex) {
                    widthProgress = '100%';
                  } else if (idx === currentSlideIndex) {
                    widthProgress = progressAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    });
                  }

                  return (
                    <View key={s.id || idx} style={styles.progressBarBg}>
                      <Animated.View
                        style={[
                          styles.progressBarFill,
                          { width: widthProgress },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>

              {/* Header Info */}
              <View style={styles.storyHeader}>
                <View style={styles.headerLeft}>
                  <Image
                    source={{ uri: resolveImageUrl(currentStory.image) }}
                    style={styles.headerAvatar}
                  />
                  <View>
                    <View style={styles.headerTitleRow}>
                      <Text style={styles.headerTitle}>{currentStory.title}</Text>
                      {currentSlides.length > 1 && (
                        <View style={styles.slideCounterPill}>
                          <Text style={styles.slideCounterText}>
                            {currentSlideIndex + 1}/{currentSlides.length}
                          </Text>
                        </View>
                      )}
                    </View>
                    <Text style={styles.headerSub}>TechnoMania • Rəsmi Hekayə</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={handleCloseStory}
                  activeOpacity={0.7}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <X size={22} color="#ffffff" />
                </TouchableOpacity>
              </View>
            </SafeAreaView>

            {/* Tap Navigation Zones (Left 35% = Prev Slide, Right 65% = Next Slide) */}
            <View style={styles.tapZonesRow}>
              <TouchableOpacity
                style={styles.tapZoneLeft}
                onPress={handlePrevSlide}
                activeOpacity={1}
              />
              <TouchableOpacity
                style={styles.tapZoneRight}
                onPress={handleNextSlide}
                activeOpacity={1}
              />
            </View>

            {/* Bottom Story Action & Title */}
            <View style={styles.bottomContent}>
              {currentStory.badge ? (
                <View
                  style={[
                    styles.bottomBadge,
                    { backgroundColor: currentStory.badge_color || '#4f533b' },
                  ]}
                >
                  <Sparkles size={12} color="#ffffff" />
                  <Text style={styles.bottomBadgeText}>{currentStory.badge}</Text>
                </View>
              ) : null}

              {activeSlide.title ? (
                <Text style={styles.bottomTitle}>{activeSlide.title}</Text>
              ) : (
                <Text style={styles.bottomTitle}>{currentStory.title}</Text>
              )}

              {activeSlide.subtitle ? (
                <Text style={styles.bottomSub}>{activeSlide.subtitle}</Text>
              ) : null}

              {(activeSlide.link || currentStory.link) ? (
                <TouchableOpacity
                  style={styles.actionBtn}
                  activeOpacity={0.85}
                  onPress={handleStoryAction}
                >
                  <ShoppingBag size={18} color="#4f533b" />
                  <Text style={styles.actionBtnText}>
                    {activeSlide.button_text || 'Məhsula bax / Kampaniyaya keç'}
                  </Text>
                  <ChevronRight size={18} color="#4f533b" />
                </TouchableOpacity>
              ) : null}
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  scrollContainer: {
    paddingHorizontal: 16,
    gap: 14,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  ringWrapper: {
    width: 66,
    height: 66,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  animatedRingContainer: {
    width: 66,
    height: 66,
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringGradient: {
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  viewedRing: {
    backgroundColor: '#cbd5e1',
  },
  imageWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    padding: 2,
    overflow: 'hidden',
    position: 'absolute',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: -4,
    alignSelf: 'center',
    paddingHorizontal: 7,
    paddingVertical: 1.5,
    borderRadius: 99,
    borderWidth: 1.5,
    borderColor: '#ffffff',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  avatarBadgeText: {
    fontSize: 9,
    fontFamily: 'Inter_700Bold',
    fontWeight: '800',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.2,
  },
  storyTitle: {
    fontSize: 11,
    fontFamily: 'Inter_500Medium',
    fontWeight: '500',
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
    letterSpacing: -0.1,
  },

  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#000000',
    position: 'relative',
  },
  fullMedia: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
    position: 'absolute',
  },
  topGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 150,
    zIndex: 2,
  },
  bottomGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 240,
    zIndex: 2,
  },
  modalHeaderSafe: {
    zIndex: 10,
    paddingHorizontal: 14,
    paddingTop: StatusBar.currentHeight ? StatusBar.currentHeight + 6 : 16,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 10,
  },
  progressBarBg: {
    flex: 1,
    height: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 99,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 99,
  },
  storyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    borderWidth: 1.5,
    borderColor: '#ffffff',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  slideCounterPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 99,
  },
  slideCounterText: {
    color: '#ffffff',
    fontSize: 10,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
  headerSub: {
    color: 'rgba(255, 255, 255, 0.75)',
    fontSize: 11,
    fontFamily: 'Inter_400Regular',
    marginTop: 1,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Tap Zones
  tapZonesRow: {
    position: 'absolute',
    top: 140,
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    zIndex: 5,
  },
  tapZoneLeft: {
    width: '35%',
    height: '100%',
  },
  tapZoneRight: {
    width: '65%',
    height: '100%',
  },

  // Bottom Content
  bottomContent: {
    position: 'absolute',
    bottom: 34,
    left: 16,
    right: 16,
    zIndex: 10,
    alignItems: 'center',
    gap: 8,
  },
  bottomBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  bottomBadgeText: {
    color: '#ffffff',
    fontSize: 11,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  bottomTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  bottomSub: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 12,
    fontFamily: 'Inter_500Medium',
    textAlign: 'center',
    marginTop: -4,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#ffffff',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 18,
    width: '100%',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    marginTop: 4,
  },
  actionBtnText: {
    color: '#4f533b',
    fontSize: 13,
    fontFamily: 'Inter_700Bold',
    fontWeight: '700',
  },
});
