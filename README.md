# 🔥 HotGist - Social Media App

A full-stack social media application built with React Native (Expo) frontend and Node.js backend, featuring real-time posts, reactions, and comments.

## 🚀 Features

- **User Authentication**: Email/password login and anonymous sign-in
- **Post Creation**: Text posts with image support
- **Real-time Feed**: Live updates of posts and interactions
- **Reaction System**: Three emoji reactions (🔥 😂 😱)
- **Comment System**: Full commenting functionality with real-time updates
- **User Profiles**: Profile management and statistics
- **Modern UI**: Beautiful, responsive design with smooth animations

## 🛠 Tech Stack

### Frontend
- **React Native** with Expo
- **React Navigation** for navigation
- **React Native Paper** for UI components
- **Firebase Auth** for authentication
- **Expo Image Picker** for image handling

### Backend
- **Node.js** with Express
- **Firebase Firestore** for database
- **Firebase Admin SDK** for server-side operations
- **CORS** and **Helmet** for security
- **Rate limiting** for API protection

### Database
- **Firebase Firestore** for real-time data storage
- **Firebase Storage** for image uploads

## 📁 Project Structure

```
HotGist/
├── server/                 # Backend API
│   ├── config/            # Firebase configuration
│   ├── middleware/        # Authentication middleware
│   ├── routes/           # API routes
│   └── index.js          # Server entry point
├── client/               # React Native frontend
│   ├── src/
│   │   ├── components/   # Reusable components
│   │   ├── screens/      # App screens
│   │   ├── services/     # API and Firebase services
│   │   ├── contexts/     # React contexts
│   │   └── utils/        # Utility functions
│   ├── App.js           # App entry point
│   └── package.json     # Frontend dependencies
├── package.json         # Backend dependencies
└── README.md           # This file
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- Firebase project
- Android Studio / Xcode (for mobile development)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd HotGist
```

### 2. Backend Setup

1. Install backend dependencies:
```bash
npm install
```

2. Create a Firebase project and enable:
   - Authentication (Email/Password and Anonymous)
   - Firestore Database
   - Storage

3. Generate a service account key from Firebase Console:
   - Go to Project Settings > Service Accounts
   - Generate new private key
   - Download the JSON file

4. Create environment file:
```bash
cp env.example .env
```

5. Update `.env` with your Firebase configuration:
```env
PORT=3000
NODE_ENV=development
CLIENT_URL=http://localhost:19006

FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY_ID=your-private-key-id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=your-client-id

FIREBASE_WEB_API_KEY=your-web-api-key
FIREBASE_WEB_AUTH_DOMAIN=your-project.firebaseapp.com
FIREBASE_WEB_PROJECT_ID=your-project-id
FIREBASE_WEB_STORAGE_BUCKET=your-project.appspot.com
FIREBASE_WEB_MESSAGING_SENDER_ID=your-sender-id
FIREBASE_WEB_APP_ID=your-app-id
```

6. Start the backend server:
```bash
npm run dev
```

### 3. Frontend Setup

1. Navigate to client directory:
```bash
cd client
```

2. Install frontend dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Update `.env` with your Firebase web configuration:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-web-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
EXPO_PUBLIC_FIREBASE_APP_ID=your-app-id

EXPO_PUBLIC_API_URL=http://localhost:3000/api
```

5. Start the Expo development server:
```bash
npm start
```

6. Run on your preferred platform:
   - Press `i` for iOS simulator
   - Press `a` for Android emulator
   - Scan QR code with Expo Go app on your device

## 📱 App Features

### Authentication
- **Email/Password Login**: Traditional authentication
- **Anonymous Sign-in**: Quick access without registration
- **Profile Management**: Update display name, bio, and profile picture

### Posts
- **Create Posts**: Share text content with optional images
- **Image Support**: Take photos or select from gallery
- **Character Limit**: 1000 characters per post
- **Real-time Updates**: See new posts instantly

### Reactions
- **Three Emoji Reactions**: 🔥 (Fire), 😂 (Laugh), 😱 (Shock)
- **Toggle Reactions**: Tap to add/remove reactions
- **Real-time Counts**: See reaction counts update live

### Comments
- **Comment on Posts**: Add comments to any post
- **Real-time Comments**: See new comments instantly
- **Delete Comments**: Remove your own comments
- **Character Limit**: 500 characters per comment

### Feed
- **Infinite Scroll**: Load more posts as you scroll
- **Pull to Refresh**: Refresh the feed manually
- **Post Details**: Tap posts to view full details and comments

## 🔧 API Endpoints

### Authentication
- `GET /api/auth/me` - Get current user profile
- `POST /api/auth/profile` - Update user profile
- `GET /api/auth/user/:userId` - Get user by ID
- `DELETE /api/auth/account` - Delete user account

### Posts
- `GET /api/posts` - Get posts with pagination
- `GET /api/posts/:postId` - Get single post
- `POST /api/posts` - Create new post
- `PUT /api/posts/:postId` - Update post
- `DELETE /api/posts/:postId` - Delete post

### Comments
- `GET /api/comments/:postId` - Get comments for post
- `POST /api/comments/:postId` - Add comment to post
- `PUT /api/comments/:commentId` - Update comment
- `DELETE /api/comments/:commentId` - Delete comment

### Reactions
- `POST /api/reactions/:postId` - Add/update reaction
- `GET /api/reactions/:postId` - Get reactions for post
- `DELETE /api/reactions/:postId` - Remove reaction

## 🎨 UI/UX Features

- **Modern Design**: Clean, intuitive interface
- **Responsive Layout**: Works on all screen sizes
- **Smooth Animations**: React Native Reanimated for fluid interactions
- **Dark/Light Theme**: Theme context for future theming support
- **Loading States**: Proper loading indicators throughout the app
- **Error Handling**: User-friendly error messages

## 🔒 Security Features

- **Firebase Authentication**: Secure user authentication
- **JWT Token Validation**: Server-side token verification
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Server-side validation for all inputs
- **CORS Protection**: Proper CORS configuration
- **Helmet Security**: Security headers with Helmet

## 🚀 Deployment

### Backend Deployment
1. Deploy to platforms like Heroku, Railway, or DigitalOcean
2. Set environment variables in your hosting platform
3. Ensure Firebase service account has proper permissions

### Frontend Deployment
1. Build for production:
```bash
expo build:android
expo build:ios
```
2. Deploy to app stores or distribute via Expo

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- Firebase for backend services
- Expo for React Native development platform
- React Native community for excellent libraries
- All contributors and testers

## 📞 Support

For support, email support@hotgist.app or create an issue in the repository.

---

Made with 🔥 by the HotGist Team
