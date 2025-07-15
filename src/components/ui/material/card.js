import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { getElevation } from '../material-theme';
const Card = forwardRef(({ className, variant = 'elevated', elevation = 1, clickable = false, style, ...props }, ref) => {
    const elevationLevel = `level${elevation}`;
    const baseStyles = {
        backgroundColor: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-surface)',
        borderRadius: 'var(--md-sys-shape-medium)',
        transition: 'all 200ms cubic-bezier(0.4, 0, 0.2, 1)',
    };
    const variantStyles = {
        elevated: {
            boxShadow: getElevation(elevationLevel),
        },
        filled: {
            backgroundColor: 'var(--md-sys-color-surface-variant)',
            color: 'var(--md-sys-color-on-surface-variant)',
        },
        outlined: {
            border: '1px solid var(--md-sys-color-outline-variant)',
            backgroundColor: 'var(--md-sys-color-surface)',
        },
    };
    const clickableStyles = clickable ? {
        cursor: 'pointer',
        ':hover': {
            boxShadow: variant === 'elevated' ? getElevation(`level${Math.min(elevation + 1, 5)}`) : undefined,
        },
    } : {};
    return (_jsx("div", { ref: ref, className: cn("md-card", clickable && "md-card-clickable", className), style: {
            ...baseStyles,
            ...variantStyles[variant],
            ...style,
        }, ...props }));
});
Card.displayName = 'Card';
const CardHeader = forwardRef(({ className, style, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("md-card-header", className), style: {
        padding: '16px 16px 0',
        ...style,
    }, ...props })));
CardHeader.displayName = 'CardHeader';
const CardTitle = forwardRef(({ className, style, ...props }, ref) => (_jsx("h3", { ref: ref, className: cn("md-card-title", className), style: {
        fontFamily: 'var(--md-sys-typescale-headline-small-font-family)',
        fontSize: 'var(--md-sys-typescale-headline-small-font-size)',
        fontWeight: 'var(--md-sys-typescale-headline-small-font-weight)',
        lineHeight: 'var(--md-sys-typescale-headline-small-line-height)',
        letterSpacing: 'var(--md-sys-typescale-headline-small-letter-spacing)',
        margin: 0,
        ...style,
    }, ...props })));
CardTitle.displayName = 'CardTitle';
const CardDescription = forwardRef(({ className, style, ...props }, ref) => (_jsx("p", { ref: ref, className: cn("md-card-description", className), style: {
        fontFamily: 'var(--md-sys-typescale-body-medium-font-family)',
        fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
        fontWeight: 'var(--md-sys-typescale-body-medium-font-weight)',
        lineHeight: 'var(--md-sys-typescale-body-medium-line-height)',
        letterSpacing: 'var(--md-sys-typescale-body-medium-letter-spacing)',
        color: 'var(--md-sys-color-on-surface-variant)',
        marginTop: '4px',
        marginBottom: 0,
        ...style,
    }, ...props })));
CardDescription.displayName = 'CardDescription';
const CardContent = forwardRef(({ className, style, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("md-card-content", className), style: {
        padding: '16px',
        ...style,
    }, ...props })));
CardContent.displayName = 'CardContent';
const CardFooter = forwardRef(({ className, style, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("md-card-footer", className), style: {
        padding: '0 8px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...style,
    }, ...props })));
CardFooter.displayName = 'CardFooter';
export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
