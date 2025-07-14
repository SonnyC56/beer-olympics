import React, { forwardRef, useEffect, useRef } from 'react';
import '@material/web/switch/switch.js';
import '@material/web/icon/icon.js';

export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  showOnlySelectedIcon?: boolean;
  label?: string;
  icons?: boolean;
}

const Switch = forwardRef<HTMLElement, SwitchProps>(
  ({ 
    checked = false,
    onCheckedChange,
    showOnlySelectedIcon = false,
    label,
    icons = true,
    className = '',
    style,
    disabled,
    required,
    value,
    name,
    id,
    ...props 
  }, ref) => {
    const internalRef = useRef<HTMLElement>(null);
    const elementRef = (ref as any) || internalRef;

    useEffect(() => {
      const element = elementRef.current;
      if (element) {
        (element as any).selected = checked;
      }
    }, [checked, elementRef]);

    useEffect(() => {
      const element = elementRef.current;
      if (element) {
        const handleChange = (e: Event) => {
          const target = e.target as any;
          if (onCheckedChange) {
            onCheckedChange(target.selected);
          }
        };

        element.addEventListener('change', handleChange);
        return () => {
          element.removeEventListener('change', handleChange);
        };
      }
    }, [onCheckedChange, elementRef]);

    const switchElement = (
      <md-switch
        ref={elementRef}
        selected={checked}
        disabled={disabled}
        show-only-selected-icon={showOnlySelectedIcon ? true : undefined}
        required={required}
        value={value}
        name={name}
        id={id}
        className={className}
        style={style}
        {...props}
      >
        {icons && (
          <>
            <md-icon slot="on-icon">check</md-icon>
            <md-icon slot="off-icon">close</md-icon>
          </>
        )}
      </md-switch>
    );

    if (label) {
      return (
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: disabled ? 'default' : 'pointer',
            fontFamily: 'var(--md-sys-typescale-body-large-font-family)',
            fontSize: 'var(--md-sys-typescale-body-large-font-size)',
            fontWeight: 'var(--md-sys-typescale-body-large-font-weight)',
            lineHeight: 'var(--md-sys-typescale-body-large-line-height)',
            letterSpacing: 'var(--md-sys-typescale-body-large-letter-spacing)',
            color: disabled ? 'var(--md-sys-color-on-surface-variant)' : 'var(--md-sys-color-on-surface)',
            opacity: disabled ? 0.38 : 1,
          }}
        >
          {switchElement}
          {label}
        </label>
      );
    }

    return switchElement;
  }
);

Switch.displayName = 'Switch';

export { Switch };