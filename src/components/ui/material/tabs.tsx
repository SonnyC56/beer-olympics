import React, { forwardRef, useEffect, useRef, createContext, useContext } from 'react';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/secondary-tab.js';
import '@material/web/icon/icon.js';
import { cn } from '@/lib/utils';
import { MaterialElements as ME } from './material-elements';

interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined);

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  variant?: 'primary' | 'secondary';
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ children, value, defaultValue, onValueChange, variant = 'primary', className, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');

    React.useEffect(() => {
      if (value !== undefined) {
        setSelectedValue(value);
      }
    }, [value]);

    const handleValueChange = (newValue: string) => {
      setSelectedValue(newValue);
      onValueChange?.(newValue);
    };

    return (
      <TabsContext.Provider value={{ value: selectedValue, onValueChange: handleValueChange }}>
        <div ref={ref} className={cn("md-tabs-container", className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    );
  }
);

Tabs.displayName = 'Tabs';

export interface TabsListProps extends React.HTMLAttributes<HTMLElement> {
  variant?: 'primary' | 'secondary';
}

const TabsList = forwardRef<HTMLElement, TabsListProps>(
  ({ children, className, variant = 'primary', ...props }, ref) => {
    const tabsRef = useRef<HTMLElement>(null);
    const elementRef = (ref as any) || tabsRef;
    const context = useContext(TabsContext);

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      const handleChange = (e: Event) => {
        const tabs = Array.from(element.querySelectorAll(variant === 'primary' ? 'md-primary-tab' : 'md-secondary-tab'));
        const activeTab = tabs.find((tab: any) => tab.active) as HTMLElement | undefined;
        if (activeTab) {
          const value = activeTab.getAttribute('data-value');
          if (value && context) {
            context.onValueChange(value);
          }
        }
      };

      element.addEventListener('change', handleChange);
      return () => {
        element.removeEventListener('change', handleChange);
      };
    }, [context, elementRef, variant]);

    return (
      <ME.Tabs
        ref={elementRef}
        className={className}
        {...props}
      >
        {React.Children.map(children, (child, index) => {
          if (React.isValidElement(child) && child.type === TabsTrigger) {
            return React.cloneElement(child as React.ReactElement<TabsTriggerProps>, {
              variant,
              index,
            });
          }
          return child;
        })}
      </ME.Tabs>
    );
  }
);

TabsList.displayName = 'TabsList';

export interface TabsTriggerProps extends React.HTMLAttributes<HTMLElement> {
  value: string;
  disabled?: boolean;
  icon?: string;
  inlineIcon?: boolean;
  variant?: 'primary' | 'secondary';
  index?: number;
}

const TabsTrigger = forwardRef<HTMLElement, TabsTriggerProps>(
  ({ children, value, disabled, icon, inlineIcon = false, variant = 'primary', index = 0, ...props }, ref) => {
    const context = useContext(TabsContext);
    const isActive = context?.value === value;

    const tabProps = {
      ref,
      active: isActive,
      disabled,
      'inline-icon': inlineIcon,
      'data-value': value,
      ...props,
    };

    const content = (
      <>
        {icon && <ME.Icon slot="icon">{icon}</ME.Icon>}
        {children}
      </>
    );

    if (variant === 'secondary') {
      return <ME.SecondaryTab {...tabProps}>{content}</ME.SecondaryTab>;
    }

    return <ME.PrimaryTab {...tabProps}>{content}</ME.PrimaryTab>;
  }
);

TabsTrigger.displayName = 'TabsTrigger';

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ value, className, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    const isActive = context?.value === value;

    if (!isActive) {
      return null;
    }

    return (
      <div
        ref={ref}
        className={cn("md-tabs-content", className)}
        role="tabpanel"
        {...props}
      >
        {children}
      </div>
    );
  }
);

TabsContent.displayName = 'TabsContent';

export { Tabs, TabsList, TabsTrigger, TabsContent };