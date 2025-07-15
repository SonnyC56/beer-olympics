import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
import React from 'react';
import { AuthProvider } from './context/auth';
import { httpBatchLink } from '@trpc/client';
import { trpc } from './utils/trpc';
import { MaterialThemeProvider } from './components/ui/material-theme';

// Pages
import { HomePage } from './pages/HomePage';
import { CreateTournamentPage } from './pages/CreateTournamentPage';
import { JoinPage } from './pages/JoinPage';
import { ControlRoomPage } from './pages/ControlRoomPage';
import { DashboardPage } from './pages/DashboardPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DisplayPage } from './pages/DisplayPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { TestPage } from './pages/TestPage';
import StyleGuide from './pages/StyleGuide';
import RSVPPage from './pages/RSVPPage';
import { RSVPManagementPage } from './pages/RSVPManagementPage';
import TournamentManagePage from './pages/TournamentManagePage';
import { AdminDashboard } from './pages/AdminDashboard';
import { Material3Demo } from './pages/Material3Demo';
import { SpectatorPage } from './pages/SpectatorPage';
import { CheckInPage } from './pages/CheckInPage';

const pageVariants = {
  initial: {
    opacity: 0,
    x: "-100vw",
    scale: 0.8
  },
  in: {
    opacity: 1,
    x: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    x: "100vw",
    scale: 1.2
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.5
};

const PageLayout = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial="initial"
    animate="in"
    exit="out"
    variants={pageVariants}
    transition={pageTransition}
  >
    {children}
  </motion.div>
);

const wrapWithLayout = (Component: React.ComponentType) => (
  <PageLayout>
    <Component />
  </PageLayout>
);

// Create tRPC client
const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: `${window.location.origin}/api/trpc`,
    }),
  ],
});

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  return (
    <MaterialThemeProvider>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <Router>
              <div className="min-h-screen">
                <Routes>
                  <Route path="/" element={wrapWithLayout(HomePage)} />
                  <Route path="/create" element={wrapWithLayout(CreateTournamentPage)} />
                  <Route path="/join/:slug" element={wrapWithLayout(JoinPage)} />
                  <Route path="/control/:slug" element={wrapWithLayout(ControlRoomPage)} />
                  <Route path="/dashboard/:slug" element={wrapWithLayout(DashboardPage)} />
                  <Route path="/leaderboard/:slug" element={wrapWithLayout(LeaderboardPage)} />
                  <Route path="/display/:slug" element={wrapWithLayout(DisplayPage)} />
                  <Route path="/auth/callback" element={<AuthCallbackPage />} />
                  <Route path="/test" element={wrapWithLayout(TestPage)} />
                  <Route path="/style-guide" element={wrapWithLayout(StyleGuide)} />
                  <Route path="/rsvp" element={wrapWithLayout(RSVPPage)} />
                  <Route path="/rsvp-management/:slug" element={wrapWithLayout(RSVPManagementPage)} />
                  <Route path="/manage/:slug" element={wrapWithLayout(TournamentManagePage)} />
                  <Route path="/admin/:slug" element={wrapWithLayout(AdminDashboard)} />
                  <Route path="/material3" element={wrapWithLayout(Material3Demo)} />
                  <Route path="/spectator/:slug" element={wrapWithLayout(SpectatorPage)} />
                  <Route path="/checkin/:tournamentSlug" element={wrapWithLayout(CheckInPage)} />
                </Routes>
                <Toaster theme="dark" position="top-center" />
              </div>
            </Router>
          </AuthProvider>
        </QueryClientProvider>
      </trpc.Provider>
    </MaterialThemeProvider>
  );
}

export default App;