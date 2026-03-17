import React from 'react';
import {Platform, View} from 'react-native';
import {BlurView} from 'expo-blur';
import {useTheme} from './ThemeProvider';
import {tokens} from './themeTokens';

function getBgColor(opacity, activeTheme) {
    switch (opacity) {
        case 'surface-dense':
            return activeTheme.surface.elevatedDense;
        case 'overlay':
            return activeTheme.surface.overlay;
        case 'surface':
        default:
            return activeTheme.surface.elevated;
    }
}

// Note: BlurWrapper must be rendered inside a parent with overflow:'hidden' when
// a border radius is needed on iOS — otherwise the blur effect bleeds past the
// clipping bounds. Use TranslucentSurface (which enforces this) instead of
// BlurWrapper directly in feature components.
// Note: intensity is an iOS-only prop; it has no effect on Android.
export default function BlurWrapper({
    intensity = tokens.blur.surfaceIos,
    opacity = 'surface',
    style,
    children,
    ...props
}) {
    const {isDark, activeTheme} = useTheme();
    const backgroundColor = getBgColor(opacity, activeTheme);

    if (Platform.OS === 'ios') {
        return (
            <BlurView
                tint={isDark ? 'dark' : 'light'}
                intensity={intensity}
                style={[{backgroundColor}, style]}
                {...props}
            >
                {children}
            </BlurView>
        );
    }

    return (
        <View
            style={[{backgroundColor}, style]}
            {...props}
        >
            {children}
        </View>
    );
}
