import React from 'react';
import {StyleSheet} from 'react-native';
import BlurWrapper from './BlurWrapper';

// Maps rounded prop presets to pixel values (aligned with Tailwind rounded-* scale).
// overflow: 'hidden' on the parent is mandatory on iOS to clip the BlurView blur
// effect to the border radius — do not remove it.
const BORDER_RADIUS_MAP = {
    'none': 0,
    'sm': 4,
    'md': 8,
    'lg': 12,
    'xl': 16,
    '2xl': 24,
    'full': 9999,
};

export default function TranslucentSurface({
    children,
    opacity = 'surface',
    intensity,
    rounded = 'xl',
    style,
    ...props
}) {
    const borderRadius = BORDER_RADIUS_MAP[rounded] ?? BORDER_RADIUS_MAP['xl'];
    return (
        <BlurWrapper
            opacity={opacity}
            intensity={intensity}
            style={[styles.base, {borderRadius}, style]}
            {...props}
        >
            {children}
        </BlurWrapper>
    );
}

const styles = StyleSheet.create({
    base: {
        overflow: 'hidden',
    },
});
