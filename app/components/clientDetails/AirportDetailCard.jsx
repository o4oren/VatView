import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';
import {useSelector} from 'react-redux';
import {getAtcBadges} from '../../common/airportBadgeHelper';

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

export default function AirportDetailCard({airport}) {
    const {activeTheme} = useTheme();
    const airportAtc = useSelector(state => state.vatsimLiveData.clients.airportAtc);
    const trafficCounts = useSelector(state => state.vatsimLiveData.clients.trafficCounts);

    const rawControllers = airportAtc[airport.icao] || [];

    const controllers = [...rawControllers].sort((a, b) => {
        if (a.callsign.endsWith('ATIS')) {
            return 1;
        }
        return b.facility - a.facility;
    });

    const nonAtisControllers = controllers.filter(c => !c.callsign.endsWith('ATIS'));
    const atisEntries = controllers.filter(c => c.callsign.endsWith('ATIS') && c.text_atis && c.text_atis.length > 0);
    const isStaffed = nonAtisControllers.length > 0;
    const badges = getAtcBadges(rawControllers, activeTheme);

    const [metar, setMetar] = useState(null);

    useEffect(() => {
        let isMounted = true;
        setMetar(null);

        fetch('https://metar.vatsim.net/data/metar.php?id=' + airport.icao)
            .then(r => r.text())
            .then(text => {
                if (isMounted) {
                    setMetar(text.trim());
                }
            })
            .catch(() => {
                if (isMounted) {
                    setMetar(null);
                }
            });

        return () => {
            isMounted = false;
        };
    }, [airport.icao]);

    const trafficEntry = trafficCounts[airport.icao];
    const hasCounts = trafficEntry != null;
    const departures = hasCounts ? trafficEntry.departures : null;
    const arrivals = hasCounts ? trafficEntry.arrivals : null;

    return (
        <View style={styles.container}>
            {/* Section 1: Peek — ICAO + name + badge row + traffic counts */}
            <View>
                <ThemedText variant="callsign">{airport.icao}</ThemedText>
                <ThemedText variant="body-sm" color={activeTheme.text.secondary}>{airport.name}</ThemedText>
                {badges.length > 0 && (
                    <View style={styles.badgeRow}>
                        {badges.map(badge => (
                            <View
                                key={badge.key}
                                style={[styles.badge, {backgroundColor: badge.color}]}
                            >
                                <ThemedText variant="caption" color="#FFFFFF">{badge.letter}</ThemedText>
                            </View>
                        ))}
                    </View>
                )}
                <View style={styles.trafficRow}>
                    <ThemedText variant="data-sm" color="#1A7F37">{hasCounts ? '▲ ' + departures : '▲ —'}</ThemedText>
                    <ThemedText variant="data-sm" color="#CF222E">{hasCounts ? '  ▼ ' + arrivals : '  ▼ —'}</ThemedText>
                </View>
            </View>

            {/* Divider */}
            <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

            {/* Section 2: Half — ATC list or unstaffed message */}
            <View>
                {!isStaffed && (
                    <ThemedText variant="body-sm" color={activeTheme.text.muted}>{'No ATC online'}</ThemedText>
                )}
                {isStaffed && controllers.map(c => (
                    <View key={c.key || c.callsign} style={styles.controllerRow}>
                        <ThemedText variant="data-sm">{c.callsign}</ThemedText>
                        <View style={styles.controllerNameGroup}>
                            <ThemedText variant="data-sm" color={activeTheme.text.secondary}>{c.name}</ThemedText>
                            <ThemedText variant="data-sm" color={activeTheme.text.muted}>{' (' + c.cid + ')'}</ThemedText>
                        </View>
                        <ThemedText variant="data-sm" color={activeTheme.text.secondary}>{c.frequency}</ThemedText>
                    </View>
                ))}
            </View>

            {/* Divider */}
            <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

            {/* Section 3: Full — METAR + per-controller details */}
            <View>
                {metar && (
                    <View style={styles.metarRow}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'METAR'}</ThemedText>
                        <ThemedText variant="data-sm">{metar}</ThemedText>
                    </View>
                )}
                {nonAtisControllers.map(c => (
                    <View key={(c.key || c.callsign) + '_detail'} style={styles.controllerDetail}>
                        <View style={styles.controllerNameRow}>
                            <ThemedText variant="body-sm">{c.name}</ThemedText>
                            <ThemedText variant="caption" color={activeTheme.text.muted}>{' (' + c.cid + ')'}</ThemedText>
                        </View>
                        <View style={styles.dataGrid}>
                            {ATC_RATINGS[c.rating] && (
                                <View style={styles.dataField}>
                                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'RATING'}</ThemedText>
                                    <ThemedText variant="data">{ATC_RATINGS[c.rating]}</ThemedText>
                                </View>
                            )}
                            {formatTimeOnline(c.logon_time) && (
                                <View style={styles.dataField}>
                                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'ONLINE'}</ThemedText>
                                    <ThemedText variant="body-sm">{formatTimeOnline(c.logon_time)}</ThemedText>
                                </View>
                            )}
                        </View>
                    </View>
                ))}
                {atisEntries.map(a => {
                    const parts = a.callsign.split('_');
                    const label = parts.length >= 3 ? parts[1] + ' ATIS' : 'ATIS';
                    return (
                        <View key={a.key || a.callsign} style={styles.atisSection}>
                            <ThemedText variant="caption" color={activeTheme.text.secondary}>{label}</ThemedText>
                            <ThemedText variant="data-sm">{a.text_atis.join('\n')}</ThemedText>
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
    badgeRow: {
        flexDirection: 'row',
        gap: 6,
        marginTop: 4,
    },
    badge: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    trafficRow: {
        flexDirection: 'row',
        marginTop: 4,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 8,
    },
    controllerRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        justifyContent: 'space-between',
        paddingVertical: 2,
    },
    controllerNameGroup: {
        flexDirection: 'row',
        alignItems: 'baseline',
        flex: 1,
        justifyContent: 'center',
        marginHorizontal: 8,
    },
    metarRow: {
        gap: 2,
        marginBottom: 8,
    },
    controllerDetail: {
        marginTop: 6,
    },
    controllerNameRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginBottom: 4,
    },
    dataGrid: {
        flexDirection: 'row',
        gap: 16,
    },
    dataField: {
        minWidth: 60,
    },
    atisSection: {
        marginTop: 8,
        gap: 2,
    },
});
