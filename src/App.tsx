import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth';
import { Toaster } from 'sonner';
import { trpc, trpcClient, queryClient } from './utils/trpc';

// Pages
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { DashboardPage } from './pages/DashboardPage';
import { ControlRoomPage } from './pages/ControlRoomPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DisplayPage } from './pages/DisplayPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { TestPage } from './pages/TestPage';

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-900 text-gray-100">
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/join/:slug" element={<JoinPage />} />
                <Route path="/dashboard/:slug" element={<DashboardPage />} />
                <Route path="/control/:slug" element={<ControlRoomPage />} />
                <Route path="/leaderboard/:slug" element={<LeaderboardPage />} />
                <Route path="/display/:slug" element={<DisplayPage />} />
                <Route path="/auth/callback" element={<AuthCallbackPage />} />
                <Route path="/test" element={<TestPage />} />
              </Routes>
              <Toaster theme="dark" position="top-center" />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;