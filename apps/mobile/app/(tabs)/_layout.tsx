import React, { useEffect, useRef } from 'react';
import { usePathname } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { useTheme } from '../../src/context/ThemeContext';
import { useCart } from '../../src/context/CartContext';

export default function TabLayout() {
  const { colors } = useTheme();
  const { itemCount } = useCart();
  const pathname = usePathname();
  const prevPathRef = useRef(pathname);

  useEffect(() => {
    if (prevPathRef.current && prevPathRef.current !== pathname) {
      try {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (e) {}
    }
    prevPathRef.current = pathname;
  }, [pathname]);

  const activeColor = colors.primary || '#4f533b';

  return (
    <NativeTabs
      tintColor={activeColor}
      badgeBackgroundColor="#ff3b30"
      disableTransparentOnScrollEdge={true}
      minimizeBehavior="never"
      labelStyle={{
        fontSize: 9.5,
      }}
    >
      <NativeTabs.Trigger name="index">
        <Label>Ana səhifə</Label>
        <Icon sf={{ default: 'house', selected: 'house.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="catalog">
        <Label>Kataloq</Label>
        <Icon sf={{ default: 'square.grid.2x2', selected: 'square.grid.2x2.fill' }} />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="search">
        <Label>Axtarış</Label>
        <Icon sf="magnifyingglass" />
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="cart">
        <Label>Səbət</Label>
        <Icon sf={{ default: 'bag', selected: 'bag.fill' }} />
        {itemCount > 0 && <Badge>{itemCount > 99 ? '99+' : String(itemCount)}</Badge>}
      </NativeTabs.Trigger>

      <NativeTabs.Trigger name="profile">
        <Label>Profil</Label>
        <Icon sf={{ default: 'person', selected: 'person.fill' }} />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

