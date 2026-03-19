/* eslint-disable react-native/no-raw-text */
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, Keyboard, Platform, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from '../shared/ThemedText';
import FilterChipsRow from '../shared/FilterChipsRow';
import TranslucentSurface from '../../common/TranslucentSurface';
import ClientCard from './ClientCard';
import ScheduledCard from './ScheduledCard';
import DatePickerModal from '../shared/DatePickerModal';
import allActions from '../../redux/actions';
import {CTR, getFacilityRank} from '../../common/consts';

const aggregatedClients = (clients, filters) => {
    const atc = [];
    const pilots = [];

    if (filters.atc) {
        if (clients.airportAtc) {
            Object.values(clients.airportAtc).forEach(arr => atc.push(...arr));
        }
        if (clients.ctr) {
            Object.values(clients.ctr).forEach(arr => atc.push(...arr));
        }
    }

    if (filters.pilots) {
        pilots.push(...clients.pilots);
    }

    atc.sort((a, b) => {
        const rankDiff = getFacilityRank(a) - getFacilityRank(b);
        if (rankDiff !== 0) return rankDiff;
        return a.callsign < b.callsign ? -1 : a.callsign > b.callsign ? 1 : 0;
    });
    pilots.sort((a, b) => (a.callsign < b.callsign ? -1 : a.callsign > b.callsign ? 1 : 0));

    const result = [...atc, ...pilots];

    if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        return result.filter(c =>
            (c.callsign && c.callsign.toLowerCase().startsWith(q)) ||
            (c.name && c.name.toLowerCase().startsWith(q)) ||
            (c.cid && String(c.cid) === q)
        );
    }

    return result;
};

const parseDeptimeToDate = (deptime) => {
    if (!deptime || deptime.length < 4) {return null;}
    const h = parseInt(deptime.slice(0, 2), 10);
    const m = parseInt(deptime.slice(2, 4), 10);
    const d = new Date();
    d.setUTCHours(h, m, 0, 0);
    return d;
};

const parseDeptime = (deptime) => {
    const d = parseDeptimeToDate(deptime);
    return d ? d.getTime() : 0;
};

export {parseDeptime};

export default function VatsimListView() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();

    const clients = useSelector(state => state.vatsimLiveData.clients);
    const filters = useSelector(state => state.app.filters);
    const bookings = useSelector(state => state.vatsimLiveData.bookings);
    const prefiles = useSelector(state => state.vatsimLiveData.prefiles);

    const [mode, setMode] = useState('live');
    const [localSearch, setLocalSearch] = useState(filters.searchQuery);
    const [scheduledDateStart, setScheduledDateStart] = useState(null);
    const [scheduledDateEnd, setScheduledDateEnd] = useState(null);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [expandedKey, setExpandedKey] = useState(null);
    const [isScheduledLoaded, setIsScheduledLoaded] = useState(false);

    const debounceTimer = useRef(null);

    // Skeleton loading guard
    useEffect(() => {
        if (bookings.length > 0) {
            setIsScheduledLoaded(true);
        }
    }, [bookings]);

    useEffect(() => {
        const timer = setTimeout(() => setIsScheduledLoaded(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    // Debounce cleanup
    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const onSearchChange = (text) => {
        setLocalSearch(text);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        if (!text.trim()) {
            dispatch(allActions.appActions.searchQueryChanged(''));
            return;
        }
        debounceTimer.current = setTimeout(() => {
            dispatch(allActions.appActions.searchQueryChanged(text));
        }, 300);
    };

    const onClearSearch = () => {
        setLocalSearch('');
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        dispatch(allActions.appActions.searchQueryChanged(''));
    };

    const onItemPress = (client) => {
        Keyboard.dismiss();
        dispatch(allActions.appActions.clientSelected(client));
        if (client.latitude != null && client.longitude != null) {
            const delta = client.facility === CTR ? 8 : 0.35;
            dispatch(allActions.appActions.flyToClient({
                latitude: client.latitude,
                longitude: client.longitude,
                delta,
            }));
        }
        navigation.navigate('Map');
    };

    const handleCardPress = (key) => {
        setExpandedKey(prev => (prev === key ? null : key));
    };

    const scheduledItems = useMemo(() => {
        const bookingItems = bookings.map(b => ({...b, _type: 'booking'}));
        const prefileItems = prefiles.map(p => ({...p, _type: 'prefile'}));
        const combined = [...bookingItems, ...prefileItems];
        combined.sort((a, b) => {
            const aTime = a._type === 'booking' ? (a.start instanceof Date ? a.start.getTime() : 0) : parseDeptime(a.flight_plan?.deptime);
            const bTime = b._type === 'booking' ? (b.start instanceof Date ? b.start.getTime() : 0) : parseDeptime(b.flight_plan?.deptime);
            return (aTime || 0) - (bTime || 0);
        });
        return combined;
    }, [bookings, prefiles]);

    const filteredScheduled = useMemo(() => {
        let list = scheduledItems;

        if (scheduledDateStart) {
            const rangeStart = scheduledDateStart;
            const rangeEnd = scheduledDateEnd || scheduledDateStart;
            list = list.filter(item => {
                if (item._type === 'booking') {
                    // Booking overlaps the selected range
                    const bStart = item.start instanceof Date ? item.start : null;
                    const bEnd = item.end instanceof Date ? item.end : bStart;
                    return bStart && bStart <= rangeEnd && bEnd >= rangeStart;
                }
                // Prefile: parse deptime to today's UTC date for comparison
                const deptimeDate = parseDeptimeToDate(item.flight_plan?.deptime);
                if (!deptimeDate) {return false;}
                deptimeDate.setHours(0, 0, 0, 0);
                return deptimeDate >= rangeStart && deptimeDate <= rangeEnd;
            });
        }

        if (localSearch.trim()) {
            const q = localSearch.toLowerCase().trim();
            list = list.filter(item => item.callsign && item.callsign.toLowerCase().startsWith(q));
        }

        return list;
    }, [scheduledItems, scheduledDateStart, scheduledDateEnd, localSearch]);

    const filteredClients = aggregatedClients(clients, filters);

    const renderLiveItem = ({item}) => (
        <ClientCard client={item} onPress={() => onItemPress(item)} />
    );

    const renderScheduledItem = ({item}) => {
        const key = item._type === 'booking'
            ? `booking-${item.id ?? item.callsign}`
            : `prefile-${item.callsign}`;
        return (
            <ScheduledCard
                item={item}
                isExpanded={expandedKey === key}
                onPress={() => handleCardPress(key)}
            />
        );
    };

    const keyExtractorLive = (client, i) => `${client.callsign}${client.cid}_${i}`;
    const keyExtractorScheduled = (item) => item._type === 'booking'
        ? `booking-${item.id ?? item.callsign}`
        : `prefile-${item.callsign}`;

    const searchInputBg = activeTheme.surface.elevated;
    const searchTextColor = activeTheme.text.primary;

    const noMatchText = `No matches for ${filters.searchQuery}`;

    const formatUTCDate = (date) => {
        if (!date) return '';
        const d = date.getUTCDate();
        const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        return `${months[date.getUTCMonth()]} ${d}`;
    };

    const dateLabel = scheduledDateStart
        ? (scheduledDateEnd && scheduledDateEnd.getTime() !== scheduledDateStart.getTime()
            ? `${formatUTCDate(scheduledDateStart)} – ${formatUTCDate(scheduledDateEnd)}`
            : formatUTCDate(scheduledDateStart))
        : null;

    const renderScheduledContent = () => {
        if (!isScheduledLoaded && bookings.length === 0) {
            return (
                <View>
                    <View style={[styles.skeletonRow, {backgroundColor: activeTheme.surface.elevated}]} />
                    <View style={[styles.skeletonRow, {backgroundColor: activeTheme.surface.elevated}]} />
                    <View style={[styles.skeletonRow, {backgroundColor: activeTheme.surface.elevated}]} />
                </View>
            );
        }

        if (filteredScheduled.length === 0) {
            const emptyText = scheduledDateStart
                ? `No scheduled traffic for ${dateLabel}`
                : 'No scheduled traffic';
            return (
                <View style={styles.emptyState}>
                    <ThemedText variant="body-sm" color={activeTheme.text.muted}>{emptyText}</ThemedText>
                </View>
            );
        }

        return (
            <FlatList
                data={filteredScheduled}
                renderItem={renderScheduledItem}
                keyExtractor={keyExtractorScheduled}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={() => Keyboard.dismiss()}
            />
        );
    };

    return (
        <View style={[styles.container, {backgroundColor: activeTheme.surface.base}]}>
            {/* Single chip row: filters left, mode toggles right */}
            <View style={[styles.controlsRow, {paddingTop: insets.top + 12}]}>
                {/* Left: context chips (Pilots/ATC or date) */}
                <View style={styles.leftChips}>
                    {mode === 'live' && <FilterChipsRow />}
                    {mode === 'scheduled' && (
                        <Pressable
                            onPress={() => setShowDatePicker(true)}
                            accessibilityLabel="Filter by date"
                            style={styles.chipPressable}
                        >
                            <TranslucentSurface
                                rounded="md"
                                style={[
                                    styles.chipSurface,
                                    styles.chipBorder,
                                    {borderColor: scheduledDateStart ? activeTheme.accent.primary : activeTheme.surface.border},
                                    !scheduledDateStart && styles.chipInactive,
                                ]}
                            >
                                <MaterialCommunityIcons
                                    name="calendar"
                                    size={14}
                                    color={scheduledDateStart ? activeTheme.accent.primary : activeTheme.text.secondary}
                                />
                                <ThemedText
                                    variant="body-sm"
                                    style={styles.chipLabel}
                                    color={scheduledDateStart ? activeTheme.accent.primary : activeTheme.text.secondary}
                                >
                                    {scheduledDateStart ? dateLabel : 'Date'}
                                </ThemedText>
                                {scheduledDateStart && (
                                    <Pressable
                                        onPress={(e) => { e.stopPropagation(); setScheduledDateStart(null); setScheduledDateEnd(null); }}
                                        accessibilityLabel="Clear date filter"
                                        hitSlop={8}
                                    >
                                        <ThemedText variant="body-sm" color={activeTheme.text.muted}>×</ThemedText>
                                    </Pressable>
                                )}
                            </TranslucentSurface>
                        </Pressable>
                    )}
                </View>

                {/* Right: mode toggle chips */}
                <View style={styles.rightChips}>
                    <Pressable
                        onPress={() => setMode('live')}
                        accessibilityRole="button"
                        accessibilityLabel="Live mode"
                        accessibilityState={{selected: mode === 'live'}}
                        style={styles.chipPressable}
                    >
                        <TranslucentSurface
                            rounded="md"
                            style={[
                                styles.chipSurface,
                                styles.chipBorder,
                                {borderColor: mode === 'live' ? activeTheme.accent.primary : activeTheme.surface.border},
                                mode !== 'live' && styles.chipInactive,
                            ]}
                        >
                            <ThemedText variant="body-sm" style={styles.chipLabel} color={mode === 'live' ? activeTheme.text.primary : activeTheme.text.secondary}>Live</ThemedText>
                        </TranslucentSurface>
                    </Pressable>
                    <Pressable
                        onPress={() => setMode('scheduled')}
                        accessibilityRole="button"
                        accessibilityLabel="Scheduled mode"
                        accessibilityState={{selected: mode === 'scheduled'}}
                        style={styles.chipPressable}
                    >
                        <TranslucentSurface
                            rounded="md"
                            style={[
                                styles.chipSurface,
                                styles.chipBorder,
                                {borderColor: mode === 'scheduled' ? activeTheme.accent.primary : activeTheme.surface.border},
                                mode !== 'scheduled' && styles.chipInactive,
                            ]}
                        >
                            <ThemedText variant="body-sm" style={styles.chipLabel} color={mode === 'scheduled' ? activeTheme.text.primary : activeTheme.text.secondary}>Scheduled</ThemedText>
                        </TranslucentSurface>
                    </Pressable>
                </View>
            </View>

            {/* Search field */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, {backgroundColor: searchInputBg, color: searchTextColor, borderColor: activeTheme.surface.border}]}
                    placeholder="Search callsign..."
                    placeholderTextColor={activeTheme.text.muted}
                    value={localSearch}
                    onChangeText={onSearchChange}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
                />
                {Platform.OS !== 'ios' && localSearch.length > 0 && (
                    <Pressable onPress={onClearSearch} style={styles.clearBtn} accessibilityLabel="Clear search">
                        <ThemedText variant="body" color={activeTheme.text.muted}>×</ThemedText>
                    </Pressable>
                )}
            </View>

            {/* Content */}
            {mode === 'live' ? (
                filteredClients.length === 0 && filters.searchQuery.trim() ? (
                    <View style={styles.emptyState}>
                        <ThemedText variant="body-sm" color={activeTheme.text.muted}>{noMatchText}</ThemedText>
                    </View>
                ) : (
                    <FlatList
                        data={filteredClients}
                        renderItem={renderLiveItem}
                        keyExtractor={keyExtractorLive}
                        keyboardShouldPersistTaps="handled"
                        onScrollBeginDrag={() => Keyboard.dismiss()}
                    />
                )
            ) : (
                renderScheduledContent()
            )}

            <DatePickerModal
                visible={showDatePicker}
                startDate={scheduledDateStart}
                endDate={scheduledDateEnd}
                onConfirm={(start, end) => {
                    setScheduledDateStart(start);
                    setScheduledDateEnd(end);
                    setShowDatePicker(false);
                }}
                onDismiss={() => setShowDatePicker(false)}
                activeTheme={activeTheme}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    controlsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 4,
    },
    leftChips: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    rightChips: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    chipPressable: {
        minHeight: 44,
        justifyContent: 'center',
    },
    chipSurface: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        gap: 4,
    },
    chipBorder: {
        borderWidth: 1,
    },
    chipInactive: {
        opacity: 0.7,
    },
    chipLabel: {
        fontWeight: '500',
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
    emptyState: {
        alignItems: 'center',
        paddingTop: 32,
    },
    skeletonRow: {
        height: 80,
        borderRadius: tokens.radius.md,
        marginHorizontal: 16,
        marginVertical: 6,
        opacity: 0.5,
    },
});
