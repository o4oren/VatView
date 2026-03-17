import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';
import {getAirportsByICAOAsync} from '../../common/staticDataAcessLayer';
import {getDistanceFromLatLonInNm} from '../../common/timeDIstanceTools';

export default function PilotLevel2Details({pilot}) {
    const {activeTheme} = useTheme();
    const fp = pilot.flight_plan;
    const [airports, setAirports] = useState({dep: null, arr: null});

    useEffect(() => {
        let mounted = true;
        if (fp) {
            getAirportsByICAOAsync([fp.departure, fp.arrival]).then(results => {
                if (!mounted) {
                    return;
                }
                const dep = results.find(a => a.icao === fp.departure) || null;
                const arr = results.find(a => a.icao === fp.arrival) || null;
                setAirports({dep, arr});
            });
        }
        return () => { mounted = false; };
    }, [fp?.departure, fp?.arrival]);

    if (!fp) {
        return null;
    }

    let totalDist = null;
    let flownDist = null;
    let remaining = null;
    let percentage = 0;

    if (airports.dep && airports.arr) {
        totalDist = getDistanceFromLatLonInNm(
            {lat: airports.dep.latitude, lon: airports.dep.longitude},
            {lat: airports.arr.latitude, lon: airports.arr.longitude}
        );
        flownDist = getDistanceFromLatLonInNm(
            {lat: airports.dep.latitude, lon: airports.dep.longitude},
            {lat: pilot.latitude, lon: pilot.longitude}
        );
        remaining = Math.max(0, totalDist - flownDist);
        percentage = totalDist > 0 ? Math.min(100, Math.round((flownDist / totalDist) * 100)) : 0;
    }

    const enrouteTime = fp.enroute_time != null
        ? formatEnrouteTime(fp.enroute_time)
        : null;

    return (
        <View
            style={styles.container}
            accessibilityLabel={
                `Route ${fp.route || 'not available'}, ` +
                `heading ${pilot.heading} degrees` +
                (totalDist != null ? `, distance ${totalDist} nautical miles, ${remaining} remaining` : '') +
                (enrouteTime ? `, time enroute ${enrouteTime}` : '')
            }
        >
            <View style={[styles.divider, {backgroundColor: activeTheme.surface.border}]} />

            <View style={styles.dataGrid}>
                <View style={styles.dataItem}>
                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'HDG'}</ThemedText>
                    <ThemedText variant="data">{pilot.heading + '°'}</ThemedText>
                </View>
                {totalDist != null && (
                    <View style={styles.dataItem}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'DIST'}</ThemedText>
                        <ThemedText variant="data">{totalDist + ' nm'}</ThemedText>
                    </View>
                )}
                {remaining != null && (
                    <View style={styles.dataItem}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'REM'}</ThemedText>
                        <ThemedText variant="data">{remaining + ' nm'}</ThemedText>
                    </View>
                )}
                {enrouteTime && (
                    <View style={styles.dataItem}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'ETE'}</ThemedText>
                        <ThemedText variant="data">{enrouteTime}</ThemedText>
                    </View>
                )}
            </View>

            {totalDist != null && (
                <View style={styles.progressSection}>
                    <View style={styles.progressLabels}>
                        <ThemedText variant="data-sm">{fp.departure}</ThemedText>
                        <ThemedText variant="data-sm" color={activeTheme.text.muted}>
                            {percentage + '%'}
                        </ThemedText>
                        <ThemedText variant="data-sm">{fp.arrival}</ThemedText>
                    </View>
                    <View style={[styles.progressTrack, {backgroundColor: activeTheme.surface.border}]}>
                        <View
                            style={[styles.progressFill, {
                                width: percentage + '%',
                                backgroundColor: activeTheme.accent.primary,
                            }]}
                        />
                    </View>
                    {airports.dep && airports.arr && (
                        <View style={styles.progressLabels}>
                            <ThemedText variant="caption" color={activeTheme.text.muted} numberOfLines={1}>
                                {airports.dep.name}
                            </ThemedText>
                            <ThemedText variant="caption" color={activeTheme.text.muted} numberOfLines={1}>
                                {airports.arr.name}
                            </ThemedText>
                        </View>
                    )}
                </View>
            )}

            {fp.route ? (
                <View style={styles.routeSection}>
                    <ThemedText variant="caption" color={activeTheme.text.secondary}>{'ROUTE'}</ThemedText>
                    <ThemedText variant="data-sm">{fp.route}</ThemedText>
                </View>
            ) : null}
        </View>
    );
}

function formatEnrouteTime(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) {
        return h + 'h ' + m + 'm';
    }
    return m + 'm';
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 4,
    },
    divider: {
        height: StyleSheet.hairlineWidth,
        marginVertical: 8,
    },
    dataGrid: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 8,
    },
    dataItem: {
        alignItems: 'center',
    },
    progressSection: {
        marginBottom: 8,
    },
    progressLabels: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 2,
    },
    progressTrack: {
        height: 4,
        borderRadius: 2,
        overflow: 'hidden',
        marginVertical: 4,
    },
    progressFill: {
        height: 4,
        borderRadius: 2,
    },
    routeSection: {
        marginTop: 4,
        gap: 2,
    },
});
