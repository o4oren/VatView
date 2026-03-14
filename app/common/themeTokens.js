// Design Token System — CJS module for use by both theme.js and tailwind.config.js
// This is the single source of truth for all design tokens.

const lightTheme = {
    surface: {
        base: '#FFFFFF',
        elevated: 'rgba(255, 255, 255, 0.50)',
        elevatedDense: 'rgba(255, 255, 255, 0.70)',
        overlay: 'rgba(255, 255, 255, 0.90)',
        border: 'rgba(0, 0, 0, 0.08)',
    },
    text: {
        primary: '#1F2328',
        secondary: '#656D76',
        muted: '#8B949E',
    },
    accent: {
        primary: '#2A6BC4',
        secondary: '#3B7DD8',
    },
    atc: {
        staffed: '#2A6BC4',
        tracon: '#1A7F37',
        fir: '#2A6BC4',
    },
    status: {
        online: '#1A7F37',
        offline: '#8B949E',
        stale: '#BF8700',
    },
};

const darkTheme = {
    surface: {
        base: '#0D1117',
        elevated: 'rgba(22, 27, 34, 0.45)',
        elevatedDense: 'rgba(22, 27, 34, 0.65)',
        overlay: 'rgba(22, 27, 34, 0.85)',
        border: 'rgba(255, 255, 255, 0.08)',
    },
    text: {
        primary: '#E6EDF3',
        secondary: '#8B949E',
        muted: '#484F58',
    },
    accent: {
        primary: '#3B7DD8',
        secondary: '#5BA0E6',
    },
    atc: {
        staffed: '#3B7DD8',
        tracon: '#2EA043',
        fir: '#3B7DD8',
    },
    status: {
        online: '#3FB950',
        offline: '#484F58',
        stale: '#D29922',
    },
};

const tokens = {
    opacity: {
        surface: 0.45,
        surfaceDense: 0.65,
        overlay: 0.85,
    },
    blur: {
        surfaceIos: 20,
        surfaceAndroid: 0,
    },
    animation: {
        duration: { fast: 150, normal: 250, slow: 400 },
        easing: 'cubic-bezier(0.2, 0, 0, 1)',
        spring: { damping: 20, stiffness: 300 },
    },
    fontFamily: {
        sans: 'System',
        mono: 'JetBrainsMono_400Regular',
    },
};

module.exports = { lightTheme, darkTheme, tokens };
