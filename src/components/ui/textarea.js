import { jsx as _jsx } from "react/jsx-runtime";
// Re-export Material 3 TextField with multiline as Textarea
import { TextField } from './material/text-field';
import { forwardRef } from 'react';
export const Textarea = forwardRef((props, ref) => {
    return _jsx(TextField, { ref: ref, multiline: true, ...props });
});
Textarea.displayName = 'Textarea';
