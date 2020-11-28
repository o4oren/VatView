/* eslint-disable react-native/no-raw-text */
import React, {useRef} from 'react';
import {Animated, Image, Pressable, StyleSheet, useWindowDimensions, View} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from '../shared/ThemedText';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';

export default function EventListItem({event}) {
    const navigation = useNavigation();
    const {activeTheme} = useTheme();
    const {width} = useWindowDimensions();
    const imageHeight = Math.round((width - 32) * 9 / 16);
    const animValue = useRef(new Animated.Value(1)).current;

    const onPress = () => {
        navigation.navigate('Event Details', {event});
    };

    const handlePressIn = () => {
        Animated.timing(animValue, {
            toValue: 0.6,
            duration: tokens.animation.duration.fast,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.timing(animValue, {
            toValue: 1,
            duration: tokens.animation.duration.fast,
            useNativeDriver: true,
        }).start();
    };

    const startTime = getDateFromUTCString(event.start_time).toUTCString();
    const endTime = getDateFromUTCString(event.end_time).toUTCString();

    return (
        <Pressable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            accessibilityRole="button"
            accessibilityLabel={event.name}
        >
            <Animated.View
                style={[
                    styles.card,
                    {backgroundColor: activeTheme.surface.elevated, opacity: animValue},
                ]}
            >
                <View style={styles.textContent}>
                    <ThemedText variant="body">{event.name}</ThemedText>
                    <ThemedText variant="caption" color={activeTheme.text.secondary}>
                        {`Start: ${startTime}`}
                    </ThemedText>
                    <ThemedText variant="caption" color={activeTheme.text.secondary}>
                        {`End: ${endTime}`}
                    </ThemedText>
                </View>
                {event.banner ? (
                    <Image
                        source={{uri: event.banner}}
                        style={[styles.banner, {height: imageHeight}]}
                        resizeMode="cover"
                    />
                ) : null}
            </Animated.View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 6,
        borderRadius: tokens.radius.md,
        overflow: 'hidden',
    },
    textContent: {
        padding: 12,
    },
    banner: {
        width: '100%',
        borderBottomLeftRadius: tokens.radius.md,
        borderBottomRightRadius: tokens.radius.md,
    },
});
