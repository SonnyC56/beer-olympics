import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useEffect, useRef } from 'react';
import '@material/web/chips/chip-set.js';
import '@material/web/chips/assist-chip.js';
import '@material/web/chips/filter-chip.js';
import '@material/web/chips/input-chip.js';
import '@material/web/chips/suggestion-chip.js';
import '@material/web/icon/icon.js';
import { MaterialElements as ME } from './material-elements';
const Chip = forwardRef(({ variant = 'assist', label, disabled, elevated, selected, removable, onRemove, onSelectedChange, icon, avatar, href, target, className, onClick, ...props }, ref) => {
    const internalRef = useRef(null);
    const elementRef = ref || internalRef;
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        if (variant === 'filter' && onSelectedChange) {
            const handleChange = () => {
                const isSelected = element.selected;
                onSelectedChange(isSelected);
            };
            element.addEventListener('change', handleChange);
            return () => {
                element.removeEventListener('change', handleChange);
            };
        }
    }, [variant, onSelectedChange, elementRef]);
    useEffect(() => {
        const element = elementRef.current;
        if (!element)
            return;
        if ((variant === 'filter' || variant === 'input') && removable && onRemove) {
            const handleRemove = () => {
                onRemove();
            };
            element.addEventListener('remove', handleRemove);
            return () => {
                element.removeEventListener('remove', handleRemove);
            };
        }
    }, [variant, removable, onRemove, elementRef]);
    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        }
    };
    const commonProps = {
        ref: elementRef,
        label,
        disabled,
        elevated,
        className,
        onClick: handleClick,
        ...props,
    };
    const iconElement = icon && _jsx(ME.Icon, { slot: "icon", children: icon });
    const avatarElement = avatar && (typeof avatar === 'string' ? (_jsx("img", { slot: "icon", src: avatar, alt: "", style: { width: '24px', height: '24px', borderRadius: '50%' } })) : (_jsx("div", { slot: "icon", children: avatar })));
    switch (variant) {
        case 'filter':
            return (_jsxs(ME.FilterChip, { ...commonProps, selected: selected, removable: removable, children: [iconElement, avatarElement] }));
        case 'input':
            return (_jsxs(ME.InputChip, { ...commonProps, selected: selected, avatar: !!avatar, href: href, target: target, children: [iconElement, avatarElement] }));
        case 'suggestion':
            return (_jsxs(ME.SuggestionChip, { ...commonProps, href: href, target: target, children: [iconElement, avatarElement] }));
        case 'assist':
        default:
            return (_jsxs(ME.AssistChip, { ...commonProps, href: href, target: target, children: [iconElement, avatarElement] }));
    }
});
Chip.displayName = 'Chip';
const ChipSet = forwardRef(({ children, className, ...props }, ref) => {
    return (_jsx(ME.ChipSet, { ref: ref, className: className, ...props, children: children }));
});
ChipSet.displayName = 'ChipSet';
export { Chip, ChipSet };
