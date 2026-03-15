import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {useTheme} from './ThemeProvider';
import {lightTheme, darkTheme} from './themeTokens';

export default function StatusBarController() {
    const {isDark} = useTheme();

    return (
        <StatusBar
            style={isDark ? 'light' : 'dark'}
            backgroundColor={isDark ? darkTheme.surface.base : lightTheme.surface.base}
        />
    );
}
