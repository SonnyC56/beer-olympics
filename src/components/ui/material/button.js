import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import '@material/web/button/filled-button.js';
import '@material/web/button/outlined-button.js';
import '@material/web/button/text-button.js';
import '@material/web/button/elevated-button.js';
import '@material/web/button/filled-tonal-button.js';
import '@material/web/icon/icon.js';
import { MaterialElements as ME } from './material-elements';
const Button = forwardRef(({ children, variant = 'filled', size = 'medium', leadingIcon, trailingIcon, fullWidth = false, className = '', disabled, onClick, type = 'button', href, target, style, ...props }, ref) => {
    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
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
    const content = (_jsxs(_Fragment, { children: [leadingIcon && _jsx(ME.Icon, { slot: "icon", children: leadingIcon }), children, trailingIcon && _jsx(ME.Icon, { children: trailingIcon })] }));
    switch (variant) {
        case 'outlined':
            return _jsx(ME.OutlinedButton, { ...commonProps, children: content });
        case 'text':
            return _jsx(ME.TextButton, { ...commonProps, children: content });
        case 'elevated':
            return _jsx(ME.ElevatedButton, { ...commonProps, children: content });
        case 'tonal':
            return _jsx(ME.FilledTonalButton, { ...commonProps, children: content });
        case 'filled':
        default:
            return _jsx(ME.FilledButton, { ...commonProps, children: content });
    }
});
Button.displayName = 'Button';
export { Button };
