# Devsync - Real-time Collaborative Code Editor

A modern, real-time collaborative code editor built with React, TypeScript, Node.js, Socket.io, and Monaco Editor. Code together in real-time with multiple users, execute code in multiple languages, and collaborate seamlessly.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Node](https://img.shields.io/badge/node-%3E%3D20.19-brightgreen)

## 🚀 Features

### Core Collaboration
- **Real-time Code Sync** - See changes as others type, instantly synchronized across all users
- **Multi-user Support** - Multiple users can edit the same code simultaneously
- **Live Chat** - Built-in chat system for team communication
- **User Presence** - See who's online in real-time with user avatars
- **Room Sharing** - Share rooms with unique links for easy collaboration

### Code Editor Features
- **Monaco Editor** - Full-featured code editor with IntelliSense, syntax highlighting
- **Multi-language Support** - JavaScript, TypeScript, Python, HTML, CSS, Java, C++, and more
- **Multiple Files** - Create, manage, and organize multiple files per session
- **File Search** - Real-time file search and filtering
- **Code Formatting** - Auto-format code with one click
- **Syntax Error Detection** - Real-time syntax error highlighting and detection
- **Error Panel** - Dedicated panel showing all syntax errors and warnings

### Code Execution
- **In-browser Execution** - Run code directly in the browser
- **Multi-language Execution**:
  - **JavaScript/TypeScript** - Native execution
  - **Python** - Powered by Pyodide (browser-based Python)
  - **HTML/CSS** - Live preview rendering
- **Output Panel** - See execution results, console logs, and errors
- **Execution Time Tracking** - Monitor code performance

### File Management
- **File Upload** - Upload files from your computer
- **File Download** - Download individual files or all files as ZIP
- **File Operations** - Create, delete, rename files with validation
- **File Type Detection** - Automatic language detection from file extensions

### Security & Reliability
- **Rate Limiting** - Prevent spam and abuse (code changes, messages, file operations)
- **Content Validation** - File name, size, and content validation
- **File Size Limits** - 5MB maximum per file
- **Input Sanitization** - Secure handling of user inputs

### Session Management
- **Firebase Integration** - Persistent session storage
- **Save/Load Sessions** - Save and restore coding sessions
- **Session Persistence** - Automatic session recovery

### User Experience
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile
- **Dark/Light Theme** - Toggle between themes
- **Modern UI** - Built with shadcn/ui and Aceternity UI components
- **Keyboard Shortcuts** - Productivity-focused keyboard shortcuts
- **Beautiful Icons** - Lucide React icons throughout

## 🛠️ Tech Stack

### Frontend
- **React 19** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Monaco Editor** - Code editor (VS Code engine)
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - UI component library
- **Socket.io Client** - Real-time communication
- **Firebase** - Session persistence
- **Pyodide** - Python execution in browser
- **JSZip** - ZIP file creation

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - WebSocket server
- **CORS** - Cross-origin resource sharing

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 20.19+ or 22.12+
- **npm** (comes with Node.js) or **yarn**
- **Firebase Account** (optional, for session persistence)
- **Git** (for cloning the repository)

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <repository-url>
cd devsync
```

### 2. Install Dependencies

#### Frontend Dependencies

```bash
npm install
```

#### Backend Dependencies

```bash
cd backend
npm install
cd ..
```

### 3. Configure Environment Variables

#### Frontend Configuration

Create a `.env` file in the root directory:

```env
VITE_SOCKET_URL=http://localhost:3002
```

#### Backend Configuration

Create a `.env` file in the `backend/` directory:

```env
PORT=3002
CORS_ORIGIN=http://localhost:5174,http://localhost:5175,http://localhost:5176

# Optional: Firebase Configuration (for session persistence)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Note:** If you don't have Firebase set up, the application will work without session persistence. You can add Firebase later.

### 4. Start Development Servers

#### Start Backend Server

Open a terminal and run:

```bash
cd backend
npm run dev
```

The backend will start on `http://localhost:3002`

#### Start Frontend Server

Open another terminal and run:

```bash
npm run dev
```

The frontend will start on `http://localhost:5174`

### 5. Open in Browser

Navigate to `http://localhost:5174` to start using Devsync!

## 📖 Usage

### Creating a Room

1. On the home page, click **"Create New Room"**
2. Enter your username (or continue as guest)
3. You'll be redirected to a new collaborative room
4. Share the room link with others to invite them

### Joining a Room

1. On the home page, click **"Join Room"**
2. Enter the room ID or paste the room link
3. Enter your username
4. Click **"Join"** to start collaborating

### Editing Code

1. Start typing in the Monaco editor
2. Changes sync in real-time to all users
3. Use **Ctrl/Cmd + F** to find text
4. Click the **"Format"** button to auto-format code
5. View syntax errors in the error panel at the bottom

### Managing Files

1. Click **"New File"** to create a new file
2. Select file type (JavaScript, TypeScript, Python, etc.)
3. Click **"Upload"** to upload files from your computer
4. Click **"Download All"** to download all files as ZIP
5. Click the download icon next to a file to download individual files

### Running Code

1. Open a file with supported language (JavaScript, TypeScript, Python, HTML, CSS)
2. Click the **"Run"** button in the output panel
3. View execution results in the output panel
4. See console logs and errors in real-time

### Chatting

1. Use the chat panel on the right (desktop) or bottom (mobile)
2. Type your message and press Enter
3. See all chat messages in real-time
4. Messages are persisted in saved sessions

### Saving Sessions

1. Click **"Save Session"** in the top bar
2. Your code, files, and chat will be saved to Firebase
3. Click **"Load Session"** to restore a saved session

## 📁 Project Structure

```
devsync/
├── backend/                 # Backend server
│   ├── server.js          # Main server file (Socket.io + Express)
│   ├── rateLimiter.js     # Rate limiting middleware
│   ├── package.json        # Backend dependencies
│   └── .env               # Backend environment variables
│
├── src/                    # Frontend source code
│   ├── components/        # React components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── CodeEditor.tsx
│   │   ├── FileTabs.tsx
│   │   ├── ChatBox.tsx
│   │   ├── TopBar.tsx
│   │   └── ...
│   ├── pages/            # Page components
│   │   ├── Home.tsx      # Landing page
│   │   └── Editor.tsx    # Main editor page
│   ├── contexts/         # React contexts
│   │   ├── SocketContext.tsx
│   │   └── AlertDialogContext.tsx
│   ├── hooks/            # Custom React hooks
│   │   ├── useCodeRunner.ts
│   │   ├── useFirebase.ts
│   │   └── ...
│   ├── lib/              # Utility libraries
│   │   ├── codeRunner.ts
│   │   ├── firestore.ts
│   │   ├── rateLimiter.ts
│   │   └── ...
│   ├── types/            # TypeScript type definitions
│   └── config.ts         # Configuration
│
├── public/               # Static assets
├── package.json          # Frontend dependencies
├── vite.config.ts        # Vite configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

## 🚀 Deployment

> **📖 For detailed step-by-step deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md)**

### Quick Deploy: Railway (Backend) + Vercel (Frontend)

This project is configured for easy deployment:
- **Backend → Railway**: Real-time Socket.io server
- **Frontend → Vercel**: React/Vite application

### Backend Deployment

#### Option 1: Railway (Recommended)

1. **Create Railway Project**:
   - Go to [Railway Dashboard](https://railway.app/dashboard)
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository

2. **Configure Service**:
   - Set **Root Directory** to `backend` in service settings
   - Railway will auto-detect Node.js

3. **Set Environment Variables** in Railway:
   - `PORT` = 3002 (Railway may auto-set this)
   - `CORS_ORIGIN` = `https://your-frontend.vercel.app` (set after frontend deploy)

#### Option 2: Render

1. **Connect Repository** to Render
2. **Create Web Service**:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: Node
3. **Set Environment Variables**:
   - `PORT` = 3002
   - `CORS_ORIGIN` = your frontend domain

#### Option 3: Heroku

1. **Install Heroku CLI**
2. **Login and create app**:
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. **Deploy**:
   ```bash
   cd backend
   git subtree push --prefix backend heroku main
   ```

4. **Set Environment Variables**:
   ```bash
   heroku config:set PORT=3002
   heroku config:set CORS_ORIGIN=https://your-frontend-domain.com
   ```

#### Option 4: DigitalOcean App Platform

1. **Connect Repository** to DigitalOcean
2. **Create App**:
   - Choose Node.js
   - Set root directory to `backend/`
3. **Configure**:
   - Build Command: `npm install`
   - Run Command: `npm start`
   - Port: 3002
4. **Set Environment Variables** in app settings

#### Option 5: VPS/Server (Self-hosted)

1. **SSH into your server**
2. **Install Node.js and npm**
3. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd devsync/backend
   ```

4. **Install dependencies**:
   ```bash
   npm install --production
   ```

5. **Set up PM2** (process manager):
   ```bash
   npm install -g pm2
   pm2 start server.js --name devsync-backend
   pm2 save
   pm2 startup
   ```

6. **Configure Nginx** (reverse proxy):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3002;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

7. **Set up SSL** with Let's Encrypt:
   ```bash
   sudo certbot --nginx -d your-domain.com
   ```

### Frontend Deployment

#### Option 1: Vercel (Recommended)

1. **Create Vercel Project**:
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New..." → "Project"
   - Import your GitHub repository

2. **Configure Build** (auto-detected from `vercel.json`):
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Set Environment Variables** in Vercel:
   - `VITE_SOCKET_URL` = `https://your-backend.up.railway.app`
   - (Optional) Firebase config variables if using session persistence

4. **Custom Domain** (optional):
   - Add domain in Vercel dashboard
   - Update DNS records

#### Option 2: Netlify

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Build and deploy**:
   ```bash
   npm run build
   netlify deploy --prod --dir=dist
   ```

3. **Set Environment Variables** in Netlify dashboard:
   - `VITE_SOCKET_URL` = your backend URL

#### Option 3: GitHub Pages

1. **Install gh-pages**:
   ```bash
   npm install --save-dev gh-pages
   ```

2. **Add scripts to package.json**:
   ```json
   "scripts": {
     "predeploy": "npm run build",
     "deploy": "gh-pages -d dist"
   }
   ```

3. **Deploy**:
   ```bash
   npm run deploy
   ```

4. **Update environment variables** in GitHub Actions or CI/CD

#### Option 4: AWS S3 + CloudFront

1. **Build the project**:
   ```bash
   npm run build
   ```

2. **Upload to S3**:
   ```bash
   aws s3 sync dist/ s3://your-bucket-name
   ```

3. **Configure CloudFront**:
   - Create distribution pointing to S3 bucket
   - Set up SSL certificate
   - Configure cache behaviors

### Firebase Setup (Session Persistence)

1. **Create Firebase Project**:
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project
   - Enable Firestore Database

2. **Get Configuration**:
   - Go to Project Settings > General
   - Scroll to "Your apps" and add a web app
   - Copy the configuration object

3. **Update Environment Variables**:
   Add to your `.env` file:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-storage-bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
   VITE_FIREBASE_APP_ID=your-app-id
   ```

4. **Configure Firestore Rules**:
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

## 📝 Available Scripts

### Frontend

- `npm run dev` - Start development server (port 5174)
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint

### Backend

- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_SOCKET_URL` | Backend WebSocket URL | `http://localhost:3002` |

#### Backend (.env)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3002` |
| `CORS_ORIGIN` | Allowed frontend origins (comma-separated) | `http://localhost:5174,...` |

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process using port 3002
lsof -i :3002  # macOS/Linux
netstat -ano | findstr :3002  # Windows

# Kill the process or change PORT in .env
```

**CORS errors:**
- Ensure `CORS_ORIGIN` includes your frontend URL
- Check that backend is running

### Frontend Issues

**Socket connection failed:**
- Verify `VITE_SOCKET_URL` matches your backend URL
- Check that backend server is running
- Check browser console for detailed errors

**Build errors:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Firebase Issues

**Firebase not initialized:**
- Check environment variables are set correctly
- Verify Firebase project is active
- Check Firestore rules allow read/write

## 📚 Documentation

- **[User Guide](./USER_GUIDE.md)** - Detailed user documentation
- **[API Documentation](./API_DOCUMENTATION.md)** - Backend API reference
- **[Contributing Guidelines](./CONTRIBUTING.md)** - How to contribute

## 🤝 Contributing

We welcome contributions! Please read our [Contributing Guidelines](./CONTRIBUTING.md) for details on:

- Code of conduct
- Development setup
- Pull request process
- Code style guidelines

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check the docs folder for detailed guides
- **Questions**: Open a discussion on GitHub

## 🎯 Roadmap

### Planned Features

- [ ] Auto-save with debouncing
- [ ] Version history / snapshots
- [ ] Comment system for code collaboration
- [ ] Folder structure UI
- [ ] User authentication
- [ ] Room privacy settings
- [ ] Voice/video chat integration

## 🙏 Acknowledgments

- [Monaco Editor](https://microsoft.github.io/monaco-editor/) - Excellent code editor
- [Socket.io](https://socket.io/) - Real-time communication
- [shadcn/ui](https://ui.shadcn.com/) - Beautiful UI components
- [Pyodide](https://pyodide.org/) - Python in the browser

---

**Built with ❤️ for developers who love to code together!**

For detailed documentation, see:
- [User Guide](./USER_GUIDE.md)
- [API Documentation](./API_DOCUMENTATION.md)
- [Contributing Guidelines](./CONTRIBUTING.md)
