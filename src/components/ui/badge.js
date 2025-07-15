import { jsx as _jsx } from "react/jsx-runtime";
// Re-export Material 3 Chip component as Badge with compatibility
import { forwardRef } from 'react';
import { Chip } from './material/chip';
export const Badge = forwardRef(({ variant = 'default', children, label, ...props }, ref) => {
    // Map old badge variants to chip styles
    const chipVariant = variant === 'outline' ? 'assist' : 'filter';
    // Use children as label if label is not provided
    const chipLabel = label || (typeof children === 'string' ? children : String(children));
    return _jsx(Chip, { ref: ref, variant: chipVariant, label: chipLabel, ...props });
});
Badge.displayName = 'Badge';
