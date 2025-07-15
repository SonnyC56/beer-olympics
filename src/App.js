import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { motion } from 'framer-motion';
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
const PageLayout = ({ children }) => (_jsx(motion.div, { initial: "initial", animate: "in", exit: "out", variants: pageVariants, transition: pageTransition, children: children }));
const wrapWithLayout = (Component) => (_jsx(PageLayout, { children: _jsx(Component, {}) }));
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
    return (_jsx(MaterialThemeProvider, { children: _jsx(trpc.Provider, { client: trpcClient, queryClient: queryClient, children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(Router, { children: _jsxs("div", { className: "min-h-screen", children: [_jsxs(Routes, { children: [_jsx(Route, { path: "/", element: wrapWithLayout(HomePage) }), _jsx(Route, { path: "/create", element: wrapWithLayout(CreateTournamentPage) }), _jsx(Route, { path: "/join/:slug", element: wrapWithLayout(JoinPage) }), _jsx(Route, { path: "/control/:slug", element: wrapWithLayout(ControlRoomPage) }), _jsx(Route, { path: "/dashboard/:slug", element: wrapWithLayout(DashboardPage) }), _jsx(Route, { path: "/leaderboard/:slug", element: wrapWithLayout(LeaderboardPage) }), _jsx(Route, { path: "/display/:slug", element: wrapWithLayout(DisplayPage) }), _jsx(Route, { path: "/auth/callback", element: _jsx(AuthCallbackPage, {}) }), _jsx(Route, { path: "/test", element: wrapWithLayout(TestPage) }), _jsx(Route, { path: "/style-guide", element: wrapWithLayout(StyleGuide) }), _jsx(Route, { path: "/rsvp", element: wrapWithLayout(RSVPPage) }), _jsx(Route, { path: "/rsvp-management/:slug", element: wrapWithLayout(RSVPManagementPage) }), _jsx(Route, { path: "/manage/:slug", element: wrapWithLayout(TournamentManagePage) }), _jsx(Route, { path: "/admin/:slug", element: wrapWithLayout(AdminDashboard) }), _jsx(Route, { path: "/material3", element: wrapWithLayout(Material3Demo) }), _jsx(Route, { path: "/spectator/:slug", element: wrapWithLayout(SpectatorPage) }), _jsx(Route, { path: "/checkin/:tournamentSlug", element: wrapWithLayout(CheckInPage) })] }), _jsx(Toaster, { theme: "dark", position: "top-center" })] }) }) }) }) }) }));
}
export default App;
