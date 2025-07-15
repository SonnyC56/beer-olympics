import React from 'react';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/input-chip.js';
import '@material/web/chips/suggestion-chip.js';
import '@material/web/icon/icon.js';
export interface ChipProps extends React.HTMLAttributes<HTMLElement> {
    variant?: 'assist' | 'filter' | 'input' | 'suggestion';
    label: string;
    disabled?: boolean;
    elevated?: boolean;
    selected?: boolean;
    removable?: boolean;
    onRemove?: () => void;
    onSelectedChange?: (selected: boolean) => void;
    icon?: string;
    avatar?: string | React.ReactNode;
    href?: string;
    target?: string;
}
declare const Chip: React.ForwardRefExoticComponent<ChipProps & React.RefAttributes<HTMLElement>>;
export interface ChipSetProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}
declare const ChipSet: React.ForwardRefExoticComponent<ChipSetProps & React.RefAttributes<HTMLElement>>;
export { Chip, ChipSet };
