// Re-export Material 3 Chip component as Badge with compatibility
import React, { forwardRef } from 'react';
import { Chip, type ChipProps } from './material/chip';

export interface BadgeProps extends Omit<ChipProps, 'variant' | 'removable' | 'onRemove' | 'selected' | 'onSelectedChange' | 'label'> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  children?: React.ReactNode;
  label?: string;
}

export const Badge = forwardRef<HTMLElement, BadgeProps>(
  ({ variant = 'default', children, label, ...props }, ref) => {
    // Map old badge variants to chip styles
    const chipVariant = variant === 'outline' ? 'assist' : 'filter';
    
    // Use children as label if label is not provided
    const chipLabel = label || (typeof children === 'string' ? children : String(children));
    
    return <Chip ref={ref} variant={chipVariant} label={chipLabel} {...props} />;
  }
);

Badge.displayName = 'Badge';