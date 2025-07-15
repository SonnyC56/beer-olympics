import React from 'react';
import { type SelectProps as MaterialSelectProps } from './material/select';
export interface SelectProps extends Omit<MaterialSelectProps, 'options'> {
    children?: React.ReactNode;
    options?: MaterialSelectProps['options'];
}
export declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLElement>>;
export declare const SelectTrigger: React.ForwardRefExoticComponent<{
    children?: React.ReactNode;
    className?: string;
} & React.RefAttributes<HTMLDivElement>>;
export declare const SelectContent: React.ForwardRefExoticComponent<{
    children?: React.ReactNode;
    className?: string;
} & React.RefAttributes<HTMLDivElement>>;
export declare const SelectItem: React.ForwardRefExoticComponent<{
    children?: React.ReactNode;
    value: string;
    disabled?: boolean;
    className?: string;
} & React.RefAttributes<HTMLDivElement>>;
export declare const SelectValue: React.ForwardRefExoticComponent<{
    placeholder?: string;
    className?: string;
} & React.RefAttributes<HTMLSpanElement>>;
