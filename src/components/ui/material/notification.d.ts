import React from 'react';
import type { NotificationPayload } from '../../../services/push-notifications';
interface NotificationProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    message: string;
    severity?: 'success' | 'error' | 'warning' | 'info';
    variant?: 'standard' | 'filled' | 'outlined';
    position?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
    };
    duration?: number | null;
    action?: React.ReactNode;
    transition?: 'slide' | 'grow' | 'fade' | 'zoom';
    icon?: React.ReactNode;
}
export declare const Notification: React.FC<NotificationProps>;
interface RichNotificationProps {
    open: boolean;
    onClose: () => void;
    notification: NotificationPayload;
    position?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'center' | 'right';
    };
    onAction?: (action: string) => void;
}
export declare const RichNotification: React.FC<RichNotificationProps>;
interface NotificationBadgeProps {
    count: number;
    children: React.ReactNode;
    max?: number;
    color?: 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning';
    showZero?: boolean;
    variant?: 'standard' | 'dot';
    invisible?: boolean;
    overlap?: 'rectangular' | 'circular';
    anchorOrigin?: {
        vertical: 'top' | 'bottom';
        horizontal: 'left' | 'right';
    };
}
export declare const NotificationBadge: React.FC<NotificationBadgeProps>;
export declare const useNotificationState: () => {
    notifications: {
        id: string;
        props: NotificationProps;
    }[];
    showNotification: (props: Omit<NotificationProps, "open" | "onClose">) => string;
    hideNotification: (id: string) => void;
    hideAll: () => void;
};
export {};
