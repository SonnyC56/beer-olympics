import React, { forwardRef, useEffect, useRef } from 'react';
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

const Chip = forwardRef<HTMLElement, ChipProps>(
  ({ 
    variant = 'assist',
    label,
    disabled,
    elevated,
    selected,
    removable,
    onRemove,
    onSelectedChange,
    icon,
    avatar,
    href,
    target,
    className,
    onClick,
    ...props 
  }, ref) => {
    const internalRef = useRef<HTMLElement>(null);
    const elementRef = (ref as any) || internalRef;

    useEffect(() => {
      const element = elementRef.current;
      if (!element) return;

      if (variant === 'filter' && onSelectedChange) {
        const handleChange = () => {
          const isSelected = (element as any).selected;
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
      if (!element) return;

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

    const handleClick = (e: React.MouseEvent<HTMLElement>) => {
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

    const iconElement = icon && <md-icon slot="icon">{icon}</md-icon>;
    const avatarElement = avatar && (
      typeof avatar === 'string' ? (
        <img slot="icon" src={avatar} alt="" style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
      ) : (
        <div slot="icon">{avatar}</div>
      )
    );

    switch (variant) {
      case 'filter':
        return (
          <md-filter-chip
            {...commonProps}
            selected={selected}
            removable={removable}
          >
            {iconElement}
            {avatarElement}
          </md-filter-chip>
        );
      
      case 'input':
        return (
          <md-input-chip
            {...commonProps}
            selected={selected}
            avatar={!!avatar}
            href={href}
            target={target}
          >
            {iconElement}
            {avatarElement}
          </md-input-chip>
        );
      
      case 'suggestion':
        return (
          <md-suggestion-chip
            {...commonProps}
            href={href}
            target={target}
          >
            {iconElement}
            {avatarElement}
          </md-suggestion-chip>
        );
      
      case 'assist':
      default:
        return (
          <md-assist-chip
            {...commonProps}
            href={href}
            target={target}
          >
            {iconElement}
            {avatarElement}
          </md-assist-chip>
        );
    }
  }
);

Chip.displayName = 'Chip';

export interface ChipSetProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
}

const ChipSet = forwardRef<HTMLElement, ChipSetProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <md-chip-set ref={ref} className={className} {...props}>
        {children}
      </md-chip-set>
    );
  }
);

ChipSet.displayName = 'ChipSet';

export { Chip, ChipSet };