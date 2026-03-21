// Design Token System — CJS module for use by both theme.js and tailwind.config.js
// This is the single source of truth for all design tokens.

const lightTheme = {
    surface: {
        base: '#FFFFFF',
        elevated: 'rgba(255, 255, 255, 0.50)',
        elevatedDense: 'rgba(255, 255, 255, 0.70)',
        overlay: 'rgba(255, 255, 255, 0.90)',
        border: 'rgba(0, 0, 0, 0.08)',
        elevatedAndroid: 'rgba(255, 255, 255, 0.82)',
        elevatedDenseAndroid: 'rgba(255, 255, 255, 0.92)',
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
        airportDot: '#1A4F8C',
        airportDotUnstaffed: '#5A6370',
        tracon: '#1A7F37',
        fir: '#2A6BC4',
        firFill: 'rgba(42, 107, 196, 0.12)',
        uir: '#8250DF',
        uirFill: 'rgba(130, 80, 223, 0.15)',
        traconFill: 'rgba(26, 127, 55, 0.08)',
        firStrokeWidth: 1,
        uirStrokeWidth: 1,
        traconStrokeWidth: 1,
        badge: {
            clearance: '#8b949e',
            ground: '#CF222E',
            tower: '#bf8700',
            approach: '#1a6d2e',
            departure: '#238636',
            atis: '#0284c7',
            ctr: '#1A7A6E',
            fss: '#8250DF',
        },
        badgeBackground: 'rgba(0,0,0,0.06)',
    },
    status: {
        online: '#1A7F37',
        offline: '#8B949E',
        stale: '#BF8700',
    },
    pilot: {
        listIcon: '#2A6BC4',
    },
};

const darkTheme = {
    surface: {
        base: '#0D1117',
        elevated: 'rgba(22, 27, 34, 0.45)',
        elevatedDense: 'rgba(22, 27, 34, 0.65)',
        overlay: 'rgba(22, 27, 34, 0.85)',
        border: 'rgba(255, 255, 255, 0.08)',
        elevatedAndroid: 'rgba(22, 27, 34, 0.82)',
        elevatedDenseAndroid: 'rgba(22, 27, 34, 0.92)',
    },
    text: {
        primary: '#E6EDF3',
        secondary: '#8B949E',
        muted: '#484F58',
    },
    accent: {
        primary: '#5BA0E6',
        secondary: '#7DBAF0',
    },
    atc: {
        staffed: '#5BA0E6',
        airportDot: '#3B7DD8',
        airportDotUnstaffed: '#484F58',
        tracon: '#2EA043',
        fir: '#3B7DD8',
        firFill: 'rgba(59, 125, 216, 0.09)',
        uir: '#A371F7',
        uirFill: 'rgba(163, 113, 247, 0.11)',
        traconFill: 'rgba(46, 160, 67, 0.07)',
        firStrokeWidth: 1,
        uirStrokeWidth: 1,
        traconStrokeWidth: 1,
        badge: {
            clearance: '#656d76',
            ground: '#F85149',
            tower: '#d29922',
            approach: '#2ea043',
            departure: '#3fb950',
            atis: '#0ea5e9',
            ctr: '#2BA99A',
            fss: '#A371F7',
        },
        badgeBackground: 'rgba(255,255,255,0.10)',
    },
    status: {
        online: '#3FB950',
        offline: '#484F58',
        stale: '#D29922',
    },
    pilot: {
        listIcon: '#5BA0E6',
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
        monoMedium: 'JetBrainsMono_500Medium',
    },
    radius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
    },
};

module.exports = { lightTheme, darkTheme, tokens };
