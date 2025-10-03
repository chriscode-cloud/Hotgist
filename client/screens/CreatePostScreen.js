import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  StatusBar,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import SuccessModal from '../components/SuccessModal';

const COLORS = {
  primary: '#F77737',
  secondary: '#FF8C42',
  accent: '#FCAF45',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#262626',
  textSecondary: '#8E8E8E'
};

const CreatePostScreen = () => {
  const navigation = useNavigation();
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedCampus, setSelectedCampus] = useState(null);
  const [selectedCampusName, setSelectedCampusName] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  useEffect(() => {
    loadUserData();
    loadSelectedCampus();
  }, []);


  /**
   * Loads user data from local storage
   * Simple client-side anonymous user management for posting
   */
  const loadUserData = async () => {
    try {
      console.log('🔄 Loading user data for posting...');
      // Load user data from local storage
      const userData = await AsyncStorage.getItem('anonymousUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
        console.log('✅ User loaded for posting:', parsedUser.name);
        console.log('👤 User data:', parsedUser);
      } else {
        console.log('⚠️ No user data found in storage');
      }
    } catch (error) {
      console.error('❌ Error loading user data for posting:', error);
    }
  };

 const loadSelectedCampus = async () => {
   try {
     const campusId = await AsyncStorage.getItem('selectedCampus');
     if (campusId) {
       console.log('✅ Loaded selected campus for posting:', campusId);
       setSelectedCampus(campusId);

       // Load campus name from campuses data (with fallback)
       try {
         const response = await apiService.getCampuses();
         if (response.success && response.campuses) {
           const campus = response.campuses.find(c => c.id === campusId);
           if (campus) {
             setSelectedCampusName(campus.name);
             console.log('✅ Campus name loaded:', campus.name);
           } else {
             setSelectedCampusName(campusId);
           }
         } else {
           setSelectedCampusName(campusId);
         }
       } catch (error) {
         console.warn('Could not load campus name from API, using ID instead');
         setSelectedCampusName(campusId);
       }
     } else {
       console.log('ℹ️ No campus selected yet');
     }
   } catch (error) {
     console.error('❌ Error loading selected campus:', error);
   }
 };

 const validatePost = (postContent) => {
    if (!postContent || postContent.trim().length === 0) {
      return 'Post content cannot be empty';
    }

    if (postContent.trim().length > 500) {
      return 'Post content must be less than 500 characters';
    }

    return null;
  };

  const handleSubmitPost = async () => {
    console.log('🔘 Submit post button pressed');

    const validationError = validatePost(content);
    if (validationError) {
      console.log('❌ Validation failed:', validationError);
      Alert.alert('Invalid Post', validationError);
      return;
    }

    console.log('✅ Validation passed, setting loading state...');
    setLoading(true);

    try {
      const postData = {
        content: content.trim(),
        campus: selectedCampus || 'GCTU', // Default to GCTU as in the curl example
        authorName: user?.name || 'AnonymousUser123' // Default to AnonymousUser123 as in the curl example
      };

      console.log('📝 Post data to send:', postData);

      const response = await apiService.createPost(postData);
      console.log('📡 Server response:', response);

      if (response.success) {
        console.log('✅ Post created successfully, showing success modal');
        // Show success modal
        setShowSuccessModal(true);
      } else {
        throw new Error(response.error || 'Failed to create post');
      }

    } catch (error) {
      console.error('❌ Error creating post:', error);
      Alert.alert(
        'Error',
        error.message || 'Failed to create post. Please check your connection and try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (content.trim().length > 0) {
      Alert.alert(
        'Discard Post?',
        'Are you sure you want to discard this post?',
        [
          { text: 'Keep Writing', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => {
            setContent(''); // Clear content before navigating back
            navigation.goBack();
          }}
        ]
      );
    } else {
      setContent(''); // Clear content before navigating back
      navigation.goBack();
    }
  };

  // Show loading only while submitting post
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Posting...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.background} />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.cancelButton}
          onPress={handleCancel}
          disabled={loading}
        >
          <Text style={styles.cancelButtonText}>Cancel</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Create Post</Text>

        <TouchableOpacity
          style={[
            styles.postButton,
            (content.trim().length === 0 || loading) && styles.postButtonDisabled
          ]}
          onPress={handleSubmitPost}
          disabled={content.trim().length === 0 || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <Text style={[
              styles.postButtonText,
              content.trim().length === 0 && styles.postButtonTextDisabled
            ]}>
              Post
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Current Campus Display */}
        {selectedCampusName && (
          <View style={styles.campusInfo}>
            <View style={styles.currentCampusDisplay}>
              <Ionicons name="school" size={16} color={COLORS.primary} />
              <Text style={styles.currentCampusText}>{selectedCampusName} Campus</Text>
            </View>
          </View>
        )}

        {/* Post Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="What's happening on campus?"
            placeholderTextColor={COLORS.textSecondary}
            value={content}
            onChangeText={setContent}
            multiline
            maxLength={500}
            textAlignVertical="top"
            autoFocus
          />

          <View style={styles.inputFooter}>
            <Text style={[
              styles.characterCount,
              content.length > 450 && styles.characterCountWarning,
              content.length > 500 && styles.characterCountError
            ]}>
              {content.length}/500
            </Text>
          </View>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>Tips for posting:</Text>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            <Text style={styles.tipText}>Keep it respectful and campus-appropriate</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            <Text style={styles.tipText}>Share events, study tips, or campus discussions</Text>
          </View>
          <View style={styles.tipItem}>
            <Ionicons name="checkmark-circle" size={16} color={COLORS.primary} />
            <Text style={styles.tipText}>Your name stays anonymous to everyone</Text>
          </View>
        </View>
      </ScrollView>

      {/* Success Modal */}
      <SuccessModal
        visible={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigation.goBack(); // Go back to home screen
        }}
        postContent={content.trim()}
        campusName={selectedCampusName || 'General'}
      />
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
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
  cancelButton: {
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  postButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  postButtonDisabled: {
    backgroundColor: '#EFEFEF',
  },
  postButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  postButtonTextDisabled: {
    color: COLORS.textSecondary,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  campusInfo: {
    paddingVertical: 16,
    marginBottom: 8,
  },
  currentCampusDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: `${COLORS.primary}30`,
  },
  currentCampusText: {
    fontSize: 16,
    color: COLORS.text,
    marginLeft: 8,
    fontWeight: '500',
  },
  inputContainer: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#EFEFEF',
  },
  textInput: {
    fontSize: 16,
    color: COLORS.text,
    minHeight: 120,
    maxHeight: 200,
  },
  inputFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
  },
  characterCount: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  characterCountWarning: {
    color: COLORS.accent,
  },
  characterCountError: {
    color: '#FF4444',
  },
  tipsContainer: {
    backgroundColor: `${COLORS.accent}15`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 32,
  },
  tipsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 8,
    flex: 1,
    lineHeight: 18,
  },
});

export default CreatePostScreen;