import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { SocketProvider } from './contexts/SocketContext';
import Home from './pages/Home.tsx';
import Editor from './pages/Editor.tsx';
import './App.css';

function App() {
  return (
    <SocketProvider>
      <Router>
        <div className="w-full h-screen bg-background">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/room/:roomId" element={<Editor />} />
          </Routes>
        </div>
      </Router>
    </SocketProvider>
  );
}

export default App;
