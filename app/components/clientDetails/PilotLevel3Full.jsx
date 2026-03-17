import React from 'react';
import {StyleSheet, View} from 'react-native';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';

const PILOT_RATINGS = {
    0: 'NEW',
    1: 'PPL',
    2: 'IR',
    3: 'CMEL',
    4: 'ATPL',
    5: 'IRS',
};

const FLIGHT_RULES = {
    'I': 'IFR',
    'V': 'VFR',
};

function formatTimeOnline(logonTime) {
    if (!logonTime) {
        return null;
    }
    const logonDate = new Date(logonTime);
    const now = new Date();
    const diffMs = now - logonDate;
    if (isNaN(diffMs) || diffMs < 0) {
        return '0m';
    }
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    if (hours > 0) {
        return hours + 'h ' + minutes + 'm';
    }
    return minutes + 'm';
}

export default function PilotLevel3Full({pilot}) {
    const {activeTheme} = useTheme();
    const fp = pilot.flight_plan;
    const timeOnline = formatTimeOnline(pilot.logon_time);
    const ratingLabel = PILOT_RATINGS[pilot.pilot_rating] || 'Unknown';
    const rulesLabel = fp ? (FLIGHT_RULES[fp.flight_rules] || fp.flight_rules) : null;

    return (
        <View
            style={styles.container}
            accessibilityLabel={
                `Full details: ` +
                (fp?.route ? `route ${fp.route}, ` : '') +
                `transponder ${pilot.transponder || 'not set'}, ` +
                `server ${pilot.server || 'unknown'}, ` +
                (timeOnline ? `time online ${timeOnline}, ` : '') +
                `pilot rating ${ratingLabel}` +
                (rulesLabel ? `, flight rules ${rulesLabel}` : '')
            }
        >
            <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

            <View style={styles.grid}>
                <DataField
                    label="SQUAWK"
                    value={pilot.transponder}
                    activeTheme={activeTheme}
                    variant="data"
                />
                <DataField
                    label="SERVER"
                    value={pilot.server}
                    activeTheme={activeTheme}
                    variant="body-sm"
                />
                <DataField
                    label="RATING"
                    value={ratingLabel}
                    activeTheme={activeTheme}
                    variant="data"
                />
                {rulesLabel && (
                    <DataField
                        label="RULES"
                        value={rulesLabel}
                        activeTheme={activeTheme}
                        variant="data"
                    />
                )}
                {timeOnline && (
                    <DataField
                        label="ONLINE"
                        value={timeOnline}
                        activeTheme={activeTheme}
                        variant="body-sm"
                    />
                )}
            </View>

            {fp && fp.remarks ? (
                <View style={styles.section}>
                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'REMARKS'}</ThemedText>
                    <ThemedText variant="data-sm">{fp.remarks}</ThemedText>
                </View>
            ) : null}
        </View>
    );
}

function DataField({label, value, activeTheme, variant}) {
    if (!value) {
        return null;
    }
    return (
        <View style={styles.dataField}>
            <ThemedText variant="caption" color={activeTheme.text.secondary}>{label}</ThemedText>
            <ThemedText variant={variant}>{value}</ThemedText>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 8,
    },
    section: {
        marginBottom: 8,
        gap: 2,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
        gap: 16,
    },
    dataField: {
        minWidth: 60,
    },
});
