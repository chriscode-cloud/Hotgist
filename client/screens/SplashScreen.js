import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const COLORS = {
  primary: '#F77737',      // Instagram Orange - warm, energetic, unisex
  secondary: '#FF8C42',    // Warm Orange - friendly, approachable
  accent: '#FCAF45',       // Instagram Yellow - bright, cheerful
  background: '#FFFFFF',   // Pure White - clean, minimal
  surface: '#F8F9FA',      // Light Gray - Instagram's card background
  text: '#262626',         // Instagram Dark - perfect readability
  textSecondary: '#8E8E8E' // Instagram Gray - secondary text
};

const SplashScreen = () => {
  const navigation = useNavigation();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.replace('Signin');
    }, 5000); // 5 seconds

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoGlow}>
          <Text style={styles.sparkle}>✨</Text>
          <Text style={styles.title}>HotGist</Text>
        </View>
        <Text style={styles.subtitle}>Where Campus Gossip lives 🔥</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    padding: 40,
  },
  content: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  logoGlow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 30,
    elevation: 15,
  },
  sparkle: {
    fontSize: 40,
    color: COLORS.secondary,
    marginRight: 12,
    textShadowColor: COLORS.secondary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: '800',
    fontStyle: 'italic',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -1,
    textShadowColor: COLORS.primary,
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 25,
  },
  subtitle: {
    fontSize: 20,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '500',
    letterSpacing: 0.3,
    maxWidth: 300,
    lineHeight: 28,
  },
});

export default SplashScreen;