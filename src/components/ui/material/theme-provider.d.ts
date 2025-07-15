import type { ReactNode } from 'react';
import { PRESET_THEMES, MaterialYouTheme, SchemeType } from '../../../styles/material-you';
interface ThemeContextType {
    theme: MaterialYouTheme;
    isDark: boolean;
    schemeType: SchemeType;
    setSourceColor: (color: string) => void;
    setSchemeType: (scheme: SchemeType) => void;
    toggleDarkMode: () => void;
    applyPresetTheme: (preset: keyof typeof PRESET_THEMES) => void;
    generateFromImage: (image: HTMLImageElement) => Promise<void>;
    customColors: string[];
    addCustomColor: (color: string) => void;
    removeCustomColor: (index: number) => void;
    resetTheme: () => void;
}
export declare function useTheme(): ThemeContextType;
interface ThemeProviderProps {
    children: ReactNode;
    defaultScheme?: SchemeType;
    defaultDark?: boolean;
    enableSystemColorScheme?: boolean;
}
export declare function ThemeProvider({ children, defaultScheme, defaultDark, enableSystemColorScheme }: ThemeProviderProps): import("react/jsx-runtime").JSX.Element;
export declare function MaterialColorPicker(): import("react/jsx-runtime").JSX.Element;
export {};
