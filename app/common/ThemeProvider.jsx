import React, {createContext, useContext, useState, useEffect, useCallback} from 'react';
import {useColorScheme} from 'react-native';
import {useColorScheme as useNativeWindColorScheme} from 'nativewind';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {lightTheme, darkTheme} from './themeTokens';
import {lightMapStyle, darkMapStyle} from './theme';

const THEME_PREFERENCE_KEY = 'themePreference';

const ThemeContext = createContext(null);

export default function ThemeProvider({children}) {
    const systemColorScheme = useColorScheme();
    const {setColorScheme} = useNativeWindColorScheme();
    const [themePreference, setThemePreference] = useState('system');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function loadPreference() {
            try {
                const saved = await AsyncStorage.getItem(THEME_PREFERENCE_KEY);
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

    const value = {
        isDark,
        activeTheme: isDark ? darkTheme : lightTheme,
        activeMapStyle: isDark ? darkMapStyle : lightMapStyle,
        themePreference,
        toggleTheme,
    };

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
