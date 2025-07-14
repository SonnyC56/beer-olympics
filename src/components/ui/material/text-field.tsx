import React, { forwardRef, useEffect, useRef } from 'react';
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

const TextField = forwardRef<HTMLElement, TextFieldProps>(
  ({ 
    variant = 'outlined',
    label,
    error,
    errorText,
    supportingText,
    prefixText,
    suffixText,
    leadingIcon,
    trailingIcon,
    fullWidth = false,
    multiline = false,
    rows,
    resize = 'none',
    className = '',
    style,
    onChange,
    value,
    type = 'text',
    disabled,
    required,
    placeholder,
    name,
    id,
    autoComplete,
    maxLength,
    minLength,
    pattern,
    min,
    max,
    step,
    multiple,
    ...props 
  }, ref) => {
    const internalRef = useRef<HTMLElement>(null);
    const elementRef = (ref as any) || internalRef;

    useEffect(() => {
      const element = elementRef.current;
      if (element) {
        const handleInput = (e: Event) => {
          if (onChange) {
            const target = e.target as any;
            const syntheticEvent = {
              target: {
                value: target.value,
                name: target.name,
              },
              currentTarget: {
                value: target.value,
                name: target.name,
              },
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
          }
        };

        element.addEventListener('input', handleInput);
        return () => {
          element.removeEventListener('input', handleInput);
        };
      }
    }, [onChange, elementRef]);

    const commonProps = {
      ref: elementRef,
      label,
      value: value as string,
      type: multiline ? 'textarea' : type,
      placeholder,
      disabled,
      required,
      'error': error,
      'error-text': errorText,
      'supporting-text': supportingText || errorText,
      'prefix-text': prefixText,
      'suffix-text': suffixText,
      'leading-icon': leadingIcon ? true : undefined,
      'trailing-icon': trailingIcon ? true : undefined,
      rows: multiline ? rows : undefined,
      resize: multiline ? resize : undefined,
      name,
      id,
      autocomplete: autoComplete,
      maxlength: maxLength,
      minlength: minLength,
      pattern,
      min,
      max,
      step,
      multiple,
      className: `${className} ${fullWidth ? 'w-full' : ''}`,
      style: {
        width: fullWidth ? '100%' : undefined,
        ...style,
      },
    };

    const content = (
      <>
        {leadingIcon && <md-icon slot="leading-icon">{leadingIcon}</md-icon>}
        {trailingIcon && <md-icon slot="trailing-icon">{trailingIcon}</md-icon>}
      </>
    );

    if (variant === 'filled') {
      return (
        <md-filled-text-field {...commonProps}>
          {content}
        </md-filled-text-field>
      );
    }

    return (
      <md-outlined-text-field {...commonProps}>
        {content}
      </md-outlined-text-field>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField };