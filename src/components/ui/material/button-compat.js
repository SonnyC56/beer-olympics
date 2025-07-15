import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { Button as MaterialButton } from './button';
// Map old variants to Material 3 variants
const variantMap = {
    'default': 'filled',
    'secondary': 'tonal',
    'tertiary': 'elevated',
    'accent': 'filled',
    'success': 'filled',
    'danger': 'filled',
    'outline': 'outlined',
    'ghost': 'text',
    'link': 'text',
};
// Map old sizes to Material 3 sizes
const sizeMap = {
    'default': 'medium',
    'sm': 'small',
    'lg': 'large',
    'icon': 'medium',
};
export const Button = forwardRef(({ variant = 'default', size = 'default', className, style, ...props }, ref) => {
    const materialVariant = variantMap[variant] || 'filled';
    const materialSize = sizeMap[size] || 'medium';
    // Apply color overrides based on variant
    const colorStyles = variant === 'accent' ? {
        '--md-filled-button-container-color': 'var(--md-sys-color-tertiary)',
        '--md-filled-button-label-text-color': 'var(--md-sys-color-on-tertiary)',
    } : variant === 'success' ? {
        '--md-filled-button-container-color': '#10B981',
        '--md-filled-button-label-text-color': '#FFFFFF',
    } : variant === 'danger' ? {
        '--md-filled-button-container-color': 'var(--md-sys-color-error)',
        '--md-filled-button-label-text-color': 'var(--md-sys-color-on-error)',
    } : {};
    // Handle icon size
    const iconStyles = size === 'icon' ? {
        padding: '8px',
        minWidth: '40px',
        width: '40px',
        height: '40px',
    } : {};
    return (_jsx(MaterialButton, { ref: ref, variant: materialVariant, size: materialSize, className: className, style: {
            ...colorStyles,
            ...iconStyles,
            ...style,
        }, ...props }));
});
Button.displayName = 'Button';
