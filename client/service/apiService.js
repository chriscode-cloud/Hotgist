const API_URL = process.env.EXPO_PUBLIC_API_URL;

// Fetch user profile
export const getUserProfile = async (token) => {
  try {
    const response = await fetch(`${API_URL}/auth/me`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`, // 🔹 Send token to backend
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log("Profile data:", data);
    return data;
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    throw error;
  }
};
