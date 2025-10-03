import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const COLORS = {
  primary: '#F77737',      // Instagram Orange - warm, energetic, unisex
  secondary: '#FF8C42',    // Warm Orange - friendly, approachable
  accent: '#FCAF45',       // Instagram Yellow - bright, cheerful
  background: '#FFFFFF',   // Pure White - clean, minimal
  surface: '#F8F9FA',      // Light Gray - Instagram's card background
  text: '#262626',         // Instagram Dark - perfect readability
  textSecondary: '#8E8E8E' // Instagram Gray - secondary text
};

const Footer = ({
  onHomePress,
  onSearchPress,
  onNotificationPress,
  onProfilePress,
  activeTab = 'home'
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'home' && styles.activeTab]}
          onPress={onHomePress}
        >
          <Ionicons
            name="home"
            size={24}
            color={activeTab === 'home' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'home' && styles.activeTabText]}>
            Home
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'search' && styles.activeTab]}
          onPress={onSearchPress}
        >
          <Ionicons
            name="school"
            size={24}
            color={activeTab === 'search' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'search' && styles.activeTabText]}>
            Campus
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'notifications' && styles.activeTab]}
          onPress={onNotificationPress}
        >
          <Ionicons
            name="notifications"
            size={24}
            color={activeTab === 'notifications' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'notifications' && styles.activeTabText]}>
            Alerts
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'profile' && styles.activeTab]}
          onPress={onProfilePress}
        >
          <Ionicons
            name="person"
            size={24}
            color={activeTab === 'profile' ? COLORS.primary : COLORS.textSecondary}
          />
          <Text style={[styles.tabText, activeTab === 'profile' && styles.activeTabText]}>
            Profile
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: COLORS.background,
  },
  tab: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 60,
  },
  activeTab: {
    backgroundColor: `${COLORS.primary}15`, // 15% opacity of primary color
  },
  tabText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.textSecondary,
    marginTop: 2,
    textAlign: 'center',
  },
  activeTabText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});

export default Footer;