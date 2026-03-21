import React, {createContext, useContext, useState, useEffect, useCallback, useMemo} from 'react';
import {useColorScheme} from 'react-native';
import {useColorScheme as useNativeWindColorScheme} from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {lightTheme, darkTheme} from './themeTokens';
import {lightMapStyle, darkMapStyle} from './theme';

const THEME_PREFERENCE_KEY = 'themePreference';
const LARGE_FONTS_KEY = 'largeFonts';

const ThemeContext = createContext(null);

export default function ThemeProvider({children}) {
    const systemColorScheme = useColorScheme();
    const {setColorScheme} = useNativeWindColorScheme();
    const [themePreference, setThemePreference] = useState('system');
    const [largeFonts, setLargeFonts] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function loadPreference() {
            try {
                const [saved, savedLargeFonts] = await Promise.all([
                    AsyncStorage.getItem(THEME_PREFERENCE_KEY),
                    AsyncStorage.getItem(LARGE_FONTS_KEY),
                ]);
                if (savedLargeFonts === 'true') {
                    setLargeFonts(true);
                }
                if (saved === 'light' || saved === 'dark' || saved === 'system') {
                    setThemePreference(saved);
                    const resolvedIsDark = saved === 'system'
                        ? systemColorScheme === 'dark'
                        : saved === 'dark';
                    setColorScheme(resolvedIsDark ? 'dark' : 'light');
                } else {
                    setColorScheme(systemColorScheme === 'dark' ? 'dark' : 'light');
                }
            } catch (err) {
                setColorScheme(systemColorScheme === 'dark' ? 'dark' : 'light');
            }
            setIsLoaded(true);
        }
        loadPreference();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const isDark = themePreference === 'system'
        ? systemColorScheme === 'dark'
        : themePreference === 'dark';

    useEffect(() => {
        if (!isLoaded) {
            return;
        }
        setColorScheme(isDark ? 'dark' : 'light');
    }, [isDark, isLoaded, setColorScheme]);

    const toggleTheme = useCallback(async (newPreference) => {
        if (newPreference !== 'system' && newPreference !== 'light' && newPreference !== 'dark') {
            return;
        }
        setThemePreference(newPreference);
        try {
            await AsyncStorage.setItem(THEME_PREFERENCE_KEY, newPreference);
        } catch (err) {
            // Persistence failed — theme still works in memory
        }
    }, []);

    const toggleLargeFonts = useCallback(async (enabled) => {
        if (typeof enabled !== 'boolean') return;
        setLargeFonts(enabled);
        try {
            await AsyncStorage.setItem(LARGE_FONTS_KEY, enabled ? 'true' : 'false');
        } catch (err) {
            // Persistence failed — setting still works in memory
        }
    }, []);

    const value = useMemo(() => ({
        isDark,
        activeTheme: isDark ? darkTheme : lightTheme,
        activeMapStyle: isDark ? darkMapStyle : lightMapStyle,
        themePreference,
        toggleTheme,
        largeFonts,
        toggleLargeFonts,
    }), [isDark, themePreference, toggleTheme, largeFonts, toggleLargeFonts]);

    return (
        <ThemeContext.Provider value={value}>
            {isLoaded ? children : null}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

export {ThemeContext};
