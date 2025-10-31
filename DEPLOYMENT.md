# Deployment Guide

This guide will walk you through deploying Devsync to Railway (backend) and Vercel (frontend).

## Prerequisites

- GitHub account with your code pushed to a repository
- Railway account ([railway.app](https://railway.app))
- Vercel account ([vercel.com](https://vercel.com))
- (Optional) Firebase account for session persistence

---

## Backend Deployment to Railway

### Step 1: Create Railway Project

1. Go to [Railway Dashboard](https://railway.app/dashboard)
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `devsync` repository

### Step 2: Configure Backend Service

1. After importing, Railway should detect your project
2. Click on your service
3. Go to **Settings** tab
4. Set the **Root Directory** to `backend`
5. Railway will automatically detect it's a Node.js project

### Step 3: Set Environment Variables

Go to the **Variables** tab and add:

```
PORT=3002
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

**Important Notes:**
- Railway will automatically provide a `PORT` environment variable, but you can set it explicitly
- Replace `your-frontend-domain.vercel.app` with your actual Vercel domain (you'll get this after deploying the frontend)
- If you have multiple frontend URLs, separate them with commas:
  ```
  CORS_ORIGIN=https://devsync.vercel.app,https://www.devsync.com
  ```

### Step 4: Deploy

1. Railway will automatically start building and deploying
2. Wait for the deployment to complete
3. Click on the service to get your backend URL (e.g., `https://your-app.up.railway.app`)
4. **Copy this URL** - you'll need it for the frontend configuration

### Step 5: Verify Backend Deployment

1. Visit `https://your-backend-url.railway.app/health`
2. You should see a JSON response with status "OK"
3. If it works, your backend is deployed! ✅

---

## Frontend Deployment to Vercel

### Step 1: Create Vercel Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your `devsync` repository from GitHub

### Step 2: Configure Build Settings

Vercel should auto-detect Vite, but verify:

- **Framework Preset:** Vite
- **Root Directory:** `./` (root of your repo)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

These settings are already configured in `vercel.json`, so Vercel should pick them up automatically.

### Step 3: Set Environment Variables

In the **Environment Variables** section, add:

```
VITE_SOCKET_URL=https://your-backend-url.railway.app
```

Replace `your-backend-url.railway.app` with the actual Railway URL from Step 4 of backend deployment.

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 1-2 minutes)
3. Vercel will provide you with a deployment URL (e.g., `https://devsync-xyz.vercel.app`)

### Step 5: Update Backend CORS

After getting your Vercel URL:

1. Go back to Railway dashboard
2. Update the `CORS_ORIGIN` environment variable:
   ```
   CORS_ORIGIN=https://your-vercel-url.vercel.app
   ```
3. Railway will automatically redeploy with the new CORS settings

### Step 6: Verify Frontend Deployment

1. Visit your Vercel deployment URL
2. Try creating a room and verify everything works
3. Check browser console for any connection errors

---

## Optional: Firebase Setup (Session Persistence)

If you want session persistence to work:

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable **Firestore Database**

### 2. Get Firebase Config

1. Go to Project Settings → General
2. Scroll to "Your apps" and add a web app
3. Copy the Firebase configuration

### 3. Add to Vercel Environment Variables

Add these to your Vercel project environment variables:

```
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 4. Configure Firestore Rules

Go to Firestore Database → Rules and add:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rooms/{roomId} {
      allow read, write: if true; // Adjust based on your security needs
      match /files/{fileId} {
        allow read, write: if true;
      }
      match /messages/{messageId} {
        allow read, write: if true;
      }
    }
  }
}
```

**Note:** For production, you should implement proper security rules. These rules allow public read/write access.

---

## Custom Domains

### Railway Custom Domain

1. Go to Railway service settings
2. Navigate to **Domains** tab
3. Click **"Generate Domain"** or **"Custom Domain"**
4. Follow the instructions to configure DNS

### Vercel Custom Domain

1. Go to your Vercel project settings
2. Navigate to **Domains** tab
3. Add your custom domain
4. Follow DNS configuration instructions
5. **Update Railway CORS_ORIGIN** to include your new domain

---

## Troubleshooting

### Backend Issues

**Port errors:**
- Railway automatically sets `PORT` env var. Don't override it unless necessary.

**CORS errors:**
- Make sure `CORS_ORIGIN` in Railway includes your exact Vercel URL (with https://)
- Check browser console for specific CORS error messages
- Remember to update CORS after changing Vercel URL

**Connection refused:**
- Check Railway logs for errors
- Verify the service is running (green status)
- Check the `/health` endpoint

### Frontend Issues

**Socket connection failed:**
- Verify `VITE_SOCKET_URL` is set correctly in Vercel
- Check that the Railway backend is running
- Ensure CORS_ORIGIN includes your Vercel URL
- Check browser console for specific errors

**Build errors:**
- Check Vercel build logs
- Ensure all dependencies are listed in `package.json`
- Try clearing Vercel cache and rebuilding

**404 errors on routes:**
- The `vercel.json` includes rewrites for SPA routing
- If issues persist, verify the rewrite rules are correct

### Environment Variable Issues

**Variables not updating:**
- After changing env vars, trigger a new deployment
- Clear browser cache if frontend vars changed
- Check that variable names match exactly (case-sensitive)

---

## Quick Reference

### Railway Environment Variables
```
PORT=3002
CORS_ORIGIN=https://your-frontend.vercel.app
```

### Vercel Environment Variables
```
VITE_SOCKET_URL=https://your-backend.up.railway.app
VITE_FIREBASE_API_KEY=... (optional)
VITE_FIREBASE_AUTH_DOMAIN=... (optional)
VITE_FIREBASE_PROJECT_ID=... (optional)
VITE_FIREBASE_STORAGE_BUCKET=... (optional)
VITE_FIREBASE_MESSAGING_SENDER_ID=... (optional)
VITE_FIREBASE_APP_ID=... (optional)
```

---

## Deployment Checklist

- [ ] Backend deployed to Railway
- [ ] Backend health check passes (`/health` endpoint)
- [ ] Frontend deployed to Vercel
- [ ] `VITE_SOCKET_URL` set in Vercel
- [ ] `CORS_ORIGIN` set in Railway with Vercel URL
- [ ] Test creating a room
- [ ] Test real-time collaboration
- [ ] Test chat functionality
- [ ] (Optional) Firebase configured for sessions
- [ ] (Optional) Custom domains configured
- [ ] Both services running without errors

---

## Need Help?

- Check Railway logs: Railway Dashboard → Service → Deployments → View Logs
- Check Vercel logs: Vercel Dashboard → Project → Deployments → View Logs
- Review browser console for client-side errors
- Verify all environment variables are set correctly

---

**Happy Deploying! 🚀**

