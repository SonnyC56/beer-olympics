import React, { forwardRef } from 'react';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/elevated-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/icon/icon.js';
import { MaterialElements as ME } from './material-elements';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'filled' | 'outlined' | 'text' | 'elevated' | 'tonal';
  size?: 'small' | 'medium' | 'large';
  leadingIcon?: string;
  trailingIcon?: string;
  fullWidth?: boolean;
  href?: string;
  target?: string;
  asChild?: boolean;
}

const Button = forwardRef<HTMLElement, ButtonProps>(
  ({ 
    children, 
    variant = 'filled', 
    size = 'medium',
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    className = '',
    disabled,
    onClick,
    type = 'button',
    href,
    target,
    style,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      if (onClick) {
        onClick(e as any);
      }
    };

    // Size styles
    const sizeStyles = {
      small: {
        '--md-filled-button-container-height': '32px',
        '--md-filled-button-label-text-size': '13px',
        '--md-outlined-button-container-height': '32px',
        '--md-outlined-button-label-text-size': '13px',
        '--md-text-button-container-height': '32px',
        '--md-text-button-label-text-size': '13px',
        '--md-elevated-button-container-height': '32px',
        '--md-elevated-button-label-text-size': '13px',
        '--md-filled-tonal-button-container-height': '32px',
        '--md-filled-tonal-button-label-text-size': '13px',
        padding: '0 12px',
      },
      medium: {
        '--md-filled-button-container-height': '40px',
        '--md-filled-button-label-text-size': '14px',
        '--md-outlined-button-container-height': '40px',
        '--md-outlined-button-label-text-size': '14px',
        '--md-text-button-container-height': '40px',
        '--md-text-button-label-text-size': '14px',
        '--md-elevated-button-container-height': '40px',
        '--md-elevated-button-label-text-size': '14px',
        '--md-filled-tonal-button-container-height': '40px',
        '--md-filled-tonal-button-label-text-size': '14px',
        padding: '0 16px',
      },
      large: {
        '--md-filled-button-container-height': '48px',
        '--md-filled-button-label-text-size': '16px',
        '--md-outlined-button-container-height': '48px',
        '--md-outlined-button-label-text-size': '16px',
        '--md-text-button-container-height': '48px',
        '--md-text-button-label-text-size': '16px',
        '--md-elevated-button-container-height': '48px',
        '--md-elevated-button-label-text-size': '16px',
        '--md-filled-tonal-button-container-height': '48px',
        '--md-filled-tonal-button-label-text-size': '16px',
        padding: '0 24px',
      },
    };

    const commonProps = {
      ref,
      disabled,
      onClick: handleClick,
      type,
      href,
      target,
      className: `${className} ${fullWidth ? 'w-full' : ''}`,
      style: {
        ...sizeStyles[size],
        width: fullWidth ? '100%' : undefined,
        ...style,
      },
      'trailing-icon': trailingIcon ? true : undefined,
    };

    const content = (
      <>
        {leadingIcon && <ME.Icon slot="icon">{leadingIcon}</ME.Icon>}
        {children}
        {trailingIcon && <ME.Icon>{trailingIcon}</ME.Icon>}
      </>
    );

    switch (variant) {
      case 'outlined':
        return <ME.OutlinedButton {...commonProps}>{content}</ME.OutlinedButton>;
      case 'text':
        return <ME.TextButton {...commonProps}>{content}</ME.TextButton>;
      case 'elevated':
        return <ME.ElevatedButton {...commonProps}>{content}</ME.ElevatedButton>;
      case 'tonal':
        return <ME.FilledTonalButton {...commonProps}>{content}</ME.FilledTonalButton>;
      case 'filled':
      default:
        return <ME.FilledButton {...commonProps}>{content}</ME.FilledButton>;
    }
  }
);

Button.displayName = 'Button';

export { Button };