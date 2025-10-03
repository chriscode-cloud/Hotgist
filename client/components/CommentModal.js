import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Modal,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';

const COLORS = {
  primary: '#F77737',
  secondary: '#FF8C42',
  accent: '#FCAF45',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#262626',
  textSecondary: '#8E8E8E'
};

const CommentModal = ({ visible, onClose, postId, onCommentAdded }) => {
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const commentInputRef = useRef(null);

  useEffect(() => {
    loadUserData();
  }, []);

  useEffect(() => {
    if (visible && commentInputRef.current) {
      // Delay focus to ensure modal is fully rendered
      setTimeout(() => {
        commentInputRef.current?.focus();
      }, 300);
    }
  }, [visible]);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem('anonymousUser');
      if (userData) {
        const parsedUser = JSON.parse(userData);
        setCurrentUser(parsedUser);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    if (comment.trim().length > 500) {
      Alert.alert('Error', 'Comment must be less than 500 characters');
      return;
    }

    setSubmitting(true);
    try {
      const commentData = {
        content: comment.trim(),
        authorName: currentUser ? currentUser.name : 'Anonymous'
      };

      const response = await apiService.addComment(postId, commentData);
      
      if (response.success) {
        setComment('');
        onCommentAdded(response.comment);
        onClose();
      } else {
        throw new Error(response.error || 'Failed to add comment');
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <SafeAreaView style={styles.safeArea}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={onClose}
            >
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Add Comment</Text>
            <TouchableOpacity
              style={[styles.postButton, (comment.trim().length === 0 || submitting) && styles.postButtonDisabled]}
              onPress={handleAddComment}
              disabled={comment.trim().length === 0 || submitting}
            >
              {submitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.postButtonText}>Post</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Comment Input */}
          <View style={styles.inputContainer}>
            <TextInput
              ref={commentInputRef}
              style={styles.textInput}
              placeholder="Write a comment..."
              placeholderTextColor={COLORS.textSecondary}
              value={comment}
              onChangeText={setComment}
              multiline
              maxLength={500}
              textAlignVertical="top"
              autoFocus={false}
              blurOnSubmit={false}
            />
            <View style={styles.inputFooter}>
              <Text style={[
                styles.characterCount,
                comment.length > 450 && styles.characterCountWarning
              ]}>
                {comment.length}/500
              </Text>
            </View>
          </View>
        </SafeAreaView>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  closeButton: {
    padding: 4,
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
  inputContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    textAlignVertical: 'top',
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
});

export default CommentModal;