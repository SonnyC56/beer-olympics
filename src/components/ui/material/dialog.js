import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import React, { forwardRef, useEffect, useRef, createContext, useContext } from 'react';
import '@material/web/dialog/dialog.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import { cn } from '@/lib/utils';
import { MaterialElements as ME } from './material-elements';
const DialogContext = createContext(undefined);
const Dialog = ({ children, open = false, onOpenChange }) => {
    const [isOpen, setIsOpen] = React.useState(open);
    React.useEffect(() => {
        setIsOpen(open);
    }, [open]);
    const handleOpenChange = (newOpen) => {
        setIsOpen(newOpen);
        onOpenChange?.(newOpen);
    };
    return (_jsx(DialogContext.Provider, { value: { open: isOpen, setOpen: handleOpenChange }, children: children }));
};
const DialogTrigger = ({ children, asChild }) => {
    const context = useContext(DialogContext);
    if (!context)
        throw new Error('DialogTrigger must be used within Dialog');
    const handleClick = () => {
        context.setOpen(true);
    };
    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: handleClick,
        });
    }
    return (_jsx("div", { onClick: handleClick, style: { display: 'inline-block', cursor: 'pointer' }, children: children }));
};
const DialogContent = forwardRef(({ children, className, showCloseButton = true, type = 'dialog', noFocusTrap = false, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context)
        throw new Error('DialogContent must be used within Dialog');
    const dialogRef = useRef(null);
    const elementRef = ref || dialogRef;
    useEffect(() => {
        const dialog = elementRef.current;
        if (!dialog)
            return;
        if (context.open) {
            dialog.open = true;
        }
        else {
            dialog.open = false;
        }
        const handleClose = () => {
            context.setOpen(false);
        };
        const handleCancel = (e) => {
            e.preventDefault();
            context.setOpen(false);
        };
        dialog.addEventListener('close', handleClose);
        dialog.addEventListener('cancel', handleCancel);
        return () => {
            dialog.removeEventListener('close', handleClose);
            dialog.removeEventListener('cancel', handleCancel);
        };
    }, [context, elementRef]);
    return (_jsxs(ME.Dialog, { ref: elementRef, type: type, "no-focus-trap": noFocusTrap ? true : undefined, className: className, ...props, children: [showCloseButton && (_jsx(ME.IconButton, { slot: "headline", "aria-label": "Close dialog", onClick: () => context.setOpen(false), style: {
                    position: 'absolute',
                    right: '16px',
                    top: '16px',
                }, children: _jsx(ME.Icon, { children: "close" }) })), children] }));
});
DialogContent.displayName = 'DialogContent';
const DialogHeader = forwardRef(({ className, style, ...props }, ref) => (_jsx("div", { ref: ref, slot: "headline", className: cn("md-dialog-header", className), style: {
        fontFamily: 'var(--md-sys-typescale-headline-small-font-family)',
        fontSize: 'var(--md-sys-typescale-headline-small-font-size)',
        fontWeight: 'var(--md-sys-typescale-headline-small-font-weight)',
        lineHeight: 'var(--md-sys-typescale-headline-small-line-height)',
        letterSpacing: 'var(--md-sys-typescale-headline-small-letter-spacing)',
        ...style,
    }, ...props })));
DialogHeader.displayName = 'DialogHeader';
const DialogTitle = forwardRef(({ className, style, ...props }, ref) => (_jsx("h2", { ref: ref, className: cn("md-dialog-title", className), style: {
        margin: 0,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        ...style,
    }, ...props })));
DialogTitle.displayName = 'DialogTitle';
const DialogDescription = forwardRef(({ className, style, ...props }, ref) => (_jsx("p", { ref: ref, slot: "content", className: cn("md-dialog-description", className), style: {
        fontFamily: 'var(--md-sys-typescale-body-medium-font-family)',
        fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
        fontWeight: 'var(--md-sys-typescale-body-medium-font-weight)',
        lineHeight: 'var(--md-sys-typescale-body-medium-line-height)',
        letterSpacing: 'var(--md-sys-typescale-body-medium-letter-spacing)',
        color: 'var(--md-sys-color-on-surface-variant)',
        margin: 0,
        ...style,
    }, ...props })));
DialogDescription.displayName = 'DialogDescription';
const DialogFooter = forwardRef(({ className, style, ...props }, ref) => (_jsx("div", { ref: ref, slot: "actions", className: cn("md-dialog-footer", className), style: {
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        ...style,
    }, ...props })));
DialogFooter.displayName = 'DialogFooter';
const DialogClose = forwardRef(({ children, onClick, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context)
        throw new Error('DialogClose must be used within Dialog');
    const handleClick = (e) => {
        context.setOpen(false);
        onClick?.(e);
    };
    return (_jsx("button", { ref: ref, onClick: handleClick, ...props, children: children }));
});
DialogClose.displayName = 'DialogClose';
export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose, };
