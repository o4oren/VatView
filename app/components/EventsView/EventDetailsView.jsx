/* eslint-disable react-native/no-raw-text */
import React from 'react';
import {Image, Pressable, ScrollView, StyleSheet, useWindowDimensions, View} from 'react-native';
import RenderHtml from 'react-native-render-html';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useNavigation} from '@react-navigation/native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from '../shared/ThemedText';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';

export default function EventDetailsView(props) {
    const {activeTheme} = useTheme();
    const {width} = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const navigation = useNavigation();
    const imageHeight = Math.round(width * 9 / 16);
    const event = props.route.params.event;

    const renderRoutes = () => {
        if (!event.routes || event.routes.length === 0) {
            return null;
        }
        return (
            <View style={styles.routesSection}>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.routesLabel}>
                    Routes
                </ThemedText>
                {event.routes.map(route => (
                    <ThemedText
                        key={`${route.departure}-${route.arrival}`}
                        variant="body-sm"
                    >
                        {`${route.departure} → ${route.arrival}: ${route.route}`}
                    </ThemedText>
                ))}
            </View>
        );
    };

    return (
        <View style={[styles.root, {backgroundColor: activeTheme.surface.base, paddingTop: insets.top}]}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
                <View style={[styles.card, {backgroundColor: activeTheme.surface.elevated}]}>
                    <View style={styles.bannerContainer}>
                        {event.banner ? (
                            <Image
                                source={{uri: event.banner}}
                                style={[styles.banner, {height: imageHeight}]}
                                resizeMode="cover"
                            />
                        ) : null}
                        <Pressable
                            onPress={() => navigation.goBack()}
                            style={styles.backBtn}
                            accessibilityLabel="Go back"
                            accessibilityRole="button"
                        >
                            <MaterialCommunityIcons name="chevron-left" size={28} color="#FFFFFF" />
                        </Pressable>
                    </View>
                    <View style={styles.content}>
                        <ThemedText variant="heading">{event.name}</ThemedText>
                        <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.timeText}>
                            {`Start: ${getDateFromUTCString(event.start_time).toUTCString()}`}
                        </ThemedText>
                        <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.timeText}>
                            {`End: ${getDateFromUTCString(event.end_time).toUTCString()}`}
                        </ThemedText>
                        <RenderHtml
                            contentWidth={width - 64}
                            source={{html: event.description || '<p></p>'}}
                            baseStyle={{color: activeTheme.text.primary}}
                            tagsStyles={{
                                p: {color: activeTheme.text.primary},
                                a: {color: activeTheme.accent.primary},
                            }}
                        />
                        {renderRoutes()}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    card: {
        margin: 16,
        borderRadius: tokens.radius.lg,
        overflow: 'hidden',
    },
    bannerContainer: {
        position: 'relative',
    },
    banner: {
        width: '100%',
    },
    /* eslint-disable react-native/no-color-literals */
    backBtn: {
        position: 'absolute',
        top: 12,
        left: 12,
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: 'rgba(0,0,0,0.4)',
        alignItems: 'center',
        justifyContent: 'center',
    },
    /* eslint-enable react-native/no-color-literals */
    content: {
        padding: 16,
    },
    timeText: {
        marginTop: 4,
    },
    routesSection: {
        marginTop: 16,
    },
    routesLabel: {
        marginBottom: 4,
    },
});
