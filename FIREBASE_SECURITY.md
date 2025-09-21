# 🔒 Firebase Security Rules for HotGist

This document explains the Firebase Firestore security rules implemented for the HotGist social media application.

## 📋 Overview

The security rules ensure that:
- ✅ Users can read all posts (authenticated or anonymous)
- ✅ Only authenticated users can create posts (including anonymous users)
- ✅ Users can only edit/delete their own posts
- ✅ Users can only manage their own reactions and comments
- ✅ User profiles are readable by all but only editable by the owner

## 🛡️ Security Rules Breakdown

### Helper Functions

```javascript
// Check if user is authenticated (including anonymous)
function isAuthenticated() {
  return request.auth != null;
}

// Check if user owns the resource
function isOwner(userId) {
  return request.auth.uid == userId;
}
```

### Posts Collection (`/posts/{postId}`)

#### ✅ **Read Access**
```javascript
allow read: if true;
```
- **Anyone can read posts** (authenticated or anonymous users)
- This enables public feed functionality

#### ✅ **Create Access**
```javascript
allow create: if isAuthenticated() && isValidPostData();
```
- **Only authenticated users can create posts** (including anonymous)
- Validates post data structure and content length (1-1000 characters)
- Ensures `authorId` matches the authenticated user

#### ✅ **Update Access**
```javascript
allow update: if isAuthenticated() && 
                isOwner(resource.data.authorId) &&
                // Additional validations...
```
- **Only post authors can update their posts**
- Prevents changing `authorId` (ownership cannot be transferred)
- Validates updated content length and structure

#### ✅ **Delete Access**
```javascript
allow delete: if isAuthenticated() && isOwner(resource.data.authorId);
```
- **Only post authors can delete their posts**
- Prevents users from deleting other users' content

### Reactions Collection (`/reactions/{reactionId}`)

#### ✅ **Read Access**
```javascript
allow read: if true;
```
- **Anyone can read reactions** for displaying counts

#### ✅ **Create Access**
```javascript
allow create: if isAuthenticated() && isValidReactionData();
```
- **Only authenticated users can create reactions**
- Validates reaction type (`fire`, `laugh`, `shock`)
- Ensures `userId` matches authenticated user

#### ✅ **Update Access**
```javascript
allow update: if isAuthenticated() && 
                isOwner(resource.data.userId) &&
                // Prevents changing userId and postId
```
- **Only reaction creators can update their reactions**
- Prevents changing `userId` or `postId` (maintains data integrity)

#### ✅ **Delete Access**
```javascript
allow delete: if isAuthenticated() && isOwner(resource.data.userId);
```
- **Only reaction creators can delete their reactions**

### Comments Collection (`/comments/{commentId}`)

#### ✅ **Read Access**
```javascript
allow read: if true;
```
- **Anyone can read comments** for displaying on posts

#### ✅ **Create Access**
```javascript
allow create: if isAuthenticated() && isValidCommentData();
```
- **Only authenticated users can create comments**
- Validates comment content (1-500 characters)
- Ensures `authorId` matches authenticated user

#### ✅ **Update Access**
```javascript
allow update: if isAuthenticated() && 
                isOwner(resource.data.authorId) &&
                // Prevents changing authorId and postId
```
- **Only comment authors can update their comments**
- Prevents changing `authorId` or `postId`

#### ✅ **Delete Access**
```javascript
allow delete: if isAuthenticated() && isOwner(resource.data.authorId);
```
- **Only comment authors can delete their comments**

### Users Collection (`/users/{userId}`)

#### ✅ **Read Access**
```javascript
allow read: if true;
```
- **Anyone can read user profiles** for displaying author information
- Enables showing usernames and avatars on posts

#### ✅ **Create Access**
```javascript
allow create: if isAuthenticated() && 
                isOwner(userId) && 
                isValidUserData();
```
- **Users can only create their own profile**
- Validates profile data structure

#### ✅ **Update Access**
```javascript
allow update: if isAuthenticated() && 
                isOwner(userId) &&
                // Prevents changing uid
```
- **Users can only update their own profile**
- Prevents changing `uid` (user identity cannot be changed)

#### ✅ **Delete Access**
```javascript
allow delete: if isAuthenticated() && isOwner(userId);
```
- **Users can only delete their own profile**

## 🔐 Data Validation

### Post Data Validation
```javascript
function isValidPostData() {
  return request.resource.data.keys().hasAll(['content', 'authorId', 'createdAt', 'updatedAt']) &&
         request.resource.data.content is string &&
         request.resource.data.content.size() > 0 &&
         request.resource.data.content.size() <= 1000 &&
         request.resource.data.authorId is string &&
         request.resource.data.authorId == request.auth.uid &&
         request.resource.data.createdAt is timestamp &&
         request.resource.data.updatedAt is timestamp;
}
```

**Validates:**
- Required fields are present
- Content is a string between 1-1000 characters
- Author ID matches authenticated user
- Timestamps are valid

### Reaction Data Validation
```javascript
function isValidReactionData() {
  return request.resource.data.keys().hasAll(['postId', 'userId', 'type', 'createdAt']) &&
         request.resource.data.postId is string &&
         request.resource.data.userId is string &&
         request.resource.data.userId == request.auth.uid &&
         request.resource.data.type in ['fire', 'laugh', 'shock'] &&
         request.resource.data.createdAt is timestamp;
}
```

**Validates:**
- Required fields are present
- Reaction type is one of the allowed values
- User ID matches authenticated user

### Comment Data Validation
```javascript
function isValidCommentData() {
  return request.resource.data.keys().hasAll(['postId', 'content', 'authorId', 'createdAt', 'updatedAt']) &&
         request.resource.data.postId is string &&
         request.resource.data.content is string &&
         request.resource.data.content.size() > 0 &&
         request.resource.data.content.size() <= 500 &&
         request.resource.data.authorId is string &&
         request.resource.data.authorId == request.auth.uid &&
         request.resource.data.createdAt is timestamp &&
         request.resource.data.updatedAt is timestamp;
}
```

**Validates:**
- Required fields are present
- Content is a string between 1-500 characters
- Author ID matches authenticated user

## 🚀 Deployment

### 1. Deploy Rules to Firebase

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase project (if not already done)
firebase init firestore

# Deploy rules
firebase deploy --only firestore:rules
```

### 2. Test Rules

```bash
# Run rules tests
firebase emulators:start --only firestore

# Test with Firebase Rules Playground
# Go to Firebase Console > Firestore > Rules > Rules playground
```

## 🧪 Testing Security Rules

### Test Cases

1. **Anonymous User Tests:**
   - ✅ Can read posts
   - ✅ Can create posts (if anonymous auth enabled)
   - ❌ Cannot edit/delete other users' posts

2. **Authenticated User Tests:**
   - ✅ Can read all posts
   - ✅ Can create posts
   - ✅ Can edit/delete own posts
   - ❌ Cannot edit/delete other users' posts

3. **Data Validation Tests:**
   - ❌ Cannot create posts with invalid content length
   - ❌ Cannot create reactions with invalid types
   - ❌ Cannot change ownership of resources

### Manual Testing

```javascript
// Test reading posts (should work for everyone)
db.collection('posts').get()

// Test creating post (should work for authenticated users)
db.collection('posts').add({
  content: "Test post",
  authorId: user.uid,
  createdAt: new Date(),
  updatedAt: new Date()
})

// Test editing own post (should work)
db.collection('posts').doc('postId').update({
  content: "Updated content",
  updatedAt: new Date()
})

// Test editing other user's post (should fail)
db.collection('posts').doc('otherPostId').update({
  content: "Hacked content"
})
```

## 🔍 Security Considerations

### ✅ **What's Protected:**
- Users can only modify their own content
- Data structure is validated
- Ownership cannot be transferred
- Content length limits are enforced

### ⚠️ **Additional Considerations:**
- **Rate Limiting**: Implement at application level
- **Content Moderation**: Consider adding content filtering
- **Spam Prevention**: Implement user-level rate limiting
- **Image Upload**: Validate image URLs and implement storage rules

### 🛡️ **Best Practices Implemented:**
- Principle of least privilege
- Data validation at database level
- Immutable ownership fields
- Comprehensive input sanitization

## 📊 Monitoring

### Firebase Console Monitoring
- Monitor rule evaluation metrics
- Check for rule violations
- Review security events

### Application-Level Monitoring
- Log security violations
- Monitor unusual activity patterns
- Track failed authentication attempts

## 🔧 Customization

### Adding New Collections
```javascript
match /newCollection/{docId} {
  allow read: if true; // or specific conditions
  allow create: if isAuthenticated() && isValidNewData();
  allow update: if isAuthenticated() && isOwner(resource.data.ownerId);
  allow delete: if isAuthenticated() && isOwner(resource.data.ownerId);
}
```

### Modifying Validation
Update the validation functions to match your requirements:
```javascript
function isValidPostData() {
  // Add your custom validation logic
  return request.resource.data.content.size() <= 2000; // Increase limit
}
```

---

## 📝 Summary

These security rules provide a robust foundation for the HotGist social media application, ensuring:

1. **Public Read Access**: Anyone can view posts and comments
2. **Authenticated Write Access**: Only logged-in users can create content
3. **Ownership Protection**: Users can only modify their own content
4. **Data Integrity**: Comprehensive validation prevents invalid data
5. **Security**: Prevents unauthorized access and data manipulation

The rules are designed to be secure by default while enabling the social media functionality required for the application.
