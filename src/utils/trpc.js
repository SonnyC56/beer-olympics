import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
export const trpc = createTRPCReact();
export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: 5000,
        },
    },
});
// Use the correct API URL based on environment
const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
        // In production, use relative URL
        if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
            return '';
        }
        // In development, use current origin (Vite dev server)
        return window.location.origin;
    }
    return '';
};
export const trpcClient = trpc.createClient({
    links: [
        httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
            headers() {
                return {
                    'Content-Type': 'application/json',
                };
            },
        }),
    ],
});
