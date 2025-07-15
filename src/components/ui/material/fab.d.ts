import React from 'react';
import '@material/web/fab/fab.js';
import '@material/web/fab/branded-fab.js';
import '@material/web/icon/icon.js';
export interface FABProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
    size?: 'small' | 'medium' | 'large';
    icon: string;
    label?: string;
    lowered?: boolean;
    branded?: boolean;
    position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left';
    href?: string;
    target?: string;
}
declare const FAB: React.ForwardRefExoticComponent<FABProps & React.RefAttributes<HTMLElement>>;
export { FAB };
