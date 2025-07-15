import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useEffect, useRef } from 'react';
import '@material/web/switch/switch.js';
import '@material/web/icon/icon.js';
import { MaterialElements as ME } from './material-elements';
const Switch = forwardRef(({ checked = false, onCheckedChange, showOnlySelectedIcon = false, label, icons = true, className = '', style, disabled, required, value, name, id, ...props }, ref) => {
    const internalRef = useRef(null);
    const elementRef = ref || internalRef;
    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            element.selected = checked;
        }
    }, [checked, elementRef]);
    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            const handleChange = (e) => {
                const target = e.target;
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
    const switchElement = (_jsx(ME.Switch, { ref: elementRef, selected: checked, disabled: disabled, "show-only-selected-icon": showOnlySelectedIcon ? true : undefined, required: required, value: value, name: name, id: id, className: className, style: style, ...props, children: icons && (_jsxs(_Fragment, { children: [_jsx(ME.Icon, { slot: "on-icon", children: "check" }), _jsx(ME.Icon, { slot: "off-icon", children: "close" })] })) }));
    if (label) {
        return (_jsxs("label", { style: {
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
            }, children: [switchElement, label] }));
    }
    return switchElement;
});
Switch.displayName = 'Switch';
export { Switch };
