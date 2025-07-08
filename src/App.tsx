import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth';
import { Toaster } from 'sonner';
import { trpc, trpcClient, queryClient } from './utils/trpc';
import { AnimatePresence, motion } from 'framer-motion';
import React from 'react';

// Pages
import { HomePage } from './pages/HomePage';
import { JoinPage } from './pages/JoinPage';
import { DashboardPage } from './pages/DashboardPage';
import { ControlRoomPage } from './pages/ControlRoomPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { DisplayPage } from './pages/DisplayPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { TestPage } from './pages/TestPage';
import { CreateTournamentPage } from './pages/CreateTournamentPage';
import StyleDemoPage from './pages/StyleDemoPage';

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


function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={wrapWithLayout(HomePage)} />
        <Route path="/join/:slug" element={wrapWithLayout(JoinPage)} />
        <Route path="/dashboard/:slug" element={wrapWithLayout(DashboardPage)} />
        <Route path="/control/:slug" element={wrapWithLayout(ControlRoomPage)} />
        <Route path="/leaderboard/:slug" element={wrapWithLayout(LeaderboardPage)} />
        <Route path="/display/:slug" element={wrapWithLayout(DisplayPage)} />
        <Route path="/auth/callback" element={wrapWithLayout(AuthCallbackPage)} />
        <Route path="/test" element={wrapWithLayout(TestPage)} />
        <Route path="/create" element={wrapWithLayout(CreateTournamentPage)} />
        <Route path="/demo" element={wrapWithLayout(StyleDemoPage)} />
      </Routes>
    </AnimatePresence>
  );
}

function App() {
  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Router>
            <div className="min-h-screen">
              <AnimatedRoutes />
              <Toaster theme="dark" position="top-center" />
            </div>
          </Router>
        </AuthProvider>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;