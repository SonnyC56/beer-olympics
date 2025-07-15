import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import React from 'react';
import { Alert, AlertTitle, Snackbar, IconButton, Box, Typography, Button, Card, CardContent, CardActions, Fade, Slide, Grow, Zoom, } from '@mui/material';
import { Close as CloseIcon, Notifications as NotificationsIcon, NotificationsActive as NotificationsActiveIcon, Check as CheckIcon, Error as ErrorIcon, Warning as WarningIcon, Info as InfoIcon, } from '@mui/icons-material';
// Transition components
function SlideTransition(props) {
    return _jsx(Slide, { ...props, direction: "up" });
}
function GrowTransition(props) {
    return _jsx(Grow, { ...props });
}
export const Notification = ({ open, onClose, title, message, severity = 'info', variant = 'filled', position = { vertical: 'bottom', horizontal: 'center' }, duration = 6000, action, transition = 'slide', icon, }) => {
    const getTransition = () => {
        switch (transition) {
            case 'grow':
                return GrowTransition;
            case 'fade':
                return Fade;
            case 'zoom':
                return Zoom;
            default:
                return SlideTransition;
        }
    };
    const getIcon = () => {
        if (icon)
            return icon;
        switch (severity) {
            case 'success':
                return _jsx(CheckIcon, {});
            case 'error':
                return _jsx(ErrorIcon, {});
            case 'warning':
                return _jsx(WarningIcon, {});
            default:
                return _jsx(InfoIcon, {});
        }
    };
    return (_jsx(Snackbar, { open: open, autoHideDuration: duration, onClose: onClose, anchorOrigin: position, TransitionComponent: getTransition(), children: _jsxs(Alert, { severity: severity, variant: variant, onClose: onClose, icon: getIcon(), action: action, sx: {
                width: '100%',
                '& .MuiAlert-icon': {
                    fontSize: 28,
                },
            }, children: [title && _jsx(AlertTitle, { children: title }), message] }) }));
};
export const RichNotification = ({ open, onClose, notification, position = { vertical: 'top', horizontal: 'right' }, onAction, }) => {
    const handleAction = (action) => {
        if (onAction) {
            onAction(action);
        }
        onClose();
    };
    return (_jsx(Snackbar, { open: open, onClose: onClose, anchorOrigin: position, TransitionComponent: SlideTransition, sx: { maxWidth: 400 }, children: _jsxs(Card, { elevation: 6, sx: {
                minWidth: 350,
                backgroundColor: notification.priority === 'urgent' ? 'error.dark' : 'background.paper',
                color: notification.priority === 'urgent' ? 'error.contrastText' : 'text.primary',
            }, children: [_jsxs(CardContent, { sx: { pb: 1 }, children: [_jsxs(Box, { display: "flex", alignItems: "flex-start", justifyContent: "space-between", children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1, flex: 1, children: [notification.priority === 'urgent' ? (_jsx(NotificationsActiveIcon, { sx: { fontSize: 28 } })) : (_jsx(NotificationsIcon, { sx: { fontSize: 28 } })), _jsxs(Box, { flex: 1, children: [_jsx(Typography, { variant: "h6", component: "div", gutterBottom: true, children: notification.title }), _jsx(Typography, { variant: "body2", sx: { opacity: 0.9 }, children: notification.body })] })] }), _jsx(IconButton, { size: "small", onClick: onClose, sx: {
                                        color: notification.priority === 'urgent' ? 'error.contrastText' : 'text.secondary',
                                    }, children: _jsx(CloseIcon, { fontSize: "small" }) })] }), notification.image && (_jsx(Box, { mt: 2, children: _jsx("img", { src: notification.image, alt: "", style: {
                                    width: '100%',
                                    height: 'auto',
                                    borderRadius: 8,
                                } }) }))] }), notification.actions && notification.actions.length > 0 && (_jsx(CardActions, { sx: { justifyContent: 'flex-end', pt: 0 }, children: notification.actions.map((action) => (_jsx(Button, { size: "small", onClick: () => handleAction(action.action), sx: {
                            color: notification.priority === 'urgent' ? 'error.contrastText' : 'primary.main',
                        }, children: action.title }, action.action))) }))] }) }));
};
export const NotificationBadge = ({ count, children, max = 99, color = 'error', showZero = false, variant = 'standard', invisible = false, overlap = 'rectangular', anchorOrigin = { vertical: 'top', horizontal: 'right' }, }) => {
    const displayCount = count > max ? `${max}+` : count;
    const shouldShow = showZero || count > 0;
    if (!shouldShow || invisible) {
        return _jsx(_Fragment, { children: children });
    }
    return (_jsxs(Box, { position: "relative", display: "inline-flex", children: [children, _jsx(Box, { component: "span", sx: {
                    position: 'absolute',
                    top: anchorOrigin.vertical === 'top' ? 0 : 'auto',
                    bottom: anchorOrigin.vertical === 'bottom' ? 0 : 'auto',
                    right: anchorOrigin.horizontal === 'right' ? 0 : 'auto',
                    left: anchorOrigin.horizontal === 'left' ? 0 : 'auto',
                    transform: 'scale(1) translate(50%, -50%)',
                    transformOrigin: `${anchorOrigin.horizontal} ${anchorOrigin.vertical}`,
                    bgcolor: `${color}.main`,
                    color: `${color}.contrastText`,
                    borderRadius: variant === 'dot' ? '50%' : '10px',
                    height: variant === 'dot' ? 8 : 20,
                    minWidth: variant === 'dot' ? 8 : 20,
                    padding: variant === 'dot' ? 0 : '0 6px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 12,
                    fontWeight: 'medium',
                    border: '2px solid',
                    borderColor: 'background.paper',
                }, children: variant !== 'dot' && displayCount })] }));
};
// Hook for managing notification state
export const useNotificationState = () => {
    const [notifications, setNotifications] = React.useState([]);
    const showNotification = React.useCallback((props) => {
        const id = Date.now().toString();
        const notification = {
            id,
            props: {
                ...props,
                open: true,
                onClose: () => {
                    setNotifications(prev => prev.filter(n => n.id !== id));
                },
            },
        };
        setNotifications(prev => [...prev, notification]);
        return id;
    }, []);
    const hideNotification = React.useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);
    const hideAll = React.useCallback(() => {
        setNotifications([]);
    }, []);
    return {
        notifications,
        showNotification,
        hideNotification,
        hideAll,
    };
};
