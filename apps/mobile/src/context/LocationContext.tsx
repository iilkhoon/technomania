import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

export const AZERBAIJAN_REGIONS = [
  'Bakı',
  'Sumqayıt',
  'Xırdalan',
  'Gəncə',
  'Mingəçevir',
  'Şəki',
  'Naxçıvan',
  'Lənkəran',
  'Quba',
  'Qəbələ',
  'Şirvan',
  'Yevlax',
  'Bərdə',
  'Xaçmaz',
  'Masallı',
  'Şəmkir',
  'Zaqatala',
  'Qazax',
  'Tovuz',
  'Cəlilabad',
  'Salyan',
  'İsmayıllı',
  'Şamaxı',
  'Göyçay',
  'Ağdam',
  'Xankəndi',
  'Şuşa',
  'Digər regionlar',
];

interface LocationContextType {
  selectedRegion: string;
  isDetectingLocation: boolean;
  isModalOpen: boolean;
  setIsModalOpen: (open: boolean) => void;
  detectGpsLocation: () => Promise<boolean>;
  selectRegion: (region: string) => void;
}

const REGION_STORAGE_KEY = '@technomania_selected_region';

const LocationContext = createContext<LocationContextType>({
  selectedRegion: 'Bakı',
  isDetectingLocation: false,
  isModalOpen: false,
  setIsModalOpen: () => {},
  detectGpsLocation: async () => false,
  selectRegion: () => {},
});

export const useLocation = () => useContext(LocationContext);

// Maps reverse geocode results to Azerbaijani standardized region names
function mapCityToAzRegion(cityOrRegion?: string | null): string {
  if (!cityOrRegion) return 'Bakı';
  const norm = cityOrRegion.toLowerCase().trim();

  if (norm.includes('baku') || norm.includes('baki') || norm.includes('bakı') || norm.includes('abseron') || norm.includes('abşeron')) {
    return 'Bakı';
  }
  if (norm.includes('sumqayit') || norm.includes('sumgayit') || norm.includes('sumgait') || norm.includes('sumqayıt')) {
    return 'Sumqayıt';
  }
  if (norm.includes('khirdalan') || norm.includes('xirdalan') || norm.includes('xırdalan')) {
    return 'Xırdalan';
  }
  if (norm.includes('ganja') || norm.includes('gyandzha') || norm.includes('gəncə') || norm.includes('gence')) {
    return 'Gəncə';
  }
  if (norm.includes('mingachevir') || norm.includes('mingecevir') || norm.includes('mingəçevir')) {
    return 'Mingəçevir';
  }
  if (norm.includes('sheki') || norm.includes('shaki') || norm.includes('şəki') || norm.includes('seki')) {
    return 'Şəki';
  }
  if (norm.includes('nakhchivan') || norm.includes('naxcivan') || norm.includes('naxçıvan')) {
    return 'Naxçıvan';
  }
  if (norm.includes('lankaran') || norm.includes('lenkoran') || norm.includes('lənkəran')) {
    return 'Lənkəran';
  }
  if (norm.includes('quba') || norm.includes('guba')) {
    return 'Quba';
  }
  if (norm.includes('gabala') || norm.includes('qebele') || norm.includes('qəbələ')) {
    return 'Qəbələ';
  }
  if (norm.includes('shirvan') || norm.includes('şirvan')) {
    return 'Şirvan';
  }
  if (norm.includes('yevlakh') || norm.includes('yevlax')) {
    return 'Yevlax';
  }
  if (norm.includes('barda') || norm.includes('bərdə')) {
    return 'Bərdə';
  }
  if (norm.includes('khachmaz') || norm.includes('xacmaz') || norm.includes('xaçmaz')) {
    return 'Xaçmaz';
  }
  if (norm.includes('masalli') || norm.includes('masallı')) {
    return 'Masallı';
  }
  if (norm.includes('shamkir') || norm.includes('semkir') || norm.includes('şəmkir')) {
    return 'Şəmkir';
  }
  if (norm.includes('zaqatala') || norm.includes('zagatala')) {
    return 'Zaqatala';
  }
  if (norm.includes('shusha') || norm.includes('şuşa')) {
    return 'Şuşa';
  }
  if (norm.includes('khankendi') || norm.includes('xankəndi')) {
    return 'Xankəndi';
  }

  // Exact match with known regions
  const matched = AZERBAIJAN_REGIONS.find(r => r.toLowerCase() === norm);
  if (matched) return matched;

  return cityOrRegion.length > 2 ? cityOrRegion : 'Bakı';
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [selectedRegion, setSelectedRegion] = useState<string>('Bakı');
  const [isDetectingLocation, setIsDetectingLocation] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  useEffect(() => {
    // Load cached region on startup
    AsyncStorage.getItem(REGION_STORAGE_KEY).then(saved => {
      if (saved) {
        setSelectedRegion(saved);
      } else {
        // Automatically try to detect on first startup
        detectGpsLocation();
      }
    });
  }, []);

  const selectRegion = (region: string) => {
    setSelectedRegion(region);
    AsyncStorage.setItem(REGION_STORAGE_KEY, region).catch(() => {});
    setIsModalOpen(false);
  };

  const detectGpsLocation = async (): Promise<boolean> => {
    setIsDetectingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setIsDetectingLocation(false);
        return false;
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      if (location && location.coords) {
        const [geocode] = await Location.reverseGeocodeAsync({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });

        if (geocode) {
          const detectedCity = geocode.city || geocode.subregion || geocode.region || geocode.district;
          const mapped = mapCityToAzRegion(detectedCity);
          selectRegion(mapped);
          setIsDetectingLocation(false);
          return true;
        }
      }
    } catch (error) {
      console.warn('GPS location detection error:', error);
    } finally {
      setIsDetectingLocation(false);
    }
    return false;
  };

  return (
    <LocationContext.Provider
      value={{
        selectedRegion,
        isDetectingLocation,
        isModalOpen,
        setIsModalOpen,
        detectGpsLocation,
        selectRegion,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}
