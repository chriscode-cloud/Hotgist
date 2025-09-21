// src/services/firebase.js
import { initializeApp, getApps, getApp } from "firebase/app";
import {
  initializeAuth,
  getReactNativePersistence,
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";

// Get Expo extra safely
const extra = Constants.manifest?.extra || Constants.expoConfig?.extra;

if (!extra) {
  console.warn(
    "⚠️ Expo constants extra is undefined. Check your app.json and restart Expo."
  );
}

// Firebase config
const firebaseConfig = {
  apiKey: extra?.firebaseApiKey,
  authDomain: extra?.firebaseAuthDomain,
  projectId: extra?.firebaseProjectId,
  storageBucket: extra?.firebaseStorageBucket,
  messagingSenderId: extra?.firebaseMessagingSenderId,
  appId: extra?.firebaseAppId,
};

// Debug: Make sure API key is loaded
console.log("Firebase Config Loaded:", firebaseConfig);

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Auth with persistent storage
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// --- Authentication helper functions ---
// Sign in anonymously
export const signInAnonymous = () => signInAnonymously(auth);

// Sign up with email/password
export const signUp = (email, password) =>
  createUserWithEmailAndPassword(auth, email, password);

// Sign in with email/password
export const signIn = (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

// Sign out
export const signOutUser = () => signOut(auth);

export default app;
