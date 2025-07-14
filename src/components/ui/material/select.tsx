import React, { forwardRef, useEffect, useRef } from 'react';
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

const Select = forwardRef<HTMLElement, SelectProps>(
  ({ 
    variant = 'outlined',
    label,
    error,
    errorText,
    supportingText,
    fullWidth = false,
    options,
    onValueChange,
    className = '',
    style,
    value,
    disabled,
    required,
    name,
    id,
    ...props 
  }, ref) => {
    const internalRef = useRef<HTMLElement>(null);
    const elementRef = (ref as any) || internalRef;

    useEffect(() => {
      const element = elementRef.current;
      if (element) {
        const handleChange = (e: Event) => {
          const target = e.target as any;
          if (onValueChange) {
            onValueChange(target.value);
          }
        };

        element.addEventListener('change', handleChange);
        return () => {
          element.removeEventListener('change', handleChange);
        };
      }
    }, [onValueChange, elementRef]);

    const commonProps = {
      ref: elementRef,
      label,
      disabled,
      required,
      'error': error,
      'error-text': errorText,
      'supporting-text': supportingText || errorText,
      value,
      name,
      id,
      className: `${className} ${fullWidth ? 'w-full' : ''}`,
      style: {
        width: fullWidth ? '100%' : undefined,
        ...style,
      },
    };

    const optionElements = options.map((option) => (
      <md-select-option
        key={option.value}
        value={option.value}
        disabled={option.disabled}
        selected={option.value === value}
      >
        {option.label}
      </md-select-option>
    ));

    if (variant === 'filled') {
      return (
        <md-filled-select {...commonProps}>
          {optionElements}
        </md-filled-select>
      );
    }

    return (
      <md-outlined-select {...commonProps}>
        {optionElements}
      </md-outlined-select>
    );
  }
);

Select.displayName = 'Select';

export { Select };