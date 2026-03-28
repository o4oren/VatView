import React, {useEffect, useState} from 'react';
import {Image, StyleSheet, View} from 'react-native';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';
import {airlineLogos} from '../../common/airlineLogos';
import {getAirportsByICAOAsync} from '../../common/staticDataAcessLayer';
import {getDistanceFromLatLonInNm, getZuluTimeFromDate} from '../../common/timeDIstanceTools';

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

function formatAltitude(alt) {
    if (alt == null) {
        return '---';
    }
    return alt.toLocaleString('en-US');
}

// enrouteTime is VATSIM HHMM format (e.g. 130 = 1h 30m)
function etaFromFiledEnroute(enrouteTime) {
    const h = Math.floor(enrouteTime / 100);
    const m = enrouteTime % 100;
    const eta = new Date();
    eta.setUTCHours(eta.getUTCHours() + h, eta.getUTCMinutes() + m);
    return getZuluTimeFromDate(eta);
}

function etaFromRemainingAndSpeed(remainingNm, groundspeed) {
    if (!groundspeed || groundspeed < 30) {
        return null;
    }
    const minutesRemaining = (remainingNm / groundspeed) * 60;
    const eta = new Date();
    eta.setUTCMinutes(eta.getUTCMinutes() + Math.round(minutesRemaining));
    return getZuluTimeFromDate(eta);
}

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

export default function PilotDetailCard({pilot}) {
    const {activeTheme} = useTheme();
    const fp = pilot.flight_plan;
    const logo = pilot.callsign ? airlineLogos[pilot.callsign.substring(0, 3)] : null;
    const [airports, setAirports] = useState({dep: null, arr: null});

    useEffect(() => {
        let mounted = true;
        if (fp) {
            const icaoList = [fp.departure, fp.arrival].filter(Boolean);
            if (icaoList.length > 0) {
                getAirportsByICAOAsync(icaoList).then(results => {
                    if (!mounted) {
                        return;
                    }
                    const dep = results.find(a => a.icao === fp.departure) || null;
                    const arr = results.find(a => a.icao === fp.arrival) || null;
                    setAirports({dep, arr});
                });
            }
        }
        return () => { mounted = false; };
    }, [fp?.departure, fp?.arrival]);

    // Distance and progress calculations
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

    // Airborne: use remaining distance + current groundspeed
    // Pre-departure/on-ground: fall back to filed enroute time
    const eta = remaining != null && pilot.groundspeed >= 30
        ? etaFromRemainingAndSpeed(remaining, pilot.groundspeed)
        : (fp?.enroute_time != null ? etaFromFiledEnroute(fp.enroute_time) : null);

    const timeOnline = formatTimeOnline(pilot.logon_time);
    const ratingLabel = PILOT_RATINGS[pilot.pilot_rating] || 'Unknown';
    const rulesLabel = fp ? (FLIGHT_RULES[fp.flight_rules] || fp.flight_rules) : null;

    return (
        <View style={styles.container}>
            {/* Section 1: Peek — Summary */}
            <View
                accessible={true}
                accessibilityLabel={
                    `Pilot ${pilot.callsign}, ` +
                    (fp ? `${fp.aircraft_short || 'unknown aircraft'}, from ${fp.departure || 'unknown'} to ${fp.arrival || 'unknown'}, ` : 'no flight plan filed, ') +
                    `altitude ${formatAltitude(pilot.altitude)} feet, ` +
                    `groundspeed ${pilot.groundspeed} knots`
                }
            >
                <View style={styles.contentRow}>
                    <View style={styles.contentMain}>
                        <View style={styles.topRow}>
                            <View style={styles.callsignRow}>
                                <ThemedText variant="callsign">{pilot.callsign}</ThemedText>
                                {fp && (
                                    <ThemedText variant="data" color={activeTheme.text.secondary}>
                                        {fp.aircraft_short}
                                    </ThemedText>
                                )}
                            </View>
                            {fp && (
                                <View style={styles.routeRow}>
                                    <ThemedText variant="data">{fp.departure}</ThemedText>
                                    <ThemedText variant="data-sm" color={activeTheme.text.muted}>
                                        {' → '}
                                    </ThemedText>
                                    <ThemedText variant="data">{fp.arrival}</ThemedText>
                                </View>
                            )}
                        </View>
                        <View style={styles.dataRow}>
                            <ThemedText variant="data">
                                {formatAltitude(pilot.altitude)}
                                <ThemedText variant="data-sm" color={activeTheme.text.secondary}>{' ft'}</ThemedText>
                            </ThemedText>
                            <ThemedText variant="data">
                                {pilot.groundspeed}
                                <ThemedText variant="data-sm" color={activeTheme.text.secondary}>{' kts'}</ThemedText>
                            </ThemedText>
                        </View>
                    </View>
                    {logo && <Image source={logo} style={styles.logo} />}
                </View>
                <View style={styles.nameRow}>
                    <ThemedText variant="body-sm" color={activeTheme.text.secondary}>
                        {pilot.name}
                    </ThemedText>
                    <ThemedText variant="caption" color={activeTheme.text.muted}>
                        {' (' + pilot.cid + ')'}
                    </ThemedText>
                </View>
                {!fp && (
                    <ThemedText variant="body-sm" color={activeTheme.text.muted} style={styles.noFpText}>
                        {'No flight plan filed'}
                    </ThemedText>
                )}
            </View>

            {/* Section 2: Half — Route Details */}
            {fp && (
                <View
                    accessible={true}
                    accessibilityLabel={
                        `Route ${fp.route || 'not available'}, ` +
                        `heading ${pilot.heading} degrees` +
                        (totalDist != null ? `, distance ${totalDist} nautical miles, ${remaining} remaining` : '') +
                        (eta ? `, ETA ${eta}` : '')
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
                        {eta && (
                            <View style={styles.dataItem}>
                                <ThemedText variant="caption" color={activeTheme.text.secondary}>{'ETA'}</ThemedText>
                                <ThemedText variant="data">{eta}</ThemedText>
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
                            <ThemedText variant="caption" color={activeTheme.text.secondary}>{'FLIGHT PLAN'}</ThemedText>
                            <ThemedText variant="data-sm">{fp.route}</ThemedText>
                        </View>
                    ) : null}
                </View>
            )}

            {/* Section 3: Full — Flight Details */}
            <View
                accessible={true}
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

                <View style={styles.fullGrid}>
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

                {fp?.remarks ? (
                    <View style={styles.remarksSection}>
                        <ThemedText variant="caption" color={activeTheme.text.secondary}>{'REMARKS'}</ThemedText>
                        <ThemedText variant="data-sm">{fp.remarks}</ThemedText>
                    </View>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingVertical: 8,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    contentMain: {
        flex: 1,
    },
    topRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    callsignRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 8,
    },
    routeRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dataRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 6,
    },
    nameRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        marginTop: 4,
    },
    logo: {
        width: 40,
        height: 40,
        marginLeft: 8,
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
    fullGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 8,
        gap: 16,
    },
    dataField: {
        minWidth: 60,
    },
    remarksSection: {
        marginBottom: 8,
        gap: 2,
    },
    noFpText: {
        marginTop: 8,
    },
});
