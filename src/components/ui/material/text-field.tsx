import React, { forwardRef, useEffect, useRef } from 'react';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/icon/icon.js';
import { MaterialElements as ME } from './material-elements';

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
    ...restProps 
  }, ref) => {
    const internalRef = useRef<HTMLElement>(null);
    const elementRef = (ref as React.RefObject<HTMLElement>) || internalRef;

    useEffect(() => {
      const element = elementRef.current;
      if (element) {
        const handleInput = (e: Event) => {
          if (onChange) {
            const target = e.target as HTMLInputElement;
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
      ...restProps,
    };

    const content = (
      <>
        {leadingIcon && <ME.Icon slot="leading-icon">{leadingIcon}</ME.Icon>}
        {trailingIcon && <ME.Icon slot="trailing-icon">{trailingIcon}</ME.Icon>}
      </>
    );

    if (variant === 'filled') {
      return (
        <ME.FilledTextField {...commonProps}>
          {content}
        </ME.FilledTextField>
      );
    }

    return (
      <ME.OutlinedTextField {...commonProps}>
        {content}
      </ME.OutlinedTextField>
    );
  }
);

TextField.displayName = 'TextField';

export { TextField };