import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";

// Register a new user
export const registerUser = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    console.log("User registered, token:", token);
    return token;
  } catch (error) {
    console.error("Registration error:", error.message);
    throw error;
  }
};

// Login an existing user
export const loginUser = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    console.log("User logged in, token:", token);
    return token;
  } catch (error) {
    console.error("Login error:", error.message);
    throw error;
  }
};
