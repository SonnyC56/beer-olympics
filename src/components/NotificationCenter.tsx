import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Typography,
  Switch,
  Button,
  Badge,
  Divider,
  Tab,
  Tabs,
  Box,
  Chip,
  FormControlLabel,
  TextField,
  Alert,
  Snackbar,
  Paper,
  Collapse,
  Fade,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  DoNotDisturb as DoNotDisturbIcon,
  Sms as SmsIcon,
  EmojiEvents as TrophyIcon,
  SportsScore as ScoreIcon,
  Leaderboard as LeaderboardIcon,
  Group as TeamIcon,
  Campaign as AnnouncementIcon,
  AccessTime as ReminderIcon,
  PlayArrow as GameStartIcon,
  Close as CloseIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  VolumeOff as MuteIcon,
  VolumeUp as SoundIcon,
} from '@mui/icons-material';
import { pushNotificationService } from '../services/push-notifications';
import type { SubscriptionData, DoNotDisturbSettings, NotificationType } from '../services/push-notifications';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { format } from 'date-fns';

interface NotificationCenterProps {
  open: boolean;
  onClose: () => void;
  tournamentId?: string;
}

interface NotificationHistory {
  id: string;
  type: NotificationType;
  title: string;
  body: string;
  timestamp: Date;
  read: boolean;
}

const notificationIcons: Record<NotificationType, React.ReactElement> = {
  'game-start': <GameStartIcon />,
  'your-turn': <NotificationsActiveIcon color="error" />,
  'game-end': <TrophyIcon />,
  'score-update': <ScoreIcon />,
  'leaderboard-change': <LeaderboardIcon />,
  'tournament-update': <TrophyIcon color="primary" />,
  'team-message': <TeamIcon />,
  'announcement': <AnnouncementIcon color="secondary" />,
  'reminder': <ReminderIcon />,
  'achievement': <TrophyIcon color="warning" />,
};

const notificationLabels: Record<NotificationType, string> = {
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

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  open,
  onClose,
  tournamentId,
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [notificationHistory, setNotificationHistory] = useState<NotificationHistory[]>([]);
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
      setNotificationHistory(history.map((n: any) => ({
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
    } catch (error) {
      console.error('Failed to enable notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleNotification = async (type: keyof SubscriptionData['preferences']) => {
    if (!subscription) return;

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
    if (!subscription) return;

    const newDnd: DoNotDisturbSettings = {
      ...subscription.doNotDisturb,
      enabled: !subscription.doNotDisturb.enabled,
    };

    await pushNotificationService.updateDoNotDisturb(newDnd);
    setSubscription({
      ...subscription,
      doNotDisturb: newDnd,
    });
  };

  const handleDndTimeChange = async (field: 'startTime' | 'endTime', value: Date | null) => {
    if (!subscription || !value) return;

    const timeString = format(value, 'HH:mm');
    const newDnd: DoNotDisturbSettings = {
      ...subscription.doNotDisturb,
      [field]: timeString,
    };

    await pushNotificationService.updateDoNotDisturb(newDnd);
    setSubscription({
      ...subscription,
      doNotDisturb: newDnd,
    });
  };

  const handleDndException = async (type: NotificationType) => {
    if (!subscription) return;

    const exceptions = subscription.doNotDisturb.exceptions || [];
    const newExceptions = exceptions.includes(type)
      ? exceptions.filter(e => e !== type)
      : [...exceptions, type];

    const newDnd: DoNotDisturbSettings = {
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
    if (!phoneNumber) return;

    setLoading(true);
    try {
      await pushNotificationService.enableSMS(phoneNumber);
      await loadSubscription();
      showSuccessToast('SMS notifications enabled!');
      setSmsExpanded(false);
    } catch (error) {
      console.error('Failed to enable SMS:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDisableSms = async () => {
    setLoading(true);
    try {
      await pushNotificationService.disableSMS();
      await loadSubscription();
      showSuccessToast('SMS notifications disabled');
    } catch (error) {
      console.error('Failed to disable SMS:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = (id: string) => {
    const updated = notificationHistory.map(n =>
      n.id === id ? { ...n, read: true } : n
    );
    setNotificationHistory(updated);
    localStorage.setItem('notification-history', JSON.stringify(updated));
  };

  const handleClearHistory = () => {
    setNotificationHistory([]);
    localStorage.removeItem('notification-history');
  };

  const showSuccessToast = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
  };

  const unreadCount = notificationHistory.filter(n => !n.read).length;

  return (
    <>
      <Dialog
        open={open}
        onClose={onClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 3,
            maxHeight: '90vh',
          },
        }}
      >
        <DialogTitle sx={{ pb: 0 }}>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1}>
              <Badge badgeContent={unreadCount} color="error">
                <NotificationsIcon />
              </Badge>
              <Typography variant="h6">Notification Center</Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <Tabs
          value={tabValue}
          onChange={(_, value) => setTabValue(value)}
          sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="History" />
          <Tab label="Preferences" />
          <Tab label="Settings" />
        </Tabs>

        <DialogContent sx={{ px: 0, py: 0 }}>
          {/* History Tab */}
          {tabValue === 0 && (
            <Box>
              {notificationHistory.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography color="text.secondary">
                    No notifications yet
                  </Typography>
                </Box>
              ) : (
                <List>
                  {notificationHistory.map((notification) => (
                    <Fade in key={notification.id}>
                      <ListItem
                        component="button"
                        onClick={() => handleMarkAsRead(notification.id)}
                        sx={{
                          backgroundColor: notification.read ? 'transparent' : 'action.hover',
                        }}
                      >
                        <ListItemIcon>
                          {notificationIcons[notification.type]}
                        </ListItemIcon>
                        <ListItemText
                          primary={notification.title}
                          secondary={
                            <>
                              <Typography variant="body2" component="span">
                                {notification.body}
                              </Typography>
                              <Typography variant="caption" display="block" color="text.secondary">
                                {format(notification.timestamp, 'MMM d, h:mm a')}
                              </Typography>
                            </>
                          }
                        />
                        {!notification.read && (
                          <Chip label="New" size="small" color="primary" />
                        )}
                      </ListItem>
                    </Fade>
                  ))}
                </List>
              )}
            </Box>
          )}

          {/* Preferences Tab */}
          {tabValue === 1 && (
            <Box>
              {!subscription ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <NotificationsIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" gutterBottom>
                    Enable notifications to stay updated
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<NotificationsIcon />}
                    onClick={handleRequestPermission}
                    disabled={loading}
                  >
                    Enable Notifications
                  </Button>
                </Box>
              ) : (
                <List>
                  {(Object.keys(notificationLabels) as NotificationType[]).map((type) => {
                    const prefKey = type.replace('-', '') as keyof SubscriptionData['preferences'];
                    return (
                      <ListItem key={type}>
                        <ListItemIcon>
                          {notificationIcons[type]}
                        </ListItemIcon>
                        <ListItemText
                          primary={notificationLabels[type]}
                          secondary={type === 'your-turn' ? 'Critical - bypasses Do Not Disturb' : undefined}
                        />
                        <ListItemSecondaryAction>
                          <Switch
                            checked={subscription.preferences[prefKey] ?? false}
                            onChange={() => handleToggleNotification(prefKey)}
                          />
                        </ListItemSecondaryAction>
                      </ListItem>
                    );
                  })}
                </List>
              )}
            </Box>
          )}

          {/* Settings Tab */}
          {tabValue === 2 && subscription && (
            <Box>
              <List>
                {/* Do Not Disturb Settings */}
                <ListItem>
                  <ListItemIcon>
                    <DoNotDisturbIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Do Not Disturb"
                    secondary={subscription.doNotDisturb.enabled ? 'Enabled' : 'Disabled'}
                  />
                  <ListItemSecondaryAction>
                    <Switch
                      checked={subscription.doNotDisturb.enabled}
                      onChange={handleDndToggle}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <Collapse in={subscription.doNotDisturb.enabled}>
                  <Box sx={{ pl: 7, pr: 2, pb: 2 }}>
                    <LocalizationProvider dateAdapter={AdapterDateFns}>
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <TimePicker
                          label="Start Time"
                          value={subscription.doNotDisturb.startTime ? 
                            new Date(`2000-01-01T${subscription.doNotDisturb.startTime}`) : null}
                          onChange={(value) => handleDndTimeChange('startTime', value)}
                          slots={{ textField: TextField }}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                        <TimePicker
                          label="End Time"
                          value={subscription.doNotDisturb.endTime ? 
                            new Date(`2000-01-01T${subscription.doNotDisturb.endTime}`) : null}
                          onChange={(value) => handleDndTimeChange('endTime', value)}
                          slots={{ textField: TextField }}
                          slotProps={{ textField: { size: 'small' } }}
                        />
                      </Box>
                    </LocalizationProvider>
                    
                    <FormControlLabel
                      control={
                        <Switch
                          checked={subscription.doNotDisturb.duringMatches}
                          onChange={async () => {
                            const newDnd = {
                              ...subscription.doNotDisturb,
                              duringMatches: !subscription.doNotDisturb.duringMatches,
                            };
                            await pushNotificationService.updateDoNotDisturb(newDnd);
                            setSubscription({
                              ...subscription,
                              doNotDisturb: newDnd,
                            });
                          }}
                        />
                      }
                      label="Mute during matches"
                    />

                    <Typography variant="subtitle2" sx={{ mt: 2, mb: 1 }}>
                      Always notify for:
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                      {(['your-turn', 'game-start', 'announcement'] as NotificationType[]).map((type) => (
                        <Chip
                          key={type}
                          label={notificationLabels[type]}
                          icon={notificationIcons[type]}
                          onClick={() => handleDndException(type)}
                          color={subscription.doNotDisturb.exceptions?.includes(type) ? 'primary' : 'default'}
                          variant={subscription.doNotDisturb.exceptions?.includes(type) ? 'filled' : 'outlined'}
                        />
                      ))}
                    </Box>
                  </Box>
                </Collapse>

                <Divider />

                {/* SMS Settings */}
                <ListItem
                  component="button"
                  onClick={() => setSmsExpanded(!smsExpanded)}
                >
                  <ListItemIcon>
                    <SmsIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="SMS Notifications"
                    secondary={subscription.smsEnabled ? `Enabled - ${subscription.phoneNumber}` : 'For critical alerts'}
                  />
                  <ListItemSecondaryAction>
                    <IconButton size="small">
                      {smsExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>

                <Collapse in={smsExpanded}>
                  <Box sx={{ pl: 7, pr: 2, pb: 2 }}>
                    {!subscription.smsEnabled ? (
                      <>
                        <Alert severity="info" sx={{ mb: 2 }}>
                          SMS notifications for "You're up next" alerts ensure you never miss your turn
                        </Alert>
                        <TextField
                          fullWidth
                          label="Phone Number"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          placeholder="+1234567890"
                          size="small"
                          sx={{ mb: 2 }}
                        />
                        <Button
                          variant="contained"
                          startIcon={<SmsIcon />}
                          onClick={handleEnableSms}
                          disabled={!phoneNumber || loading}
                          fullWidth
                        >
                          Enable SMS
                        </Button>
                      </>
                    ) : (
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={handleDisableSms}
                        disabled={loading}
                        fullWidth
                      >
                        Disable SMS
                      </Button>
                    )}
                  </Box>
                </Collapse>

                <Divider />

                {/* Sound Settings */}
                <ListItem>
                  <ListItemIcon>
                    <SoundIcon />
                  </ListItemIcon>
                  <ListItemText
                    primary="Notification Sounds"
                    secondary="Play sounds for notifications"
                  />
                  <ListItemSecondaryAction>
                    <Switch defaultChecked />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Box>
          )}
        </DialogContent>

        {tabValue === 0 && notificationHistory.length > 0 && (
          <DialogActions sx={{ justifyContent: 'center' }}>
            <Button onClick={handleClearHistory} color="error">
              Clear History
            </Button>
          </DialogActions>
        )}
      </Dialog>

      <Snackbar
        open={showSuccess}
        autoHideDuration={3000}
        onClose={() => setShowSuccess(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="success" onClose={() => setShowSuccess(false)}>
          {successMessage}
        </Alert>
      </Snackbar>
    </>
  );
};