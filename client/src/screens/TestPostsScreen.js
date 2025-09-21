// src/screens/TestPostsScreen.js
import React, { useEffect, useState } from "react";
import { View, Text, FlatList, TextInput, Button, StyleSheet, ActivityIndicator, Alert } from "react-native";
import api from "../services/api";

export default function TestPostsScreen() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPostText, setNewPostText] = useState("");
  const [creating, setCreating] = useState(false);

  // Fetch all posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await api.getPosts();
      setPosts(data);
    } catch (error) {
      console.error("Failed to load posts:", error);
      Alert.alert("Error", "Failed to fetch posts. Check your backend or network.");
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const handleCreatePost = async () => {
    if (!newPostText.trim()) return Alert.alert("Error", "Post text cannot be empty");
    try {
      setCreating(true);
      const newPost = await api.createPost({ text: newPostText });
      setPosts([newPost, ...posts]); // Add new post to top
      setNewPostText("");
    } catch (error) {
      console.error("Failed to create post:", error);
      Alert.alert("Error", "Failed to create post. Check your backend or network.");
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#FF6B35" />
        <Text style={{ marginTop: 10 }}>Loading posts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Test Posts</Text>

      {/* New Post Input */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Write a new post..."
          value={newPostText}
          onChangeText={setNewPostText}
        />
        <Button title={creating ? "Posting..." : "Post"} onPress={handleCreatePost} disabled={creating} />
      </View>

      {/* Posts List */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.postCard}>
            <Text style={styles.postText}>{item.text}</Text>
            <Text style={styles.postMeta}>{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</Text>
          </View>
        )}
        ListEmptyComponent={<Text>No posts found.</Text>}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#FF6B35" },
  inputContainer: { flexDirection: "row", marginBottom: 16 },
  input: { flex: 1, borderColor: "#ccc", borderWidth: 1, borderRadius: 8, padding: 8, marginRight: 8 },
  postCard: { padding: 12, borderWidth: 1, borderColor: "#ddd", borderRadius: 8, marginBottom: 12 },
  postText: { fontSize: 16 },
  postMeta: { fontSize: 12, color: "gray", marginTop: 4 },
});
