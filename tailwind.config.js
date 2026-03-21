const { lightTheme, darkTheme, tokens } = require('./app/common/themeTokens');

/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ['./App.{js,jsx}', './app/**/*.{js,jsx}'],
    presets: [require('nativewind/preset')],
    darkMode: 'class',
    theme: {
        extend: {
            colors: {
                surface: {
                    DEFAULT: lightTheme.surface.base,
                    dark: darkTheme.surface.base,
                    elevated: lightTheme.surface.elevated,
                    'elevated-dark': darkTheme.surface.elevated,
                    'elevated-dense': lightTheme.surface.elevatedDense,
                    'elevated-dense-dark': darkTheme.surface.elevatedDense,
                    overlay: lightTheme.surface.overlay,
                    'overlay-dark': darkTheme.surface.overlay,
                    border: lightTheme.surface.border,
                    'border-dark': darkTheme.surface.border,
                },
                'on-surface': {
                    DEFAULT: lightTheme.text.primary,
                    dark: darkTheme.text.primary,
                },
                'on-surface-secondary': {
                    DEFAULT: lightTheme.text.secondary,
                    dark: darkTheme.text.secondary,
                },
                'on-surface-muted': {
                    DEFAULT: lightTheme.text.muted,
                    dark: darkTheme.text.muted,
                },
                accent: {
                    DEFAULT: lightTheme.accent.primary,
                    dark: darkTheme.accent.primary,
                    secondary: lightTheme.accent.secondary,
                    'secondary-dark': darkTheme.accent.secondary,
                },
                atc: {
                    staffed: lightTheme.atc.staffed,
                    'staffed-dark': darkTheme.atc.staffed,
                    tracon: lightTheme.atc.tracon,
                    'tracon-dark': darkTheme.atc.tracon,
                    fir: lightTheme.atc.fir,
                    'fir-dark': darkTheme.atc.fir,
                },
                status: {
                    online: lightTheme.status.online,
                    'online-dark': darkTheme.status.online,
                    offline: lightTheme.status.offline,
                    'offline-dark': darkTheme.status.offline,
                    stale: lightTheme.status.stale,
                    'stale-dark': darkTheme.status.stale,
                },
            },
            opacity: {
                surface: String(tokens.opacity.surface),
                'surface-dense': String(tokens.opacity.surfaceDense),
                overlay: String(tokens.opacity.overlay),
            },
            blur: {
                'surface-ios': `${tokens.blur.surfaceIos}px`,
                'surface-android': `${tokens.blur.surfaceAndroid}px`,
            },
            transitionDuration: {
                fast: `${tokens.animation.duration.fast}ms`,
                normal: `${tokens.animation.duration.normal}ms`,
                slow: `${tokens.animation.duration.slow}ms`,
            },
            transitionTimingFunction: {
                app: tokens.animation.easing,
            },
            fontFamily: {
                sans: [tokens.fontFamily.sans],
                mono: [tokens.fontFamily.mono],
            },
        },
    },
    plugins: [],
};
