/* eslint-disable react-native/no-raw-text */
/* eslint-disable react-native/no-color-literals */
import React, {useEffect, useState} from 'react';
import {Modal, Pressable, StyleSheet, View} from 'react-native';
import {tokens} from '../../common/themeTokens';
import ThemedText from './ThemedText';

const MONTH_NAMES = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const DAY_LABELS = ['Su','Mo','Tu','We','Th','Fr','Sa'];

function sameDay(a, b) {
    return a && b
        && a.getUTCFullYear() === b.getUTCFullYear()
        && a.getUTCMonth() === b.getUTCMonth()
        && a.getUTCDate() === b.getUTCDate();
}

function dayOf(year, month, day) {
    return new Date(Date.UTC(year, month, day, 0, 0, 0, 0));
}

function buildCalendarDays(year, month) {
    const firstDay = new Date(Date.UTC(year, month, 1)).getUTCDay();
    const daysInMonth = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(null);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(d);
    }
    return cells;
}

/**
 * DatePickerModal — pure-JS calendar picker.
 *
 * Props:
 *   visible       {boolean}
 *   startDate     {Date|null}
 *   endDate       {Date|null}  — ignored when singleDate=true
 *   onConfirm     {(start: Date, end: Date) => void}
 *   onDismiss     {() => void}
 *   activeTheme   {object}
 *   singleDate    {boolean}  — when true, closes after first tap; onConfirm(date, date)
 */
export default function DatePickerModal({visible, startDate, endDate, onConfirm, onDismiss, activeTheme, singleDate = false}) {
    const today = new Date();
    const utcToday = new Date(Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate(), 0, 0, 0, 0));

    const [viewYear, setViewYear] = useState(startDate ? startDate.getUTCFullYear() : utcToday.getUTCFullYear());
    const [viewMonth, setViewMonth] = useState(startDate ? startDate.getUTCMonth() : utcToday.getUTCMonth());
    const [draftStart, setDraftStart] = useState(startDate || null);
    const [draftEnd, setDraftEnd] = useState(endDate || null);

    useEffect(() => {
        if (visible) {
            setDraftStart(startDate || null);
            setDraftEnd(endDate || null);
            setViewYear(startDate ? startDate.getUTCFullYear() : utcToday.getUTCFullYear());
            setViewMonth(startDate ? startDate.getUTCMonth() : utcToday.getUTCMonth());
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
        if (singleDate) {
            onConfirm(pressed, pressed);
            return;
        }
        if (!draftStart || (draftStart && draftEnd)) {
            setDraftStart(pressed);
            setDraftEnd(null);
        } else {
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
    const isToday = (day) => day && sameDay(dayOf(viewYear, viewMonth, day), utcToday);

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

    const hintText = singleDate
        ? 'Tap a date'
        : (!draftStart ? 'Tap a start date' : !draftEnd ? 'Tap an end date (or confirm single day)' : 'Range selected');

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
                        {hintText}
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
                                    {range && <View style={[StyleSheet.absoluteFill, styles.rangeOverlay, {backgroundColor: activeTheme.accent.primary}]} />}
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
                                    {(range || endCap) && !startCap && (
                                        <View style={[styles.rangeConnectorLeft, styles.rangeOverlay, {backgroundColor: activeTheme.accent.primary}]} />
                                    )}
                                    {(range || startCap) && !endCap && (
                                        <View style={[styles.rangeConnectorRight, styles.rangeOverlay, {backgroundColor: activeTheme.accent.primary}]} />
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    {!singleDate && (
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
                    )}
                </Pressable>
            </Pressable>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
    dayRangeBg: {},
    rangeOverlay: {
        opacity: 0.15,
    },
    dayCellInner: {
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 16,
    },
    dayCellSelected: {},
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
