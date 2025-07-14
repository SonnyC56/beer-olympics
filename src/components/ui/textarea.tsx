// Re-export Material 3 TextField with multiline as Textarea
import { TextField, type TextFieldProps } from './material/text-field';
import { forwardRef } from 'react';

export interface TextareaProps extends Omit<TextFieldProps, 'multiline'> {
  rows?: number;
}

export const Textarea = forwardRef<HTMLElement, TextareaProps>(
  (props, ref) => {
    return <TextField ref={ref} multiline {...props} />;
  }
);

Textarea.displayName = 'Textarea';