import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';
import { useTheme } from '../context/ThemeContext';
import Logo from './Logo';

interface LogoLoaderProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  fullScreen?: boolean;
}

export default function LogoLoader({
  message = 'Yüklənir...',
  size = 'md',
  fullScreen = false,
}: LogoLoaderProps) {
  const { colors } = useTheme();

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const opacityAnim = useRef(new Animated.Value(0.75)).current;

  useEffect(() => {
    // Clean subtle breathing / pulse animation for official logo
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 1.06,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
        Animated.parallel([
          Animated.timing(pulseAnim, {
            toValue: 0.96,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
          Animated.timing(opacityAnim, {
            toValue: 0.75,
            duration: 900,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: true,
          }),
        ]),
      ])
    );

    pulseLoop.start();
    return () => pulseLoop.stop();
  }, []);

  const content = (
    <View style={styles.centerBox}>
      {/* Pulsing Official Logo without any outer circle */}
      <Animated.View
        style={[
          styles.logoContainer,
          {
            transform: [{ scale: pulseAnim }],
            opacity: opacityAnim,
          },
        ]}
      >
        <Logo size={size === 'lg' ? 'lg' : size === 'sm' ? 'sm' : 'md'} />
      </Animated.View>

      {/* Loading caption */}
      {message ? (
        <Animated.Text
          style={[
            styles.captionText,
            { color: colors.textSecondary, opacity: opacityAnim },
          ]}
        >
          {message}
        </Animated.Text>
      ) : null}
    </View>
  );

  if (fullScreen) {
    return (
      <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
        {content}
      </View>
    );
  }

  return <View style={styles.container}>{content}</View>;
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  fullScreen: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  centerBox: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  captionText: {
    fontSize: 12,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 12,
    letterSpacing: 0.2,
  },
});
