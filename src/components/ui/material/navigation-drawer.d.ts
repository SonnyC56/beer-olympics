import React from 'react';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';
import '@material/web/ripple/ripple.js';
export interface NavigationDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
    open?: boolean;
    variant?: 'modal' | 'dismissible' | 'permanent';
    anchor?: 'left' | 'right';
    onOpenChange?: (open: boolean) => void;
}
declare const NavigationDrawer: React.ForwardRefExoticComponent<NavigationDrawerProps & React.RefAttributes<HTMLDivElement>>;
export interface NavigationDrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
}
declare const NavigationDrawerHeader: React.ForwardRefExoticComponent<NavigationDrawerHeaderProps & React.RefAttributes<HTMLDivElement>>;
export interface NavigationDrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {
}
declare const NavigationDrawerContent: React.ForwardRefExoticComponent<NavigationDrawerContentProps & React.RefAttributes<HTMLDivElement>>;
export interface NavigationItemProps extends React.HTMLAttributes<HTMLElement> {
    icon?: string;
    label: string;
    selected?: boolean;
    activated?: boolean;
    disabled?: boolean;
    href?: string;
    target?: string;
    badge?: string | number;
}
declare const NavigationItem: React.ForwardRefExoticComponent<NavigationItemProps & React.RefAttributes<HTMLElement>>;
export interface NavigationSectionProps extends React.HTMLAttributes<HTMLDivElement> {
    title?: string;
}
declare const NavigationSection: React.ForwardRefExoticComponent<NavigationSectionProps & React.RefAttributes<HTMLDivElement>>;
export { NavigationDrawer, NavigationDrawerHeader, NavigationDrawerContent, NavigationItem, NavigationSection, };
