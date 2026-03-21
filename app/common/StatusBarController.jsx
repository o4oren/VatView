import React from 'react';
import {StatusBar} from 'expo-status-bar';
import {useTheme} from './ThemeProvider';

export default function StatusBarController() {
    const {isDark} = useTheme();

    return (
        <StatusBar
            style={isDark ? 'light' : 'dark'}
            backgroundColor="transparent"
            translucent={true}
        />
    );
}
