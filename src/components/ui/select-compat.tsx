import React, { forwardRef, Children, isValidElement, cloneElement } from 'react';
import type { ReactElement } from 'react';
import { Select as MaterialSelect, type SelectProps as MaterialSelectProps } from './material/select';

// For backwards compatibility with Radix Select pattern
export interface SelectProps extends Omit<MaterialSelectProps, 'options'> {
  children?: React.ReactNode;
  options?: MaterialSelectProps['options'];
}

export const Select = forwardRef<HTMLElement, SelectProps>(
  ({ children, options, ...props }, ref) => {
    // If options are provided directly, use them
    if (options) {
      return <MaterialSelect ref={ref} options={options} {...props} />;
    }
    
    // Otherwise, parse children to extract options
    const parsedOptions: MaterialSelectProps['options'] = [];
    
    Children.forEach(children, (child) => {
      if (isValidElement(child)) {
        if (child.type === SelectContent) {
          const contentChildren = (child.props as any).children;
          Children.forEach(contentChildren, (contentChild) => {
            if (isValidElement(contentChild) && contentChild.type === SelectItem) {
              const itemProps = contentChild.props as any;
              parsedOptions.push({
                value: itemProps.value,
                label: itemProps.children as string,
                disabled: itemProps.disabled,
              });
            }
          });
        }
      }
    });
    
    return <MaterialSelect ref={ref} options={parsedOptions} {...props} />;
  }
);

Select.displayName = 'Select';

// Compatibility components
export const SelectTrigger = forwardRef<HTMLDivElement, { children?: React.ReactNode; className?: string }>(
  ({ children }, ref) => {
    return <div ref={ref} style={{ display: 'none' }}>{children}</div>;
  }
);

SelectTrigger.displayName = 'SelectTrigger';

export const SelectContent = forwardRef<HTMLDivElement, { children?: React.ReactNode; className?: string }>(
  ({ children }, ref) => {
    return <div ref={ref} style={{ display: 'none' }}>{children}</div>;
  }
);

SelectContent.displayName = 'SelectContent';

export const SelectItem = forwardRef<HTMLDivElement, { 
  children?: React.ReactNode; 
  value: string; 
  disabled?: boolean;
  className?: string;
}>(
  ({ children }, ref) => {
    return <div ref={ref} style={{ display: 'none' }}>{children}</div>;
  }
);

SelectItem.displayName = 'SelectItem';

export const SelectValue = forwardRef<HTMLSpanElement, { 
  placeholder?: string;
  className?: string;
}>(
  (props, ref) => {
    return <span ref={ref} style={{ display: 'none' }} />;
  }
);

SelectValue.displayName = 'SelectValue';