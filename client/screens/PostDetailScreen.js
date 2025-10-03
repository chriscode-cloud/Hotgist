import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiService from '../services/apiService';
import commentService from '../services/commentService';
import CommentCard from '../components/CommentCard';
import CommentModal from '../components/CommentModal';

const COLORS = {
  primary: '#F77737',
  secondary: '#FF8C42',
  accent: '#FCAF45',
  background: '#FFFFFF',
  surface: '#F8F9FA',
  text: '#262626',
  textSecondary: '#8E8E8E'
};

const PostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { postId } = route.params;

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);

  useEffect(() => {
    loadPost();
    commentService.cleanupOldComments();
  }, []);

  const loadPost = async () => {
    try {
      setLoading(true);
      
      // Load post details
      const postResponse = await apiService.getPostById(postId);
      if (postResponse.success) {
        // Merge comments using the comment service
        const postWithComments = await commentService.mergeCommentsWithPost(postResponse.post);
        setPost(postWithComments);
      } else {
        throw new Error('Failed to load post');
      }
    } catch (error) {
      console.error('Error loading post:', error);
      Alert.alert('Error', 'Failed to load post details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPost();
    setRefreshing(false);
  };

  const handleLike = async () => {
    try {
      const response = await apiService.toggleLike(postId);
      if (response.success) {
        // Update the post with new like count
        setPost({
          ...post,
          likes: response.likesCount,
          liked: true
        });
      } else {
        throw new Error('Failed to update like');
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      Alert.alert('Error', 'Failed to update like. Please try again.');
    }
  };

  const handleCommentAdded = (newComment) => {
    // Add the new comment to the post's comments array
    if (post) {
      const updatedComments = [
        ...(post.comments || []),
        newComment
      ];
      
      setPost({
        ...post,
        comments: updatedComments
      });
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const postTime = new Date(timestamp);
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) return 'Just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  const renderHeader = () => (
    <View style={styles.postContainer}>
      {/* Post Header - Instagram Style */}
      <View style={styles.postHeader}>
        <View style={styles.userContainer}>
          <View style={styles.avatar}>
            <Ionicons name="person-circle" size={32} color={COLORS.textSecondary} />
          </View>
          <View style={styles.userInfo}>
            <Text style={styles.username}>{post && post.authorName ? post.authorName : 'Anonymous User'}</Text>
            {post && post.campus && (
              <Text style={styles.userCampus}>{post.campus}</Text>
            )}
          </View>
        </View>
        <View style={styles.postMeta}>
          <Text style={styles.timestamp}>{post && formatTimeAgo(post.timestamp)}</Text>
        </View>
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postText}>{post && post.content}</Text>
      </View>

      {/* Post Actions - Instagram Style */}
      <View style={styles.postActions}>
        <View style={styles.mainActions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleLike}
          >
            <Ionicons
              name={post && post.liked ? "heart" : "heart-outline"}
              size={24}
              color={post && post.liked ? COLORS.primary : COLORS.text}
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => setShowCommentModal(true)}
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
          {post && post.likes ? post.likes : 0} like{post && post.likes !== 1 ? 's' : ''}
        </Text>
        <Text style={styles.commentsCount}>
          {post && post.comments ? post.comments.length : 0} comment{post && post.comments && post.comments.length !== 1 ? 's' : ''}
        </Text>
      </View>
      
      {/* Comment Input Bar - Always visible at the bottom */}
      <View style={styles.commentInputBar}>
        <TouchableOpacity 
          style={styles.commentInputButton}
          onPress={() => setShowCommentModal(true)}
        >
          <Text style={styles.commentInputPlaceholder}>Add a comment...</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderComment = ({ item }) => (
    <CommentCard comment={item} />
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading post...</Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={COLORS.textSecondary} />
        <Text style={styles.errorText}>Failed to load post</Text>
        <TouchableOpacity style={styles.retryButton} onPress={loadPost}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Post</Text>
        <View style={styles.headerSpacer} />
      </View>

      <FlatList
        data={post.comments || []}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="none"
      />
      
      {/* Comment Modal */}
      <CommentModal
        visible={showCommentModal}
        onClose={() => setShowCommentModal(false)}
        postId={postId}
        onCommentAdded={handleCommentAdded}
      />
    </View>
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
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.background,
    borderBottomWidth: 0.5,
    borderBottomColor: '#EFEFEF',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
  },
  headerSpacer: {
    width: 32,
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    paddingHorizontal: 40,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    marginTop: 16,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: COLORS.background,
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
  postContent: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postText: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
  },
  postActions: {
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
  commentInputBar: {
    borderTopWidth: 0.5,
    borderTopColor: '#EFEFEF',
    backgroundColor: COLORS.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  commentInputButton: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  commentInputPlaceholder: {
    fontSize: 14,
    color: COLORS.textSecondary,
  },
});

export default PostDetailScreen;