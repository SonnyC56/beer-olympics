import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { ReactNode } from 'react';
import {
  generateMaterialYouTheme,
  applyMaterialYouTheme,
  initializeMaterialYou,
  saveThemePreference,
  generateThemeFromImage,
  PRESET_THEMES,
  BRAND_COLORS,
  MaterialYouTheme,
  SchemeType
} from '../../../styles/material-you';

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

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}

interface ThemeProviderProps {
  children: ReactNode;
  defaultScheme?: SchemeType;
  defaultDark?: boolean;
  enableSystemColorScheme?: boolean;
}

export function ThemeProvider({
  children,
  defaultScheme = 'party',
  defaultDark = false,
  enableSystemColorScheme = true
}: ThemeProviderProps) {
  // Initialize state from localStorage or defaults
  const [theme, setTheme] = useState<MaterialYouTheme>(() => {
    const saved = localStorage.getItem('materialYouTheme');
    return saved ? JSON.parse(saved) : PRESET_THEMES.beerGold;
  });
  
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('materialYouDarkMode');
    if (saved !== null) return JSON.parse(saved);
    
    if (enableSystemColorScheme) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return defaultDark;
  });
  
  const [schemeType, setSchemeTypeState] = useState<SchemeType>(() => {
    const saved = localStorage.getItem('materialYouSchemeType');
    return (saved as SchemeType) || defaultScheme;
  });
  
  const [customColors, setCustomColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('materialYouCustomColors');
    return saved ? JSON.parse(saved) : [];
  });

  // Apply theme on mount and changes
  useEffect(() => {
    applyMaterialYouTheme(theme, isDark);
  }, [theme, isDark]);

  // Listen for system dark mode changes
  useEffect(() => {
    if (!enableSystemColorScheme) return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      setIsDark(e.matches);
    };

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, [enableSystemColorScheme]);

  // Save preferences to localStorage
  useEffect(() => {
    saveThemePreference(theme);
    localStorage.setItem('materialYouDarkMode', JSON.stringify(isDark));
    localStorage.setItem('materialYouSchemeType', schemeType);
    localStorage.setItem('materialYouCustomColors', JSON.stringify(customColors));
  }, [theme, isDark, schemeType, customColors]);

  const setSourceColor = useCallback((color: string) => {
    const newTheme = generateMaterialYouTheme(color, schemeType, customColors);
    setTheme(newTheme);
  }, [schemeType, customColors]);

  const setSchemeType = useCallback((scheme: SchemeType) => {
    setSchemeTypeState(scheme);
    const newTheme = generateMaterialYouTheme(theme.source, scheme, customColors);
    setTheme(newTheme);
  }, [theme.source, customColors]);

  const toggleDarkMode = useCallback(() => {
    setIsDark(prev => !prev);
  }, []);

  const applyPresetTheme = useCallback((preset: keyof typeof PRESET_THEMES) => {
    const presetTheme = PRESET_THEMES[preset];
    setTheme(presetTheme);
    setSchemeTypeState(presetTheme.scheme);
  }, []);

  const generateFromImage = useCallback(async (image: HTMLImageElement) => {
    try {
      const newTheme = await generateThemeFromImage(image, schemeType);
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to generate theme from image:', error);
    }
  }, [schemeType]);

  const addCustomColor = useCallback((color: string) => {
    const newCustomColors = [...customColors, color];
    setCustomColors(newCustomColors);
    const newTheme = generateMaterialYouTheme(theme.source, schemeType, newCustomColors);
    setTheme(newTheme);
  }, [customColors, theme.source, schemeType]);

  const removeCustomColor = useCallback((index: number) => {
    const newCustomColors = customColors.filter((_, i) => i !== index);
    setCustomColors(newCustomColors);
    const newTheme = generateMaterialYouTheme(theme.source, schemeType, newCustomColors);
    setTheme(newTheme);
  }, [customColors, theme.source, schemeType]);

  const resetTheme = useCallback(() => {
    setTheme(PRESET_THEMES.beerGold);
    setSchemeTypeState('party');
    setCustomColors([]);
    setIsDark(defaultDark);
  }, [defaultDark]);

  const value: ThemeContextType = {
    theme,
    isDark,
    schemeType,
    setSourceColor,
    setSchemeType,
    toggleDarkMode,
    applyPresetTheme,
    generateFromImage,
    customColors,
    addCustomColor,
    removeCustomColor,
    resetTheme
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Color picker component for theme customization
export function MaterialColorPicker() {
  const {
    theme,
    isDark,
    schemeType,
    setSourceColor,
    setSchemeType,
    toggleDarkMode,
    applyPresetTheme,
    customColors,
    addCustomColor,
    removeCustomColor
  } = useTheme();

  const [showCustomColor, setShowCustomColor] = useState(false);
  const [customColorInput, setCustomColorInput] = useState('#000000');

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const img = new Image();
    img.onload = async () => {
      const { generateFromImage } = useTheme();
      await generateFromImage(img);
    };
    img.src = URL.createObjectURL(file);
  };

  return (
    <div className="p-6 space-y-6 bg-[var(--md-sys-color-surface-container)] rounded-[var(--md-sys-shape-extra-large)]">
      <h2 className="headline-medium text-[var(--md-sys-color-on-surface)]">
        Material You Theme
      </h2>

      {/* Current theme display */}
      <div className="flex items-center gap-4">
        <div 
          className="w-16 h-16 rounded-full elevation-2"
          style={{ backgroundColor: theme.source }}
        />
        <div>
          <p className="title-medium text-[var(--md-sys-color-on-surface)]">
            Source Color
          </p>
          <p className="body-medium text-[var(--md-sys-color-on-surface-variant)]">
            {theme.source}
          </p>
        </div>
      </div>

      {/* Color scheme selector */}
      <div className="space-y-2">
        <label className="label-large text-[var(--md-sys-color-on-surface)]">
          Color Scheme
        </label>
        <select
          value={schemeType}
          onChange={(e) => setSchemeType(e.target.value as SchemeType)}
          className="w-full p-3 rounded-[var(--md-sys-shape-medium)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] body-large"
        >
          <option value="party">Party (Beer Olympics)</option>
          <option value="expressive">Expressive</option>
          <option value="vibrant">Vibrant</option>
          <option value="content">Content</option>
          <option value="fidelity">Fidelity</option>
          <option value="tonalSpot">Tonal Spot</option>
          <option value="neutral">Neutral</option>
          <option value="monochrome">Monochrome</option>
        </select>
      </div>

      {/* Preset themes */}
      <div className="space-y-2">
        <label className="label-large text-[var(--md-sys-color-on-surface)]">
          Preset Themes
        </label>
        <div className="grid grid-cols-3 gap-2">
          {Object.entries(PRESET_THEMES).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => applyPresetTheme(key as keyof typeof PRESET_THEMES)}
              className="p-3 rounded-[var(--md-sys-shape-medium)] bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors label-medium text-[var(--md-sys-color-on-surface)] state-layer"
              style={{
                borderLeft: `4px solid ${preset.source}`
              }}
            >
              {key}
            </button>
          ))}
        </div>
      </div>

      {/* Brand colors */}
      <div className="space-y-2">
        <label className="label-large text-[var(--md-sys-color-on-surface)]">
          Brand Colors
        </label>
        <div className="grid grid-cols-4 gap-2">
          {Object.entries(BRAND_COLORS).map(([name, color]) => (
            <button
              key={name}
              onClick={() => setSourceColor(color)}
              className="aspect-square rounded-[var(--md-sys-shape-medium)] elevation-1 transition-all hover:elevation-3 state-layer"
              style={{ backgroundColor: color }}
              title={name}
            />
          ))}
        </div>
      </div>

      {/* Custom colors */}
      <div className="space-y-2">
        <label className="label-large text-[var(--md-sys-color-on-surface)]">
          Custom Colors
        </label>
        <div className="flex flex-wrap gap-2">
          {customColors.map((color, index) => (
            <div
              key={index}
              className="relative group"
            >
              <div
                className="w-12 h-12 rounded-[var(--md-sys-shape-small)] elevation-1"
                style={{ backgroundColor: color }}
              />
              <button
                onClick={() => removeCustomColor(index)}
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center label-small"
              >
                ×
              </button>
            </div>
          ))}
          {!showCustomColor ? (
            <button
              onClick={() => setShowCustomColor(true)}
              className="w-12 h-12 rounded-[var(--md-sys-shape-small)] border-2 border-dashed border-[var(--md-sys-color-outline)] flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors"
            >
              +
            </button>
          ) : (
            <div className="flex gap-2">
              <input
                type="color"
                value={customColorInput}
                onChange={(e) => setCustomColorInput(e.target.value)}
                className="w-12 h-12 rounded-[var(--md-sys-shape-small)]"
              />
              <button
                onClick={() => {
                  addCustomColor(customColorInput);
                  setShowCustomColor(false);
                }}
                className="px-3 py-1 rounded-[var(--md-sys-shape-button)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] label-medium hover:elevation-1 transition-all"
              >
                Add
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Image upload */}
      <div className="space-y-2">
        <label className="label-large text-[var(--md-sys-color-on-surface)]">
          Generate from Image
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="w-full p-3 rounded-[var(--md-sys-shape-medium)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] body-medium"
        />
      </div>

      {/* Dark mode toggle */}
      <div className="flex items-center justify-between">
        <span className="label-large text-[var(--md-sys-color-on-surface)]">
          Dark Mode
        </span>
        <button
          onClick={toggleDarkMode}
          className={`relative w-14 h-8 rounded-full transition-colors ${
            isDark
              ? 'bg-[var(--md-sys-color-primary)]'
              : 'bg-[var(--md-sys-color-surface-variant)]'
          }`}
        >
          <div
            className={`absolute top-1 w-6 h-6 rounded-full bg-[var(--md-sys-color-on-primary)] transition-transform ${
              isDark ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
      </div>
    </div>
  );
}