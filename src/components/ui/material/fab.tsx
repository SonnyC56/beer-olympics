import React, { forwardRef } from 'react';
import '@material/web/fab/fab.js';
import '@material/web/fab/branded-fab.js';
import '@material/web/icon/icon.js';

export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
  size?: 'small' | 'medium' | 'large';
  icon: string;
  label?: string;
  lowered?: boolean;
  branded?: boolean;
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
  href?: string;
  target?: string;
}

const FAB = forwardRef<HTMLElement, FABProps>(
  ({ 
    variant = 'primary',
    size = 'medium',
    icon,
    label,
    lowered = false,
    branded = false,
    position = 'bottom-right',
    className = '',
    style,
    onClick,
    disabled,
    href,
    target,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      if (onClick) {
        onClick(e as any);
      }
    };

    const positionStyles = {
      'bottom-right': {
        position: 'fixed' as const,
        bottom: '16px',
        right: '16px',
      },
      'bottom-left': {
        position: 'fixed' as const,
        bottom: '16px',
        left: '16px',
      },
      'top-right': {
        position: 'fixed' as const,
        top: '16px',
        right: '16px',
      },
      'top-left': {
        position: 'fixed' as const,
        top: '16px',
        left: '16px',
      },
    };

    const commonProps = {
      ref,
      variant,
      size,
      label,
      lowered,
      disabled,
      href,
      target,
      onClick: handleClick,
      className,
      style: {
        ...positionStyles[position],
        ...style,
      },
    };

    const iconElement = <md-icon slot="icon">{icon}</md-icon>;

    if (branded) {
      return (
        <md-branded-fab {...commonProps}>
          {iconElement}
        </md-branded-fab>
      );
    }

    return (
      <md-fab {...commonProps}>
        {iconElement}
      </md-fab>
    );
  }
);

FAB.displayName = 'FAB';

export { FAB };