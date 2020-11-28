import React from 'react';
import {Pressable, StyleSheet, View} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from './ThemedText';

const OPTIONS = [
    {label: 'System', value: 'system'},
    {label: 'Dark', value: 'dark'},
    {label: 'Light', value: 'light'},
];

export default function ThemePicker() {
    const {themePreference, toggleTheme, activeTheme} = useTheme();

    return (
        <View style={styles.row}>
            {OPTIONS.map(opt => {
                const isActive = opt.value === themePreference;
                const borderColor = isActive ? activeTheme.accent.primary : activeTheme.surface.border;
                const textColor = isActive ? activeTheme.text.primary : activeTheme.text.secondary;
                return (
                    <Pressable
                        key={opt.value}
                        onPress={() => toggleTheme(opt.value)}
                        accessibilityRole="button"
                        accessibilityLabel={`${opt.label} theme`}
                        accessibilityState={{selected: isActive}}
                        style={[
                            styles.chipBase,
                            isActive ? styles.chipActive : styles.chipInactive,
                            {borderColor},
                        ]}
                    >
                        <ThemedText variant="body-sm" color={textColor}>
                            {opt.label}
                        </ThemedText>
                    </Pressable>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        gap: 8,
    },
    chipBase: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: tokens.radius.md,
    },
    chipActive: {
        borderWidth: 1.5,
        backgroundColor: 'transparent',
    },
    chipInactive: {
        borderWidth: 1,
        opacity: 0.6,
    },
});
