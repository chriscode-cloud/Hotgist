import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const COLORS = {
  primary: '#F77737',
  secondary: '#FF8C42',
  accent: '#FCAF45',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#262626',
  textSecondary: '#8E8E8E'
};

const NameSetupScreen = () => {
  const navigation = useNavigation();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const validateName = (inputName) => {
    if (inputName.length < 3) return 'Name must be at least 3 characters';
    if (inputName.length > 20) return 'Name must be less than 20 characters';
    if (!/^[a-zA-Z0-9_]+$/.test(inputName)) return 'Name can only contain letters, numbers, and underscores';
    return null;
  };

  /**
   * Handles the continue button press
   * Creates an anonymous session on the server instead of local storage
   */
  const handleContinue = async () => {
    console.log('🔘 Continue button pressed, name:', name.trim());

    const validationError = validateName(name.trim());
    if (validationError) {
      console.log('❌ Validation failed:', validationError);
      Alert.alert('Invalid Name', validationError);
      return;
    }

    console.log('✅ Name validation passed, setting loading state...');
    setLoading(true);

    try {
      // Create simple local anonymous user (no server required)
      const anonymousUser = {
        id: `anon_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: name.trim(),
        isAnonymous: true,
        createdAt: new Date().toISOString()
      };

      console.log('💾 Saving user data:', anonymousUser.name);

      // Store locally (client-side only)
      await AsyncStorage.setItem('anonymousUser', JSON.stringify(anonymousUser));

      console.log('✅ User data saved successfully');

      // Small delay to ensure storage is complete
      setTimeout(() => {
        console.log('🏠 Navigating to Home screen...');
        navigation.replace('Home');
      }, 100);

    } catch (error) {
      console.error('❌ Error in handleContinue:', error);
      Alert.alert('Error', 'Failed to save your information. Please try again.');
    } finally {
      // Ensure loading state is reset after a delay
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    }
  };

  const generateSuggestion = () => {
    const adjectives = ['Cool', 'Smart', 'Creative', 'Anonymous', 'Mysterious', 'Campus'];
    const nouns = ['Student', 'Gossip', 'Ninja', 'Hero', 'Legend', 'User', 'Friend'];

    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;

    return `${adj}${noun}${number}`;
  };

  const handleSuggestion = () => {
    setName(generateSuggestion());
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Choose Your Name</Text>
          <Text style={styles.subtitle}>
            Pick a fun anonymous name for the campus community
          </Text>
        </View>

        {/* Name Input */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <Ionicons name="person-outline" size={20} color={COLORS.textSecondary} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Enter your anonymous name"
              value={name}
              onChangeText={setName}
              maxLength={20}
              autoCapitalize="none"
              autoCorrect={false}
            />
            {name.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setName('')}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            )}
          </View>

          <Text style={styles.characterCount}>
            {name.length}/20 characters
          </Text>
        </View>

        {/* Suggestions */}
        <View style={styles.suggestionsContainer}>
          <Text style={styles.suggestionsTitle}>Need inspiration?</Text>
          <TouchableOpacity
            style={styles.suggestionButton}
            onPress={handleSuggestion}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles-outline" size={16} color={COLORS.primary} />
            <Text style={styles.suggestionText}>Generate random name</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Button */}
        <TouchableOpacity
          style={[
            styles.continueButton,
            (name.trim().length < 3 || loading) && styles.continueButtonDisabled
          ]}
          onPress={handleContinue}
          disabled={name.trim().length < 3 || loading}
          activeOpacity={0.8}
          accessible={true}
          accessibilityLabel="Continue to HotGist"
          accessibilityHint="Creates your anonymous profile and navigates to the main feed"
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.continueButtonText}>Setting up...</Text>
            </View>
          ) : (
            <Text style={[
              styles.continueButtonText,
              name.trim().length < 3 && styles.continueButtonTextDisabled
            ]}>
              Continue to HotGist
            </Text>
          )}
        </TouchableOpacity>


        {/* Info */}
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>
            This name will be visible with your posts. You can change it later.
          </Text>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 32,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 280,
  },
  inputContainer: {
    marginBottom: 32,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
  },
  clearButton: {
    marginLeft: 8,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  suggestionsContainer: {
    marginBottom: 40,
    alignItems: 'center',
  },
  suggestionsTitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 12,
  },
  suggestionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: 20,
  },
  suggestionText: {
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: 6,
    fontWeight: '500',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  continueButtonDisabled: {
    backgroundColor: '#EFEFEF',
    shadowOpacity: 0,
    elevation: 0,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  continueButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: `${COLORS.accent}15`,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 'auto',
  },
  infoText: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginLeft: 8,
    lineHeight: 16,
    flex: 1,
  },
});

export default NameSetupScreen;