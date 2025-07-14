import React, { forwardRef } from 'react';
import '@material/web/list/list.js';
import '@material/web/list/list-item.js';
import '@material/web/icon/icon.js';
import '@material/web/ripple/ripple.js';
import { cn } from '@/lib/utils';

export interface NavigationDrawerProps extends React.HTMLAttributes<HTMLDivElement> {
  open?: boolean;
  variant?: 'modal' | 'dismissible' | 'permanent';
  anchor?: 'left' | 'right';
  onOpenChange?: (open: boolean) => void;
}

const NavigationDrawer = forwardRef<HTMLDivElement, NavigationDrawerProps>(
  ({ 
    children, 
    open = false, 
    variant = 'dismissible',
    anchor = 'left',
    className,
    style,
    onOpenChange,
    ...props 
  }, ref) => {
    const handleScrimClick = () => {
      if (variant === 'modal' && onOpenChange) {
        onOpenChange(false);
      }
    };

    const drawerStyles: React.CSSProperties = {
      position: variant === 'permanent' ? 'relative' : 'fixed',
      top: 0,
      bottom: 0,
      [anchor]: 0,
      width: '256px',
      backgroundColor: 'var(--md-sys-color-surface)',
      color: 'var(--md-sys-color-on-surface)',
      borderRadius: anchor === 'left' ? '0 16px 16px 0' : '16px 0 0 16px',
      boxShadow: variant !== 'permanent' ? getElevation('level1') : 'none',
      transition: 'transform 200ms cubic-bezier(0.4, 0, 0.2, 1)',
      transform: variant === 'permanent' || open ? 'translateX(0)' : `translateX(${anchor === 'left' ? '-100%' : '100%'})`,
      zIndex: variant === 'modal' ? 1001 : 1,
      display: 'flex',
      flexDirection: 'column' as const,
      overflow: 'hidden',
    };

    return (
      <>
        {variant === 'modal' && open && (
          <div
            className="md-navigation-drawer-scrim"
            onClick={handleScrimClick}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.32)',
              zIndex: 1000,
              transition: 'opacity 200ms cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          />
        )}
        <nav
          ref={ref}
          className={cn("md-navigation-drawer", className)}
          style={{
            ...drawerStyles,
            ...style,
          }}
          {...props}
        >
          {children}
        </nav>
      </>
    );
  }
);

NavigationDrawer.displayName = 'NavigationDrawer';

export interface NavigationDrawerHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}

const NavigationDrawerHeader = forwardRef<HTMLDivElement, NavigationDrawerHeaderProps>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("md-navigation-drawer-header", className)}
      style={{
        padding: '28px 28px 16px',
        ...style,
      }}
      {...props}
    />
  )
);

NavigationDrawerHeader.displayName = 'NavigationDrawerHeader';

export interface NavigationDrawerContentProps extends React.HTMLAttributes<HTMLDivElement> {}

const NavigationDrawerContent = forwardRef<HTMLDivElement, NavigationDrawerContentProps>(
  ({ className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("md-navigation-drawer-content", className)}
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '0 12px',
        ...style,
      }}
      {...props}
    />
  )
);

NavigationDrawerContent.displayName = 'NavigationDrawerContent';

export interface NavigationItemProps extends React.HTMLAttributes<HTMLElement> {
  icon?: string;
  label: string;
  selected?: boolean;
  activated?: boolean;
  disabled?: boolean;
  href?: string;
  target?: string;
  badge?: string | number;
}

const NavigationItem = forwardRef<HTMLElement, NavigationItemProps>(
  ({ 
    icon,
    label,
    selected,
    activated,
    disabled,
    href,
    target,
    badge,
    onClick,
    ...props 
  }, ref) => {
    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
      if (onClick) {
        onClick(e);
      }
    };

    return (
      <md-list-item
        ref={ref}
        disabled={disabled}
        type={href ? 'link' : 'button'}
        href={href}
        target={target}
        selected={selected}
        activated={activated}
        onClick={handleClick}
        style={{
          borderRadius: '28px',
          margin: '4px 0',
        }}
        {...props}
      >
        {icon && <md-icon slot="start">{icon}</md-icon>}
        <span>{label}</span>
        {badge !== undefined && (
          <span
            slot="end"
            style={{
              backgroundColor: 'var(--md-sys-color-primary)',
              color: 'var(--md-sys-color-on-primary)',
              borderRadius: '12px',
              padding: '2px 8px',
              fontSize: '11px',
              fontWeight: '500',
              minWidth: '20px',
              textAlign: 'center',
            }}
          >
            {badge}
          </span>
        )}
        <md-ripple />
      </md-list-item>
    );
  }
);

NavigationItem.displayName = 'NavigationItem';

export interface NavigationSectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
}

const NavigationSection = forwardRef<HTMLDivElement, NavigationSectionProps>(
  ({ title, children, className, style, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("md-navigation-section", className)}
      style={{
        marginTop: '8px',
        marginBottom: '8px',
        ...style,
      }}
      {...props}
    >
      {title && (
        <div
          style={{
            padding: '16px 28px 8px',
            fontFamily: 'var(--md-sys-typescale-title-small-font-family)',
            fontSize: 'var(--md-sys-typescale-title-small-font-size)',
            fontWeight: 'var(--md-sys-typescale-title-small-font-weight)',
            lineHeight: 'var(--md-sys-typescale-title-small-line-height)',
            letterSpacing: 'var(--md-sys-typescale-title-small-letter-spacing)',
            color: 'var(--md-sys-color-on-surface-variant)',
          }}
        >
          {title}
        </div>
      )}
      <md-list>
        {children}
      </md-list>
    </div>
  )
);

NavigationSection.displayName = 'NavigationSection';

// Helper function to get elevation (import from material-theme.tsx in real usage)
const getElevation = (level: string) => {
  const elevations: Record<string, string> = {
    level0: 'none',
    level1: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
    level2: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
    level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
    level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
    level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
  };
  return elevations[level] || elevations.level0;
};

export {
  NavigationDrawer,
  NavigationDrawerHeader,
  NavigationDrawerContent,
  NavigationItem,
  NavigationSection,
};