import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, StatusBar, ActivityIndicator, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

const COLORS = {
  primary: '#F77737',      // Instagram Orange - warm, energetic, unisex
  secondary: '#FF8C42',    // Warm Orange - friendly, approachable
  accent: '#FCAF45',       // Instagram Yellow - bright, cheerful
  background: '#FFFFFF',   // Pure White - clean, minimal
  surface: '#F8F9FA',      // Light Gray - Instagram's card background
  text: '#262626',         // Instagram Dark - perfect readability
  textSecondary: '#8E8E8E' // Instagram Gray - secondary text
};

const CampusScreen = () => {
  const navigation = useNavigation();
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [campuses, setCampuses] = useState([]);
  const [filteredCampuses, setFilteredCampuses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadCampuses();
  }, []);

  // Filter campuses based on search query
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredCampuses(campuses);
    } else {
      const filtered = campuses.filter(campus =>
        campus.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campus.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        campus.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCampuses(filtered);
    }
  }, [campuses, searchQuery]);

  const loadCampuses = async () => {
    try {
      setLoading(true);
      const response = await apiService.getCampuses();

      if (response.success) {
        // Transform server data to match component format
        const formattedCampuses = response.campuses.map((campus, index) => ({
          id: campus.id,
          name: campus.code,
          fullName: campus.name,
          location: campus.location,
          type: campus.type || 'University'
        }));
        setCampuses(formattedCampuses);
      } else {
        throw new Error('Failed to load campuses');
      }
    } catch (error) {
      console.error('Error loading campuses:', error);
      // Fallback to hardcoded data if server fails
      setCampuses([
        { id: 'GCTU', name: 'GCTU', fullName: 'Ghana Communication Technology University', location: 'Accra' },
        { id: 'UG', name: 'UG', fullName: 'University of Ghana', location: 'Accra' },
        { id: 'KNUST', name: 'KNUST', fullName: 'Kwame Nkrumah University of Science and Technology', location: 'Kumasi' },
        { id: 'UCC', name: 'UCC', fullName: 'University of Cape Coast', location: 'Cape Coast' },
        { id: 'UPSA', name: 'UPSA', fullName: 'University of Professional Studies', location: 'Accra' },
        { id: 'UENR', name: 'UENR', fullName: 'University of Energy and Natural Resources', location: 'Sunyani' },
        { id: 'UMaT', name: 'UMaT', fullName: 'University of Mines and Technology', location: 'Tarkwa' },
        { id: 'UDS', name: 'UDS', fullName: 'University for Development Studies', location: 'Tamale' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCampusSelect = async (campus) => {
    try {
      setSelectedCampus(campus.id);

      // Save selected campus to localStorage
      await AsyncStorage.setItem('selectedCampus', campus.id);

      console.log('✅ Campus selected and saved:', campus.name);

      // Navigate to campus-specific posts screen
      navigation.navigate('CampusPosts', {
        campusId: campus.id,
        campusName: campus.fullName || campus.name
      });
    } catch (error) {
      console.error('❌ Error saving selected campus:', error);
      // Still navigate to campus posts even if saving fails
      navigation.navigate('CampusPosts', {
        campusId: campus.id,
        campusName: campus.fullName || campus.name
      });
    }
  };

  const renderCampusItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.campusItem,
        selectedCampus === item.id && styles.selectedCampusItem
      ]}
      onPress={() => handleCampusSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.campusIcon}>
        <Text style={styles.campusIconText}>{item.name.charAt(0)}</Text>
      </View>
      <View style={styles.campusInfo}>
        <Text style={[
          styles.campusName,
          selectedCampus === item.id && styles.selectedCampusName
        ]}>
          {item.name}
        </Text>
        <Text style={[
          styles.campusFullName,
          selectedCampus === item.id && styles.selectedCampusFullName
        ]}>
          {item.fullName}
        </Text>
      </View>
      <Ionicons
        name={selectedCampus === item.id ? "checkmark-circle" : "chevron-forward"}
        size={20}
        color={selectedCampus === item.id ? COLORS.primary : COLORS.textSecondary}
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Select Campus</Text>
        <View style={styles.headerSpacer} />
      </View>

      {/* Search Bar */}
      {!loading && campuses.length > 0 && (
        <View style={styles.searchContainer}>
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={COLORS.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search campuses..."
              placeholderTextColor={COLORS.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      )}

      {/* Campus List */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading campuses...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredCampuses}
          renderItem={renderCampusItem}
          keyExtractor={(item) => item.id}
          showsVerticalScrollIndicator={true}
          contentContainerStyle={styles.listContainer}
          style={styles.flatList}
          scrollEnabled={true}
          bounces={true}
          decelerationRate="normal"
          scrollEventThrottle={16}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="school-outline" size={64} color={COLORS.textSecondary} />
              <Text style={styles.emptyText}>No campuses found</Text>
              <Text style={styles.emptySubtext}>Try adjusting your search terms</Text>
            </View>
          }
          keyboardShouldPersistTaps="handled"
          removeClippedSubviews={true}
          maxToRenderPerBatch={10}
          updateCellsBatchingPeriod={50}
          windowSize={10}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 32,
  },
  listContainer: {
    paddingTop: 8,
    paddingBottom: 100, // Extra space at bottom for better scrolling
  },
  flatList: {
    flex: 1,
  },
  campusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginHorizontal: 16,
    marginVertical: 4,
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    minHeight: 80, // Ensure minimum height for consistent layout
  },
  selectedCampusItem: {
    backgroundColor: `${COLORS.primary}15`,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  campusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  campusIconText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  campusInfo: {
    flex: 1,
  },
  campusName: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 2,
  },
  selectedCampusName: {
    color: COLORS.primary,
  },
  campusFullName: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 18,
  },
  selectedCampusFullName: {
    color: COLORS.primary,
    opacity: 0.8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    marginLeft: 8,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
    backgroundColor: COLORS.background,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default CampusScreen;