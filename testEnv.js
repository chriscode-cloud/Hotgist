require('dotenv').config();

console.log("Loaded Environment Variables:");
console.log({
  FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
  FIREBASE_PRIVATE_KEY_ID: process.env.FIREBASE_PRIVATE_KEY_ID,
  FIREBASE_PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY,
  FIREBASE_CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL,
  FIREBASE_CLIENT_ID: process.env.FIREBASE_CLIENT_ID,
});

if (!process.env.FIREBASE_PROJECT_ID) {
  console.error("❌ ERROR: FIREBASE_PROJECT_ID is undefined!");
} else {
  console.log("✅ FIREBASE_PROJECT_ID loaded correctly!");
}
