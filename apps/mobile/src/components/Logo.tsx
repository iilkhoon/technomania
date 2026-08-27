import React, { useState, useEffect } from 'react';
import { View, Image, ImageStyle, StyleProp } from 'react-native';
import { useSettings } from '../context/SettingsContext';
import { resolveImageUrl } from '../api/client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  style?: StyleProp<ImageStyle>;
}

export default function Logo({ size = 'md', style }: LogoProps) {
  const { logoUrl, logos, settings } = useSettings();
  const [aspectRatios, setAspectRatios] = useState<Record<string, number>>({});

  const rawLogos: string[] = (logos && logos.length > 0) ? logos : (logoUrl ? [logoUrl] : []);
  const activeLogos: string[] = rawLogos.map((uri: string) => resolveImageUrl(uri)).filter(Boolean);
  const count = activeLogos.length;

  useEffect(() => {
    activeLogos.forEach((uri: string) => {
      if (uri && typeof uri === 'string') {
        Image.getSize(
          uri,
          (w: number, h: number) => {
            if (w && h > 0) {
              setAspectRatios(prev => ({ ...prev, [uri]: w / h }));
            }
          },
          () => {}
        );
      }
    });
  }, [activeLogos.join(',')]);

  const baseHeight = count > 2 ? 22 : count === 2 ? 26 : (size === 'sm' ? 24 : size === 'lg' ? 36 : 28);
  const maxLogoWidth = count > 2 ? 70 : count === 2 ? 90 : (size === 'sm' ? 100 : size === 'lg' ? 160 : 130);
  const standardGap = settings?.logoGap !== undefined ? Math.min(settings.logoGap, 10) : 6;

  if (activeLogos.length > 0) {
    return (
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: count > 1 ? standardGap : 0,
        }}
      >
        {activeLogos.map((uri: string, idx: number) => {
          const customH = idx === 0 ? settings?.logo1Height : idx === 1 ? settings?.logo2Height : settings?.logo3Height;
          const targetH = customH ? Math.min(Math.round(customH * (count > 2 ? 0.65 : count === 2 ? 0.78 : 0.88)), 36) : baseHeight;
          const ratio = aspectRatios[uri] || 2.4;
          const calculatedWidth = Math.min(Math.round(targetH * ratio), maxLogoWidth);

          return (
            <Image
              key={idx}
              source={{ uri }}
              style={[
                {
                  height: targetH,
                  width: calculatedWidth,
                },
                style,
              ]}
              resizeMode="contain"
              onLoad={(e) => {
                const { width, height } = e.nativeEvent.source;
                if (width && height > 0) {
                  setAspectRatios(prev => ({ ...prev, [uri]: width / height }));
                }
              }}
            />
          );
        })}
      </View>
    );
  }

  return (
    <Image
      source={require('../../assets/icon.png')}
      style={[
        {
          width: baseHeight,
          height: baseHeight,
          borderRadius: size === 'sm' ? 6 : size === 'lg' ? 10 : 7,
        },
        style,
      ]}
      resizeMode="contain"
    />
  );
}

