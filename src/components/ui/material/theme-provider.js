import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { generateMaterialYouTheme, applyMaterialYouTheme, saveThemePreference, generateThemeFromImage, PRESET_THEMES, BRAND_COLORS } from '../../../styles/material-you';
const ThemeContext = createContext(undefined);
export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
export function ThemeProvider({ children, defaultScheme = 'party', defaultDark = false, enableSystemColorScheme = true }) {
    // Initialize state from localStorage or defaults
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('materialYouTheme');
        return saved ? JSON.parse(saved) : PRESET_THEMES.beerGold;
    });
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('materialYouDarkMode');
        if (saved !== null)
            return JSON.parse(saved);
        if (enableSystemColorScheme) {
            return window.matchMedia('(prefers-color-scheme: dark)').matches;
        }
        return defaultDark;
    });
    const [schemeType, setSchemeTypeState] = useState(() => {
        const saved = localStorage.getItem('materialYouSchemeType');
        return saved || defaultScheme;
    });
    const [customColors, setCustomColors] = useState(() => {
        const saved = localStorage.getItem('materialYouCustomColors');
        return saved ? JSON.parse(saved) : [];
    });
    // Apply theme on mount and changes
    useEffect(() => {
        applyMaterialYouTheme(theme, isDark);
    }, [theme, isDark]);
    // Listen for system dark mode changes
    useEffect(() => {
        if (!enableSystemColorScheme)
            return;
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handler = (e) => {
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
    const setSourceColor = useCallback((color) => {
        const newTheme = generateMaterialYouTheme(color, schemeType, customColors);
        setTheme(newTheme);
    }, [schemeType, customColors]);
    const setSchemeType = useCallback((scheme) => {
        setSchemeTypeState(scheme);
        const newTheme = generateMaterialYouTheme(theme.source, scheme, customColors);
        setTheme(newTheme);
    }, [theme.source, customColors]);
    const toggleDarkMode = useCallback(() => {
        setIsDark(prev => !prev);
    }, []);
    const applyPresetTheme = useCallback((preset) => {
        const presetTheme = PRESET_THEMES[preset];
        setTheme(presetTheme);
        setSchemeTypeState(presetTheme.scheme);
    }, []);
    const generateFromImage = useCallback(async (image) => {
        try {
            const newTheme = await generateThemeFromImage(image, schemeType);
            setTheme(newTheme);
        }
        catch (error) {
            console.error('Failed to generate theme from image:', error);
        }
    }, [schemeType]);
    const addCustomColor = useCallback((color) => {
        const newCustomColors = [...customColors, color];
        setCustomColors(newCustomColors);
        const newTheme = generateMaterialYouTheme(theme.source, schemeType, newCustomColors);
        setTheme(newTheme);
    }, [customColors, theme.source, schemeType]);
    const removeCustomColor = useCallback((index) => {
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
    const value = {
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
    return (_jsx(ThemeContext.Provider, { value: value, children: children }));
}
// Color picker component for theme customization
export function MaterialColorPicker() {
    const { theme, isDark, schemeType, setSourceColor, setSchemeType, toggleDarkMode, applyPresetTheme, customColors, addCustomColor, removeCustomColor } = useTheme();
    const [showCustomColor, setShowCustomColor] = useState(false);
    const [customColorInput, setCustomColorInput] = useState('#000000');
    const handleImageUpload = async (event) => {
        const file = event.target.files?.[0];
        if (!file)
            return;
        const img = new Image();
        img.onload = async () => {
            const { generateFromImage } = useTheme();
            await generateFromImage(img);
        };
        img.src = URL.createObjectURL(file);
    };
    return (_jsxs("div", { className: "p-6 space-y-6 bg-[var(--md-sys-color-surface-container)] rounded-[var(--md-sys-shape-extra-large)]", children: [_jsx("h2", { className: "headline-medium text-[var(--md-sys-color-on-surface)]", children: "Material You Theme" }), _jsxs("div", { className: "flex items-center gap-4", children: [_jsx("div", { className: "w-16 h-16 rounded-full elevation-2", style: { backgroundColor: theme.source } }), _jsxs("div", { children: [_jsx("p", { className: "title-medium text-[var(--md-sys-color-on-surface)]", children: "Source Color" }), _jsx("p", { className: "body-medium text-[var(--md-sys-color-on-surface-variant)]", children: theme.source })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "label-large text-[var(--md-sys-color-on-surface)]", children: "Color Scheme" }), _jsxs("select", { value: schemeType, onChange: (e) => setSchemeType(e.target.value), className: "w-full p-3 rounded-[var(--md-sys-shape-medium)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] body-large", children: [_jsx("option", { value: "party", children: "Party (Beer Olympics)" }), _jsx("option", { value: "expressive", children: "Expressive" }), _jsx("option", { value: "vibrant", children: "Vibrant" }), _jsx("option", { value: "content", children: "Content" }), _jsx("option", { value: "fidelity", children: "Fidelity" }), _jsx("option", { value: "tonalSpot", children: "Tonal Spot" }), _jsx("option", { value: "neutral", children: "Neutral" }), _jsx("option", { value: "monochrome", children: "Monochrome" })] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "label-large text-[var(--md-sys-color-on-surface)]", children: "Preset Themes" }), _jsx("div", { className: "grid grid-cols-3 gap-2", children: Object.entries(PRESET_THEMES).map(([key, preset]) => (_jsx("button", { onClick: () => applyPresetTheme(key), className: "p-3 rounded-[var(--md-sys-shape-medium)] bg-[var(--md-sys-color-surface-container-high)] hover:bg-[var(--md-sys-color-surface-container-highest)] transition-colors label-medium text-[var(--md-sys-color-on-surface)] state-layer", style: {
                                borderLeft: `4px solid ${preset.source}`
                            }, children: key }, key))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "label-large text-[var(--md-sys-color-on-surface)]", children: "Brand Colors" }), _jsx("div", { className: "grid grid-cols-4 gap-2", children: Object.entries(BRAND_COLORS).map(([name, color]) => (_jsx("button", { onClick: () => setSourceColor(color), className: "aspect-square rounded-[var(--md-sys-shape-medium)] elevation-1 transition-all hover:elevation-3 state-layer", style: { backgroundColor: color }, title: name }, name))) })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "label-large text-[var(--md-sys-color-on-surface)]", children: "Custom Colors" }), _jsxs("div", { className: "flex flex-wrap gap-2", children: [customColors.map((color, index) => (_jsxs("div", { className: "relative group", children: [_jsx("div", { className: "w-12 h-12 rounded-[var(--md-sys-shape-small)] elevation-1", style: { backgroundColor: color } }), _jsx("button", { onClick: () => removeCustomColor(index), className: "absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--md-sys-color-error)] text-[var(--md-sys-color-on-error)] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center label-small", children: "\u00D7" })] }, index))), !showCustomColor ? (_jsx("button", { onClick: () => setShowCustomColor(true), className: "w-12 h-12 rounded-[var(--md-sys-shape-small)] border-2 border-dashed border-[var(--md-sys-color-outline)] flex items-center justify-center hover:bg-[var(--md-sys-color-surface-container-high)] transition-colors", children: "+" })) : (_jsxs("div", { className: "flex gap-2", children: [_jsx("input", { type: "color", value: customColorInput, onChange: (e) => setCustomColorInput(e.target.value), className: "w-12 h-12 rounded-[var(--md-sys-shape-small)]" }), _jsx("button", { onClick: () => {
                                            addCustomColor(customColorInput);
                                            setShowCustomColor(false);
                                        }, className: "px-3 py-1 rounded-[var(--md-sys-shape-button)] bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] label-medium hover:elevation-1 transition-all", children: "Add" })] }))] })] }), _jsxs("div", { className: "space-y-2", children: [_jsx("label", { className: "label-large text-[var(--md-sys-color-on-surface)]", children: "Generate from Image" }), _jsx("input", { type: "file", accept: "image/*", onChange: handleImageUpload, className: "w-full p-3 rounded-[var(--md-sys-shape-medium)] bg-[var(--md-sys-color-surface-container-high)] text-[var(--md-sys-color-on-surface)] body-medium" })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsx("span", { className: "label-large text-[var(--md-sys-color-on-surface)]", children: "Dark Mode" }), _jsx("button", { onClick: toggleDarkMode, className: `relative w-14 h-8 rounded-full transition-colors ${isDark
                            ? 'bg-[var(--md-sys-color-primary)]'
                            : 'bg-[var(--md-sys-color-surface-variant)]'}`, children: _jsx("div", { className: `absolute top-1 w-6 h-6 rounded-full bg-[var(--md-sys-color-on-primary)] transition-transform ${isDark ? 'translate-x-6' : 'translate-x-1'}` }) })] })] }));
}
