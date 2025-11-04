// TypeScript module declaration for @ncdai/react-wheel-picker
// This allows importing the package without type errors

declare module '@ncdai/react-wheel-picker' {
    import * as React from 'react';
    export type WheelPickerValue = string | number;
    export interface WheelPickerOption<T extends WheelPickerValue = string> {
        value: T;
        label: React.ReactNode;
    }
    export type WheelPickerClassNames = {
        optionItem?: string;
        highlightWrapper?: string;
        highlightItem?: string;
    };
    export interface WheelPickerProps<T extends WheelPickerValue = string> {
        defaultValue?: T;
        value?: T;
        onValueChange?: (value: T) => void;
        options: WheelPickerOption<T>[];
        infinite?: boolean;
        visibleCount?: number;
        dragSensitivity?: number;
        scrollSensitivity?: number;
        optionItemHeight?: number;
        classNames?: WheelPickerClassNames;
    }
    export const WheelPicker: React.FC<WheelPickerProps>;
    export default WheelPicker;
}
