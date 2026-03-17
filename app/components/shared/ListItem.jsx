import React, {useRef} from 'react';
import {Animated, Pressable, View, StyleSheet} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from './ThemedText';

export default function ListItem({
    leftSlot,
    title,
    titleVariant = 'body',
    subtitle,
    trailingSlot,
    onPress,
    style,
    accessibilityLabel,
}) {
    const {activeTheme} = useTheme();
    const animValue = useRef(new Animated.Value(1)).current;

    function handlePressIn() {
        Animated.timing(animValue, {
            toValue: 0.6,
            duration: tokens.animation.duration.fast,
            useNativeDriver: true,
        }).start();
    }

    function handlePressOut() {
        Animated.timing(animValue, {
            toValue: 1,
            duration: tokens.animation.duration.fast,
            useNativeDriver: true,
        }).start();
    }

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel={accessibilityLabel || title}
        >
            <Animated.View style={[styles.container, style, {opacity: animValue}]}>
                {leftSlot && <View style={styles.leftSlot}>{leftSlot}</View>}
                <View style={styles.body}>
                    <ThemedText variant={titleVariant}>{title}</ThemedText>
                    {subtitle ? (
                        <ThemedText variant="body-sm" color={activeTheme.text.secondary}>
                            {subtitle}
                        </ThemedText>
                    ) : null}
                </View>
                {trailingSlot && <View style={styles.trailingSlot}>{trailingSlot}</View>}
                <View style={[styles.separator, {backgroundColor: activeTheme.surface.border}]} />
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    container: {
        minHeight: 64,
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    leftSlot: {
        width: 42,
        height: 42,
        marginRight: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    body: {
        flex: 1,
        justifyContent: 'center',
    },
    trailingSlot: {
        marginLeft: 8,
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    separator: {
        position: 'absolute',
        bottom: 0,
        left: 16,
        right: 0,
        height: StyleSheet.hairlineWidth,
    },
});
