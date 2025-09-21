// src/screens/CreatePostScreen.js
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { colors } from '../utils/theme';

export default function CreatePostScreen({ navigation }) {
  const [content, setContent] = useState('');
  const [imageUri, setImageUri] = useState(null);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth(); // use current user directly

  // Pick image from library
  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) setImageUri(result.assets[0].uri);
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  // Take a photo using camera
  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) setImageUri(result.assets[0].uri);
    } catch (error) {
      console.error('Error taking photo:', error);
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const showImageOptions = () => {
    Alert.alert('Add Image', 'Choose an option', [
      { text: 'Camera', onPress: takePhoto },
      { text: 'Photo Library', onPress: pickImage },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const removeImage = () => setImageUri(null);

  const handleSubmit = async () => {
    if (!content.trim()) return Alert.alert('Error', 'Please write something before posting');
    if (content.length > 1000) return Alert.alert('Error', 'Post is too long (max 1000 characters)');

    setLoading(true);
    try {
      const postData = { content: content.trim(), imageUrl: imageUri || null };
      if (!api.createPost) throw new Error('createPost function is not defined in api.js');

      await api.createPost(postData);

      setContent('');
      setImageUri(null);

      Alert.alert('Success', 'Post created successfully!', [
        { text: 'OK', onPress: () => navigation.navigate('Home') },
      ]);
    } catch (error) {
      console.error('Failed to create post:', error);
      Alert.alert('Error', 'Failed to create post. Please check your network or backend.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.authorInfo}>
            {user?.photoURL ? (
              <Image source={{ uri: user.photoURL }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={20} color={colors.white} />
              </View>
            )}
            <Text style={styles.authorName}>{user?.displayName || 'Anonymous'}</Text>
          </View>
        </View>

        <View style={styles.content}>
          <TextInput
            style={styles.textInput}
            placeholder="What's the hottest take you have? 🔥"
            placeholderTextColor={colors.placeholder}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={1000}
            textAlignVertical="top"
          />

          <Text style={styles.characterCount}>{content.length}/1000</Text>

          {imageUri && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: imageUri }} style={styles.selectedImage} />
              <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                <Ionicons name="close-circle" size={24} color={colors.error} />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.imageOptions}>
            <TouchableOpacity style={styles.imageButton} onPress={showImageOptions}>
              <Ionicons name="image-outline" size={24} color={colors.primary} />
              <Text style={styles.imageButtonText}>Add Image</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.submitButton, (!content.trim() || loading) && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={!content.trim() || loading}
        >
          <Text style={styles.submitButtonText}>{loading ? 'Posting...' : 'Post'}</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  scrollView: { flex: 1 },
  header: { padding: 15, borderBottomWidth: 1, borderBottomColor: colors.border },
  authorInfo: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorName: { fontSize: 16, fontWeight: 'bold', color: colors.text },
  content: { padding: 15 },
  textInput: { fontSize: 16, color: colors.text, minHeight: 120, textAlignVertical: 'top', marginBottom: 10 },
  characterCount: { fontSize: 12, color: colors.textSecondary, textAlign: 'right', marginBottom: 20 },
  imageContainer: { position: 'relative', marginBottom: 15 },
  selectedImage: { width: '100%', height: 200, borderRadius: 8, resizeMode: 'cover' },
  removeImageButton: { position: 'absolute', top: 8, right: 8, backgroundColor: colors.white, borderRadius: 12 },
  imageOptions: { flexDirection: 'row', justifyContent: 'center' },
  imageButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.surface, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 20, borderWidth: 1, borderColor: colors.primary },
  imageButtonText: { marginLeft: 8, color: colors.primary, fontWeight: '500' },
  footer: { padding: 15, borderTopWidth: 1, borderTopColor: colors.border },
  submitButton: { backgroundColor: colors.primary, paddingVertical: 15, borderRadius: 12, alignItems: 'center' },
  submitButtonDisabled: { backgroundColor: colors.gray },
  submitButtonText: { color: colors.white, fontSize: 16, fontWeight: 'bold' },
});
