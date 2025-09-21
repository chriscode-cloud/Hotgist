// src/contexts/AuthContext.js
import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, signIn, signUp, signInAnonymous, signOutUser } from '../services/firebase';
import { onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return unsubscribe; // cleanup on unmount
  }, []);

  // Sign in with email/password
  const signInWithEmailAndPassword = async (email, password) => {
    return signIn(email, password);
  };

  // Sign up with email/password
  const signUpWithEmailAndPassword = async (email, password) => {
    return signUp(email, password);
  };

  // Sign in anonymously
  const signInAnonymously = async () => {
    return signInAnonymous();
  };

  // Sign out
  const logout = async () => {
    return signOutUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signInWithEmailAndPassword,
        signUpWithEmailAndPassword,
        signInAnonymously,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
