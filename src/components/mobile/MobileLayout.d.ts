import type { ReactNode } from 'react';
interface MobileLayoutProps {
    children: ReactNode;
    showBottomNav?: boolean;
    tournamentSlug?: string;
}
export declare function MobileLayout({ children, showBottomNav, tournamentSlug }: MobileLayoutProps): import("react/jsx-runtime").JSX.Element;
export {};
