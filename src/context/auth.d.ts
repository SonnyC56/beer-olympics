import React from 'react';
import type { User } from '../types';
interface AuthContextType {
    user: User | null;
    loading: boolean;
    signIn: (returnTo?: string) => Promise<void>;
    signOut: () => Promise<void>;
    refreshUser: () => Promise<void>;
}
export declare function AuthProvider({ children }: {
    children: React.ReactNode;
}): import("react/jsx-runtime").JSX.Element;
export declare function useAuth(): AuthContextType;
export {};
