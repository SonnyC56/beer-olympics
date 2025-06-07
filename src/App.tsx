import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/auth';
import { Toaster } from 'sonner';

// Pages
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { DashboardPage } from './pages/DashboardPage';
import { ControlRoomPage } from './pages/ControlRoomPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DisplayPage } from './pages/DisplayPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-950 text-gray-100">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/join/:slug" element={<JoinPage />} />
            <Route path="/dashboard/:slug" element={<DashboardPage />} />
            <Route path="/control/:slug" element={<ControlRoomPage />} />
            <Route path="/leaderboard/:slug" element={<LeaderboardPage />} />
            <Route path="/display/:slug" element={<DisplayPage />} />
          </Routes>
          <Toaster theme="dark" position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;