import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PostCard from '../components/PostCard';
import apiService from '../services/apiService';

const COLORS = {
  primary: '#F77737',      // Instagram Orange - warm, energetic, unisex
  secondary: '#FF8C42',    // Warm Orange - friendly, approachable
  accent: '#FCAF45',       // Instagram Yellow - bright, cheerful
  background: '#FFFFFF',   // Pure White - clean, minimal
  surface: '#F8F9FA',      // Light Gray - Instagram's card background
  text: '#262626',         // Instagram Dark - perfect readability
  textSecondary: '#8E8E8E' // Instagram Gray - secondary text
};

const HomeScreen = () => {
   const [activeTab, setActiveTab] = useState('home');
   const [posts, setPosts] = useState([]);
   const [loading, setLoading] = useState(true);
   const [refreshing, setRefreshing] = useState(false);
   const [currentUser, setCurrentUser] = useState(null);
   const navigation = useNavigation();

   // Load user data and initial posts
   useEffect(() => {
     loadUserData();
   }, []);

   // Set up polling for real-time updates
   useEffect(() => {
     // Initial fetch
     fetchPosts();

     // Set up polling every 30 seconds
     const pollInterval = setInterval(() => {
       fetchPosts();
     }, 30000); // 30 seconds

     return () => {
       clearInterval(pollInterval);
     };
   }, []);

  /**
   * Loads user data from local storage
   * Simple client-side anonymous user management
   */
   const loadUserData = async () => {
     try {
       // Load user data from local storage
       const userData = await AsyncStorage.getItem('anonymousUser');
       if (userData) {
         const parsedUser = JSON.parse(userData);
         setCurrentUser(parsedUser);
         console.log('✅ Anonymous user loaded:', parsedUser.name);
       }
     } catch (error) {
       console.error('❌ Error loading user data:', error);
     }
   };

   const fetchPosts = async () => {
     try {
       setLoading(true);
       // Fetch trending posts from all campuses using server-side sorting
       const response = await apiService.getPosts(null, 50, 0, true);

       if (response.success) {
         setPosts(response.posts);
       } else {
         throw new Error('Failed to fetch posts');
       }
     } catch (error) {
       console.error('Error fetching posts:', error);
       Alert.alert(
         'Error',
         'Failed to load posts. Please check your connection and try again.'
       );
     } finally {
       setLoading(false);
     }
   };

   const handleRefresh = async () => {
     setRefreshing(true);
     await fetchPosts();
     setRefreshing(false);
   };

   const handlePostUpdate = () => {
     // Refresh posts when a post is updated (liked/unliked)
     fetchPosts();
   };

   const handleHomePress = () => {
     setActiveTab('home');
   };

   const handleSearchPress = () => {
     setActiveTab('search');
     navigation.navigate('Campus');
   };

   const handleNotificationPress = () => {
     setActiveTab('notifications');
     console.log('Notifications pressed');
   };

   const handleProfilePress = () => {
     setActiveTab('profile');
     navigation.navigate('Profile');
   };

   const handleHeaderNotificationPress = () => {
     console.log('Header notification pressed');
   };

   const handleHeaderAvatarPress = () => {
     console.log('Header avatar pressed');
   };

   const handleUploadPress = () => {
     navigation.navigate('CreatePost');
   };

   const renderPost = ({ item }) => (
     <PostCard
       post={item}
       currentUser={currentUser}
       onUpdate={handlePostUpdate}
     />
   );

   const renderEmptyState = () => (
     <View style={styles.emptyState}>
       <Ionicons name="trending-up" size={64} color={COLORS.textSecondary} />
       <Text style={styles.emptyStateTitle}>No trending posts yet</Text>
       <Text style={styles.emptyStateSubtitle}>
         Be the first to start a trending conversation across all campuses!
       </Text>
       <TouchableOpacity
         style={styles.emptyStateButton}
         onPress={handleUploadPress}
       >
         <Text style={styles.emptyStateButtonText}>Create Trending Post</Text>
       </TouchableOpacity>
     </View>
   );

   const renderErrorState = () => (
     <View style={styles.errorState}>
       <Ionicons name="cloud-offline-outline" size={64} color={COLORS.textSecondary} />
       <Text style={styles.errorStateTitle}>Connection Error</Text>
       <Text style={styles.errorStateSubtitle}>
         Unable to load posts. Please check your internet connection.
       </Text>
       <TouchableOpacity
         style={styles.errorStateButton}
         onPress={fetchPosts}
       >
         <Text style={styles.errorStateButtonText}>Try Again</Text>
       </TouchableOpacity>
     </View>
   );

  return (
    <View style={styles.container}>
      <Header
        title="HotGist"
        onNotificationPress={handleHeaderNotificationPress}
        onAvatarPress={handleHeaderAvatarPress}
      />
      <View style={styles.trendingHeader}>
        <View style={styles.trendingInfo}>
          <Ionicons name="trending-up" size={20} color={COLORS.primary} />
          <Text style={styles.trendingTitle}>Trending Now</Text>
        </View>
        <Text style={styles.trendingSubtitle}>
          🔥 Most popular posts from all campuses
        </Text>
      </View>

      {loading && posts.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading posts...</Text>
        </View>
      ) : posts.length === 0 ? (
        renderEmptyState()
      ) : (
        <FlatList
          data={posts}
          renderItem={renderPost}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              colors={[COLORS.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.postsList}
        />
      )}

      <Footer
        activeTab={activeTab}
        onHomePress={handleHomePress}
        onSearchPress={handleSearchPress}
        onNotificationPress={handleNotificationPress}
        onProfilePress={handleProfilePress}
      />
      <TouchableOpacity
        style={styles.uploadButton}
        onPress={handleUploadPress}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#FFFFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  trendingHeader: {
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: '#EFEFEF',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  trendingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  trendingTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: 8,
  },
  trendingSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  postsList: {
    paddingBottom: 100, // Space for upload button
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  emptyStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  emptyStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  errorState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorStateSubtitle: {
    fontSize: 16,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  errorStateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
  },
  errorStateButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  uploadButton: {
    position: 'absolute',
    bottom: 100, // Position above footer
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E46212',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#171a1f',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});

export default HomeScreen;