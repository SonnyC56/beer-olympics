import { jsx as _jsx } from "react/jsx-runtime";
import { forwardRef } from 'react';
import '@material/web/fab/fab.js';
import '@material/web/fab/branded-fab.js';
import '@material/web/icon/icon.js';
import { MaterialElements as ME } from './material-elements';
const FAB = forwardRef(({ variant = 'primary', size = 'medium', icon, label, lowered = false, branded = false, position = 'bottom-right', className = '', style, onClick, disabled, href, target, ...props }, ref) => {
    const handleClick = (e) => {
        if (onClick) {
            onClick(e);
        }
    };
    const positionStyles = {
        'bottom-right': {
            position: 'fixed',
            bottom: '16px',
            right: '16px',
        },
        'bottom-left': {
            position: 'fixed',
            bottom: '16px',
            left: '16px',
        },
        'top-right': {
            position: 'fixed',
            top: '16px',
            right: '16px',
        },
        'top-left': {
            position: 'fixed',
            top: '16px',
            left: '16px',
        },
    };
    const commonProps = {
        ref,
        variant,
        size,
        label,
        lowered,
        disabled,
        href,
        target,
        onClick: handleClick,
        className,
        style: {
            ...positionStyles[position],
            ...style,
        },
    };
    const iconElement = _jsx(ME.Icon, { slot: "icon", children: icon });
    if (branded) {
        return (_jsx(ME.BrandedFab, { ...commonProps, children: iconElement }));
    }
    return (_jsx(ME.Fab, { ...commonProps, children: iconElement }));
});
FAB.displayName = 'FAB';
export { FAB };
