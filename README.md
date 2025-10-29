# Devsync - Real-time Collaborative Code Editor

A real-time collaborative code editor built with React, Node.js, Socket.io, and Monaco Editor.

## Features

- 🚀 **Real-time Code Sync** - See changes as others type
- 💬 **Live Chat** - Communicate with your team
- 👥 **User Presence** - See who's online
- 📱 **Responsive Design** - Works on desktop and mobile
- 🌙 **Dark/Light Theme** - Toggle between themes
- 🔗 **Room Sharing** - Share rooms with unique links

## Tech Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Monaco Editor, Socket.io Client
- **Backend**: Node.js, Express, Socket.io
- **UI Components**: shadcn/ui
- **Real-time**: WebSocket connections via Socket.io

## Quick Start

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd devsync
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

4. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will run on `http://localhost:3001`

5. **Start the frontend development server**
   ```bash
   npm run dev
   ```
   The frontend will run on `http://localhost:5173`

6. **Open your browser**
   Navigate to `http://localhost:5173` to start using Devsync!

## Usage

1. **Create a Room**: Click "Create New Room" to start a new coding session
2. **Join a Room**: Enter a room ID to join an existing session
3. **Start Coding**: Use the Monaco editor to write code with real-time sync
4. **Chat**: Use the chat panel to communicate with other users
5. **Share**: Copy the room link to invite others

## Development

### Project Structure

```
devsync/
├── src/                    # Frontend source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── contexts/         # React contexts
│   ├── types/            # TypeScript types
│   └── config.ts         # Configuration
├── backend/              # Backend source code
│   ├── server.js         # Main server file
│   ├── package.json      # Backend dependencies
│   └── .env.example     # Environment variables template
└── package.json          # Frontend dependencies
```

### Available Scripts

**Frontend:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

**Backend:**
- `npm run dev` - Start development server with auto-reload
- `npm start` - Start production server

## Deployment

### Backend Deployment

1. **Prepare environment variables**
   ```bash
   cp backend/.env.example backend/.env
   # Edit backend/.env with production values
   ```

2. **Deploy to your preferred platform** (Railway, Render, Heroku, etc.)
   - Set `PORT` environment variable
   - Set `CORS_ORIGIN` to your frontend domain

### Frontend Deployment

1. **Set environment variables**
   ```bash
   # Create .env file in root directory
   VITE_SOCKET_URL=https://your-backend-domain.com
   ```

2. **Build and deploy**
   ```bash
   npm run build
   # Deploy dist/ folder to Vercel, Netlify, etc.
   ```

## Configuration

### Environment Variables

**Frontend (.env):**
- `VITE_SOCKET_URL` - Backend WebSocket URL

**Backend (.env):**
- `PORT` - Server port (default: 3001)
- `CORS_ORIGIN` - Allowed frontend origins

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
- Create an issue on GitHub
- Check the documentation
- Review the code comments

---

Built with ❤️ for developers who love to code together!