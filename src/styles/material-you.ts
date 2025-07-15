/**
 * Material You Dynamic Color System
 * Generates custom color palettes from source colors
 * Adapted for Beer Olympics brand identity
 */

import { 
  argbFromHex, 
  themeFromSourceColor,
  applyTheme,
  hexFromArgb,
  TonalPalette,
  Hct,
  MaterialDynamicColors,
  DynamicScheme,
  SchemeContent,
  SchemeExpressive,
  SchemeFidelity,
  SchemeMonochrome,
  SchemeNeutral,
  SchemeTonalSpot,
  SchemeVibrant,
  Blend
} from '@material/material-color-utilities';

// Beer Olympics brand colors
export const BRAND_COLORS = {
  primary: '#f59e0b',     // Beer Gold
  secondary: '#06b6d4',   // Party Cyan
  tertiary: '#ec4899',    // Fun Pink
  error: '#dc2626',       // Red for errors
  success: '#10b981',     // Green for success
  beerAmber: '#f59e0b',   // Classic beer color
  partyPink: '#ec4899',   // Party vibes
  partyCyan: '#06b6d4',   // Cool accent
  partyYellow: '#eab308', // Bright fun
  partyOrange: '#ea580c', // Energetic
  partyPurple: '#8b5cf6', // Playful
  partyGreen: '#10b981'   // Victory
};

// Material You scheme types
export type SchemeType = 
  | 'content'      // Default Material You
  | 'expressive'   // More colorful, playful
  | 'fidelity'     // True to source color
  | 'monochrome'   // Black & white + accent
  | 'neutral'      // Subtle, muted
  | 'tonalSpot'    // Single color focus
  | 'vibrant'      // Maximum vibrancy
  | 'party';       // Custom Beer Olympics scheme

// Custom Beer Olympics color scheme
export class SchemeParty extends DynamicScheme {
  constructor(sourceColorHct: Hct, isDark: boolean, contrastLevel: number) {
    super({
      sourceColorArgb: sourceColorHct.toInt(),
      variant: 6, // Custom variant
      contrastLevel,
      isDark,
      primaryPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue, Math.max(48, sourceColorHct.chroma)),
      secondaryPalette: TonalPalette.fromHueAndChroma(
        sourceColorHct.hue + 30, // Shift hue for variety
        Math.max(40, sourceColorHct.chroma * 0.8)
      ),
      tertiaryPalette: TonalPalette.fromHueAndChroma(
        sourceColorHct.hue + 60, // More hue shift
        Math.max(36, sourceColorHct.chroma * 0.7)
      ),
      neutralPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue, 8),
      neutralVariantPalette: TonalPalette.fromHueAndChroma(sourceColorHct.hue, 12)
    });
  }
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
export function generateMaterialYouTheme(
  sourceColor: string,
  schemeType: SchemeType = 'expressive',
  customColors?: string[]
): MaterialYouTheme {
  const sourceArgb = argbFromHex(sourceColor);
  const sourceHct = Hct.fromInt(sourceArgb);
  
  // Create light and dark schemes based on type
  let lightScheme: DynamicScheme;
  let darkScheme: DynamicScheme;
  
  switch (schemeType) {
    case 'content':
      lightScheme = new SchemeContent(sourceHct, false, 0);
      darkScheme = new SchemeContent(sourceHct, true, 0);
      break;
    case 'expressive':
      lightScheme = new SchemeExpressive(sourceHct, false, 0);
      darkScheme = new SchemeExpressive(sourceHct, true, 0);
      break;
    case 'fidelity':
      lightScheme = new SchemeFidelity(sourceHct, false, 0);
      darkScheme = new SchemeFidelity(sourceHct, true, 0);
      break;
    case 'monochrome':
      lightScheme = new SchemeMonochrome(sourceHct, false, 0);
      darkScheme = new SchemeMonochrome(sourceHct, true, 0);
      break;
    case 'neutral':
      lightScheme = new SchemeNeutral(sourceHct, false, 0);
      darkScheme = new SchemeNeutral(sourceHct, true, 0);
      break;
    case 'tonalSpot':
      lightScheme = new SchemeTonalSpot(sourceHct, false, 0);
      darkScheme = new SchemeTonalSpot(sourceHct, true, 0);
      break;
    case 'vibrant':
      lightScheme = new SchemeVibrant(sourceHct, false, 0);
      darkScheme = new SchemeVibrant(sourceHct, true, 0);
      break;
    case 'party':
      lightScheme = new SchemeParty(sourceHct, false, 0);
      darkScheme = new SchemeParty(sourceHct, true, 0);
      break;
  }
  
  // Get color tokens for both themes
  const lightColors = MaterialDynamicColors.getColorTokens(lightScheme);
  const darkColors = MaterialDynamicColors.getColorTokens(darkScheme);
  
  // Convert to hex values
  const lightTheme: Record<string, string> = {};
  const darkTheme: Record<string, string> = {};
  
  Object.entries(lightColors).forEach(([key, value]) => {
    lightTheme[key] = hexFromArgb(value);
  });
  
  Object.entries(darkColors).forEach(([key, value]) => {
    darkTheme[key] = hexFromArgb(value);
  });
  
  // Add custom colors if provided
  if (customColors && customColors.length > 0) {
    customColors.forEach((color, index) => {
      const customArgb = argbFromHex(color);
      const customHct = Hct.fromInt(customArgb);
      
      // Blend with source for harmony
      const blendedLight = Blend.harmonize(customArgb, sourceArgb);
      const blendedDark = Blend.harmonize(customArgb, sourceArgb);
      
      lightTheme[`custom${index + 1}`] = hexFromArgb(blendedLight);
      darkTheme[`custom${index + 1}`] = hexFromArgb(blendedDark);
      
      // Also add tonal variations
      const palette = TonalPalette.fromHueAndChroma(customHct.hue, customHct.chroma);
      lightTheme[`custom${index + 1}Container`] = hexFromArgb(palette.tone(90));
      lightTheme[`onCustom${index + 1}Container`] = hexFromArgb(palette.tone(10));
      darkTheme[`custom${index + 1}Container`] = hexFromArgb(palette.tone(30));
      darkTheme[`onCustom${index + 1}Container`] = hexFromArgb(palette.tone(90));
    });
  }
  
  return {
    light: lightTheme,
    dark: darkTheme,
    source: sourceColor,
    scheme: schemeType
  };
}

/**
 * Apply Material You theme to CSS custom properties
 */
export function applyMaterialYouTheme(theme: MaterialYouTheme, isDark: boolean = false): void {
  const colors = isDark ? theme.dark : theme.light;
  const root = document.documentElement;
  
  // Map Material You tokens to CSS variables
  const tokenMapping: Record<string, string> = {
    primary: '--md-sys-color-primary',
    onPrimary: '--md-sys-color-on-primary',
    primaryContainer: '--md-sys-color-primary-container',
    onPrimaryContainer: '--md-sys-color-on-primary-container',
    secondary: '--md-sys-color-secondary',
    onSecondary: '--md-sys-color-on-secondary',
    secondaryContainer: '--md-sys-color-secondary-container',
    onSecondaryContainer: '--md-sys-color-on-secondary-container',
    tertiary: '--md-sys-color-tertiary',
    onTertiary: '--md-sys-color-on-tertiary',
    tertiaryContainer: '--md-sys-color-tertiary-container',
    onTertiaryContainer: '--md-sys-color-on-tertiary-container',
    error: '--md-sys-color-error',
    onError: '--md-sys-color-on-error',
    errorContainer: '--md-sys-color-error-container',
    onErrorContainer: '--md-sys-color-on-error-container',
    background: '--md-sys-color-background',
    onBackground: '--md-sys-color-on-background',
    surface: '--md-sys-color-surface',
    onSurface: '--md-sys-color-on-surface',
    surfaceVariant: '--md-sys-color-surface-variant',
    onSurfaceVariant: '--md-sys-color-on-surface-variant',
    outline: '--md-sys-color-outline',
    outlineVariant: '--md-sys-color-outline-variant',
    inverseSurface: '--md-sys-color-inverse-surface',
    inverseOnSurface: '--md-sys-color-inverse-on-surface',
    inversePrimary: '--md-sys-color-inverse-primary',
    surfaceDim: '--md-sys-color-surface-dim',
    surfaceBright: '--md-sys-color-surface-bright',
    surfaceContainerLowest: '--md-sys-color-surface-container-lowest',
    surfaceContainerLow: '--md-sys-color-surface-container-low',
    surfaceContainer: '--md-sys-color-surface-container',
    surfaceContainerHigh: '--md-sys-color-surface-container-high',
    surfaceContainerHighest: '--md-sys-color-surface-container-highest'
  };
  
  // Apply colors to CSS variables
  Object.entries(tokenMapping).forEach(([token, cssVar]) => {
    if (colors[token]) {
      root.style.setProperty(cssVar, colors[token]);
    }
  });
  
  // Apply custom colors
  Object.entries(colors).forEach(([key, value]) => {
    if (key.startsWith('custom')) {
      root.style.setProperty(`--md-sys-color-${key}`, value);
    }
  });
  
  // Set theme attribute
  root.setAttribute('data-theme', isDark ? 'dark' : 'light');
  root.setAttribute('data-scheme', theme.scheme);
}

/**
 * Generate Material You theme from an image
 */
export async function generateThemeFromImage(
  imageElement: HTMLImageElement,
  schemeType: SchemeType = 'expressive'
): Promise<MaterialYouTheme> {
  // Create canvas to extract colors
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create canvas context');
  
  // Sample the image
  const size = 128; // Sample size
  canvas.width = size;
  canvas.height = size;
  ctx.drawImage(imageElement, 0, 0, size, size);
  
  // Get image data
  const imageData = ctx.getImageData(0, 0, size, size);
  const pixels = imageData.data;
  
  // Simple dominant color extraction
  const colorCounts = new Map<string, number>();
  
  for (let i = 0; i < pixels.length; i += 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    
    if (a < 128) continue; // Skip transparent pixels
    
    // Quantize colors to reduce variations
    const qR = Math.round(r / 32) * 32;
    const qG = Math.round(g / 32) * 32;
    const qB = Math.round(b / 32) * 32;
    
    const hex = `#${[qR, qG, qB].map(x => x.toString(16).padStart(2, '0')).join('')}`;
    colorCounts.set(hex, (colorCounts.get(hex) || 0) + 1);
  }
  
  // Find dominant color
  let dominantColor = '#f59e0b'; // Default to beer gold
  let maxCount = 0;
  
  for (const [color, count] of colorCounts.entries()) {
    if (count > maxCount) {
      maxCount = count;
      dominantColor = color;
    }
  }
  
  return generateMaterialYouTheme(dominantColor, schemeType);
}

/**
 * Preset themes for Beer Olympics
 */
export const PRESET_THEMES = {
  beerGold: generateMaterialYouTheme(BRAND_COLORS.beerAmber, 'party'),
  partyCyan: generateMaterialYouTheme(BRAND_COLORS.partyCyan, 'vibrant'),
  partyPink: generateMaterialYouTheme(BRAND_COLORS.partyPink, 'expressive'),
  victory: generateMaterialYouTheme(BRAND_COLORS.success, 'tonalSpot'),
  sunset: generateMaterialYouTheme('#ff6b6b', 'expressive', ['#4ecdc4', '#45b7d1']),
  ocean: generateMaterialYouTheme('#667eea', 'content', ['#764ba2']),
  neon: generateMaterialYouTheme('#ec4899', 'vibrant', [
    BRAND_COLORS.partyCyan,
    BRAND_COLORS.partyYellow,
    BRAND_COLORS.partyGreen
  ])
};

/**
 * Initialize Material You with user preference
 */
export function initializeMaterialYou(
  preferredScheme: SchemeType = 'party',
  darkMode: boolean = false
): void {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('materialYouTheme');
  const savedSource = localStorage.getItem('materialYouSource');
  
  let theme: MaterialYouTheme;
  
  if (savedTheme && savedSource) {
    // Use saved theme
    theme = JSON.parse(savedTheme);
  } else {
    // Use default Beer Olympics theme
    theme = PRESET_THEMES.beerGold;
  }
  
  // Apply theme
  applyMaterialYouTheme(theme, darkMode);
  
  // Listen for system dark mode changes
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  mediaQuery.addEventListener('change', (e) => {
    applyMaterialYouTheme(theme, e.matches);
  });
}

/**
 * Save theme preference
 */
export function saveThemePreference(theme: MaterialYouTheme): void {
  localStorage.setItem('materialYouTheme', JSON.stringify(theme));
  localStorage.setItem('materialYouSource', theme.source);
}

// Export utility functions for color manipulation
export { hexFromArgb, argbFromHex, Blend } from '@material/material-color-utilities';