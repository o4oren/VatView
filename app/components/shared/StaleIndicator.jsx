import React, {useEffect, useRef, useState} from 'react';
import {Animated, View, StyleSheet, AccessibilityInfo} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';

const DOT_SIZE = 10;

const ERROR_COLOR_LIGHT = '#F85149';
const ERROR_COLOR_DARK = '#FF7B72';

function getErrorColor(isDark) {
    return isDark ? ERROR_COLOR_DARK : ERROR_COLOR_LIGHT;
}

export default function StaleIndicator({status = 'live', style}) {
    const {activeTheme, isDark} = useTheme();
    const pulseAnim = useRef(new Animated.Value(1)).current;
    const [reduceMotion, setReduceMotion] = useState(false);

    useEffect(() => {
        let isMounted = true;
        AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
            if (isMounted) {
                setReduceMotion(enabled);
            }
        });

        const subscription = AccessibilityInfo.addEventListener(
            'reduceMotionChanged',
            setReduceMotion,
        );

        return () => {
            isMounted = false;
            subscription?.remove?.();
        };
    }, []);

    useEffect(() => {
        if (status === 'live' || reduceMotion) {
            pulseAnim.stopAnimation();
            pulseAnim.setValue(1);
            return;
        }
        const loop = Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, {toValue: 0.3, duration: 800, useNativeDriver: true}),
                Animated.timing(pulseAnim, {toValue: 1, duration: 800, useNativeDriver: true}),
            ]),
        );
        loop.start();
        return () => loop.stop();
    }, [status, reduceMotion, pulseAnim]);

    let dotColor;
    if (status === 'stale') {
        dotColor = activeTheme.status.stale;
    } else if (status === 'error') {
        dotColor = getErrorColor(isDark);
    } else {
        dotColor = activeTheme.status.online;
    }

    return (
        <View
            style={[styles.wrapper, style]}
            accessibilityLabel={`Data status: ${status}`}
            accessible={true}
        >
            <Animated.View style={[styles.dot, {backgroundColor: dotColor, opacity: pulseAnim}]} />
        </View>
    );
}

const styles = StyleSheet.create({
    wrapper: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
    },
});
