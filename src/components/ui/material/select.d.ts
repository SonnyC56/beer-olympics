import React from 'react';
import '@material/web/select/filled-select.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/icon/icon.js';
export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
    variant?: 'filled' | 'outlined';
    label?: string;
    error?: boolean;
    errorText?: string;
    supportingText?: string;
    fullWidth?: boolean;
    options: Array<{
        value: string;
        label: string;
        disabled?: boolean;
    }>;
    onValueChange?: (value: string) => void;
}
declare const Select: React.ForwardRefExoticComponent<SelectProps & React.RefAttributes<HTMLElement>>;
export { Select };
