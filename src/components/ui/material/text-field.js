import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { forwardRef, useEffect, useRef } from 'react';
import '@material/web/textfield/filled-text-field.js';
import '@material/web/textfield/outlined-text-field.js';
import '@material/web/icon/icon.js';
import { MaterialElements as ME } from './material-elements';
const TextField = forwardRef(({ variant = 'outlined', label, error, errorText, supportingText, prefixText, suffixText, leadingIcon, trailingIcon, fullWidth = false, multiline = false, rows, resize = 'none', className = '', style, onChange, value, type = 'text', disabled, required, placeholder, name, id, autoComplete, maxLength, minLength, pattern, min, max, step, multiple, ...restProps }, ref) => {
    const internalRef = useRef(null);
    const elementRef = ref || internalRef;
    useEffect(() => {
        const element = elementRef.current;
        if (element) {
            const handleInput = (e) => {
                if (onChange) {
                    const target = e.target;
                    const syntheticEvent = {
                        target: {
                            value: target.value,
                            name: target.name,
                        },
                        currentTarget: {
                            value: target.value,
                            name: target.name,
                        },
                    };
                    onChange(syntheticEvent);
                }
            };
            element.addEventListener('input', handleInput);
            return () => {
                element.removeEventListener('input', handleInput);
            };
        }
    }, [onChange, elementRef]);
    const commonProps = {
        ref: elementRef,
        label,
        value: value,
        type: multiline ? 'textarea' : type,
        placeholder,
        disabled,
        required,
        'error': error,
        'error-text': errorText,
        'supporting-text': supportingText || errorText,
        'prefix-text': prefixText,
        'suffix-text': suffixText,
        'leading-icon': leadingIcon ? true : undefined,
        'trailing-icon': trailingIcon ? true : undefined,
        rows: multiline ? rows : undefined,
        resize: multiline ? resize : undefined,
        name,
        id,
        autocomplete: autoComplete,
        maxlength: maxLength,
        minlength: minLength,
        pattern,
        min,
        max,
        step,
        multiple,
        className: `${className} ${fullWidth ? 'w-full' : ''}`,
        style: {
            width: fullWidth ? '100%' : undefined,
            ...style,
        },
        ...restProps,
    };
    const content = (_jsxs(_Fragment, { children: [leadingIcon && _jsx(ME.Icon, { slot: "leading-icon", children: leadingIcon }), trailingIcon && _jsx(ME.Icon, { slot: "trailing-icon", children: trailingIcon })] }));
    if (variant === 'filled') {
        return (_jsx(ME.FilledTextField, { ...commonProps, children: content }));
    }
    return (_jsx(ME.OutlinedTextField, { ...commonProps, children: content }));
});
TextField.displayName = 'TextField';
export { TextField };
