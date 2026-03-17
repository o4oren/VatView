import React from 'react';
import {StyleSheet, View} from 'react-native';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';
import {useSelector} from 'react-redux';
import {FSS, facilities} from '../../common/consts';

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

export default function AtcDetailCard({atc}) {
    const {activeTheme} = useTheme();
    const uirs = useSelector(state => state.staticAirspaceData.uirs);

    const prefix = atc?.callsign ? atc.callsign.split('_')[0] : '';
    const facilityLabel = facilities[atc.facility] ? facilities[atc.facility].short : '';
    const hasAtis = atc.text_atis && atc.text_atis.length > 0;
    const atisFirstLine = hasAtis ? atc.text_atis[0] : null;
    const atisFullText = hasAtis && atc.text_atis.length > 1
        ? atc.text_atis.join('\n')
        : (hasAtis ? atc.text_atis[0] : null);

    const sectorName = atc.facility === FSS
        ? (uirs[prefix]?.name || null)
        : null;

    const ratingLabel = ATC_RATINGS[atc.rating] || null;
    const timeOnline = formatTimeOnline(atc.logon_time);
    const remarks = atc.text_atis && atc.text_atis.find(line => line.toLowerCase().startsWith('remarks:')) 
        ? atc.text_atis.find(line => line.toLowerCase().startsWith('remarks:')).replace(/remarks:\s*/i, '').trim() 
        : null;

    return (
        <View style={styles.container}>
            {/* Section 1: Peek — callsign + frequency + facility label */}
            <View>
                <View style={styles.callsignRow}>
                    <ThemedText variant="callsign">{atc.callsign}</ThemedText>
                    <ThemedText variant="data" color={activeTheme.text.secondary}>{facilityLabel}</ThemedText>
                    {hasAtis && (
                        <View style={[styles.atisDot, {backgroundColor: activeTheme.accent.primary}]} />
                    )}
                </View>
                {sectorName && (
                    <ThemedText variant="body-sm" color={activeTheme.text.secondary}>{sectorName}</ThemedText>
                )}
                <ThemedText variant="data">{atc.frequency}</ThemedText>
            </View>

            {/* Divider */}
            <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

            {/* Section 2: Half — controller name/CID, rating, time online, ATIS first line */}
            <View>
                <View style={styles.nameRow}>
                    <ThemedText variant="body-sm">{atc.name}</ThemedText>
                    <ThemedText variant="caption" color={activeTheme.text.muted}>{' (' + atc.cid + ')'}</ThemedText>
                </View>
                <View style={styles.dataGrid}>
                    <DataField label="RATING" value={ratingLabel} activeTheme={activeTheme} variant="data" />
                    <DataField label="ONLINE" value={timeOnline} activeTheme={activeTheme} variant="body-sm" />
                </View>
                {atisFirstLine && (
                    <View style={styles.atisSection}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'ATIS'}</ThemedText>
                        <ThemedText variant="data-sm">{atisFirstLine}</ThemedText>
                    </View>
                )}
            </View>

            {/* Divider */}
            <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

            {/* Section 3: Full — complete ATIS + remarks */}
            <View>
                {atisFullText && (
                    <View style={styles.atisFullSection}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'FULL ATIS'}</ThemedText>
                        <ThemedText variant="data-sm">{atisFullText}</ThemedText>
                    </View>
                )}
                {remarks && (
                    <View style={styles.remarksSection}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'REMARKS'}</ThemedText>
                        <ThemedText variant="data-sm">{remarks}</ThemedText>
                    </View>
                )}
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
    atisDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
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
    atisSection: {
        gap: 2,
        marginTop: 4,
    },
    atisFullSection: {
        gap: 2,
        marginBottom: 8,
    },
    remarksSection: {
        gap: 2,
        marginBottom: 8,
    },
});
