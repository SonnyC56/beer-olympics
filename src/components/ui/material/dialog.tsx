import React, { forwardRef, useEffect, useRef, createContext, useContext } from 'react';
import '@material/web/dialog/dialog.js';
import '@material/web/icon/icon.js';
import '@material/web/iconbutton/icon-button.js';
import { cn } from '@/lib/utils';
import { MaterialElements as ME } from './material-elements';

interface DialogContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextValue | undefined>(undefined);

export interface DialogProps {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const Dialog: React.FC<DialogProps> = ({ children, open = false, onOpenChange }) => {
  const [isOpen, setIsOpen] = React.useState(open);

  React.useEffect(() => {
    setIsOpen(open);
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <DialogContext.Provider value={{ open: isOpen, setOpen: handleOpenChange }}>
      {children}
    </DialogContext.Provider>
  );
};

export interface DialogTriggerProps {
  children: React.ReactElement;
  asChild?: boolean;
}

const DialogTrigger: React.FC<DialogTriggerProps> = ({ children, asChild }) => {
  const context = useContext(DialogContext);
  if (!context) throw new Error('DialogTrigger must be used within Dialog');

  const handleClick = () => {
    context.setOpen(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <div onClick={handleClick} style={{ display: 'inline-block', cursor: 'pointer' }}>
      {children}
    </div>
  );
};

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  showCloseButton?: boolean;
  type?: 'alert' | 'dialog';
  noFocusTrap?: boolean;
}

const DialogContent = forwardRef<HTMLElement, DialogContentProps>(
  ({ children, className, showCloseButton = true, type = 'dialog', noFocusTrap = false, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('DialogContent must be used within Dialog');

    const dialogRef = useRef<HTMLElement>(null);
    const elementRef = (ref as any) || dialogRef;

    useEffect(() => {
      const dialog = elementRef.current;
      if (!dialog) return;

      if (context.open) {
        (dialog as any).open = true;
      } else {
        (dialog as any).open = false;
      }

      const handleClose = () => {
        context.setOpen(false);
      };

      const handleCancel = (e: Event) => {
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

    return (
      <ME.Dialog
        ref={elementRef}
        type={type}
        no-focus-trap={noFocusTrap ? true : undefined}
        className={className}
        {...props}
      >
        {showCloseButton && (
          <ME.IconButton
            slot="headline"
            aria-label="Close dialog"
            onClick={() => context.setOpen(false)}
            style={{
              position: 'absolute',
              right: '16px',
              top: '16px',
            }}
          >
            <ME.Icon>close</ME.Icon>
          </ME.IconButton>
        )}
        {children}
      </ME.Dialog>
    );
  }
);

DialogContent.displayName = 'DialogContent';

const DialogHeader = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      slot="headline"
      className={cn("md-dialog-header", className)}
      style={{
        fontFamily: 'var(--md-sys-typescale-headline-small-font-family)',
        fontSize: 'var(--md-sys-typescale-headline-small-font-size)',
        fontWeight: 'var(--md-sys-typescale-headline-small-font-weight)',
        lineHeight: 'var(--md-sys-typescale-headline-small-line-height)',
        letterSpacing: 'var(--md-sys-typescale-headline-small-letter-spacing)',
        ...style,
      }}
      {...props}
    />
  )
);

DialogHeader.displayName = 'DialogHeader';

const DialogTitle = forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, style, ...props }, ref) => (
    <h2
      ref={ref}
      className={cn("md-dialog-title", className)}
      style={{
        margin: 0,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        fontWeight: 'inherit',
        lineHeight: 'inherit',
        letterSpacing: 'inherit',
        ...style,
      }}
      {...props}
    />
  )
);

DialogTitle.displayName = 'DialogTitle';

const DialogDescription = forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, style, ...props }, ref) => (
    <p
      ref={ref}
      slot="content"
      className={cn("md-dialog-description", className)}
      style={{
        fontFamily: 'var(--md-sys-typescale-body-medium-font-family)',
        fontSize: 'var(--md-sys-typescale-body-medium-font-size)',
        fontWeight: 'var(--md-sys-typescale-body-medium-font-weight)',
        lineHeight: 'var(--md-sys-typescale-body-medium-line-height)',
        letterSpacing: 'var(--md-sys-typescale-body-medium-letter-spacing)',
        color: 'var(--md-sys-color-on-surface-variant)',
        margin: 0,
        ...style,
      }}
      {...props}
    />
  )
);

DialogDescription.displayName = 'DialogDescription';

const DialogFooter = forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      slot="actions"
      className={cn("md-dialog-footer", className)}
      style={{
        display: 'flex',
        gap: '8px',
        justifyContent: 'flex-end',
        ...style,
      }}
      {...props}
    />
  )
);

DialogFooter.displayName = 'DialogFooter';

const DialogClose = forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ children, onClick, ...props }, ref) => {
    const context = useContext(DialogContext);
    if (!context) throw new Error('DialogClose must be used within Dialog');

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      context.setOpen(false);
      onClick?.(e);
    };

    return (
      <button ref={ref} onClick={handleClick} {...props}>
        {children}
      </button>
    );
  }
);

DialogClose.displayName = 'DialogClose';

export {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
};