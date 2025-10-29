# Firebase Setup Instructions for Devsync

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `devsync` (or your preferred name)
4. Enable Google Analytics (optional)
5. Click "Create project"

## 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location (choose closest to your users)
5. Click "Done"

## 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps" section
3. Click "Add app" and select Web (</>) icon
4. Register your app with nickname: `devsync-web`
5. Copy the Firebase configuration object

## 4. Set Up Environment Variables

Create a `.env.local` file in your project root with:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# Socket.io Configuration
VITE_SOCKET_URL=http://localhost:3002
```

Replace the values with your actual Firebase project credentials.

## 5. Deploy Security Rules

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize project: `firebase init firestore`
4. Deploy rules: `firebase deploy --only firestore:rules`

Or manually copy the rules from `firestore.rules` to your Firebase Console > Firestore Database > Rules.

## 6. Test Firebase Integration

1. Start your development server: `npm run dev`
2. Create a room and test saving/loading sessions
3. Check Firebase Console to see data being saved

## 7. Production Setup

For production deployment:

1. Update security rules to be more restrictive
2. Set up proper authentication if needed
3. Configure CORS for your production domain
4. Update environment variables for production

## Troubleshooting

- **Permission denied**: Check Firestore security rules
- **Configuration error**: Verify environment variables
- **Connection issues**: Check Firebase project status
- **Data not saving**: Check browser console for errors
