import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../utils/theme';

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

export default function PostCard({ post, onReaction, onPress }) {
  const handleReaction = (type) => {
    if (onReaction) {
      onReaction(post.id, type);
    }
  };

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

  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={styles.header}>
        <View style={styles.authorInfo}>
          {post.author?.photoURL ? (
            <Image source={{ uri: post.author.photoURL }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={20} color={colors.white} />
            </View>
          )}
          <View style={styles.authorDetails}>
            <Text style={styles.authorName}>
              {post.author?.displayName || 'Anonymous'}
            </Text>
            <Text style={styles.timestamp}>
              {formatTime(post.createdAt)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.postText}>{post.content}</Text>
        {post.imageUrl && (
          <Image source={{ uri: post.imageUrl }} style={styles.postImage} />
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.reactions}>
          {Object.entries(reactionEmojis).map(([type, emoji]) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.reactionButton,
                post.userReaction === type && styles.activeReaction,
                post.userReaction === type && { backgroundColor: reactionColors[type] }
              ]}
              onPress={() => handleReaction(type)}
            >
              <Text style={styles.reactionEmoji}>{emoji}</Text>
              <Text style={[
                styles.reactionCount,
                post.userReaction === type && styles.activeReactionText
              ]}>
                {post.reactions[type] || 0}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={styles.commentButton}>
          <Ionicons name="chatbubble-outline" size={20} color={colors.textSecondary} />
          <Text style={styles.commentCount}>{post.commentCount || 0}</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    marginBottom: 10,
    borderRadius: 12,
    padding: 15,
    shadowColor: colors.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
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
  content: {
    marginBottom: 15,
  },
  postText: {
    fontSize: 16,
    color: colors.text,
    lineHeight: 22,
    marginBottom: 10,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    resizeMode: 'cover',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  reactions: {
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
  commentButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentCount: {
    fontSize: 14,
    color: colors.textSecondary,
    marginLeft: 4,
  },
});
