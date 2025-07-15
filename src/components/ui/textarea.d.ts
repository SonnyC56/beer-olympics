import { type TextFieldProps } from './material/text-field';
export interface TextareaProps extends Omit<TextFieldProps, 'multiline'> {
    rows?: number;
}
export declare const Textarea: import("react").ForwardRefExoticComponent<TextareaProps & import("react").RefAttributes<HTMLElement>>;
