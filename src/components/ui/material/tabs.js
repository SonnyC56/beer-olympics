import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import React, { forwardRef, useEffect, useRef, createContext, useContext } from 'react';
import '@material/web/tabs/tabs.js';
import '@material/web/tabs/primary-tab.js';
import '@material/web/tabs/secondary-tab.js';
import '@material/web/icon/icon.js';
import { cn } from '@/lib/utils';
import { MaterialElements as ME } from './material-elements';
const TabsContext = createContext(undefined);
const Tabs = forwardRef(({ children, value, defaultValue, onValueChange, variant = 'primary', className, ...props }, ref) => {
    const [selectedValue, setSelectedValue] = React.useState(value || defaultValue || '');
    React.useEffect(() => {
        if (value !== undefined) {
            setSelectedValue(value);
        }
    }, [value]);
    const handleValueChange = (newValue) => {
        setSelectedValue(newValue);
        onValueChange?.(newValue);
    };
    return (_jsx(TabsContext.Provider, { value: { value: selectedValue, onValueChange: handleValueChange }, children: _jsx("div", { ref: ref, className: cn("md-tabs-container", className), ...props, children: children }) }));
});
Tabs.displayName = 'Tabs';
const TabsList = forwardRef(({ children, className, variant = 'primary', ...props }, ref) => {
    const tabsRef = useRef(null);
    const elementRef = ref || tabsRef;
    const context = useContext(TabsContext);
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        const handleChange = (e) => {
            const tabs = Array.from(element.querySelectorAll(variant === 'primary' ? 'md-primary-tab' : 'md-secondary-tab'));
            const activeTab = tabs.find((tab) => tab.active);
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
    return (_jsx(ME.Tabs, { ref: elementRef, className: className, ...props, children: React.Children.map(children, (child, index) => {
            if (React.isValidElement(child) && child.type === TabsTrigger) {
                return React.cloneElement(child, {
                    variant,
                    index,
                });
            }
            return child;
        }) }));
});
TabsList.displayName = 'TabsList';
const TabsTrigger = forwardRef(({ children, value, disabled, icon, inlineIcon = false, variant = 'primary', index = 0, ...props }, ref) => {
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
    const content = (_jsxs(_Fragment, { children: [icon && _jsx(ME.Icon, { slot: "icon", children: icon }), children] }));
    if (variant === 'secondary') {
        return _jsx(ME.SecondaryTab, { ...tabProps, children: content });
    }
    return _jsx(ME.PrimaryTab, { ...tabProps, children: content });
});
TabsTrigger.displayName = 'TabsTrigger';
const TabsContent = forwardRef(({ value, className, children, ...props }, ref) => {
    const context = useContext(TabsContext);
    const isActive = context?.value === value;
    if (!isActive) {
        return null;
    }
    return (_jsx("div", { ref: ref, className: cn("md-tabs-content", className), role: "tabpanel", ...props, children: children }));
});
TabsContent.displayName = 'TabsContent';
export { Tabs, TabsList, TabsTrigger, TabsContent };
