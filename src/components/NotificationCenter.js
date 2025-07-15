import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, IconButton, List, ListItem, ListItemText, ListItemIcon, ListItemSecondaryAction, Typography, Switch, Button, Badge, Divider, Tab, Tabs, Box, Chip, FormControlLabel, TextField, Alert, Snackbar, Collapse, Fade, } from '@mui/material';
import { Notifications as NotificationsIcon, NotificationsActive as NotificationsActiveIcon, DoNotDisturb as DoNotDisturbIcon, Sms as SmsIcon, EmojiEvents as TrophyIcon, SportsScore as ScoreIcon, Leaderboard as LeaderboardIcon, Group as TeamIcon, Campaign as AnnouncementIcon, AccessTime as ReminderIcon, PlayArrow as GameStartIcon, Close as CloseIcon, ExpandMore as ExpandMoreIcon, ExpandLess as ExpandLessIcon, VolumeUp as SoundIcon, } from '@mui/icons-material';
import { pushNotificationService } from '../services/push-notifications';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';
const notificationIcons = {
    'game-start': _jsx(GameStartIcon, {}),
    'your-turn': _jsx(NotificationsActiveIcon, { color: "error" }),
    'game-end': _jsx(TrophyIcon, {}),
    'score-update': _jsx(ScoreIcon, {}),
    'leaderboard-change': _jsx(LeaderboardIcon, {}),
    'tournament-update': _jsx(TrophyIcon, { color: "primary" }),
    'team-message': _jsx(TeamIcon, {}),
    'announcement': _jsx(AnnouncementIcon, { color: "secondary" }),
    'reminder': _jsx(ReminderIcon, {}),
    'achievement': _jsx(TrophyIcon, { color: "warning" }),
};
const notificationLabels = {
    'game-start': 'Game Start',
    'your-turn': "You're Up Next",
    'game-end': 'Game End',
    'score-update': 'Score Updates',
    'leaderboard-change': 'Leaderboard Changes',
    'tournament-update': 'Tournament Updates',
    'team-message': 'Team Messages',
    'announcement': 'Announcements',
    'reminder': 'Reminders',
    'achievement': 'Achievements',
};
export const NotificationCenter = ({ open, onClose, tournamentId, }) => {
    const [tabValue, setTabValue] = useState(0);
    const [subscription, setSubscription] = useState(null);
    const [notificationHistory, setNotificationHistory] = useState([]);
    const [loading, setLoading] = useState(false);
    const [phoneNumber, setPhoneNumber] = useState('');
    const [dndExpanded, setDndExpanded] = useState(false);
    const [smsExpanded, setSmsExpanded] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    useEffect(() => {
        loadSubscription();
        loadNotificationHistory();
    }, []);
    const loadSubscription = async () => {
        const sub = await pushNotificationService.getSubscription();
        setSubscription(sub);
        if (sub?.phoneNumber) {
            setPhoneNumber(sub.phoneNumber);
        }
    };
    const loadNotificationHistory = () => {
        // Load from localStorage or database
        const stored = localStorage.getItem('notification-history');
        if (stored) {
            const history = JSON.parse(stored);
            setNotificationHistory(history.map((n) => ({
                ...n,
                timestamp: new Date(n.timestamp),
            })));
        }
    };
    const handleRequestPermission = async () => {
        setLoading(true);
        try {
            const sub = await pushNotificationService.subscribe();
            setSubscription(sub);
            showSuccessToast('Notifications enabled!');
        }
        catch (error) {
            console.error('Failed to enable notifications:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleToggleNotification = async (type) => {
        if (!subscription)
            return;
        const newPreferences = {
            ...subscription.preferences,
            [type]: !subscription.preferences[type],
        };
        await pushNotificationService.updatePreferences(newPreferences);
        setSubscription({
            ...subscription,
            preferences: newPreferences,
        });
    };
    const handleDndToggle = async () => {
        if (!subscription)
            return;
        const newDnd = {
            ...subscription.doNotDisturb,
            enabled: !subscription.doNotDisturb.enabled,
        };
        await pushNotificationService.updateDoNotDisturb(newDnd);
        setSubscription({
            ...subscription,
            doNotDisturb: newDnd,
        });
    };
    const handleDndTimeChange = async (field, value) => {
        if (!subscription || !value)
            return;
        const timeString = format(value, 'HH:mm');
        const newDnd = {
            ...subscription.doNotDisturb,
            [field]: timeString,
        };
        await pushNotificationService.updateDoNotDisturb(newDnd);
        setSubscription({
            ...subscription,
            doNotDisturb: newDnd,
        });
    };
    const handleDndException = async (type) => {
        if (!subscription)
            return;
        const exceptions = subscription.doNotDisturb.exceptions || [];
        const newExceptions = exceptions.includes(type)
            ? exceptions.filter(e => e !== type)
            : [...exceptions, type];
        const newDnd = {
            ...subscription.doNotDisturb,
            exceptions: newExceptions,
        };
        await pushNotificationService.updateDoNotDisturb(newDnd);
        setSubscription({
            ...subscription,
            doNotDisturb: newDnd,
        });
    };
    const handleEnableSms = async () => {
        if (!phoneNumber)
            return;
        setLoading(true);
        try {
            await pushNotificationService.enableSMS(phoneNumber);
            await loadSubscription();
            showSuccessToast('SMS notifications enabled!');
            setSmsExpanded(false);
        }
        catch (error) {
            console.error('Failed to enable SMS:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleDisableSms = async () => {
        setLoading(true);
        try {
            await pushNotificationService.disableSMS();
            await loadSubscription();
            showSuccessToast('SMS notifications disabled');
        }
        catch (error) {
            console.error('Failed to disable SMS:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const handleMarkAsRead = (id) => {
        const updated = notificationHistory.map(n => n.id === id ? { ...n, read: true } : n);
        setNotificationHistory(updated);
        localStorage.setItem('notification-history', JSON.stringify(updated));
    };
    const handleClearHistory = () => {
        setNotificationHistory([]);
        localStorage.removeItem('notification-history');
    };
    const showSuccessToast = (message) => {
        setSuccessMessage(message);
        setShowSuccess(true);
    };
    const unreadCount = notificationHistory.filter(n => !n.read).length;
    return (_jsxs(_Fragment, { children: [_jsxs(Dialog, { open: open, onClose: onClose, maxWidth: "sm", fullWidth: true, PaperProps: {
                    sx: {
                        borderRadius: 3,
                        maxHeight: '90vh',
                    },
                }, children: [_jsx(DialogTitle, { sx: { pb: 0 }, children: _jsxs(Box, { display: "flex", alignItems: "center", justifyContent: "space-between", children: [_jsxs(Box, { display: "flex", alignItems: "center", gap: 1, children: [_jsx(Badge, { badgeContent: unreadCount, color: "error", children: _jsx(NotificationsIcon, {}) }), _jsx(Typography, { variant: "h6", children: "Notification Center" })] }), _jsx(IconButton, { onClick: onClose, size: "small", children: _jsx(CloseIcon, {}) })] }) }), _jsxs(Tabs, { value: tabValue, onChange: (_, value) => setTabValue(value), sx: { px: 2, borderBottom: 1, borderColor: 'divider' }, children: [_jsx(Tab, { label: "History" }), _jsx(Tab, { label: "Preferences" }), _jsx(Tab, { label: "Settings" })] }), _jsxs(DialogContent, { sx: { px: 0, py: 0 }, children: [tabValue === 0 && (_jsx(Box, { children: notificationHistory.length === 0 ? (_jsxs(Box, { sx: { p: 4, textAlign: 'center' }, children: [_jsx(NotificationsIcon, { sx: { fontSize: 48, color: 'text.disabled', mb: 2 } }), _jsx(Typography, { color: "text.secondary", children: "No notifications yet" })] })) : (_jsx(List, { children: notificationHistory.map((notification) => (_jsx(Fade, { in: true, children: _jsxs(ListItem, { component: "button", onClick: () => handleMarkAsRead(notification.id), sx: {
                                                backgroundColor: notification.read ? 'transparent' : 'action.hover',
                                            }, children: [_jsx(ListItemIcon, { children: notificationIcons[notification.type] }), _jsx(ListItemText, { primary: notification.title, secondary: _jsxs(_Fragment, { children: [_jsx(Typography, { variant: "body2", component: "span", children: notification.body }), _jsx(Typography, { variant: "caption", display: "block", color: "text.secondary", children: format(notification.timestamp, 'MMM d, h:mm a') })] }) }), !notification.read && (_jsx(Chip, { label: "New", size: "small", color: "primary" }))] }) }, notification.id))) })) })), tabValue === 1 && (_jsx(Box, { children: !subscription ? (_jsxs(Box, { sx: { p: 4, textAlign: 'center' }, children: [_jsx(NotificationsIcon, { sx: { fontSize: 48, color: 'text.disabled', mb: 2 } }), _jsx(Typography, { variant: "body1", gutterBottom: true, children: "Enable notifications to stay updated" }), _jsx(Button, { variant: "contained", startIcon: _jsx(NotificationsIcon, {}), onClick: handleRequestPermission, disabled: loading, children: "Enable Notifications" })] })) : (_jsx(List, { children: Object.keys(notificationLabels).map((type) => {
                                        const prefKey = type.replace('-', '');
                                        return (_jsxs(ListItem, { children: [_jsx(ListItemIcon, { children: notificationIcons[type] }), _jsx(ListItemText, { primary: notificationLabels[type], secondary: type === 'your-turn' ? 'Critical - bypasses Do Not Disturb' : undefined }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { checked: subscription.preferences[prefKey] ?? false, onChange: () => handleToggleNotification(prefKey) }) })] }, type));
                                    }) })) })), tabValue === 2 && subscription && (_jsx(Box, { children: _jsxs(List, { children: [_jsxs(ListItem, { children: [_jsx(ListItemIcon, { children: _jsx(DoNotDisturbIcon, {}) }), _jsx(ListItemText, { primary: "Do Not Disturb", secondary: subscription.doNotDisturb.enabled ? 'Enabled' : 'Disabled' }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { checked: subscription.doNotDisturb.enabled, onChange: handleDndToggle }) })] }), _jsx(Collapse, { in: subscription.doNotDisturb.enabled, children: _jsxs(Box, { sx: { pl: 7, pr: 2, pb: 2 }, children: [_jsx(LocalizationProvider, { dateAdapter: AdapterDateFns, children: _jsxs(Box, { sx: { display: 'flex', gap: 2, mb: 2 }, children: [_jsx(TimePicker, { label: "Start Time", value: subscription.doNotDisturb.startTime ?
                                                                        new Date(`2000-01-01T${subscription.doNotDisturb.startTime}`) : null, onChange: (value) => handleDndTimeChange('startTime', value), slots: { textField: TextField }, slotProps: { textField: { size: 'small' } } }), _jsx(TimePicker, { label: "End Time", value: subscription.doNotDisturb.endTime ?
                                                                        new Date(`2000-01-01T${subscription.doNotDisturb.endTime}`) : null, onChange: (value) => handleDndTimeChange('endTime', value), slots: { textField: TextField }, slotProps: { textField: { size: 'small' } } })] }) }), _jsx(FormControlLabel, { control: _jsx(Switch, { checked: subscription.doNotDisturb.duringMatches, onChange: async () => {
                                                                const newDnd = {
                                                                    ...subscription.doNotDisturb,
                                                                    duringMatches: !subscription.doNotDisturb.duringMatches,
                                                                };
                                                                await pushNotificationService.updateDoNotDisturb(newDnd);
                                                                setSubscription({
                                                                    ...subscription,
                                                                    doNotDisturb: newDnd,
                                                                });
                                                            } }), label: "Mute during matches" }), _jsx(Typography, { variant: "subtitle2", sx: { mt: 2, mb: 1 }, children: "Always notify for:" }), _jsx(Box, { sx: { display: 'flex', flexWrap: 'wrap', gap: 1 }, children: ['your-turn', 'game-start', 'announcement'].map((type) => (_jsx(Chip, { label: notificationLabels[type], icon: notificationIcons[type], onClick: () => handleDndException(type), color: subscription.doNotDisturb.exceptions?.includes(type) ? 'primary' : 'default', variant: subscription.doNotDisturb.exceptions?.includes(type) ? 'filled' : 'outlined' }, type))) })] }) }), _jsx(Divider, {}), _jsxs(ListItem, { component: "button", onClick: () => setSmsExpanded(!smsExpanded), children: [_jsx(ListItemIcon, { children: _jsx(SmsIcon, {}) }), _jsx(ListItemText, { primary: "SMS Notifications", secondary: subscription.smsEnabled ? `Enabled - ${subscription.phoneNumber}` : 'For critical alerts' }), _jsx(ListItemSecondaryAction, { children: _jsx(IconButton, { size: "small", children: smsExpanded ? _jsx(ExpandLessIcon, {}) : _jsx(ExpandMoreIcon, {}) }) })] }), _jsx(Collapse, { in: smsExpanded, children: _jsx(Box, { sx: { pl: 7, pr: 2, pb: 2 }, children: !subscription.smsEnabled ? (_jsxs(_Fragment, { children: [_jsx(Alert, { severity: "info", sx: { mb: 2 }, children: "SMS notifications for \"You're up next\" alerts ensure you never miss your turn" }), _jsx(TextField, { fullWidth: true, label: "Phone Number", value: phoneNumber, onChange: (e) => setPhoneNumber(e.target.value), placeholder: "+1234567890", size: "small", sx: { mb: 2 } }), _jsx(Button, { variant: "contained", startIcon: _jsx(SmsIcon, {}), onClick: handleEnableSms, disabled: !phoneNumber || loading, fullWidth: true, children: "Enable SMS" })] })) : (_jsx(Button, { variant: "outlined", color: "error", onClick: handleDisableSms, disabled: loading, fullWidth: true, children: "Disable SMS" })) }) }), _jsx(Divider, {}), _jsxs(ListItem, { children: [_jsx(ListItemIcon, { children: _jsx(SoundIcon, {}) }), _jsx(ListItemText, { primary: "Notification Sounds", secondary: "Play sounds for notifications" }), _jsx(ListItemSecondaryAction, { children: _jsx(Switch, { defaultChecked: true }) })] })] }) }))] }), tabValue === 0 && notificationHistory.length > 0 && (_jsx(DialogActions, { sx: { justifyContent: 'center' }, children: _jsx(Button, { onClick: handleClearHistory, color: "error", children: "Clear History" }) }))] }), _jsx(Snackbar, { open: showSuccess, autoHideDuration: 3000, onClose: () => setShowSuccess(false), anchorOrigin: { vertical: 'bottom', horizontal: 'center' }, children: _jsx(Alert, { severity: "success", onClose: () => setShowSuccess(false), children: successMessage }) })] }));
};
