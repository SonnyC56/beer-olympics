import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef, Children, isValidElement } from 'react';
import { Select as MaterialSelect } from './material/select';
export const Select = forwardRef(({ children, options, ...props }, ref) => {
    // If options are provided directly, use them
    if (options) {
        return _jsx(MaterialSelect, { ref: ref, options: options, ...props });
    }
    // Otherwise, parse children to extract options
    const parsedOptions = [];
    Children.forEach(children, (child) => {
        if (isValidElement(child)) {
            if (child.type === SelectContent) {
                const contentChildren = child.props.children;
                Children.forEach(contentChildren, (contentChild) => {
                    if (isValidElement(contentChild) && contentChild.type === SelectItem) {
                        const itemProps = contentChild.props;
                        parsedOptions.push({
                            value: itemProps.value,
                            label: itemProps.children,
                            disabled: itemProps.disabled,
                        });
                    }
                });
            }
        }
    });
    return _jsx(MaterialSelect, { ref: ref, options: parsedOptions, ...props });
});
Select.displayName = 'Select';
// Compatibility components
export const SelectTrigger = forwardRef(({ children }, ref) => {
    return _jsx("div", { ref: ref, style: { display: 'none' }, children: children });
});
SelectTrigger.displayName = 'SelectTrigger';
export const SelectContent = forwardRef(({ children }, ref) => {
    return _jsx("div", { ref: ref, style: { display: 'none' }, children: children });
});
SelectContent.displayName = 'SelectContent';
export const SelectItem = forwardRef(({ children }, ref) => {
    return _jsx("div", { ref: ref, style: { display: 'none' }, children: children });
});
SelectItem.displayName = 'SelectItem';
export const SelectValue = forwardRef((props, ref) => {
    return _jsx("span", { ref: ref, style: { display: 'none' } });
});
SelectValue.displayName = 'SelectValue';
