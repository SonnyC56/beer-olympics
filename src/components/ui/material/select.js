import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, useEffect, useRef } from 'react';
import '@material/web/select/filled-select.js';
import '@material/web/select/outlined-select.js';
import '@material/web/select/select-option.js';
import '@material/web/icon/icon.js';
import { MaterialElements as ME } from './material-elements';
const Select = forwardRef(({ variant = 'outlined', label, error, errorText, supportingText, fullWidth = false, options, onValueChange, className = '', style, value, disabled, required, name, id, ...props }, ref) => {
    const internalRef = useRef(null);
    const elementRef = ref || internalRef;
    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            const handleChange = (e) => {
                const target = e.target;
                if (onValueChange) {
                    onValueChange(target.value);
                }
            };
            element.addEventListener('change', handleChange);
            return () => {
                element.removeEventListener('change', handleChange);
            };
        }
    }, [onValueChange, elementRef]);
    const commonProps = {
        ref: elementRef,
        label,
        disabled,
        required,
        'error': error,
        'error-text': errorText,
        'supporting-text': supportingText || errorText,
        value,
        name,
        id,
        className: `${className} ${fullWidth ? 'w-full' : ''}`,
        style: {
            width: fullWidth ? '100%' : undefined,
            ...style,
        },
    };
    const optionElements = options.map((option) => (_jsx(ME.SelectOption, { value: option.value, disabled: option.disabled, selected: option.value === value, children: option.label }, option.value)));
    if (variant === 'filled') {
        return (_jsx(ME.FilledSelect, { ...commonProps, children: optionElements }));
    }
    return (_jsx(ME.OutlinedSelect, { ...commonProps, children: optionElements }));
});
Select.displayName = 'Select';
export { Select };
