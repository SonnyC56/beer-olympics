import React from 'react';
interface QuickActionsProps {
    tournamentSlug?: string;
    isPlayer?: boolean;
    className?: string;
}
export declare function QuickActions({ tournamentSlug, isPlayer, className }: QuickActionsProps): import("react/jsx-runtime").JSX.Element;
export declare function MobileFAB({ onClick, icon: Icon, label, className }: {
    onClick: () => void;
    icon?: React.ComponentType<{
        className?: string;
    }>;
    label?: string;
    className?: string;
}): import("react/jsx-runtime").JSX.Element;
export {};
