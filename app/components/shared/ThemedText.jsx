import React from 'react';
import {Text, StyleSheet} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';

const VARIANT_STYLES = StyleSheet.create({
    'heading-lg': {
        fontSize: 22,
        fontWeight: '600',
        lineHeight: 28,
        fontFamily: tokens.fontFamily.sans,
    },
    heading: {
        fontSize: 18,
        fontWeight: '600',
        lineHeight: 24,
        fontFamily: tokens.fontFamily.sans,
    },
    body: {
        fontSize: 15,
        fontWeight: '400',
        lineHeight: 22,
        fontFamily: tokens.fontFamily.sans,
    },
    'body-sm': {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
        fontFamily: tokens.fontFamily.sans,
    },
    caption: {
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 16,
        fontFamily: tokens.fontFamily.sans,
    },
    callsign: {
        fontSize: 15,
        fontWeight: '500',
        lineHeight: 20,
        fontFamily: tokens.fontFamily.monoMedium,
    },
    frequency: {
        fontSize: 14,
        fontWeight: '400',
        lineHeight: 18,
        fontFamily: tokens.fontFamily.mono,
    },
    data: {
        fontSize: 13,
        fontWeight: '400',
        lineHeight: 18,
        fontFamily: tokens.fontFamily.mono,
    },
    'data-sm': {
        fontSize: 11,
        fontWeight: '400',
        lineHeight: 16,
        fontFamily: tokens.fontFamily.mono,
    },
});

const FONT_SCALE = 1.20;

const LARGE_VARIANT_STYLES = StyleSheet.create(
    Object.fromEntries(
        Object.entries(VARIANT_STYLES).map(([key, val]) => [
            key,
            {fontSize: Math.round(val.fontSize * FONT_SCALE), lineHeight: Math.round(val.lineHeight * FONT_SCALE)},
        ])
    )
);

export default function ThemedText({variant = 'body', color, style, ...props}) {
    const {activeTheme, largeFonts} = useTheme();
    const resolvedColor = color ?? activeTheme.text.primary;
    const variantStyle = VARIANT_STYLES[variant] || VARIANT_STYLES.body;
    const scaledOverride = largeFonts
        ? LARGE_VARIANT_STYLES[variant] || LARGE_VARIANT_STYLES.body
        : undefined;

    return (
        <Text
            style={[variantStyle, scaledOverride, {color: resolvedColor}, style]}
            accessibilityRole="text"
            {...props}
        />
    );
}
