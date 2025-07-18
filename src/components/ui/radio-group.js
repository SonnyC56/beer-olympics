import { jsx as _jsx } from "react/jsx-runtime";
import * as React from "react";
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const RadioGroup = React.forwardRef(({ className, ...props }, ref) => {
    return (_jsx(RadioGroupPrimitive.Root, { className: cn("grid gap-2", className), ...props, ref: ref }));
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
const RadioGroupItem = React.forwardRef(({ className, ...props }, ref) => {
    return (_jsx(RadioGroupPrimitive.Item, { ref: ref, className: cn("aspect-square h-4 w-4 rounded-full border border-gray-200 text-gray-900 ring-offset-white focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-800 dark:text-gray-50 dark:ring-offset-gray-950 dark:focus-visible:ring-gray-300", className), ...props, children: _jsx(RadioGroupPrimitive.Indicator, { className: "flex items-center justify-center", children: _jsx(Circle, { className: "h-2.5 w-2.5 fill-current text-current" }) }) }));
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
export { RadioGroup, RadioGroupItem };
