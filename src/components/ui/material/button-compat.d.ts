import React from 'react';
import { type ButtonProps as MaterialButtonProps } from './button';
declare const variantMap: Record<string, MaterialButtonProps['variant']>;
declare const sizeMap: Record<string, MaterialButtonProps['size']>;
export interface ButtonCompatProps extends Omit<MaterialButtonProps, 'variant' | 'size'> {
    variant?: keyof typeof variantMap;
    size?: keyof typeof sizeMap;
    asChild?: boolean;
}
export declare const Button: React.ForwardRefExoticComponent<ButtonCompatProps & React.RefAttributes<HTMLElement>>;
export {};
