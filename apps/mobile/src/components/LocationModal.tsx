import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  FlatList,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MapPin, Navigation, Check, X, Search } from 'lucide-react-native';
import { useLocation, AZERBAIJAN_REGIONS } from '../context/LocationContext';
import { useTheme } from '../context/ThemeContext';

export default function LocationModal() {
  const {
    selectedRegion,
    isDetectingLocation,
    isModalOpen,
    setIsModalOpen,
    detectGpsLocation,
    selectRegion,
  } = useLocation();

  const { colors } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredRegions = AZERBAIJAN_REGIONS.filter(r =>
    r.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  const handleGpsDetect = async () => {
    const success = await detectGpsLocation();
    if (!success) {
      // If permission denied or error, user stays in modal to pick manually
    }
  };

  return (
    <Modal
      visible={isModalOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setIsModalOpen(false)}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={() => setIsModalOpen(false)}
        />

        <View style={[styles.modalSheet, { backgroundColor: colors.card }]}>
          {/* Header */}
          <View style={[styles.header, { borderBottomColor: colors.border }]}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <MapPin size={18} color="#ffffff" />
              </View>
              <View>
                <Text style={[styles.title, { color: colors.text }]}>Çatdırılma Regionu</Text>
                <Text style={styles.subtitle}>Şəhərinizi seçin və ya GPS ilə təyin edin</Text>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.closeBtn, { backgroundColor: colors.surface }]}
              onPress={() => setIsModalOpen(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <X size={18} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* GPS Auto-detect Button */}
          <TouchableOpacity
            style={[styles.gpsButton, isDetectingLocation && styles.gpsButtonDisabled]}
            activeOpacity={0.8}
            onPress={handleGpsDetect}
            disabled={isDetectingLocation}
          >
            {isDetectingLocation ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Navigation size={18} color="#ffffff" />
            )}
            <Text style={styles.gpsButtonText}>
              {isDetectingLocation ? 'Məkan müəyyən edilir...' : 'Cari Məkanımdan Təyin Et (GPS)'}
            </Text>
          </TouchableOpacity>

          {/* Search Box */}
          <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Search size={16} color={colors.textSecondary} />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Şəhər və ya region axtar..."
              placeholderTextColor={colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <X size={14} color={colors.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          {/* Regions List */}
          <FlatList
            data={filteredRegions}
            keyExtractor={item => item}
            style={styles.list}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => {
              const isSelected = selectedRegion === item;
              return (
                <TouchableOpacity
                  style={[
                    styles.regionItem,
                    { borderBottomColor: colors.border },
                    isSelected && { backgroundColor: 'rgba(79, 83, 59, 0.08)' },
                  ]}
                  activeOpacity={0.7}
                  onPress={() => selectRegion(item)}
                >
                  <View style={styles.regionRow}>
                    <MapPin
                      size={16}
                      color={isSelected ? '#4f533b' : colors.textSecondary}
                    />
                    <Text
                      style={[
                        styles.regionName,
                        { color: colors.text },
                        isSelected && styles.selectedRegionName,
                      ]}
                    >
                      {item}
                    </Text>
                  </View>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Check size={14} color="#ffffff" />
                    </View>
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalSheet: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 16,
    paddingBottom: 32,
    paddingHorizontal: 20,
    maxHeight: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 17,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  gpsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4f533b',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 14,
    gap: 8,
    shadowColor: '#4f533b',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  gpsButtonDisabled: {
    opacity: 0.7,
  },
  gpsButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginTop: 12,
    marginBottom: 8,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    padding: 0,
  },
  list: {
    maxHeight: 320,
  },
  regionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 13,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderRadius: 10,
  },
  regionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  regionName: {
    fontSize: 15,
    fontWeight: '600',
  },
  selectedRegionName: {
    color: '#4f533b',
    fontWeight: '800',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#4f533b',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
