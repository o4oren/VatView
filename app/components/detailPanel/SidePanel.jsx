import React, {useEffect, useRef} from 'react';
import {Animated, ScrollView, StyleSheet, useWindowDimensions} from 'react-native';
import {useReducedMotion} from 'react-native-reanimated';
import TranslucentSurface from '../../common/TranslucentSurface';
import {tokens} from '../../common/themeTokens';

export const PANEL_WIDTH_PHONE = 360;
export const PANEL_WIDTH_TABLET = 400;
export const TABLET_WIDTH_THRESHOLD = 768;

export default function SidePanel({visible, children}) {
    const {width} = useWindowDimensions();
    const panelWidth = width >= TABLET_WIDTH_THRESHOLD ? PANEL_WIDTH_TABLET : PANEL_WIDTH_PHONE;
    const reducedMotion = useReducedMotion();
    const translateX = useRef(new Animated.Value(panelWidth)).current;

    useEffect(() => {
        Animated.timing(translateX, {
            toValue: visible ? 0 : panelWidth,
            duration: reducedMotion ? 0 : tokens.animation.duration.slow,
            useNativeDriver: true,
        }).start();
    }, [visible, panelWidth, reducedMotion]);

    return (
        <Animated.View style={[styles.panel, {width: panelWidth, transform: [{translateX}]}]}>
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <TranslucentSurface opacity="surface" rounded="none" style={styles.surface}>
                    {children}
                </TranslucentSurface>
            </ScrollView>
        </Animated.View>
    );
}

const styles = StyleSheet.create({
    panel: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        right: 0,
        zIndex: 10,
    },
    scrollContent: {flexGrow: 1},
    surface: {flex: 1, borderWidth: 0, elevation: 0},
});
