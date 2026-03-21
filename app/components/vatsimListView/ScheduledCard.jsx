/* eslint-disable react-native/no-raw-text */
import React from 'react';
import {Image, LayoutAnimation, Pressable, StyleSheet, View} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from '../shared/ThemedText';
import {getAircraftIcon} from '../../common/iconsHelper';
import {DEL, GND, TWR_ATIS, APP, CTR, FSS, facilities} from '../../common/consts';

const FACILITY_BADGE = {
    [DEL]:      { letter: 'C', tokenKey: 'clearance' },
    [GND]:      { letter: 'G', tokenKey: 'ground' },
    [TWR_ATIS]: { letter: 'T', tokenKey: 'tower' },
    [APP]:      { letter: 'A', tokenKey: 'approach' },
    [CTR]:      { letter: 'E', tokenKey: 'ctr' },
    [FSS]:      { letter: 'F', tokenKey: 'fss' },
};

const SUFFIX_TO_FACILITY = {
    '_DEL':  DEL,
    '_GND':  GND,
    '_TWR':  TWR_ATIS,
    '_ATIS': TWR_ATIS,
    '_APP':  APP,
    '_DEP':  APP,
    '_CTR':  CTR,
    '_FSS':  FSS,
};

function facilityFromCallsign(callsign) {
    if (!callsign) {return null;}
    const upper = callsign.toUpperCase();
    for (const suffix of Object.keys(SUFFIX_TO_FACILITY)) {
        if (upper.endsWith(suffix)) {return SUFFIX_TO_FACILITY[suffix];}
    }
    return null;
}

function LeftSlot({item, activeTheme}) {
    if (item._type === 'booking') {
        const facilityNum = facilityFromCallsign(item.callsign);
        let badge = facilityNum != null ? FACILITY_BADGE[facilityNum] : null;
        let facilityShort = facilityNum != null ? (facilities[facilityNum]?.short ?? '') : '';

        if (facilityNum === TWR_ATIS && typeof item.callsign === 'string' && item.callsign.toUpperCase().endsWith('ATIS')) {
            badge = { letter: 'A', tokenKey: 'atis' };
            facilityShort = 'ATIS';
        }

        const letter = badge?.letter ?? '?';
        const color = badge ? activeTheme.atc.badge[badge.tokenKey] : activeTheme.text.muted;
        return (
            <View style={styles.leftSlot}>
                <View style={[styles.facilityBadge, {backgroundColor: color}]}>
                    <ThemedText variant="caption" color="#FFFFFF" style={styles.badgeLetter}>{letter}</ThemedText>
                </View>
                {facilityShort ? (
                    <ThemedText variant="caption" color={activeTheme.text.muted} style={styles.facilityLabel}>{facilityShort}</ThemedText>
                ) : null}
            </View>
        );
    }
    // prefile
    const fp = item.flight_plan || {};
    const [image] = getAircraftIcon(fp.aircraft);
    if (image) {
        return (
            <View style={styles.leftSlot}>
                <Image source={image} style={styles.aircraftIcon} resizeMode="contain" />
            </View>
        );
    }
    return (
        <View style={styles.leftSlot}>
            <ThemedText variant="body" color={activeTheme.accent.primary}>✈</ThemedText>
        </View>
    );
}

function formatUTCTime(date) {
    if (!date) {return '?';}
    return date.toUTCString().slice(17, 22);
}

function formatUTCDate(date) {
    if (!date) {return '';}
    const d = date.getUTCDate();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${d} ${months[date.getUTCMonth()]}`;
}

function formatDeptime(deptime) {
    if (!deptime || deptime.length < 4) {return '';}
    return `${deptime.slice(0, 2)}:${deptime.slice(2, 4)} UTC`;
}

function ExpandedFields({item, activeTheme}) {
    if (item._type === 'booking') {
        const fields = [
            {label: 'ID', value: item.id != null ? String(item.id) : null},
            {label: 'Type', value: item.type || null},
            {label: 'Division', value: item.division || null},
            {label: 'Subdivision', value: item.subdivision || null},
            {label: 'Start', value: item.start ? `${formatUTCTime(item.start)} UTC` : null},
            {label: 'End', value: item.end ? `${formatUTCTime(item.end)} UTC` : null},
        ].filter(f => f.value != null);
        return (
            <View style={[styles.expandedSection, {borderTopColor: activeTheme.surface.border}]}>
                {fields.map(f => (
                    <View key={f.label} style={styles.fieldRow}>
                        <ThemedText variant="caption" color={activeTheme.text.muted} style={styles.fieldLabel}>{f.label}</ThemedText>
                        <ThemedText variant="data-sm" color={activeTheme.text.primary} style={styles.fieldValue}>{f.value}</ThemedText>
                    </View>
                ))}
            </View>
        );
    }
    // prefile
    const fp = item.flight_plan || {};
    const fields = [
        {label: 'CID', value: item.cid != null ? String(item.cid) : null},
        {label: 'Name', value: item.name || null},
        {label: 'Departure', value: fp.departure || null},
        {label: 'Arrival', value: fp.arrival || null},
        {label: 'Aircraft', value: fp.aircraft || null},
        {label: 'EOBT', value: fp.deptime ? formatDeptime(fp.deptime) : null},
        {label: 'ETE', value: fp.ete || null},
        {label: 'Route', value: fp.route || null},
        {label: 'Altitude', value: fp.altitude || null},
    ].filter(f => f.value != null);
    return (
        <View style={[styles.expandedSection, {borderTopColor: activeTheme.surface.border}]}>
            {fields.map(f => (
                <View key={f.label} style={styles.fieldRow}>
                    <ThemedText variant="caption" color={activeTheme.text.muted} style={styles.fieldLabel}>{f.label}</ThemedText>
                    <ThemedText variant="data-sm" color={activeTheme.text.primary} style={styles.fieldValue}>{f.value}</ThemedText>
                </View>
            ))}
        </View>
    );
}

export default function ScheduledCard({item, isExpanded, onPress}) {
    const {activeTheme} = useTheme();

    const handlePress = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        onPress();
    };

    const renderCollapsed = () => {
        if (item._type === 'booking') {
            const date = formatUTCDate(item.start);
            const timeWindow = `${formatUTCTime(item.start)} – ${formatUTCTime(item.end)} UTC`;
            const subtitle = [item.type, item.division, item.subdivision].filter(Boolean).join(' · ');
            return (
                <>
                    <View style={styles.cardRow}>
                        <ThemedText variant="data" style={styles.callsign} color={activeTheme.text.primary}>{item.callsign}</ThemedText>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{date}</ThemedText>
                    </View>
                    <View style={styles.cardRow}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{timeWindow}</ThemedText>
                    </View>
                    {subtitle ? (
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{subtitle}</ThemedText>
                    ) : null}
                </>
            );
        }
        // prefile
        const fp = item.flight_plan || {};
        const route = fp.departure && fp.arrival ? `${fp.departure} → ${fp.arrival}` : null;
        const eobt = fp.deptime ? formatDeptime(fp.deptime) : null;
        return (
            <>
                <View style={styles.cardRow}>
                    <ThemedText variant="data" style={styles.callsign} color={activeTheme.text.primary}>{item.callsign}</ThemedText>
                    {eobt ? <ThemedText variant="caption" color={activeTheme.text.secondary}>{eobt}</ThemedText> : null}
                </View>
                <View style={styles.cardRow}>
                    {route ? <ThemedText variant="caption" color={activeTheme.text.secondary}>{route}</ThemedText> : null}
                    {(fp.aircraft_short || fp.aircraft) ? <ThemedText variant="data" color={activeTheme.text.secondary}>{fp.aircraft_short || fp.aircraft}</ThemedText> : null}
                </View>
            </>
        );
    };

    return (
        <Pressable
            onPress={handlePress}
            style={[
                styles.card,
                isExpanded ? styles.cardExpanded : styles.cardCollapsed,
                {
                    backgroundColor: activeTheme.surface.elevated,
                    borderColor: isExpanded ? activeTheme.accent.primary : activeTheme.surface.border,
                },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`${item._type === 'booking' ? 'Booking' : 'Prefile'}: ${item.callsign}`}
        >
            <View style={styles.cardBody}>
                <LeftSlot item={item} activeTheme={activeTheme} />
                <View style={styles.cardContent}>
                    {renderCollapsed()}
                    {isExpanded && <ExpandedFields item={item} activeTheme={activeTheme} />}
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        marginHorizontal: 16,
        marginVertical: 4,
        borderRadius: tokens.radius.md,
        padding: 12,
    },
    cardBody: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    leftSlot: {
        width: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 8,
    },
    facilityBadge: {
        borderRadius: 3,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    badgeLetter: {
        fontFamily: 'JetBrainsMono_500Medium',
        fontSize: 9,
        fontWeight: '700',
        lineHeight: 14,
    },
    facilityLabel: {
        marginTop: 2,
        fontSize: 8,
    },
    aircraftIcon: {
        width: 28,
        height: 28,
    },
    cardContent: {
        flex: 1,
    },
    cardRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 2,
    },
    callsign: {
        fontWeight: '600',
    },
    cardCollapsed: {
        borderWidth: 1,
    },
    cardExpanded: {
        borderWidth: 1.5,
    },
    expandedSection: {
        marginTop: 10,
        paddingTop: 8,
        borderTopWidth: StyleSheet.hairlineWidth,
        gap: 4,
    },
    fieldRow: {
        flexDirection: 'row',
        gap: 8,
        alignItems: 'flex-start',
    },
    fieldLabel: {
        width: 72,
    },
    fieldValue: {
        flex: 1,
    },
});
