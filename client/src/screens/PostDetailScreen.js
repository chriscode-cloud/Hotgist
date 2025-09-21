import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRoute } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import CommentCard from '../components/CommentCard';
import api from '../services/api';
import { colors } from '../utils/theme';

export default function PostDetailScreen() {
  const route = useRoute();
  const { post: initialPost } = route.params;
  
  const [post, setPost] = useState(initialPost);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState(null);

  const loadComments = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setLastDocId(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.getComments(post.id, 20, isRefresh ? null : lastDocId);
      
      if (isRefresh) {
        setComments(response.comments);
      } else {
        setComments(prev => [...prev, ...response.comments]);
      }
      
      setHasMore(response.hasMore);
      setLastDocId(response.lastDocId);
    } catch (error) {
      console.error('Failed to load comments:', error);
      Alert.alert('Error', 'Failed to load comments. Please try again.');
    } finally {
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    loadComments(true);
  }, [post.id]);

  const handleRefresh = () => {
    loadComments(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      loadComments(false);
    }
  };

  const handleReaction = async (postId, type) => {
    try {
      const response = await api.addReaction(postId, type);
      setPost(prev => ({ 
        ...prev, 
        reactions: response.reactions, 
        userReaction: response.userReaction 
      }));
    } catch (error) {
      console.error('Failed to add reaction:', error);
      Alert.alert('Error', 'Failed to add reaction. Please try again.');
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'Please write a comment');
      return;
    }

    if (newComment.length > 500) {
      Alert.alert('Error', 'Comment is too long (max 500 characters)');
      return;
    }

    setLoading(true);
    try {
      const response = await api.addComment(post.id, newComment.trim());
      setComments(prev => [response, ...prev]);
      setPost(prev => ({ ...prev, commentCount: prev.commentCount + 1 }));
      setNewComment('');
    } catch (error) {
      console.error('Failed to add comment:', error);
      Alert.alert('Error', 'Failed to add comment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    Alert.alert(
      'Delete Comment',
      'Are you sure you want to delete this comment?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteComment(commentId);
              setComments(prev => prev.filter(comment => comment.id !== commentId));
              setPost(prev => ({ ...prev, commentCount: prev.commentCount - 1 }));
            } catch (error) {
              console.error('Failed to delete comment:', error);
              Alert.alert('Error', 'Failed to delete comment. Please try again.');
            }
          }
        }
      ]
    );
  };

  const renderComment = ({ item }) => (
    <CommentCard
      comment={item}
      onDelete={handleDeleteComment}
    />
  );

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No comments yet</Text>
      <Text style={styles.emptySubtext}>Be the first to comment! 💬</Text>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <FlatList
        data={comments}
        renderItem={renderComment}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <PostCard
            post={post}
            onReaction={handleReaction}
            onPress={() => {}} // Disable navigation since we're already in detail view
          />
        }
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={handleLoadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />

      <View style={styles.commentInput}>
        <TextInput
          style={styles.textInput}
          placeholder="Write a comment..."
          placeholderTextColor={colors.placeholder}
          value={newComment}
          onChangeText={setNewComment}
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newComment.trim() || loading) && styles.sendButtonDisabled
          ]}
          onPress={handleAddComment}
          disabled={!newComment.trim() || loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color={colors.white} />
          ) : (
            <Ionicons name="send" size={20} color={colors.white} />
          )}
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 10,
    flexGrow: 1,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 14,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  commentInput: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: colors.white,
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    maxHeight: 100,
    fontSize: 16,
    color: colors.text,
  },
  sendButton: {
    backgroundColor: colors.primary,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: colors.gray,
  },
});
