import React, { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { getElevation } from '../material-theme';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined';
  elevation?: 0 | 1 | 2 | 3 | 4 | 5;
  clickable?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'elevated', elevation = 1, clickable = false, style, ...props }, ref) => {
    const elevationLevel = `level${elevation}` as 'level0' | 'level1' | 'level2' | 'level3' | 'level4' | 'level5';
    
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
        boxShadow: variant === 'elevated' ? getElevation(`level${Math.min(elevation + 1, 5)}` as any) : undefined,
      },
    } : {};

    return (
      <div
        ref={ref}
        className={cn(
          "md-card",
          clickable && "md-card-clickable",
          className
        )}
        style={{
          ...baseStyles,
          ...variantStyles[variant],
          ...style,
        }}
        {...props}
      />
    );
  }
);

Card.displayName = 'Card';

const CardHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("md-card-header", className)}
      style={{
        padding: '16px 16px 0',
        ...style,
      }}
      {...props}
    />
  )
);

CardHeader.displayName = 'CardHeader';

const CardTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, style, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn("md-card-title", className)}
      style={{
        fontFamily: 'var(--md-sys-typescale-headline-small-font-family)',
        fontSize: 'var(--md-sys-typescale-headline-small-font-size)',
        fontWeight: 'var(--md-sys-typescale-headline-small-font-weight)',
        lineHeight: 'var(--md-sys-typescale-headline-small-line-height)',
        letterSpacing: 'var(--md-sys-typescale-headline-small-letter-spacing)',
        margin: 0,
        ...style,
      }}
      {...props}
    />
  )
);

CardTitle.displayName = 'CardTitle';

const CardDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, style, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("md-card-description", className)}
      style={{
        fontFamily: 'var(--md-sys-typescale-body-medium-font-family)',
        fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
        fontWeight: 'var(--md-sys-typescale-body-medium-font-weight)',
        lineHeight: 'var(--md-sys-typescale-body-medium-line-height)',
        letterSpacing: 'var(--md-sys-typescale-body-medium-letter-spacing)',
        color: 'var(--md-sys-color-on-surface-variant)',
        marginTop: '4px',
        marginBottom: 0,
        ...style,
      }}
      {...props}
    />
  )
);

CardDescription.displayName = 'CardDescription';

const CardContent = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("md-card-content", className)}
      style={{
        padding: '16px',
        ...style,
      }}
      {...props}
    />
  )
);

CardContent.displayName = 'CardContent';

const CardFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("md-card-footer", className)}
      style={{
        padding: '0 8px 8px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        ...style,
      }}
      {...props}
    />
  )
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };