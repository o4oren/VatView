/* eslint-disable react-native/no-raw-text */
import React, {useEffect, useState} from 'react';
import {Keyboard, Platform, Pressable, ScrollView, StyleSheet, TextInput, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {translateCondition, translateCloudCode} from '../../common/metarTools';
import {useTheme} from '../../common/ThemeProvider';
import ThemedText from '../shared/ThemedText';
import {tokens} from '../../common/themeTokens';

export default function MetarView({route}) {
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();
    const metar = useSelector(state => state.metar.metar);
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    useEffect(() => {
        if (route?.params?.icao) {
            onChangeSearch(route.params.icao);
        }
    }, [route?.params?.icao]);

    const onChangeSearch = (text) => {
        const normalizedText = text.toUpperCase();
        setSearchTerm(normalizedText);
        if (normalizedText.length === 4) {
            dispatch(allActions.metarActions.metarRequsted(normalizedText));
        }
    };

    const isLoading = searchTerm.length === 4 && Object.keys(metar).length === 0;
    const hasData = metar && Object.keys(metar).length > 0;
    const hasRawText = hasData && Boolean(metar.raw_text);
    const hasObserved = typeof metar?.observed?.toUTCString === 'function';
    const hasPressure = metar?.barometer?.hg != null && metar?.barometer?.mb != null;
    const hasTemperature = metar?.temperature?.celsius != null && metar?.temperature?.fahrenheit != null;
    const hasDewpoint = metar?.dewpoint?.celsius != null && metar?.dewpoint?.fahrenheit != null;
    const hasWind = metar?.wind?.degrees != null && metar?.wind?.speed_kts != null;
    const hasVisibility = metar?.visibility?.miles != null;
    const hasHumidity = metar?.humidity_percent != null;
    const hasDecodedFields = hasRawText
        && hasObserved
        && hasPressure
        && hasTemperature
        && hasDewpoint
        && hasWind
        && hasVisibility
        && hasHumidity;
    const isUnavailable = hasData && !hasRawText;
    const isParseFailure = hasRawText && !hasDecodedFields;
    const isFullData = hasDecodedFields;
    const gustKts = metar?.wind?.gust_kts ?? metar?.wind?.speed_kts;

    const displayMetar = () => {
        if (searchTerm.length !== 4) {
            return null;
        }

        if (isLoading) {
            return (
                <ThemedText variant="body-sm" color={activeTheme.text.muted}>
                    {'Loading...'}
                </ThemedText>
            );
        }

        if (isUnavailable) {
            return (
                <ThemedText variant="body-sm" color={activeTheme.text.muted}>
                    {'METAR unavailable for ' + searchTerm}
                </ThemedText>
            );
        }

        if (isParseFailure) {
            return (
                <View>
                    <View style={[styles.metarCard, {
                        backgroundColor: activeTheme.surface.elevated,
                        borderColor: activeTheme.surface.border,
                    }]}>
                        <ThemedText variant="data">{metar.raw_text}</ThemedText>
                    </View>
                    <ThemedText variant="body-sm" color={activeTheme.text.muted}>
                        {'Unable to parse METAR string'}
                    </ThemedText>
                </View>
            );
        }

        if (isFullData) {
            return (
                <View>
                    <View style={[styles.metarCard, {
                        backgroundColor: activeTheme.surface.elevated,
                        borderColor: activeTheme.surface.border,
                    }]}>
                        <ThemedText variant="data">{metar.raw_text}</ThemedText>
                    </View>

                    <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                    {metar.conditions && metar.conditions.length > 0 && (
                        <ThemedText variant="body-sm">
                            {metar.conditions.map(c => translateCondition(c.code)).join(' ')}
                        </ThemedText>
                    )}

                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Observed'}</ThemedText>
                    <ThemedText variant="data">{metar.observed.toUTCString()}</ThemedText>

                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Flight conditions'}</ThemedText>
                    <ThemedText variant="data">{metar.flight_category}</ThemedText>

                    <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Altimeter'}</ThemedText>
                    <ThemedText variant="data">
                        {Number(metar.barometer.hg).toFixed(2) + ' inHg / ' + Number(metar.barometer.mb).toFixed(0) + ' mb'}
                    </ThemedText>

                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Temperature'}</ThemedText>
                    <ThemedText variant="data">
                        {metar.temperature.celsius + '°C / ' + Number(metar.temperature.fahrenheit).toFixed(0) + '°F'}
                    </ThemedText>

                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Dew point'}</ThemedText>
                    <ThemedText variant="data">
                        {metar.dewpoint.celsius + '°C / ' + Number(metar.dewpoint.fahrenheit).toFixed(0) + '°F'}
                    </ThemedText>

                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Wind'}</ThemedText>
                    <ThemedText variant="data">
                        {metar.wind.degrees + '° at ' + Number(metar.wind.speed_kts).toFixed(0) + ' kts'}
                    </ThemedText>
                    {gustKts !== metar.wind.speed_kts && (
                        <>
                            <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Gusts'}</ThemedText>
                            <ThemedText variant="data">{Number(gustKts).toFixed(0) + ' kts'}</ThemedText>
                        </>
                    )}

                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Humidity'}</ThemedText>
                    <ThemedText variant="data">{Number(metar.humidity_percent).toFixed(0) + '%'}</ThemedText>

                    <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Visibility'}</ThemedText>
                    <ThemedText variant="data">{metar.visibility.miles + ' sm'}</ThemedText>

                    {metar.ceiling && (
                        <>
                            <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Ceiling'}</ThemedText>
                            <ThemedText variant="data">
                                {translateCloudCode(metar.ceiling.code) + ' at ' + metar.ceiling.feet_agl + ' ft AGL'}
                            </ThemedText>
                        </>
                    )}

                    {metar.clouds && metar.clouds.length > 0 && (
                        <View>
                            <ThemedText variant="caption" color={activeTheme.text.secondary}>{'Clouds'}</ThemedText>
                            {metar.clouds.map(layer => (
                                <ThemedText key={layer.code + layer.base_feet_agl} variant="body-sm">
                                    {translateCloudCode(layer.code) + ' at ' + layer.base_feet_agl + ' ft AGL'}
                                </ThemedText>
                            ))}
                        </View>
                    )}

                    <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

                    <ThemedText variant="caption" color={activeTheme.text.muted}>
                        {'* The weather information presented in this app is obtained via the VATSIM network API, and is for use only in a simulated flight environment. Do not use for real world aviation or other activities.'}
                    </ThemedText>
                </View>
            );
        }

        return null;
    };

    return (
        <View style={[styles.container, {backgroundColor: activeTheme.surface.base, paddingTop: insets.top}]}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, {
                        backgroundColor: activeTheme.surface.elevated,
                        color: activeTheme.text.primary,
                        borderColor: activeTheme.surface.border,
                    }]}
                    placeholder="Airport ICAO"
                    placeholderTextColor={activeTheme.text.muted}
                    value={searchTerm}
                    onChangeText={onChangeSearch}
                    autoCapitalize="characters"
                    autoCorrect={false}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
                    maxLength={4}
                />
                {Platform.OS !== 'ios' && searchTerm.length > 0 && (
                    <Pressable
                        onPress={() => setSearchTerm('')}
                        style={styles.clearBtn}
                        accessibilityLabel="Clear search"
                    >
                        <ThemedText variant="body" color={activeTheme.text.muted}>{'×'}</ThemedText>
                    </Pressable>
                )}
            </View>

            <ScrollView style={styles.textArea} contentContainerStyle={styles.scrollContent}>
                {displayMetar()}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        position: 'relative',
    },
    searchInput: {
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        fontSize: 15,
        fontFamily: tokens.fontFamily.mono,
    },
    clearBtn: {
        position: 'absolute',
        right: 28,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    textArea: {
        flex: 1,
        paddingHorizontal: 16,
    },
    scrollContent: {
        paddingBottom: 24,
    },
    metarCard: {
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 8,
        padding: 12,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 8,
    },
});
/* eslint-enable react-native/no-raw-text */
