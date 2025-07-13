import { createTRPCReact } from '@trpc/react-query';
import { httpBatchLink } from '@trpc/client';
import { QueryClient } from '@tanstack/react-query';
import type { AppRouter } from '../api/routers/index';

export const trpc = createTRPCReact<AppRouter>();

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
    if (import.meta.env.PROD) {
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