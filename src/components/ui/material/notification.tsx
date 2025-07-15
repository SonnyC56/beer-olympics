import React from 'react';
import { 
  Alert,
  AlertTitle,
  Snackbar,
  IconButton,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Fade,
  Slide,
  Grow,
  Zoom,
} from '@mui/material';
import {
  Close as CloseIcon,
  Notifications as NotificationsIcon,
  NotificationsActive as NotificationsActiveIcon,
  Check as CheckIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
} from '@mui/icons-material';
import { TransitionProps } from '@mui/material/transitions';
import type { NotificationPayload } from '../../../services/push-notifications';

// Transition components
function SlideTransition(props: TransitionProps & { children: React.ReactElement<any, any> }) {
  return <Slide {...props} direction="up" />;
}

function GrowTransition(props: TransitionProps & { children: React.ReactElement<any, any> }) {
  return <Grow {...props} />;
}

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

export const Notification: React.FC<NotificationProps> = ({
  open,
  onClose,
  title,
  message,
  severity = 'info',
  variant = 'filled',
  position = { vertical: 'bottom', horizontal: 'center' },
  duration = 6000,
  action,
  transition = 'slide',
  icon,
}) => {
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
    if (icon) return icon;
    
    switch (severity) {
      case 'success':
        return <CheckIcon />;
      case 'error':
        return <ErrorIcon />;
      case 'warning':
        return <WarningIcon />;
      default:
        return <InfoIcon />;
    }
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={duration}
      onClose={onClose}
      anchorOrigin={position}
      TransitionComponent={getTransition()}
    >
      <Alert
        severity={severity}
        variant={variant}
        onClose={onClose}
        icon={getIcon()}
        action={action}
        sx={{
          width: '100%',
          '& .MuiAlert-icon': {
            fontSize: 28,
          },
        }}
      >
        {title && <AlertTitle>{title}</AlertTitle>}
        {message}
      </Alert>
    </Snackbar>
  );
};

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

export const RichNotification: React.FC<RichNotificationProps> = ({
  open,
  onClose,
  notification,
  position = { vertical: 'top', horizontal: 'right' },
  onAction,
}) => {
  const handleAction = (action: string) => {
    if (onAction) {
      onAction(action);
    }
    onClose();
  };

  return (
    <Snackbar
      open={open}
      onClose={onClose}
      anchorOrigin={position}
      TransitionComponent={SlideTransition}
      sx={{ maxWidth: 400 }}
    >
      <Card
        elevation={6}
        sx={{
          minWidth: 350,
          backgroundColor: notification.priority === 'urgent' ? 'error.dark' : 'background.paper',
          color: notification.priority === 'urgent' ? 'error.contrastText' : 'text.primary',
        }}
      >
        <CardContent sx={{ pb: 1 }}>
          <Box display="flex" alignItems="flex-start" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={1} flex={1}>
              {notification.priority === 'urgent' ? (
                <NotificationsActiveIcon sx={{ fontSize: 28 }} />
              ) : (
                <NotificationsIcon sx={{ fontSize: 28 }} />
              )}
              <Box flex={1}>
                <Typography variant="h6" component="div" gutterBottom>
                  {notification.title}
                </Typography>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  {notification.body}
                </Typography>
              </Box>
            </Box>
            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: notification.priority === 'urgent' ? 'error.contrastText' : 'text.secondary',
              }}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          </Box>
          
          {notification.image && (
            <Box mt={2}>
              <img
                src={notification.image}
                alt=""
                style={{
                  width: '100%',
                  height: 'auto',
                  borderRadius: 8,
                }}
              />
            </Box>
          )}
        </CardContent>
        
        {notification.actions && notification.actions.length > 0 && (
          <CardActions sx={{ justifyContent: 'flex-end', pt: 0 }}>
            {notification.actions.map((action) => (
              <Button
                key={action.action}
                size="small"
                onClick={() => handleAction(action.action)}
                sx={{
                  color: notification.priority === 'urgent' ? 'error.contrastText' : 'primary.main',
                }}
              >
                {action.title}
              </Button>
            ))}
          </CardActions>
        )}
      </Card>
    </Snackbar>
  );
};

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

export const NotificationBadge: React.FC<NotificationBadgeProps> = ({
  count,
  children,
  max = 99,
  color = 'error',
  showZero = false,
  variant = 'standard',
  invisible = false,
  overlap = 'rectangular',
  anchorOrigin = { vertical: 'top', horizontal: 'right' },
}) => {
  const displayCount = count > max ? `${max}+` : count;
  const shouldShow = showZero || count > 0;

  if (!shouldShow || invisible) {
    return <>{children}</>;
  }

  return (
    <Box position="relative" display="inline-flex">
      {children}
      <Box
        component="span"
        sx={{
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
        }}
      >
        {variant !== 'dot' && displayCount}
      </Box>
    </Box>
  );
};

// Hook for managing notification state
export const useNotificationState = () => {
  const [notifications, setNotifications] = React.useState<Array<{
    id: string;
    props: NotificationProps;
  }>>([]);

  const showNotification = React.useCallback((props: Omit<NotificationProps, 'open' | 'onClose'>) => {
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

  const hideNotification = React.useCallback((id: string) => {
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