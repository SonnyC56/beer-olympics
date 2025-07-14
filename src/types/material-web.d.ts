// Type declarations for Material Web Components
import { HTMLAttributes, DetailedHTMLProps } from 'react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      // Buttons
      'md-filled-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        'trailing-icon'?: boolean;
        type?: 'submit' | 'reset' | 'button';
      }, HTMLElement>;
      
      'md-outlined-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        'trailing-icon'?: boolean;
        type?: 'submit' | 'reset' | 'button';
      }, HTMLElement>;
      
      'md-text-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        'trailing-icon'?: boolean;
        type?: 'submit' | 'reset' | 'button';
      }, HTMLElement>;
      
      'md-elevated-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        'trailing-icon'?: boolean;
        type?: 'submit' | 'reset' | 'button';
      }, HTMLElement>;
      
      'md-filled-tonal-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        href?: string;
        target?: string;
        'trailing-icon'?: boolean;
        type?: 'submit' | 'reset' | 'button';
      }, HTMLElement>;
      
      // Icon
      'md-icon': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        slot?: string;
      }, HTMLElement>;
      
      // Text Fields
      'md-filled-text-field': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        label?: string;
        value?: string;
        type?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        'error'?: boolean;
        'error-text'?: string;
        'supporting-text'?: string;
        'prefix-text'?: string;
        'suffix-text'?: string;
        'leading-icon'?: boolean;
        'trailing-icon'?: boolean;
        'text-direction'?: string;
        'rows'?: number;
        'cols'?: number;
        'resize'?: string;
        'max'?: string;
        'maxlength'?: number;
        'min'?: string;
        'minlength'?: number;
        'pattern'?: string;
        'multiple'?: boolean;
        'step'?: string;
        'autocomplete'?: string;
        name?: string;
      }, HTMLElement>;
      
      'md-outlined-text-field': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        label?: string;
        value?: string;
        type?: string;
        placeholder?: string;
        disabled?: boolean;
        required?: boolean;
        'error'?: boolean;
        'error-text'?: string;
        'supporting-text'?: string;
        'prefix-text'?: string;
        'suffix-text'?: string;
        'leading-icon'?: boolean;
        'trailing-icon'?: boolean;
        'text-direction'?: string;
        'rows'?: number;
        'cols'?: number;
        'resize'?: string;
        'max'?: string;
        'maxlength'?: number;
        'min'?: string;
        'minlength'?: number;
        'pattern'?: string;
        'multiple'?: boolean;
        'step'?: string;
        'autocomplete'?: string;
        name?: string;
      }, HTMLElement>;
      
      // Dialog
      'md-dialog': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        open?: boolean;
        'return-value'?: string;
        type?: 'alert' | 'dialog';
        'no-focus-trap'?: boolean;
      }, HTMLElement>;
      
      'md-icon-button': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        'aria-label'?: string;
      }, HTMLElement>;
      
      // Select
      'md-filled-select': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        label?: string;
        disabled?: boolean;
        required?: boolean;
        'error'?: boolean;
        'error-text'?: string;
        'supporting-text'?: string;
        'menu-positioning'?: 'absolute' | 'fixed';
        'clamp-menu-width'?: boolean;
        value?: string;
        name?: string;
      }, HTMLElement>;
      
      'md-outlined-select': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        label?: string;
        disabled?: boolean;
        required?: boolean;
        'error'?: boolean;
        'error-text'?: string;
        'supporting-text'?: string;
        'menu-positioning'?: 'absolute' | 'fixed';
        'clamp-menu-width'?: boolean;
        value?: string;
        name?: string;
      }, HTMLElement>;
      
      'md-select-option': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        value?: string;
        selected?: boolean;
        disabled?: boolean;
      }, HTMLElement>;
      
      // Switch
      'md-switch': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        selected?: boolean;
        disabled?: boolean;
        'show-only-selected-icon'?: boolean;
        required?: boolean;
        value?: string;
        name?: string;
      }, HTMLElement>;
      
      // Tabs
      'md-tabs': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        'active-tab'?: number;
        'auto-activate'?: boolean;
      }, HTMLElement>;
      
      'md-primary-tab': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        active?: boolean;
        disabled?: boolean;
        'inline-icon'?: boolean;
      }, HTMLElement>;
      
      'md-secondary-tab': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        active?: boolean;
        disabled?: boolean;
        'inline-icon'?: boolean;
      }, HTMLElement>;
      
      // FAB
      'md-fab': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
        size?: 'small' | 'medium' | 'large';
        label?: string;
        lowered?: boolean;
        disabled?: boolean;
        href?: string;
        target?: string;
      }, HTMLElement>;
      
      'md-branded-fab': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        variant?: 'primary' | 'secondary' | 'tertiary' | 'surface';
        size?: 'small' | 'medium' | 'large';
        label?: string;
        lowered?: boolean;
        disabled?: boolean;
        href?: string;
        target?: string;
      }, HTMLElement>;
      
      // Chips
      'md-chip-set': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      
      'md-assist-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        label?: string;
        disabled?: boolean;
        elevated?: boolean;
        href?: string;
        target?: string;
      }, HTMLElement>;
      
      'md-filter-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        label?: string;
        disabled?: boolean;
        elevated?: boolean;
        removable?: boolean;
        selected?: boolean;
      }, HTMLElement>;
      
      'md-input-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        label?: string;
        disabled?: boolean;
        'avatar'?: boolean;
        href?: string;
        target?: string;
        'remove-only'?: boolean;
        selected?: boolean;
      }, HTMLElement>;
      
      'md-suggestion-chip': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        label?: string;
        disabled?: boolean;
        elevated?: boolean;
        href?: string;
        target?: string;
      }, HTMLElement>;
      
      // List
      'md-list': DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>;
      
      'md-list-item': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        disabled?: boolean;
        type?: 'text' | 'button' | 'link';
        href?: string;
        target?: string;
        selected?: boolean;
        activated?: boolean;
      }, HTMLElement>;
      
      // Ripple
      'md-ripple': DetailedHTMLProps<HTMLAttributes<HTMLElement> & {
        'for'?: string;
        unbounded?: boolean;
      }, HTMLElement>;
    }
  }
}