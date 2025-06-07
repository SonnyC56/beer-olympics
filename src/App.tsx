import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';
import { AuthProvider } from './context/auth';
import { Toaster } from 'sonner';

// Pages
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { DashboardPage } from './pages/DashboardPage';
import { ControlRoomPage } from './pages/ControlRoomPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DisplayPage } from './pages/DisplayPage';

const queryClient = new QueryClient();

const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: import.meta.env.VITE_API_URL || 'http://localhost:3001',
    }),
  ],
});

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
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
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;