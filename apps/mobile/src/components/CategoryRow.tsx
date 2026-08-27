import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import {
  Sun,
  Gamepad2,
  Coffee,
  Smartphone,
  Watch,
  Laptop,
  Tv,
  Home as HomeIcon,
  Shirt,
  Utensils,
  Scissors,
  Armchair,
  Bike,
  Wind,
  HeartPulse,
  Sparkles,
  Glasses,
  Car,
  Stethoscope,
  Dumbbell,
  Headphones,
  Layers,
} from 'lucide-react-native';
import { Category } from '../types';
import { useTheme } from '../context/ThemeContext';

interface CategoryRowProps {
  categories: Category[];
  selectedSlug?: string;
  onSelect?: (slug: string) => void;
}

const WEB_ORDER_SLUGS = [
  'summer', 'yay',
  'gamer', 'gaming',
  'coffee', 'qehve', 'qəhvə',
  'smartphone', 'smartphones', 'smartfon', 'telefon',
  'watch', 'watches', 'saat',
  'laptop', 'laptops', 'laptops-pc', 'noutbuk',
  'tv', 'tv-audio', 'televizor',
  'climate', 'climate-tech', 'serinlik', 'iqlim',
  'home', 'home-appliances', 'big-appliances', 'boyuk', 'böyük',
  'household', 'small-appliances', 'meiset', 'məişət',
  'kitchen', 'kitchenware', 'qab',
  'beauty', 'beauty-care', 'gozellik', 'gözəllik',
  'furniture', 'furniture-decor', 'mebel',
  'transport', 'bike', 'skuter',
  'active', 'active-living', 'idman',
  'sun', 'sun-style', 'eynek',
  'auto', 'auto-moto', 'avto',
  'medical', 'medical-products', 'tibbi'
];

export function getCategoryPriority(cat: Category): number {
  if (typeof cat.sort_order === 'number') return cat.sort_order;
  if (typeof (cat as any).order === 'number') return (cat as any).order;
  const slug = (cat.slug || '').toLowerCase();
  const name = (cat.name || '').toLowerCase();
  const index = WEB_ORDER_SLUGS.findIndex(s => slug.includes(s) || name.includes(s));
  return index !== -1 ? index : 999;
}

import { resolveImageUrl } from '../api/client';

export function renderCategoryIcon(
  iconKey?: string,
  slug?: string,
  name?: string,
  iconUrl?: string | null,
  color: string = '#4f533b',
  size: number = 22
) {
  const resolved = resolveImageUrl(iconUrl);
  if (resolved && resolved.trim() !== '') {
    return (
      <Image
        source={{ uri: resolved }}
        style={{ width: size, height: size }}
        resizeMode="contain"
      />
    );
  }

  const combined = `${iconKey || ''} ${slug || ''} ${name || ''}`.toLowerCase();

  if (combined.includes('summer') || combined.includes('yay') || combined.includes('sun')) {
    return <Sun size={size} color={color} />;
  }
  if (combined.includes('gaming') || combined.includes('gamepad') || combined.includes('oyun') || combined.includes('konsol')) {
    return <Gamepad2 size={size} color={color} />;
  }
  if (combined.includes('coffee') || combined.includes('qehve') || combined.includes('qəhvə') || combined.includes('small-appliances')) {
    return <Coffee size={size} color={color} />;
  }
  if (combined.includes('smartphone') || combined.includes('smartfon') || combined.includes('telefon') || combined.includes('phone') || combined.includes('planset') || combined.includes('tablet')) {
    return <Smartphone size={size} color={color} />;
  }
  if (combined.includes('watch') || combined.includes('saat')) {
    return <Watch size={size} color={color} />;
  }
  if (combined.includes('laptop') || combined.includes('noutbuk') || combined.includes('pc') || combined.includes('komp')) {
    return <Laptop size={size} color={color} />;
  }
  if (combined.includes('tv') || combined.includes('audio') || combined.includes('televizor') || combined.includes('video')) {
    return <Tv size={size} color={color} />;
  }
  if (combined.includes('climate') || combined.includes('serinlik') || combined.includes('iqlim') || combined.includes('wind') || combined.includes('kondisioner')) {
    return <Wind size={size} color={color} />;
  }
  if (combined.includes('big-appliances') || combined.includes('boyuk') || combined.includes('böyük') || combined.includes('soyuducu') || combined.includes('paltaryuyan')) {
    return <HomeIcon size={size} color={color} />;
  }
  if (combined.includes('household') || combined.includes('meiset') || combined.includes('məişət') || combined.includes('shirt')) {
    return <Shirt size={size} color={color} />;
  }
  if (combined.includes('kitchen') || combined.includes('qab') || combined.includes('utensils')) {
    return <Utensils size={size} color={color} />;
  }
  if (combined.includes('beauty') || combined.includes('gozellik') || combined.includes('gözəllik') || combined.includes('baxim') || combined.includes('scissors')) {
    return <Scissors size={size} color={color} />;
  }
  if (combined.includes('furniture') || combined.includes('mebel') || combined.includes('tekstil') || combined.includes('armchair')) {
    return <Armchair size={size} color={color} />;
  }
  if (combined.includes('transport') || combined.includes('neqliyyat') || combined.includes('skuter') || combined.includes('bike') || combined.includes('velosiped')) {
    return <Bike size={size} color={color} />;
  }
  if (combined.includes('active') || combined.includes('idman') || combined.includes('yasam') || combined.includes('dumbbell')) {
    return <Dumbbell size={size} color={color} />;
  }
  if (combined.includes('eynek') || combined.includes('glasses') || combined.includes('gunes')) {
    return <Glasses size={size} color={color} />;
  }
  if (combined.includes('auto') || combined.includes('avto') || combined.includes('car')) {
    return <Car size={size} color={color} />;
  }
  if (combined.includes('medical') || combined.includes('tibbi') || combined.includes('saglamliq') || combined.includes('stethoscope') || combined.includes('heartpulse')) {
    return <Stethoscope size={size} color={color} />;
  }
  if (combined.includes('clean') || combined.includes('tozsoran') || combined.includes('sparkles') || combined.includes('bag')) {
    return <Sparkles size={size} color={color} />;
  }
  if (combined.includes('headphone') || combined.includes('qulaqliq') || combined.includes('aksesuar')) {
    return <Headphones size={size} color={color} />;
  }

  return <Layers size={size} color={color} />;
}

export default function CategoryRow({ categories, selectedSlug, onSelect }: CategoryRowProps) {
  const router = useRouter();
  const { colors } = useTheme();

  // Filter only Level-1 root categories and deduplicate so no categories ever repeat
  const topCategories = React.useMemo(() => {
    const seenSlugs = new Set<string>();
    const seenNames = new Set<string>();
    return (categories || [])
      .filter(c => {
        const isRoot = !c.parent_id || c.parent_id === 'root' || c.parent_id === '' || c.level === 1;
        if (!isRoot) return false;
        const slugKey = (c.slug || c.id || '').toLowerCase();
        const nameKey = (c.name || '').toLowerCase().trim();
        if (seenSlugs.has(slugKey) || seenNames.has(nameKey)) return false;
        seenSlugs.add(slugKey);
        seenNames.add(nameKey);
        return true;
      })
      .sort((a, b) => getCategoryPriority(a) - getCategoryPriority(b));
  }, [categories]);

  const handlePress = (cat: Category) => {
    if (onSelect) {
      onSelect(cat.slug);
    } else {
      router.push({
        pathname: '/category/[slug]',
        params: { slug: cat.slug, name: cat.name },
      });
    }
  };

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.scrollContent}
    >
      {topCategories.map(cat => {
        const isActive = selectedSlug === cat.slug;
        const iconColor = isActive ? '#ffffff' : '#4f533b';

        return (
          <TouchableOpacity
            key={cat.id || cat.slug}
            style={styles.item}
            onPress={() => handlePress(cat)}
            activeOpacity={0.75}
          >
            <View
              style={[
                styles.iconCircle,
                {
                  backgroundColor: isActive ? '#4f533b' : colors.card,
                  borderColor: isActive ? '#4f533b' : colors.border,
                },
              ]}
            >
              {renderCategoryIcon(cat.icon, cat.slug, cat.name, cat.icon_url, iconColor, 22)}
            </View>
            <Text
              style={[
                styles.name,
                { color: isActive ? '#4f533b' : colors.text },
                isActive && styles.activeName,
              ]}
              numberOfLines={2}
            >
              {cat.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingHorizontal: 16,
    gap: 12,
    paddingVertical: 6,
  },
  item: {
    alignItems: 'center',
    width: 72,
  },
  iconCircle: {
    width: 56,
    height: 56,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 6,
  },
  name: {
    fontSize: 11,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
    lineHeight: 14,
  },
  activeName: {
    fontFamily: 'PlusJakartaSans_800ExtraBold',
    color: '#4f533b',
  },
});
