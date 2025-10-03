import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, StatusBar } from 'react-native';
import { FontAwesome, MaterialIcons, Ionicons } from '@expo/vector-icons';
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

const SigninScreen = () => {
  const navigation = useNavigation();

  const handleAnonymousEntry = () => {
    navigation.replace('NameSetup');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.logoGlow}>
            <Text style={styles.logo}>✨HotGist</Text>
          </View>
        </View>

        <View style={styles.welcomeSection}>
          <Text style={styles.welcomeTitle}>Welcome to HotGist!</Text>
          <Text style={styles.welcomeSubtitle}>
            Your anonymous campus buzz just a tap away.
          </Text>
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.googleButton} activeOpacity={0.8}>
            <FontAwesome name="google" size={28} color="#DB4437" />
            <Text style={styles.googleButtonText}>Sign in with Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.phoneButton} activeOpacity={0.8}>
            <MaterialIcons name="phone" size={28} color="#34A853" />
            <Text style={styles.phoneButtonText}>Sign in with Phone number</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.anonymousButton} activeOpacity={0.8} onPress={handleAnonymousEntry}>
            <Ionicons name="person-circle-outline" size={28} color="#FFFFFF" />
            <Text style={styles.anonymousButtonText}>Anonymous Entry</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>By continuing, you agree to our Terms of Service</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 32,
  },
  header: {
    marginBottom: 60,
    alignItems: 'center',
  },
  logoGlow: {
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 20,
    elevation: 10,
  },
  logo: {
    fontSize: 42,
    fontWeight: '700',
    fontStyle: 'italic',
    color: COLORS.text,
    textAlign: 'center',
    letterSpacing: -0.5,
  },
  welcomeSection: {
    alignItems: 'center',
    marginBottom: 48,
  },
  welcomeTitle: {
    fontSize: 28,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: 'center',
    fontWeight: '400',
    letterSpacing: 0.1,
    maxWidth: 260,
    lineHeight: 20,
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 280,
    marginBottom: 32,
  },
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  phoneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  anonymousButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  icon: {
    marginRight: 18,
  },
  googleButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.1,
  },
  phoneButtonText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.1,
  },
  anonymousButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    letterSpacing: 0.1,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    color: COLORS.textSecondary,
    fontSize: 13,
    fontWeight: '400',
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default SigninScreen;