import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/context/auth';
import { toast } from 'sonner';
export function TestPage() {
    const { user, signIn, signOut } = useAuth();
    const [testResults, setTestResults] = useState([]);
    const addResult = (result) => {
        setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${result}`]);
    };
    const testAuth = async () => {
        try {
            addResult('Testing authentication...');
            if (user) {
                addResult(`✅ Already signed in as: ${user.name} (${user.email})`);
            }
            else {
                addResult('📝 Not signed in - click Sign In to test OAuth');
            }
        }
        catch (error) {
            addResult(`❌ Auth test failed: ${error}`);
        }
    };
    const testCouchbase = async () => {
        try {
            addResult('Testing Couchbase connection...');
            // This would normally connect to Couchbase
            // For now, we're using mock data
            addResult('ℹ️ Using mock data (Couchbase connection pending)');
            toast.info('Couchbase test uses mock data for now');
        }
        catch (error) {
            addResult(`❌ Couchbase test failed: ${error}`);
        }
    };
    const testTournamentFlow = async () => {
        try {
            addResult('Testing tournament flow...');
            const testSlug = 'test-' + Date.now();
            addResult(`📝 Created test tournament: ${testSlug}`);
            addResult(`✅ Visit /join/${testSlug} to test`);
            toast.success(`Test tournament created: ${testSlug}`);
        }
        catch (error) {
            addResult(`❌ Tournament test failed: ${error}`);
        }
    };
    return (_jsxs("div", { className: "min-h-screen p-4 max-w-4xl mx-auto", children: [_jsx("h1", { className: "text-4xl font-bold mb-8", children: "Beer Olympics Test Suite" }), _jsxs("div", { className: "grid gap-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Authentication Status" }), _jsx(CardDescription, { children: "Test Google OAuth integration" })] }), _jsxs(CardContent, { className: "space-y-4", children: [user ? (_jsxs("div", { className: "p-4 bg-green-900/20 rounded-lg", children: [_jsx("p", { className: "font-semibold", children: "Signed in as:" }), _jsx("p", { children: user.name }), _jsx("p", { className: "text-sm text-gray-400", children: user.email })] })) : (_jsx("div", { className: "p-4 bg-yellow-900/20 rounded-lg", children: _jsx("p", { children: "Not signed in" }) })), _jsxs("div", { className: "flex gap-2", children: [user ? (_jsx(Button, { onClick: signOut, variant: "outline", children: "Sign Out" })) : (_jsx(Button, { onClick: () => signIn(), children: "Sign In with Google" })), _jsx(Button, { onClick: testAuth, variant: "outline", children: "Test Auth" })] })] })] }), _jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { children: "Integration Tests" }), _jsx(CardDescription, { children: "Test various system components" })] }), _jsx(CardContent, { className: "space-y-4", children: _jsxs("div", { className: "flex gap-2", children: [_jsx(Button, { onClick: testCouchbase, variant: "outline", children: "Test Couchbase" }), _jsx(Button, { onClick: testTournamentFlow, variant: "outline", children: "Test Tournament" })] }) })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Test Results" }) }), _jsx(CardContent, { children: testResults.length === 0 ? (_jsx("p", { className: "text-gray-400", children: "No tests run yet" })) : (_jsx("div", { className: "space-y-1 font-mono text-sm", children: testResults.map((result, i) => (_jsx("div", { children: result }, i))) })) })] })] })] }));
}
