/* eslint-disable react-native/no-raw-text */
import React, {useEffect, useState, useMemo} from 'react';
import {FlatList, Keyboard, Platform, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from '../shared/ThemedText';
import EventListItem from './EventListItem';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';
import DatePickerModal from '../shared/DatePickerModal';

function sameDay(a, b) {
    return a && b
        && a.getUTCFullYear() === b.getUTCFullYear()
        && a.getUTCMonth() === b.getUTCMonth()
        && a.getUTCDate() === b.getUTCDate();
}

function formatUTCDate(date) {
    if (!date) return '';
    const d = date.getUTCDate();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[date.getUTCMonth()]} ${d}`;
}

function formatDateRange(startDate, endDate) {
    if (!startDate) {return null;}
    const start = formatUTCDate(startDate);
    if (!endDate || sameDay(startDate, endDate)) {return start;}
    return `${start} – ${formatUTCDate(endDate)}`;
}

export default function VatsimEventsView() {
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();
    const events = useSelector(state => state.vatsimLiveData.events);

    const [searchTerm, setSearchTerm] = useState('');
    const [dateStart, setDateStart] = useState(undefined);
    const [dateEnd, setDateEnd] = useState(undefined);
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (events.length > 0) {
            setIsLoaded(true);
        }
    }, [events]);

    useEffect(() => {
        const timer = setTimeout(() => setIsLoaded(true), 2000);
        return () => clearTimeout(timer);
    }, []);

    const onClearSearch = () => setSearchTerm('');

    const onClearDate = () => {
        setDateStart(undefined);
        setDateEnd(undefined);
    };

    const onConfirmRange = (start, end) => {
        setDateStart(start);
        setDateEnd(end);
        setShowDatePicker(false);
    };

    const filteredEvents = useMemo(() => {
        let list = events;
        if (searchTerm.length > 2) {
            list = events.filter(ev =>
                ev.name.toLowerCase().includes(searchTerm.toLowerCase())
                || (ev.airports && ev.airports.some(a => a.icao === searchTerm.toUpperCase()))
            );
        }
        if (dateStart) {
            const rangeStart = dateStart;
            const rangeEnd = dateEnd || dateStart;
            list = list.filter(ev => {
                const evStart = getDateFromUTCString(ev.start_time);
                const evEnd = getDateFromUTCString(ev.end_time);
                evStart.setHours(0, 0, 0, 0);
                evEnd.setHours(23, 59, 59, 999);
                // Event overlaps the selected range
                return evStart <= rangeEnd && evEnd >= rangeStart;
            });
        }
        return list;
    }, [events, searchTerm, dateStart, dateEnd]);

    const hasFilter = searchTerm.length > 2 || !!dateStart;
    const dateLabel = formatDateRange(dateStart, dateEnd);

    const renderItem = ({item}) => <EventListItem event={item} />;

    const renderContent = () => {
        if (!isLoaded && events.length === 0) {
            return (
                <View>
                    <View style={[styles.skeletonRow, {backgroundColor: activeTheme.surface.elevated}]} />
                    <View style={[styles.skeletonRow, {backgroundColor: activeTheme.surface.elevated}]} />
                    <View style={[styles.skeletonRow, {backgroundColor: activeTheme.surface.elevated}]} />
                </View>
            );
        }

        if (filteredEvents.length === 0) {
            return (
                <View style={styles.emptyState}>
                    <ThemedText variant="body-sm" color={activeTheme.text.muted}>
                        {hasFilter ? `No matches for "${searchTerm || dateLabel}"` : 'No upcoming events'}
                    </ThemedText>
                </View>
            );
        }

        return (
            <FlatList
                data={filteredEvents}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
                keyboardShouldPersistTaps="handled"
                onScrollBeginDrag={() => Keyboard.dismiss()}
            />
        );
    };

    return (
        <View style={[styles.container, {backgroundColor: activeTheme.surface.base}]}>
            <View style={[styles.searchContainer, {paddingTop: insets.top + 12}]}>
                <View style={styles.searchRow}>
                    <TextInput
                        style={[
                            styles.searchInput,
                            {
                                backgroundColor: activeTheme.surface.elevated,
                                color: activeTheme.text.primary,
                                borderColor: activeTheme.surface.border,
                            },
                        ]}
                        placeholder="Event name or airport"
                        placeholderTextColor={activeTheme.text.muted}
                        value={searchTerm}
                        onChangeText={setSearchTerm}
                        autoCorrect={false}
                        returnKeyType="done"
                        onSubmitEditing={() => Keyboard.dismiss()}
                        clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
                    />
                    {Platform.OS !== 'ios' && searchTerm.length > 0 && (
                        <Pressable onPress={onClearSearch} style={styles.clearBtn} accessibilityLabel="Clear search">
                            <ThemedText variant="body" color={activeTheme.text.muted}>×</ThemedText>
                        </Pressable>
                    )}
                </View>
                <View style={styles.calendarRow}>
                    <Pressable
                        onPress={() => setShowDatePicker(true)}
                        style={styles.calendarBtn}
                        accessibilityLabel="Filter by date"
                    >
                        <MaterialCommunityIcons
                            name="calendar"
                            size={18}
                            color={dateStart ? activeTheme.accent.primary : activeTheme.text.secondary}
                        />
                    </Pressable>
                    {dateStart ? (
                        <>
                            <ThemedText variant="caption" color={activeTheme.accent.primary}>
                                {dateLabel}
                            </ThemedText>
                            <Pressable onPress={onClearDate} style={styles.clearDateBtn} accessibilityLabel="Clear date filter">
                                <ThemedText variant="caption" color={activeTheme.text.muted}>{'×'}</ThemedText>
                            </Pressable>
                        </>
                    ) : null}
                </View>
            </View>

            <DatePickerModal
                visible={showDatePicker}
                startDate={dateStart}
                endDate={dateEnd}
                onConfirm={onConfirmRange}
                onDismiss={() => setShowDatePicker(false)}
                activeTheme={activeTheme}
            />

            {renderContent()}
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
        paddingBottom: 8,
    },
    searchRow: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    searchInput: {
        flex: 1,
        height: 40,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 12,
        fontSize: 15,
        fontFamily: tokens.fontFamily.mono,
    },
    clearBtn: {
        position: 'absolute',
        right: 0,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 12,
    },
    calendarRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 4,
        gap: 6,
    },
    calendarBtn: {
        padding: 2,
    },
    clearDateBtn: {
        padding: 2,
    },
    skeletonRow: {
        height: 80,
        borderRadius: tokens.radius.md,
        marginHorizontal: 16,
        marginVertical: 6,
        opacity: 0.5,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 32,
    },
});
