import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  startAfter, 
  doc, 
  getDocs, 
  addDoc, 
  where,
  getDoc,
  deleteDoc,
  updateDoc
} from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from '../contexts/AuthContext';
import { colors } from '../utils/theme';

const { width } = Dimensions.get('window');

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const { user } = useAuth();

  // Real-time reaction emojis and colors
  const reactionEmojis = {
    fire: '🔥',
    laugh: '😂',
    shock: '😱',
  };

  const reactionColors = {
    fire: '#FF6B35',
    laugh: '#FFD700',
    shock: '#9C27B0',
  };

  // Load initial posts
  const loadInitialPosts = useCallback(() => {
    setLoading(true);
    const postsRef = collection(db, 'posts');
    const q = query(postsRef, orderBy('createdAt', 'desc'), limit(20));

    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const postsData = [];
      
      for (const docSnapshot of snapshot.docs) {
        const postData = docSnapshot.data();
        
        // Get author information
        const authorDocRef = doc(db, 'users', postData.authorId);
        const authorDoc = await getDoc(authorDocRef);
        const authorData = authorDoc.exists() ? authorDoc.data() : null;
        
        // Get reaction counts
        const reactionsQuery = query(
          collection(db, 'reactions'),
          where('postId', '==', docSnapshot.id)
        );
        const reactionsSnapshot = await getDocs(reactionsQuery);
        
        const reactions = {
          fire: 0,
          laugh: 0,
          shock: 0,
        };
        
        reactionsSnapshot.docs.forEach(reactionDoc => {
          const reactionData = reactionDoc.data();
          if (reactions[reactionData.type] !== undefined) {
            reactions[reactionData.type]++;
          }
        });
        
        // Check if current user has reacted
        let userReaction = null;
        if (user) {
          const userReactionQuery = query(
            collection(db, 'reactions'),
            where('postId', '==', docSnapshot.id),
            where('userId', '==', user.uid),
            limit(1)
          );
          const userReactionSnapshot = await getDocs(userReactionQuery);
          
          if (!userReactionSnapshot.empty) {
            userReaction = userReactionSnapshot.docs[0].data().type;
          }
        }
        
        postsData.push({
          id: docSnapshot.id,
          ...postData,
          author: authorData ? {
            uid: authorData.uid,
            displayName: authorData.displayName,
            photoURL: authorData.photoURL,
          } : null,
          reactions,
          userReaction,
        });
      }
      
      setPosts(postsData);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
      setLoading(false);
    }, (error) => {
      console.error('Error loading posts:', error);
      setLoading(false);
      Alert.alert('Error', 'Failed to load posts');
    });

    return unsubscribe;
  }, [user]);

  // Load more posts
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore || !lastVisible) return;

    setLoadingMore(true);
    try {
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(20)
      );

      const snapshot = await getDocs(q);
      const newPosts = [];

      for (const docSnapshot of snapshot.docs) {
        const postData = docSnapshot.data();
        
        // Get author information
        const authorDocRef = doc(db, 'users', postData.authorId);
        const authorDoc = await getDoc(authorDocRef);
        const authorData = authorDoc.exists() ? authorDoc.data() : null;
        
        // Get reaction counts
        const reactionsQuery = query(
          collection(db, 'reactions'),
          where('postId', '==', docSnapshot.id)
        );
        const reactionsSnapshot = await getDocs(reactionsQuery);
        
        const reactions = {
          fire: 0,
          laugh: 0,
          shock: 0,
        };
        
        reactionsSnapshot.docs.forEach(reactionDoc => {
          const reactionData = reactionDoc.data();
          if (reactions[reactionData.type] !== undefined) {
            reactions[reactionData.type]++;
          }
        });
        
        // Check if current user has reacted
        let userReaction = null;
        if (user) {
          const userReactionQuery = query(
            collection(db, 'reactions'),
            where('postId', '==', docSnapshot.id),
            where('userId', '==', user.uid),
            limit(1)
          );
          const userReactionSnapshot = await getDocs(userReactionQuery);
          
          if (!userReactionSnapshot.empty) {
            userReaction = userReactionSnapshot.docs[0].data().type;
          }
        }
        
        newPosts.push({
          id: docSnapshot.id,
          ...postData,
          author: authorData ? {
            uid: authorData.uid,
            displayName: authorData.displayName,
            photoURL: authorData.photoURL,
          } : null,
          reactions,
          userReaction,
        });
      }

      setPosts(prev => [...prev, ...newPosts]);
      setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
      setHasMore(snapshot.docs.length === 20);
    } catch (error) {
      console.error('Error loading more posts:', error);
      Alert.alert('Error', 'Failed to load more posts');
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, loadingMore, lastVisible, user]);

  // Handle reaction
  const handleReaction = async (postId, type) => {
    if (!user) {
      Alert.alert('Error', 'Please sign in to react to posts');
      return;
    }

    try {
      const reactionsRef = collection(db, 'reactions');
      const userReactionQuery = query(
        reactionsRef,
        where('postId', '==', postId),
        where('userId', '==', user.uid)
      );

      const existingReaction = await getDocs(userReactionQuery);
      
      if (!existingReaction.empty) {
        const existingReactionDoc = existingReaction.docs[0];
        const existingType = existingReactionDoc.data().type;
        
        if (existingType === type) {
          // Remove reaction if same type
          await deleteDoc(existingReactionDoc.ref);
        } else {
          // Update reaction if different type
          await updateDoc(existingReactionDoc.ref, { type });
        }
      } else {
        // Add new reaction
        await addDoc(reactionsRef, {
          postId,
          userId: user.uid,
          type,
          createdAt: new Date(),
        });
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
      Alert.alert('Error', 'Failed to update reaction');
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const now = new Date();
    const postTime = timestamp.toDate();
    const diffInSeconds = Math.floor((now - postTime) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours}h ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days}d ago`;
    }
  };

  // Render post item
  const renderPost = ({ item }) => (
    <View style={styles.postContainer}>
      {/* Post Header */}
      <View style={styles.postHeader}>
        <View style={styles.authorInfo}>
          {item.author?.photoURL ? (
            <Image source={{ uri: item.author.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={colors.white} />
            </View>
          )}
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>
              {item.author?.displayName || 'Anonymous'}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(item.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postText}>{item.content}</Text>
        {item.imageUrl && (
          <Image source={{ uri: item.imageUrl }} style={styles.postImage} />
        )}
      </View>

      {/* Post Actions */}
      <View style={styles.postActions}>
        <View style={styles.reactionsContainer}>
          {Object.entries(reactionEmojis).map(([type, emoji]) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.reactionButton,
                item.userReaction === type && styles.activeReaction,
                item.userReaction === type && { backgroundColor: reactionColors[type] }
              ]}
              onPress={() => handleReaction(item.id, type)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              <Text style={[
                styles.reactionCount,
                item.userReaction === type && styles.activeReactionText
              ]}>
                {item.reactions[type] || 0}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );

  // Render footer for loading more
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  // Render empty state
  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyText}>No posts yet</Text>
      <Text style={styles.emptySubtext}>Be the first to share something hot! 🔥</Text>
    </View>
  );

  // Handle refresh
  const handleRefresh = () => {
    setRefreshing(true);
    loadInitialPosts();
    setRefreshing(false);
  };

  // Load initial posts on mount
  useEffect(() => {
    const unsubscribe = loadInitialPosts();
    return () => unsubscribe();
  }, [loadInitialPosts]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        onEndReached={loadMorePosts}
        onEndReachedThreshold={0.1}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  listContainer: {
    padding: 16,
    flexGrow: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: colors.textSecondary,
  },
  postContainer: {
    backgroundColor: colors.white,
    marginBottom: 16,
    borderRadius: 12,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorDetails: {
    flex: 1,
  },
  authorName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.text,
  },
  timestamp: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  postContent: {
    marginBottom: 16,
  },
  postText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 12,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  postActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reactionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  reactionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
  },
  activeReaction: {
    backgroundColor: colors.primary,
  },
  reactionEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  reactionCount: {
    fontSize: 14,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  activeReactionText: {
    color: colors.white,
  },
  footerLoader: {
    padding: 20,
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});