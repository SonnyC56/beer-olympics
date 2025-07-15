import React from 'react';
import { type ChipProps } from './material/chip';
export interface BadgeProps extends Omit<ChipProps, 'variant' | 'removable' | 'onRemove' | 'selected' | 'onSelectedChange' | 'label'> {
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    children?: React.ReactNode;
    label?: string;
}
export declare const Badge: React.ForwardRefExoticComponent<BadgeProps & React.RefAttributes<HTMLElement>>;
