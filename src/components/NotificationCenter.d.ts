import React from 'react';
interface NotificationCenterProps {
    open: boolean;
    onClose: () => void;
    tournamentId?: string;
}
export declare const NotificationCenter: React.FC<NotificationCenterProps>;
export {};
