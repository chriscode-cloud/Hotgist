import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, TextInput, Alert, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';

const COLORS = {
  primary: '#F77737',      // Instagram Orange - warm, energetic, unisex
  secondary: '#FF8C42',    // Warm Orange - friendly, approachable
  accent: '#FCAF45',       // Instagram Yellow - bright, cheerful
  background: '#FFFFFF',   // Pure White - clean, minimal
  surface: '#F8F9FA',      // Light Gray - Instagram's card background
  text: '#262626',         // Instagram Dark - perfect readability
  textSecondary: '#8E8E8E' // Instagram Gray - secondary text
};

const PostScreen = () => {
  const navigation = useNavigation();
  const [postText, setPostText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [localImagePath, setLocalImagePath] = useState(null);

  // Utility functions for local file operations
  const getLocalStorageDir = () => {
    return FileSystem.documentDirectory + 'posts/';
  };

  const ensureStorageDirExists = async () => {
    const dir = getLocalStorageDir();
    const dirInfo = await FileSystem.getInfoAsync(dir);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      console.log('Created local storage directory:', dir);
    }
    return dir;
  };

  const saveImageLocally = async (imageUri, fileName) => {
    try {
      await ensureStorageDirExists();
      const localPath = getLocalStorageDir() + fileName;

      // Copy image from camera roll to local storage
      await FileSystem.copyAsync({
        from: imageUri,
        to: localPath
      });

      console.log('Image saved locally:', localPath);
      return localPath;
    } catch (error) {
      console.error('Error saving image locally:', error);
      throw error;
    }
  };

  const cleanupLocalFile = async (localPath) => {
    try {
      if (localPath && await FileSystem.getInfoAsync(localPath).exists) {
        await FileSystem.deleteAsync(localPath);
        console.log('Cleaned up local file:', localPath);
      }
    } catch (error) {
      console.error('Error cleaning up local file:', error);
    }
  };

  const handleBackPress = () => {
    // Clean up any local files when leaving the screen
    if (localImagePath) {
      cleanupLocalFile(localImagePath);
    }
    navigation.goBack();
  };

  const handleMinePress = () => {
    console.log('Mine pressed - Save as draft');
    // TODO: Implement save as draft functionality
  };

  const submitPost = async () => {
    if (!postText.trim() && !selectedImage) {
      Alert.alert('Error', 'Please add some text or select an image');
      return;
    }

    setIsSubmitting(true);

    try {
      console.log('=== STARTING SUBMIT PROCESS ===');
      console.log('Has selectedImage:', !!selectedImage);
      console.log('Has postText:', !!postText.trim());

      const formData = new FormData();

      // Add text if provided
      if (postText.trim()) {
        formData.append('text', postText.trim());
        console.log('Added text to FormData:', postText.trim());
      }

      // Add image if selected and saved locally
      if (localImagePath && selectedImage) {
        console.log('Using local image path for upload:', localImagePath);

        // Get file extension from local path
        const fileExtension = localImagePath.split('.').pop() || 'jpg';

        // Better MIME type handling
        let mimeType = `image/${fileExtension}`;
        if (fileExtension === 'jpg') {
          mimeType = 'image/jpeg';
        } else if (fileExtension === 'png') {
          mimeType = 'image/png';
        } else if (fileExtension === 'gif') {
          mimeType = 'image/gif';
        } else if (fileExtension === 'webp') {
          mimeType = 'image/webp';
        }

        const imageFile = {
          uri: localImagePath,
          name: `post-image.${fileExtension}`,
          type: mimeType
        };

        console.log('Local image file object for FormData:', JSON.stringify(imageFile, null, 2));

        // Use the local file for upload - this is more reliable in React Native
        formData.append('image', {
          uri: localImagePath,
          name: imageFile.name,
          type: imageFile.type
        });

        console.log('✓ Added local image to FormData for upload');
      } else if (selectedImage && !localImagePath) {
        console.warn('⚠ Selected image but no local path - image may not have been saved properly');
      }


      console.log('About to send request to:', 'http://localhost:3000/api/submit');
      console.log('FormData has image:', selectedImage ? 'YES' : 'NO');
      console.log('FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      // Log the request details before sending
      console.log('=== REQUEST DEBUG INFO ===');
      console.log('Request URL:', 'http://localhost:3000/api/submit');
      console.log('Request method: POST');
      console.log('FormData boundary check:');
      for (let [key, value] of formData.entries()) {
        console.log(`  ${key}: ${typeof value}`);
        if (value && typeof value === 'object' && value.uri) {
          console.log(`    -> URI: ${value.uri}`);
          console.log(`    -> Name: ${value.name}`);
          console.log(`    -> Type: ${value.type}`);
        } else {
          console.log(`    -> Value: ${value}`);
        }
      }

      const response = await fetch('http://localhost:3000/api/submit', {
        method: 'POST',
        body: formData
        // Note: Don't set Content-Type header manually - FormData sets it automatically with boundary
      });

      console.log('=== RESPONSE DEBUG INFO ===');
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (response.ok) {
        const result = await response.json();
        console.log('Post submitted successfully:', result);

        // Clean up local file after successful upload
        if (localImagePath) {
          await cleanupLocalFile(localImagePath);
          setLocalImagePath(null);
          console.log('✓ Cleaned up local file after successful upload');
        }

        // Navigate back to home on success
        navigation.navigate('Home');

        // Show success message with more details
        const successMessage = selectedImage
          ? 'Your post with image has been submitted!'
          : 'Your text post has been submitted!';
        Alert.alert('Success', successMessage);
      } else {
        const errorText = await response.text();
        console.log('Error response body:', errorText);

        // Don't clean up local file on error - keep it for retry
        console.log('⚠ Upload failed - keeping local file for retry:', localImagePath);

        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting post:', error);

      // Provide more specific error messages based on the error type
      let errorMessage = 'Failed to submit post. Please try again.';

      if (error.message.includes('Network request failed')) {
        errorMessage = 'Cannot connect to server. Please check if the server is running on http://localhost:3000';
      } else if (error.message.includes('404')) {
        errorMessage = 'Server endpoint not found. Please check if the API endpoint /api/submit exists on the server';
      } else if (error.message.includes('500')) {
        errorMessage = 'Server error. Please check the server logs for more details';
      } else if (error.message.includes('413')) {
        errorMessage = 'Image file is too large. Please try a smaller image';
      }

      Alert.alert('Error', errorMessage + '\n\nDebug info: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendPress = () => {
    submitPost();
  };

  const handleAddImage = async () => {
    try {
      // Request permissions
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permissionResult.granted === false) {
        Alert.alert('Permission required', 'Permission to access camera roll is required to select images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled) {
        const selectedAsset = result.assets[0];
        console.log('Selected asset:', JSON.stringify(selectedAsset, null, 2));
        console.log('Image URI type:', typeof selectedAsset.uri);
        console.log('Image URI length:', selectedAsset.uri ? selectedAsset.uri.length : 'undefined');
        console.log('Image file size:', selectedAsset.fileSize || 'unknown');
        console.log('Image dimensions:', selectedAsset.width && selectedAsset.height ?
          `${selectedAsset.width}x${selectedAsset.height}` : 'unknown');

        // Validate the selected image
        if (!selectedAsset.uri) {
          Alert.alert('Error', 'Selected image does not have a valid URI');
          return;
        }

        // Additional validation for React Native image objects
        console.log('=== IMAGE VALIDATION ===');
        console.log('URI starts with file:// :', selectedAsset.uri.startsWith('file://'));
        console.log('URI length:', selectedAsset.uri.length);
        console.log('Has file extension:', selectedAsset.uri.includes('.'));
        console.log('MIME type:', selectedAsset.type || 'not provided');

        try {
          // Save image locally first
          const fileExtension = selectedAsset.uri.split('.').pop() || 'jpg';
          const fileName = `post-image-${Date.now()}.${fileExtension}`;
          const localPath = await saveImageLocally(selectedAsset.uri, fileName);

          // Update state with both the original image and local path
          setSelectedImage(selectedAsset);
          setLocalImagePath(localPath);

          console.log('Image saved locally and ready for upload:', localPath);
        } catch (saveError) {
          console.error('Error saving image locally:', saveError);
          Alert.alert('Error', 'Failed to save image locally. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image. Please try again.');
    }
  };

  const handleAddMeme = () => {
    console.log('Add Meme pressed');
    // TODO: Implement meme picker functionality
  };

  const handleRemoveImage = async () => {
    // Clean up local file when removing image
    if (localImagePath) {
      await cleanupLocalFile(localImagePath);
    }
    setSelectedImage(null);
    setLocalImagePath(null);
  };


  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="chevron-back" size={24} color="#171A1F" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>New Gossip</Text>
        <View style={styles.headerRight} />
      </View>
      <View style={styles.content}>
        <View style={styles.textareaContainer}>
          <TextInput
            style={styles.textarea}
            placeholder="What's the gist today? 🤔"
            placeholderTextColor="#565D6D"
            value={postText}
            onChangeText={setPostText}
            multiline={true}
            textAlignVertical="top"
          />
          {selectedImage && (
            <View style={styles.imagePreview}>
              <Image
                source={{ uri: selectedImage.uri }}
                style={styles.previewImage}
                resizeMode="cover"
              />
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={handleRemoveImage}
                activeOpacity={0.7}
              >
                <Ionicons name="close-circle" size={20} color="#FFFFFF" />
              </TouchableOpacity>
              <View style={styles.previewOverlay}>
                <Text style={styles.previewText}>✓</Text>
              </View>
            </View>
          )}
        </View>
      </View>
      <View style={styles.bottomSection}>
        <View style={styles.mediaSection}>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleAddImage}
            activeOpacity={0.7}
          >
            <Ionicons name="image" size={20} color="#171A1F" />
            <Text style={styles.mediaButtonText}>Add Image</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleAddMeme}
            activeOpacity={0.7}
          >
            <Ionicons name="happy" size={20} color="#171A1F" />
            <Text style={styles.mediaButtonText}>Add Meme</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.footer}>
        <TouchableOpacity
          style={styles.mineButton}
          onPress={handleMinePress}
          activeOpacity={0.8}
        >
          <Text style={styles.mineButtonText}>Mine</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendButton, isSubmitting && styles.sendButtonDisabled]}
          onPress={handleSendPress}
          activeOpacity={0.8}
          disabled={isSubmitting}
        >
          <Text style={styles.sendButtonText}>
            {isSubmitting ? 'Sending...' : 'Send It'}
          </Text>
        </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
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
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    backgroundColor: COLORS.background,
    height: 60,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    textAlign: 'center',
    flex: 1,
  },
  headerRight: {
    width: 40, // Balance the back button
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 0,
  },
  textareaContainer: {
    flex: 1,
    width: '100%',
  },
  textarea: {
    width: '100%',
    height: '70%',
    minHeight: 300,
    paddingTop: 16,
    paddingBottom: 16,
    paddingLeft: 16,
    paddingRight: 16,
    fontSize: 18,
    lineHeight: 28,
    fontWeight: '400',
    color: '#565D6D',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#DEE1E6',
    textAlignVertical: 'top',
  },
  imagePreview: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  previewOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: '#F77737',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  deleteButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#FF4444',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  bottomSection: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  mediaSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
  },
  mediaButton: {
    width: 140,
    height: 48,
    backgroundColor: '#FAFAFB',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#565D6D4D',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
  },
  mediaButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#171A1F',
    lineHeight: 26,
  },
  footer: {
    height: 81,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#EFEFEF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  mineButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#F8F9FA',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  mineButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#262626',
  },
  sendButton: {
    flex: 1,
    height: 50,
    backgroundColor: '#F77737',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  sendButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
});

export default PostScreen;