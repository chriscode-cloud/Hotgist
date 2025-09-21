// src/screens/HomeScreen.js
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Text,
  Image,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import PostCard from '../components/PostCard';
import api from '../services/api';
import { colors } from '../utils/theme';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth(); // current user
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [lastDocId, setLastDocId] = useState(null);
  const [profile, setProfile] = useState(null);

  // Load user profile
  const loadUserProfile = async () => {
    if (!user) return;
    try {
      const data = await api.getProfile();
      setProfile(data);
    } catch (err) {
      console.error('Failed to load profile:', err);
    }
  };

  // Load posts
  const loadPosts = async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
        setLastDocId(null);
        setHasMore(true);
      } else {
        setLoadingMore(true);
      }

      const response = await api.getPosts(20, isRefresh ? null : lastDocId);

      if (isRefresh) setPosts(response.posts || []);
      else setPosts(prev => [...prev, ...(response.posts || [])]);

      setHasMore(response.hasMore);
      setLastDocId(response.lastDocId);
    } catch (error) {
      console.error('Failed to load posts:', error);
      Alert.alert('Error', 'Failed to load posts. Check your network or backend.');
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserProfile();
      loadPosts(true);
    }, [user])
  );

  const handleRefresh = () => {
    loadUserProfile();
    loadPosts(true);
  };

  const handleLoadMore = () => {
    if (hasMore && !loadingMore) loadPosts(false);
  };

  const handleReaction = async (postId, type) => {
    try {
      const response = await api.addReaction(postId, type);
      setPosts(prev =>
        prev.map(post =>
          post.id === postId
            ? { ...post, reactions: response.reactions, userReaction: response.userReaction }
            : post
        )
      );
    } catch (error) {
      console.error('Failed to add reaction:', error);
      Alert.alert('Error', 'Failed to add reaction. Please try again.');
    }
  };

  const handlePostPress = post => {
    navigation.navigate('PostDetail', { post });
  };

  const renderPost = ({ item }) => (
    <PostCard post={item} onReaction={handleReaction} onPress={() => handlePostPress(item)} />
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
      <Text style={styles.emptyText}>No posts yet</Text>
      <Text style={styles.emptySubtext}>Be the first to share something hot! 🔥</Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Profile Section */}
      {profile && (
        <View style={styles.profileContainer}>
          {profile.photoURL ? (
            <Image source={{ uri: profile.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{profile.displayName?.[0] || 'U'}</Text>
            </View>
          )}
          <Text style={styles.displayName}>{profile.displayName}</Text>
          <Text style={styles.bio}>{profile.bio}</Text>
        </View>
      )}

      <FlatList
        data={posts}
        renderItem={renderPost}
        keyExtractor={item => item.id}
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
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  listContainer: { padding: 10, flexGrow: 1 },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background },
  footerLoader: { padding: 20, alignItems: 'center' },
  emptyContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyText: { fontSize: 20, fontWeight: 'bold', color: colors.text, marginBottom: 10 },
  emptySubtext: { fontSize: 16, color: colors.textSecondary, textAlign: 'center' },
  profileContainer: { alignItems: 'center', marginBottom: 15, paddingVertical: 10, backgroundColor: '#fff', borderRadius: 8, elevation: 2 },
  avatar: { width: 70, height: 70, borderRadius: 35, marginBottom: 8 },
  avatarPlaceholder: { width: 70, height: 70, borderRadius: 35, backgroundColor: colors.primary, justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  avatarText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  displayName: { fontSize: 18, fontWeight: 'bold', color: colors.text },
  bio: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 10 },
});
