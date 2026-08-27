import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { useSettings } from '../context/SettingsContext';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function BrandedSplash() {
  const { logoUrl } = useSettings();

  return (
    <View style={styles.container}>
      <View style={styles.logoCenter}>
        {logoUrl ? (
          <Image
            source={{ uri: logoUrl }}
            style={styles.logoImage}
            resizeMode="contain"
          />
        ) : (
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  logoCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImage: {
    width: SCREEN_WIDTH * 0.55,
    height: 90,
    maxWidth: 240,
  },
});
