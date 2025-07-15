import React from 'react';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/icon/icon.js';
export interface TextFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix'> {
    variant?: 'filled' | 'outlined';
    label?: string;
    error?: boolean;
    errorText?: string;
    supportingText?: string;
    prefixText?: string;
    suffixText?: string;
    leadingIcon?: string;
    trailingIcon?: string;
    fullWidth?: boolean;
    multiline?: boolean;
    rows?: number;
    resize?: 'none' | 'both' | 'horizontal' | 'vertical';
}
declare const TextField: React.ForwardRefExoticComponent<TextFieldProps & React.RefAttributes<HTMLElement>>;
export { TextField };
