import React from 'react';
import '@material/web/switch/switch.js';
import '@material/web/icon/icon.js';
export interface SwitchProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'type'> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
    showOnlySelectedIcon?: boolean;
    label?: string;
    icons?: boolean;
}
declare const Switch: React.ForwardRefExoticComponent<SwitchProps & React.RefAttributes<HTMLElement>>;
export { Switch };
