import { jsx as _jsx } from "react/jsx-runtime";
import { createContext, useContext, useEffect } from 'react';
// Material 3 theme tokens
export const materialTheme = {
    // Color tokens based on Material 3 color system
    colors: {
        primary: '#006495',
        onPrimary: '#FFFFFF',
        primaryContainer: '#C8E6FF',
        onPrimaryContainer: '#001E30',
        secondary: '#4F606E',
        onSecondary: '#FFFFFF',
        secondaryContainer: '#D2E4F5',
        onSecondaryContainer: '#0B1D29',
        tertiary: '#63597B',
        onTertiary: '#FFFFFF',
        tertiaryContainer: '#E9DDFF',
        onTertiaryContainer: '#1F1635',
        error: '#BA1A1A',
        onError: '#FFFFFF',
        errorContainer: '#FFDAD6',
        onErrorContainer: '#410002',
        background: '#F8F9FF',
        onBackground: '#191C20',
        surface: '#F8F9FF',
        onSurface: '#191C20',
        surfaceVariant: '#DDE3EA',
        onSurfaceVariant: '#41474E',
        outline: '#71787F',
        outlineVariant: '#C1C7CE',
        inverseSurface: '#2E3135',
        inverseOnSurface: '#EFF0F7',
        inversePrimary: '#8BCEFF',
        surfaceTint: '#006495',
        // Surface elevation colors
        surfaceDim: '#D8DAE1',
        surfaceBright: '#F8F9FF',
        surfaceContainerLowest: '#FFFFFF',
        surfaceContainerLow: '#F2F3FA',
        surfaceContainer: '#ECEEF5',
        surfaceContainerHigh: '#E6E8EF',
        surfaceContainerHighest: '#E1E2E9',
    },
    // Typography scale
    typography: {
        displayLarge: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '57px',
            fontWeight: '400',
            lineHeight: '64px',
            letterSpacing: '-0.25px',
        },
        displayMedium: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '45px',
            fontWeight: '400',
            lineHeight: '52px',
            letterSpacing: '0',
        },
        displaySmall: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '36px',
            fontWeight: '400',
            lineHeight: '44px',
            letterSpacing: '0',
        },
        headlineLarge: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '32px',
            fontWeight: '400',
            lineHeight: '40px',
            letterSpacing: '0',
        },
        headlineMedium: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '28px',
            fontWeight: '400',
            lineHeight: '36px',
            letterSpacing: '0',
        },
        headlineSmall: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '24px',
            fontWeight: '400',
            lineHeight: '32px',
            letterSpacing: '0',
        },
        titleLarge: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '22px',
            fontWeight: '400',
            lineHeight: '28px',
            letterSpacing: '0',
        },
        titleMedium: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            fontWeight: '500',
            lineHeight: '24px',
            letterSpacing: '0.15px',
        },
        titleSmall: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '20px',
            letterSpacing: '0.1px',
        },
        bodyLarge: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '16px',
            fontWeight: '400',
            lineHeight: '24px',
            letterSpacing: '0.5px',
        },
        bodyMedium: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px',
            fontWeight: '400',
            lineHeight: '20px',
            letterSpacing: '0.25px',
        },
        bodySmall: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '12px',
            fontWeight: '400',
            lineHeight: '16px',
            letterSpacing: '0.4px',
        },
        labelLarge: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '14px',
            fontWeight: '500',
            lineHeight: '20px',
            letterSpacing: '0.1px',
        },
        labelMedium: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '12px',
            fontWeight: '500',
            lineHeight: '16px',
            letterSpacing: '0.5px',
        },
        labelSmall: {
            fontFamily: 'Roboto, sans-serif',
            fontSize: '11px',
            fontWeight: '500',
            lineHeight: '16px',
            letterSpacing: '0.5px',
        },
    },
    // Shape system
    shape: {
        none: '0',
        extraSmall: '4px',
        small: '8px',
        medium: '12px',
        large: '16px',
        extraLarge: '28px',
        full: '9999px',
    },
    // Elevation
    elevation: {
        level0: 'none',
        level1: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 1px 3px 1px rgba(0, 0, 0, 0.15)',
        level2: '0px 1px 2px rgba(0, 0, 0, 0.3), 0px 2px 6px 2px rgba(0, 0, 0, 0.15)',
        level3: '0px 4px 8px 3px rgba(0, 0, 0, 0.15), 0px 1px 3px rgba(0, 0, 0, 0.3)',
        level4: '0px 6px 10px 4px rgba(0, 0, 0, 0.15), 0px 2px 3px rgba(0, 0, 0, 0.3)',
        level5: '0px 8px 12px 6px rgba(0, 0, 0, 0.15), 0px 4px 4px rgba(0, 0, 0, 0.3)',
    },
    // State layers
    stateLayer: {
        hover: 0.08,
        focus: 0.12,
        pressed: 0.12,
        dragged: 0.16,
    },
};
// Material Theme Context
const MaterialThemeContext = createContext(materialTheme);
export const useMaterialTheme = () => {
    const context = useContext(MaterialThemeContext);
    if (!context) {
        throw new Error('useMaterialTheme must be used within MaterialThemeProvider');
    }
    return context;
};
// Material Theme Provider
export const MaterialThemeProvider = ({ children }) => {
    useEffect(() => {
        // Apply Material 3 CSS custom properties
        const root = document.documentElement;
        // Set color tokens
        Object.entries(materialTheme.colors).forEach(([key, value]) => {
            const cssVarName = `--md-sys-color-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
        });
        // Set typography tokens
        Object.entries(materialTheme.typography).forEach(([key, value]) => {
            const prefix = `--md-sys-typescale-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(`${prefix}-font-family`, value.fontFamily);
            root.style.setProperty(`${prefix}-font-size`, value.fontSize);
            root.style.setProperty(`${prefix}-font-weight`, value.fontWeight);
            root.style.setProperty(`${prefix}-line-height`, value.lineHeight);
            root.style.setProperty(`${prefix}-letter-spacing`, value.letterSpacing);
        });
        // Set shape tokens
        Object.entries(materialTheme.shape).forEach(([key, value]) => {
            const cssVarName = `--md-sys-shape-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`;
            root.style.setProperty(cssVarName, value);
        });
        // Add Roboto font
        const fontLink = document.createElement('link');
        fontLink.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&display=swap';
        fontLink.rel = 'stylesheet';
        document.head.appendChild(fontLink);
        // Add Material Symbols
        const symbolsLink = document.createElement('link');
        symbolsLink.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
        symbolsLink.rel = 'stylesheet';
        document.head.appendChild(symbolsLink);
        return () => {
            document.head.removeChild(fontLink);
            document.head.removeChild(symbolsLink);
        };
    }, []);
    return (_jsx(MaterialThemeContext.Provider, { value: materialTheme, children: children }));
};
// Helper function to apply elevation
export const getElevation = (level) => {
    return materialTheme.elevation[level];
};
// Helper function to apply state layer
export const getStateLayerOpacity = (state) => {
    return materialTheme.stateLayer[state];
};
