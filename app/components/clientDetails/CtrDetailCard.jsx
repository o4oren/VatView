import React from 'react';
import {StyleSheet, View} from 'react-native';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';
import {useSelector} from 'react-redux';
import {getFirFromPrefix} from '../../common/firResolver';

const ATC_RATINGS = {
    1: 'S1',
    2: 'S2',
    3: 'S3',
    4: 'C1',
    5: 'C3',
    7: 'I1',
    8: 'I3',
    10: 'SUP',
    11: 'ADM',
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

export default function CtrDetailCard({ctr, prefix}) {
    const {activeTheme} = useTheme();
    const firs = useSelector(state => state.staticAirspaceData.firs);

    if (!ctr || ctr.length === 0) {
        return null; // Return nothing if ctr is empty
    }

    const primary = ctr[0];
    const fir = getFirFromPrefix(prefix, firs);
    const sectorName = fir?.name || prefix;

    const ratingLabel = ATC_RATINGS[primary.rating] || null;
    const timeOnline = formatTimeOnline(primary.logon_time);

    return (
        <View style={styles.container}>
            {/* Section 1: Peek — primary callsign + CTR label + sector name + frequency */}
            <View>
                <View style={styles.callsignRow}>
                    <ThemedText variant="callsign">{primary.callsign}</ThemedText>
                    <ThemedText variant="data" color={activeTheme.text.secondary}>{'CTR'}</ThemedText>
                </View>
                <ThemedText variant="body-sm" color={activeTheme.text.secondary}>{sectorName}</ThemedText>
                <ThemedText variant="data">{primary.frequency}</ThemedText>
            </View>

            {/* Divider */}
            <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

            {/* Section 2: Half — primary controller details + all FIR controllers list */}
            <View>
                <View style={styles.nameRow}>
                    <ThemedText variant="body-sm">{primary.name}</ThemedText>
                    <ThemedText variant="caption" color={activeTheme.text.muted}>{' (' + primary.cid + ')'}</ThemedText>
                </View>
                <View style={styles.dataGrid}>
                    <DataField label="RATING" value={ratingLabel} activeTheme={activeTheme} variant="data" />
                    <DataField label="ONLINE" value={timeOnline} activeTheme={activeTheme} variant="body-sm" />
                </View>
                {ctr.length > 0 && (
                    <View style={styles.controllerList}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'CONTROLLERS'}</ThemedText>
                        {ctr.map(c => (
                            <View key={c.key || c.callsign} style={styles.controllerRow}>
                                <ThemedText variant="data-sm">{c.callsign}</ThemedText>
                                <ThemedText variant="data-sm" color={activeTheme.text.secondary}>{c.frequency}</ThemedText>
                            </View>
                        ))}
                    </View>
                )}
            </View>

            {/* Divider */}
            <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

            {/* Section 3: Full — ATIS text for each controller that has it + any remarks */}
            <View>
                {ctr.map(c => {
                    const hasAtis = c.text_atis && c.text_atis.length > 0;
                    const remarks = hasAtis && c.text_atis.find(line => line.toLowerCase().startsWith('remarks:')) 
                        ? c.text_atis.find(line => line.toLowerCase().startsWith('remarks:')).replace(/remarks:\s*/i, '').trim() 
                        : null;

                    return (
                        <View key={(c.key || c.callsign) + '_details'} style={styles.controllerDetailsSection}>
                            {hasAtis && (
                                <View style={styles.atisSection}>
                                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{c.callsign + ' ATIS'}</ThemedText>
                                    <ThemedText variant="data-sm">{c.text_atis.join('\n')}</ThemedText>
                                </View>
                            )}
                            {remarks && (
                                <View style={styles.remarksSection}>
                                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{c.callsign + ' REMARKS'}</ThemedText>
                                    <ThemedText variant="data-sm">{remarks}</ThemedText>
                                </View>
                            )}
                        </View>
                    );
                })}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    callsignRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 6,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 8,
    },
    dataGrid: {
        flexDirection: 'row',
        gap: 16,
        marginBottom: 6,
    },
    dataField: {
        minWidth: 60,
    },
    controllerList: {
        marginTop: 4,
        gap: 4,
    },
    controllerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    controllerDetailsSection: {
        marginBottom: 8,
    },
    atisSection: {
        gap: 2,
        marginBottom: 4,
    },
    remarksSection: {
        gap: 2,
        marginBottom: 4,
    },
});
