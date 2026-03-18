import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Keyboard, Platform, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from '../shared/ThemedText';
import AirportListItem from './AirportListItem';
import {
    findAirportsByCodeOrNamePrefixAsync,
    getAirportsByICAOAsync,
} from '../../common/staticDataAcessLayer';

/* eslint-disable react-native/no-raw-text */

const calculateFlights = (airportIcao, pilots, prefiles) => {
    const departures = [];
    const arrivals = [];

    pilots.forEach(p => {
        if (p.flight_plan) {
            if (p.flight_plan.departure === airportIcao) {
                departures.push(p);
            }
            if (p.flight_plan.arrival === airportIcao) {
                arrivals.push(p);
            }
        }
    });

    prefiles.forEach(p => {
        if (p.flight_plan) {
            if (p.flight_plan.departure === airportIcao) {
                departures.push(p);
            }
            if (p.flight_plan.arrival === airportIcao) {
                arrivals.push(p);
            }
        }
    });

    return {departures, arrivals};
};

export default function AirportSearchList({filters = {pilots: true, atc: true}}) {
    const {activeTheme} = useTheme();
    const airportAtc = useSelector(state => state.vatsimLiveData.clients.airportAtc);
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);
    const prefiles = useSelector(state => state.vatsimLiveData.prefiles);

    const [localSearch, setLocalSearch] = useState('');
    const [filteredAirportList, setFilteredAirportList] = useState([]);
    const [expandedIcao, setExpandedIcao] = useState(null);
    const debounceTimer = useRef(null);
    const themedStyles = React.useMemo(() => ({
        searchInput: [
            styles.searchInput,
            {
                backgroundColor: activeTheme.surface.elevated,
                color: activeTheme.text.primary,
            },
        ],
    }), [activeTheme.surface.elevated, activeTheme.text.primary]);

    // Load active airports when airportAtc changes and search is empty
    useEffect(() => {
        if (!localSearch.trim() && airportAtc) {
            const activeAirportIcaos = filters.atc ? Object.keys(airportAtc) : [];
            getAirportsByICAOAsync(activeAirportIcaos)
                .then(setFilteredAirportList)
                .catch(() => setFilteredAirportList([]));
        }
    }, [airportAtc, filters.atc, localSearch]);

    // Cleanup debounce timer on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const onSearchChange = (text) => {
        const trimmedText = text.trim();
        setLocalSearch(text);
        setExpandedIcao(null);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        if (!trimmedText) {
            // Restore active airports immediately (handled by useEffect above)
            return;
        }
        if (trimmedText.length < 3) {
            setFilteredAirportList([]);
            return;
        }
        debounceTimer.current = setTimeout(() => {
            findAirportsByCodeOrNamePrefixAsync(trimmedText)
                .then(setFilteredAirportList)
                .catch(() => setFilteredAirportList([]));
        }, 300);
    };

    const onClearSearch = () => {
        setLocalSearch('');
        setExpandedIcao(null);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        // Active airports restored by useEffect
    };

    const renderItem = ({item}) => (
        <AirportListItem
            airport={item}
            airportAtc={filters.atc && (airportAtc?.[item.icao] && airportAtc[item.icao].length > 0) ? airportAtc[item.icao] : null}
            flights={filters.pilots ? calculateFlights(item.icao, pilots, prefiles) : null}
            isExpanded={expandedIcao === item.icao}
            onToggle={() => setExpandedIcao(prev => prev === item.icao ? null : item.icao)}
            showAtc={filters.atc}
            showTraffic={filters.pilots}
        />
    );

    const trimmedSearch = localSearch.trim();
    const showMinLengthHint = trimmedSearch.length > 0 && trimmedSearch.length < 3;
    const showNoResults = trimmedSearch.length >= 3 && filteredAirportList.length === 0;
    const showAtcDisabledHint = trimmedSearch.length === 0 && !filters.atc;

    return (
        <View style={styles.container}>
            <View style={styles.searchContainer}>
                <TextInput
                    style={themedStyles.searchInput}
                    placeholder="Airport ICAO, IATA or name"
                    placeholderTextColor={activeTheme.text.muted}
                    value={localSearch}
                    onChangeText={onSearchChange}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    autoCorrect={false}
                    autoCapitalize="none"
                    clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
                />
                {Platform.OS !== 'ios' && localSearch.length > 0 && (
                    <Pressable onPress={onClearSearch} style={styles.clearBtn} accessibilityLabel="Clear search">
                        <ThemedText variant="body" color={activeTheme.text.muted}>×</ThemedText>
                    </Pressable>
                )}
            </View>

            {showAtcDisabledHint && (
                <View style={styles.emptyState}>
                    <ThemedText variant="body-sm" color={activeTheme.text.muted}>
                        {'Turn on ATC to show active airports or search for an airport'}
                    </ThemedText>
                </View>
            )}

            {showMinLengthHint && (
                <View style={styles.emptyState}>
                    <ThemedText variant="body-sm" color={activeTheme.text.muted}>
                        {'Type at least 3 characters to search'}
                    </ThemedText>
                </View>
            )}

            {showNoResults && (
                <View style={styles.emptyState}>
                    <ThemedText variant="body-sm" color={activeTheme.text.muted}>
                        {'No airports found for ' + trimmedSearch}
                    </ThemedText>
                </View>
            )}

            {!showAtcDisabledHint && !showMinLengthHint && !showNoResults && (
                <FlatList
                    data={filteredAirportList}
                    renderItem={renderItem}
                    keyExtractor={item => item.icao}
                    keyboardShouldPersistTaps="handled"
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                />
            )}
        </View>
    );
}

/* eslint-enable react-native/no-raw-text */

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
    emptyState: {
        alignItems: 'center',
        paddingTop: 32,
    },
});
