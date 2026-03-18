/* eslint-disable react-native/no-raw-text */
import React, {useEffect, useState, useMemo} from 'react';
import {FlatList, Keyboard, Modal, Platform, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {useSelector} from 'react-redux';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from '../shared/ThemedText';
import EventListItem from './EventListItem';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function sameDay(a, b) {
    return a && b
        && a.getFullYear() === b.getFullYear()
        && a.getMonth() === b.getMonth()
        && a.getDate() === b.getDate();
}

function dayOf(year, month, day) {
    const d = new Date(year, month, day);
    d.setHours(0, 0, 0, 0);
    return d;
}

function buildCalendarDays(year, month) {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
    }
    return cells;
}

// Range date picker: tap once = startDate, tap again = endDate (must be >= start), tap a third time resets
function DateRangePickerModal({visible, startDate, endDate, onConfirm, onDismiss, activeTheme}) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [viewYear, setViewYear] = useState(startDate ? startDate.getFullYear() : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(startDate ? startDate.getMonth() : today.getMonth());
    // Internal draft range while modal is open
    const [draftStart, setDraftStart] = useState(startDate || null);
    const [draftEnd, setDraftEnd] = useState(endDate || null);

    // Reset draft when modal opens
    useEffect(() => {
        if (visible) {
            setDraftStart(startDate || null);
            setDraftEnd(endDate || null);
            setViewYear(startDate ? startDate.getFullYear() : today.getFullYear());
            setViewMonth(startDate ? startDate.getMonth() : today.getMonth());
        }
    }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else { setViewMonth(m => m - 1); }
    };

    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else { setViewMonth(m => m + 1); }
    };

    const onDayPress = (day) => {
        const pressed = dayOf(viewYear, viewMonth, day);
        if (!draftStart || (draftStart && draftEnd)) {
            // Start fresh
            setDraftStart(pressed);
            setDraftEnd(null);
        } else {
            // Have start, no end
            if (pressed < draftStart) {
                setDraftStart(pressed);
                setDraftEnd(null);
            } else if (sameDay(pressed, draftStart)) {
                setDraftStart(null);
                setDraftEnd(null);
            } else {
                setDraftEnd(pressed);
            }
        }
    };

    const isDraftStart = (day) => day && draftStart && sameDay(dayOf(viewYear, viewMonth, day), draftStart);
    const isDraftEnd = (day) => day && draftEnd && sameDay(dayOf(viewYear, viewMonth, day), draftEnd);
    const isInRange = (day) => {
        if (!day || !draftStart || !draftEnd) {return false;}
        const d = dayOf(viewYear, viewMonth, day);
        return d > draftStart && d < draftEnd;
    };
    const isToday = (day) => day && sameDay(dayOf(viewYear, viewMonth, day), today);

    const cells = buildCalendarDays(viewYear, viewMonth);

    const canConfirm = draftStart != null;

    const getDayColors = (day) => {
        const start = isDraftStart(day);
        const end = isDraftEnd(day);
        const inRange = isInRange(day);
        const tod = isToday(day);

        if (start || end) {
            return {bg: activeTheme.accent.primary, text: '#FFFFFF', range: false};
        }
        if (inRange) {
            return {bg: null, text: activeTheme.text.primary, range: true};
        }
        if (tod) {
            return {bg: null, text: activeTheme.accent.primary, range: false, todayBorder: true};
        }
        return {bg: null, text: day ? activeTheme.text.primary : 'transparent', range: false};
    };

    return (
        <Modal visible={visible} transparent animationType="fade" onRequestClose={onDismiss}>
            <Pressable style={styles.modalOverlay} onPress={onDismiss}>
                <Pressable style={[styles.calendarSheet, {backgroundColor: activeTheme.surface.base}]} onPress={() => {}}>

                    <View style={styles.calendarHeader}>
                        <Pressable onPress={prevMonth} style={styles.navBtn} accessibilityLabel="Previous month">
                            <ThemedText variant="body" color={activeTheme.accent.primary}>{'‹'}</ThemedText>
                        </Pressable>
                        <ThemedText variant="body" style={styles.monthLabel}>
                            {`${MONTH_NAMES[viewMonth]} ${viewYear}`}
                        </ThemedText>
                        <Pressable onPress={nextMonth} style={styles.navBtn} accessibilityLabel="Next month">
                            <ThemedText variant="body" color={activeTheme.accent.primary}>{'›'}</ThemedText>
                        </Pressable>
                    </View>

                    <ThemedText variant="caption" color={activeTheme.text.muted} style={styles.rangeHint}>
                        {!draftStart ? 'Tap a start date' : !draftEnd ? 'Tap an end date (or confirm single day)' : 'Range selected'}
                    </ThemedText>

                    <View style={styles.dayLabelsRow}>
                        {DAY_LABELS.map(l => (
                            <View key={l} style={styles.dayCell}>
                                <ThemedText variant="caption" color={activeTheme.text.muted}>{l}</ThemedText>
                            </View>
                        ))}
                    </View>

                    <View style={styles.daysGrid}>
                        {cells.map((day, i) => {
                            const {bg, text, range, todayBorder} = getDayColors(day);
                            const endCap = isDraftEnd(day);
                            const startCap = isDraftStart(day);
                            return (
                                <View key={i} style={[styles.dayCell, range && styles.dayRangeBg]}>
                                    {range && <View style={[StyleSheet.absoluteFill, {backgroundColor: activeTheme.accent.primary, opacity: 0.15}]} />}
                                    <Pressable
                                        style={[
                                            styles.dayCellInner,
                                            bg && [styles.dayCellSelected, {backgroundColor: bg}],
                                            todayBorder && [styles.dayCellToday, {borderColor: activeTheme.accent.primary}],
                                        ]}
                                        onPress={() => day && onDayPress(day)}
                                        disabled={!day}
                                        accessibilityLabel={day ? `${day} ${MONTH_NAMES[viewMonth]}` : undefined}
                                    >
                                        <ThemedText variant="body-sm" color={text}>
                                            {day ? String(day) : ' '}
                                        </ThemedText>
                                    </Pressable>
                                    {/* Range connector strips on left/right edges */}
                                    {(range || endCap) && !startCap && (
                                        <View style={[styles.rangeConnectorLeft, {backgroundColor: activeTheme.accent.primary, opacity: 0.15}]} />
                                    )}
                                    {(range || startCap) && !endCap && (
                                        <View style={[styles.rangeConnectorRight, {backgroundColor: activeTheme.accent.primary, opacity: 0.15}]} />
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.calendarFooter}>
                        <Pressable onPress={onDismiss} style={styles.footerBtn} accessibilityLabel="Cancel">
                            <ThemedText variant="body-sm" color={activeTheme.text.secondary}>Cancel</ThemedText>
                        </Pressable>
                        <Pressable
                            onPress={() => canConfirm && onConfirm(draftStart, draftEnd || draftStart)}
                            style={[styles.footerBtn, !canConfirm && styles.footerBtnDisabled]}
                            accessibilityLabel="Confirm date range"
                            disabled={!canConfirm}
                        >
                            <ThemedText variant="body-sm" color={canConfirm ? activeTheme.accent.primary : activeTheme.text.muted}>
                                Confirm
                            </ThemedText>
                        </Pressable>
                    </View>
                </Pressable>
            </Pressable>
        </Modal>
    );
}

function formatDateRange(startDate, endDate) {
    if (!startDate) {return null;}
    const opts = {month: 'short', day: 'numeric'};
    const start = startDate.toLocaleDateString(undefined, opts);
    if (!endDate || sameDay(startDate, endDate)) {return start;}
    return `${start} – ${endDate.toLocaleDateString(undefined, opts)}`;
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

            <DateRangePickerModal
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
    // DateRangePickerModal styles
    /* eslint-disable react-native/no-color-literals */
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    calendarSheet: {
        width: 320,
        borderRadius: tokens.radius.lg,
        padding: 16,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    /* eslint-enable react-native/no-color-literals */
    calendarHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    navBtn: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    monthLabel: {
        fontWeight: '600',
    },
    rangeHint: {
        textAlign: 'center',
        marginBottom: 8,
    },
    dayLabelsRow: {
        flexDirection: 'row',
        marginBottom: 4,
    },
    daysGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    dayCell: {
        width: `${100 / 7}%`,
        aspectRatio: 1,
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
    },
    dayRangeBg: {
        // background set dynamically
    },
    dayCellInner: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    dayCellSelected: {
        // borderRadius set above in dayCellInner
    },
    dayCellToday: {
        borderWidth: 1,
    },
    rangeConnectorLeft: {
        position: 'absolute',
        left: 0,
        top: '25%',
        width: '50%',
        height: '50%',
    },
    rangeConnectorRight: {
        position: 'absolute',
        right: 0,
        top: '25%',
        width: '50%',
        height: '50%',
    },
    calendarFooter: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 8,
    },
    footerBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
    footerBtnDisabled: {
        opacity: 0.4,
    },
});
