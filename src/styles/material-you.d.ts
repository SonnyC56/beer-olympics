/**
 * Material You Dynamic Color System
 * Generates custom color palettes from source colors
 * Adapted for Beer Olympics brand identity
 */
import { Hct, DynamicScheme } from '@material/material-color-utilities';
export declare const BRAND_COLORS: {
    primary: string;
    secondary: string;
    tertiary: string;
    error: string;
    success: string;
    beerAmber: string;
    partyPink: string;
    partyCyan: string;
    partyYellow: string;
    partyOrange: string;
    partyPurple: string;
    partyGreen: string;
};
export type SchemeType = 'content' | 'expressive' | 'fidelity' | 'monochrome' | 'neutral' | 'tonalSpot' | 'vibrant' | 'party';
export declare class SchemeParty extends DynamicScheme {
    constructor(sourceColorHct: Hct, isDark: boolean, contrastLevel: number);
}
export interface MaterialYouTheme {
    light: Record<string, string>;
    dark: Record<string, string>;
    source: string;
    scheme: SchemeType;
}
/**
 * Generate a Material You theme from a source color
 */
export declare function generateMaterialYouTheme(sourceColor: string, schemeType?: SchemeType, customColors?: string[]): MaterialYouTheme;
/**
 * Apply Material You theme to CSS custom properties
 */
export declare function applyMaterialYouTheme(theme: MaterialYouTheme, isDark?: boolean): void;
/**
 * Generate Material You theme from an image
 */
export declare function generateThemeFromImage(imageElement: HTMLImageElement, schemeType?: SchemeType): Promise<MaterialYouTheme>;
/**
 * Preset themes for Beer Olympics
 */
export declare const PRESET_THEMES: {
    beerGold: MaterialYouTheme;
    partyCyan: MaterialYouTheme;
    partyPink: MaterialYouTheme;
    victory: MaterialYouTheme;
    sunset: MaterialYouTheme;
    ocean: MaterialYouTheme;
    neon: MaterialYouTheme;
};
/**
 * Initialize Material You with user preference
 */
export declare function initializeMaterialYou(preferredScheme?: SchemeType, darkMode?: boolean): void;
/**
 * Save theme preference
 */
export declare function saveThemePreference(theme: MaterialYouTheme): void;
export { hexFromArgb, argbFromHex, Blend } from '@material/material-color-utilities';
