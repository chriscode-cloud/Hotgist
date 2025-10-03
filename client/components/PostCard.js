import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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

const PostCard = ({ post, currentUser, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const handleLike = async () => {
    if (loading) return;

    setLoading(true);
    try {
      // Simple like toggle without user tracking
      const response = await apiService.toggleLike(post.id);

      if (onUpdate) {
        onUpdate();
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleComment = () => {
    // Navigate to post detail screen
    navigation.navigate('PostDetail', { postId: post.id });
  };

  // For anonymous posts, we don't track individual user likes
  const isLiked = post.liked || false;

  return (
    <View style={styles.container}>
      {/* Post Header - Instagram Style */}
      <View style={styles.postHeader}>
        <View style={styles.userContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={32} color={COLORS.textSecondary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{post.authorName || 'Anonymous User'}</Text>
            {post.campus && (
              <Text style={styles.userCampus}>{post.campus}</Text>
            )}
          </View>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.timestamp}>{formatTimeAgo(post.timestamp)}</Text>
        </View>
      </View>

      {/* Post Content */}
      <View style={styles.content}>
        <Text style={styles.postText}>{post.content}</Text>
      </View>

      {/* Post Actions - Instagram Style */}
      <View style={styles.actions}>
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
            disabled={loading}
          >
            <Ionicons
              name={isLiked ? "heart" : "heart-outline"}
              size={24}
              color={isLiked ? COLORS.primary : COLORS.text}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleComment}
          >
            <Ionicons name="chatbubble-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="paper-plane-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>
        
        <View style={styles.spacer} />
        
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={24} color={COLORS.text} />
        </TouchableOpacity>
      </View>

      {/* Likes and Comments Info */}
      <View style={styles.postInfo}>
        <Text style={styles.likesCount}>
          {post.likes || 0} like{post.likes !== 1 ? 's' : ''}
        </Text>
        <TouchableOpacity onPress={handleComment}>
          <Text style={styles.commentsCount}>
            {(post.comments && post.comments.length) || 0} comment{(post.comments && post.comments.length) !== 1 ? 's' : ''}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
    paddingVertical: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    marginRight: 12,
  },
  userInfo: {
    flexDirection: 'column',
  },
  username: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },
  userCampus: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  postMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textSecondary,
  },
  content: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  mainActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
    marginRight: 12,
  },
  spacer: {
    flex: 1,
  },
  postInfo: {
    paddingHorizontal: 16,
  },
  likesCount: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  commentsCount: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginBottom: 8,
  },
});

export default PostCard;