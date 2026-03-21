/* eslint-disable react-native/no-raw-text */
import React, {useState, useEffect} from 'react';
import {View, ScrollView, StyleSheet, Linking, Image, Platform, Pressable} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useSelector} from 'react-redux';
import Constants from 'expo-constants';
import * as Updates from 'expo-updates';
import {useTheme} from '../../common/ThemeProvider';
import ThemedText from '../shared/ThemedText';
import ThemePicker from '../shared/ThemePicker';
import {tokens} from '../../common/themeTokens';
import {getReleaseTag, FIR_GEOJSON_RELEASE_TAG_KEY, TRACON_RELEASE_TAG_KEY} from '../../common/storageService';

const Settings = () => {
    const insets = useSafeAreaInsets();
    const {activeTheme, largeFonts, toggleLargeFonts} = useTheme();
    const liveData = useSelector(state => state.vatsimLiveData);
    const [firGeoJsonReleaseTag, setFirGeoJsonReleaseTag] = useState(null);
    const [traconReleaseTag, setTraconReleaseTag] = useState(null);

    useEffect(() => {
        let isMounted = true;
        
        getReleaseTag(FIR_GEOJSON_RELEASE_TAG_KEY)
            .then(tag => {
                if (isMounted) setFirGeoJsonReleaseTag(tag);
            })
            .catch(err => console.warn('Failed to load FIR tag', err));
            
        getReleaseTag(TRACON_RELEASE_TAG_KEY)
            .then(tag => {
                if (isMounted) setTraconReleaseTag(tag);
            })
            .catch(err => console.warn('Failed to load TRACON tag', err));
            
        return () => {
            isMounted = false;
        };
    }, []);

    const rnVersion = Platform.constants?.reactNativeVersion;
    const rnStr = rnVersion
        ? `${rnVersion.major}.${rnVersion.minor}.${rnVersion.patch}`
        : 'N/A';

    const pilotCount = liveData?.clients?.pilots?.length ?? 'N/A';
    const atcCount = liveData?.clients?.controllerCount ?? 'N/A';
    const servers = liveData?.servers || [];

    return (
        <View style={[styles.container, {backgroundColor: activeTheme.surface.base}]}>
            <ScrollView
                contentContainerStyle={[
                    styles.scrollContent,
                    {paddingTop: insets.top + 12},
                ]}
            >
                {/* Header row: logo + title block */}
                <View style={styles.headerRow}>
                    <Image
                        source={require('../../../assets/icon-256.png')}
                        style={styles.logo}
                    />
                    <View style={styles.titleBlock}>
                        <ThemedText variant="heading">VatView</ThemedText>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>
                            Your mobile VATSIM companion
                        </ThemedText>
                    </View>
                </View>

                <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                {/* Appearance section */}
                <ThemedText variant="heading" style={styles.sectionHeader}>Appearance</ThemedText>
                <ThemePicker />

                <ThemedText variant="body-sm" color={activeTheme.text.secondary} style={styles.fontSizeLabel}>
                    Font size
                </ThemedText>
                <View style={styles.chipRow}>
                    {[{label: 'Default', value: false}, {label: 'Larger', value: true}].map(opt => {
                        const isActive = opt.value === largeFonts;
                        const borderColor = isActive ? activeTheme.accent.primary : activeTheme.surface.border;
                        const textColor = isActive ? activeTheme.text.primary : activeTheme.text.secondary;
                        return (
                            <Pressable
                                key={opt.label}
                                onPress={() => toggleLargeFonts(opt.value)}
                                accessibilityRole="button"
                                accessibilityLabel={`${opt.label} font size`}
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

                <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                {/* About section */}
                <ThemedText variant="heading" style={styles.sectionHeader}>About</ThemedText>
                <ThemedText variant="body-sm" color={activeTheme.text.secondary} style={styles.description}>
                    Track live VATSIM traffic, ATC coverage, ATIS, and events — all without leaving the sim. Not affiliated with VATSIM.
                </ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.attributionRow}>
                    {'Icons by '}
                    <ThemedText
                        variant="caption"
                        color={activeTheme.accent.primary}
                        onPress={() => Linking.openURL('https://www.flaticon.com/authors/freepik').catch(err => console.warn('Failed to open URL', err))}
                    >
                        Freepik
                    </ThemedText>
                    {' & '}
                    <ThemedText
                        variant="caption"
                        color={activeTheme.accent.primary}
                        onPress={() => Linking.openURL('https://www.flaticon.com/authors/roundicons').catch(err => console.warn('Failed to open URL', err))}
                    >
                        Roundicons
                    </ThemedText>
                    {' from '}
                    <ThemedText
                        variant="caption"
                        color={activeTheme.accent.primary}
                        onPress={() => Linking.openURL('https://www.flaticon.com').catch(err => console.warn('Failed to open URL', err))}
                    >
                        flaticon.com
                    </ThemedText>
                </ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.attributionRow}>
                    {'Data from '}
                    <ThemedText
                        variant="caption"
                        color={activeTheme.accent.primary}
                        onPress={() => Linking.openURL('https://github.com/vatsimnetwork/vatspy-data-project').catch(err => console.warn('Failed to open URL', err))}
                    >
                        VAT-Spy Data Project
                    </ThemedText>
                    {' & '}
                    <ThemedText
                        variant="caption"
                        color={activeTheme.accent.primary}
                        onPress={() => Linking.openURL('https://github.com/vatsimnetwork/simaware-tracon-project').catch(err => console.warn('Failed to open URL', err))}
                    >
                        SimAware TRACON Project
                    </ThemedText>
                </ThemedText>

                <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                {/* Network Status section */}
                <ThemedText variant="heading" style={styles.sectionHeader}>Network Status</ThemedText>
                <ThemedText variant="body-sm" style={styles.networkRow}>
                    {'Pilots: '}
                    <ThemedText variant="data">{String(pilotCount)}</ThemedText>
                </ThemedText>
                <ThemedText variant="body-sm" style={styles.networkRow}>
                    {'ATC: '}
                    <ThemedText variant="data">{String(atcCount)}</ThemedText>
                </ThemedText>
                {servers.map((server) => (
                    <ThemedText
                        key={server.name || server.hostname_or_ip}
                        variant="caption"
                        color={activeTheme.text.secondary}
                        style={styles.serverRow}
                    >
                        <ThemedText variant="data-sm">{server.name}</ThemedText>
                        {'  '}
                        {server.location}
                        {'  '}
                        <ThemedText variant="data-sm">{server.hostname_or_ip}</ThemedText>
                    </ThemedText>
                ))}

                <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                {/* Version section */}
                <ThemedText variant="heading" style={styles.sectionHeader}>Version</ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.versionRow}>
                    {'App: '}
                    <ThemedText variant="data-sm">{Constants.expoConfig?.version || 'N/A'}</ThemedText>
                </ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.versionRow}>
                    {'Expo SDK: '}
                    <ThemedText variant="data-sm">{Constants.expoConfig?.sdkVersion || 'N/A'}</ThemedText>
                </ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.versionRow}>
                    {'React Native: '}
                    <ThemedText variant="data-sm">{rnStr}</ThemedText>
                </ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.versionRow}>
                    {'Update Channel: '}
                    <ThemedText variant="data-sm">{Updates.channel || 'N/A'}</ThemedText>
                </ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.versionRow}>
                    {'Update ID: '}
                    <ThemedText variant="data-sm">{Updates.updateId || 'N/A'}</ThemedText>
                </ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.versionRow}>
                    {'VATSpy Boundaries: '}
                    <ThemedText variant="data-sm">{firGeoJsonReleaseTag || 'N/A'}</ThemedText>
                </ThemedText>
                <ThemedText variant="caption" color={activeTheme.text.secondary} style={styles.versionRow}>
                    {'TRACON Boundaries: '}
                    <ThemedText variant="data-sm">{traconReleaseTag || 'N/A'}</ThemedText>
                </ThemedText>

                <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                <ThemedText variant="caption" color={activeTheme.text.muted} style={styles.copyright}>
                    {`© Oren Geva 2021–${new Date().getFullYear()}`}
                </ThemedText>
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 16,
        paddingBottom: 32,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 4,
    },
    logo: {
        width: 48,
        height: 48,
        borderRadius: 10,
    },
    titleBlock: {
        flex: 1,
    },
    divider: {
        height: 1,
        marginVertical: 16,
    },
    sectionHeader: {
        marginBottom: 12,
    },
    fontSizeLabel: {
        marginTop: 16,
        marginBottom: 8,
    },
    chipRow: {
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
    description: {
        marginBottom: 8,
    },
    attributionRow: {
        marginBottom: 4,
    },
    networkRow: {
        marginBottom: 4,
    },
    serverRow: {
        marginBottom: 2,
    },
    versionRow: {
        marginBottom: 4,
    },
    copyright: {
        textAlign: 'center',
        marginTop: 8,
    },
});

export default Settings;
