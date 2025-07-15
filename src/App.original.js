import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/auth';
import { Toaster } from 'sonner';
import { trpc, trpcClient, queryClient } from './utils/trpc';
import { AnimatePresence, motion } from 'framer-motion';
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
import StyleGuide from './pages/StyleGuide';
import RSVPPage from './pages/RSVPPage';
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
function AnimatedRoutes() {
    const location = useLocation();
    return (_jsx(AnimatePresence, { mode: "wait", children: _jsxs(Routes, { location: location, children: [_jsx(Route, { path: "/", element: wrapWithLayout(HomePage) }), _jsx(Route, { path: "/join/:slug", element: wrapWithLayout(JoinPage) }), _jsx(Route, { path: "/dashboard/:slug", element: wrapWithLayout(DashboardPage) }), _jsx(Route, { path: "/control/:slug", element: wrapWithLayout(ControlRoomPage) }), _jsx(Route, { path: "/leaderboard/:slug", element: wrapWithLayout(LeaderboardPage) }), _jsx(Route, { path: "/display/:slug", element: wrapWithLayout(DisplayPage) }), _jsx(Route, { path: "/auth/callback", element: wrapWithLayout(AuthCallbackPage) }), _jsx(Route, { path: "/test", element: wrapWithLayout(TestPage) }), _jsx(Route, { path: "/create", element: wrapWithLayout(CreateTournamentPage) }), _jsx(Route, { path: "/demo", element: wrapWithLayout(StyleDemoPage) }), _jsx(Route, { path: "/style-guide", element: wrapWithLayout(StyleGuide) }), _jsx(Route, { path: "/rsvp", element: wrapWithLayout(RSVPPage) })] }, location.pathname) }));
}
function App() {
    return (_jsx(trpc.Provider, { client: trpcClient, queryClient: queryClient, children: _jsx(QueryClientProvider, { client: queryClient, children: _jsx(AuthProvider, { children: _jsx(Router, { children: _jsxs("div", { className: "min-h-screen", children: [_jsx(AnimatedRoutes, {}), _jsx(Toaster, { theme: "dark", position: "top-center" })] }) }) }) }) }));
}
export default App;
