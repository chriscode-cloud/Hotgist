import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
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

const Header = ({
  title = 'HotGist',
  onNotificationPress,
  onAvatarPress,
  showAvatar = true,
  showNotification = true
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        {/* Left: Title */}
        <View style={styles.leftSection}>
          <Text style={styles.title}>{title}</Text>
        </View>

        {/* Center: Notification Icon */}
        {showNotification && (
          <TouchableOpacity
            style={styles.centerSection}
            onPress={onNotificationPress}
          >
            <Ionicons
              name="notifications-outline"
              size={24}
              color={COLORS.text}
            />
          </TouchableOpacity>
        )}

        {/* Right: Avatar */}
        {showAvatar && (
          <TouchableOpacity
            style={styles.rightSection}
            onPress={onAvatarPress}
          >
            <View style={styles.avatarContainer}>
              <Image
                source={{ uri: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop&crop=face' }}
                style={styles.avatar}
                defaultSource={{ uri: 'https://via.placeholder.com/100x100/FF8C42/FFFFFF?text=👤' }}
              />
            </View>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    height: 56,
  },
  leftSection: {
    flex: 1,
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  centerSection: {
    position: 'absolute',
    right: 60,
    paddingHorizontal: 8,
  },
  rightSection: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});

export default Header;