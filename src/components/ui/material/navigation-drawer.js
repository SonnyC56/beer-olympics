import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef } from 'react';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';
import '@material/web/ripple/ripple.js';
import { cn } from '@/lib/utils';
import { MaterialElements as ME } from './material-elements';
const NavigationDrawer = forwardRef(({ children, open = false, variant = 'dismissible', anchor = 'left', className, style, onOpenChange, ...props }, ref) => {
    const handleScrimClick = () => {
        if (variant === 'modal' && onOpenChange) {
            onOpenChange(false);
        }
    };
    const drawerStyles = {
        position: variant === 'permanent' ? 'relative' : 'fixed',
        top: 0,
        bottom: 0,
        [anchor]: 0,
        width: '256px',
        backgroundColor: 'var(--md-sys-color-surface)',
        color: 'var(--md-sys-color-on-surface)',
        borderRadius: anchor === 'left' ? '0 16px 16px 0' : '16px 0 0 16px',
        boxShadow: variant !== 'permanent' ? getElevation('level1') : 'none',
        transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
        transform: variant === 'permanent' || open ? 'translateX(0)' : `translateX(${anchor === 'left' ? '-100%' : '100%'})`,
        zIndex: variant === 'modal' ? 1001 : 1,
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
    };
    return (_jsxs(_Fragment, { children: [variant === 'modal' && open && (_jsx("div", { className: "md-navigation-drawer-scrim", onClick: handleScrimClick, style: {
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'rgba(0, 0, 0, 0.32)',
                    zIndex: 1000,
                    transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
                } })), _jsx("nav", { ref: ref, className: cn("md-navigation-drawer", className), style: {
                    ...drawerStyles,
                    ...style,
                }, ...props, children: children })] }));
});
NavigationDrawer.displayName = 'NavigationDrawer';
const NavigationDrawerHeader = forwardRef(({ className, style, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("md-navigation-drawer-header", className), style: {
        padding: '28px 28px 16px',
        ...style,
    }, ...props })));
NavigationDrawerHeader.displayName = 'NavigationDrawerHeader';
const NavigationDrawerContent = forwardRef(({ className, style, ...props }, ref) => (_jsx("div", { ref: ref, className: cn("md-navigation-drawer-content", className), style: {
        flex: 1,
        overflowY: 'auto',
        padding: '0 12px',
        ...style,
    }, ...props })));
NavigationDrawerContent.displayName = 'NavigationDrawerContent';
const NavigationItem = forwardRef(({ icon, label, selected, activated, disabled, href, target, badge, onClick, ...props }, ref) => {
    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        }
    };
    return (_jsxs(ME.ListItem, { ref: ref, disabled: disabled, type: href ? 'link' : 'button', href: href, target: target, selected: selected, activated: activated, onClick: handleClick, style: {
            borderRadius: '28px',
            margin: '4px 0',
        }, ...props, children: [icon && _jsx(ME.Icon, { slot: "start", children: icon }), _jsx("span", { children: label }), badge !== undefined && (_jsx("span", { slot: "end", style: {
                    backgroundColor: 'var(--md-sys-color-primary)',
                    color: 'var(--md-sys-color-on-primary)',
                    borderRadius: '12px',
                    padding: '2px 8px',
                    fontSize: '11px',
                    fontWeight: '500',
                    minWidth: '20px',
                    textAlign: 'center',
                }, children: badge })), _jsx(ME.Ripple, {})] }));
});
NavigationItem.displayName = 'NavigationItem';
const NavigationSection = forwardRef(({ title, children, className, style, ...props }, ref) => (_jsxs("div", { ref: ref, className: cn("md-navigation-section", className), style: {
        marginTop: '8px',
        marginBottom: '8px',
        ...style,
    }, ...props, children: [title && (_jsx("div", { style: {
                padding: '16px 28px 8px',
                fontFamily: 'var(--md-sys-typescale-title-small-font-family)',
                fontSize: 'var(--md-sys-typescale-title-small-font-size)',
                fontWeight: 'var(--md-sys-typescale-title-small-font-weight)',
                lineHeight: 'var(--md-sys-typescale-title-small-line-height)',
                letterSpacing: 'var(--md-sys-typescale-title-small-letter-spacing)',
                color: 'var(--md-sys-color-on-surface-variant)',
            }, children: title })), _jsx(ME.List, { children: children })] })));
NavigationSection.displayName = 'NavigationSection';
// Helper function to get elevation (import from material-theme.tsx in real usage)
const getElevation = (level) => {
    const elevations = {
        level0: 'none',
        level1: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        level2: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
        level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
    };
    return elevations[level] || elevations.level0;
};
export { NavigationDrawer, NavigationDrawerHeader, NavigationDrawerContent, NavigationItem, NavigationSection, };
