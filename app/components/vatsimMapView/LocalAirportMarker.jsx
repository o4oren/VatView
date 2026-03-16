import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { Marker } from 'react-native-maps';
import { tokens } from '../../common/themeTokens';
import { getAtcBadges } from '../../common/airportBadgeHelper';

const isAndroid = Platform.OS === 'android';

const TRAFFIC_GREEN = '#1A7F37';
const TRAFFIC_RED = '#CF222E';
const BADGE_FONT_SIZE = 9;
const ICAO_FONT_SIZE = 15;
const TRAFFIC_FONT_SIZE = 12;
const DOT_SIZE = 10;
const DOT_GAP = 3;
const BADGE_TEXT_COLOR = '#FFFFFF';

const LocalAirportMarker = React.memo(function LocalAirportMarker({
    airport,
    atcList,
    trafficInfo,
    activeTheme,
    onPress,
}) {
    const isStaffed = atcList && atcList.length > 0;
    const badges = isStaffed ? getAtcBadges(atcList, activeTheme) : [];
    const departures = trafficInfo?.departures || 0;
    const arrivals = trafficInfo?.arrivals || 0;
    const dotColor = isStaffed
        ? activeTheme.atc.airportDot
        : activeTheme.atc.airportDotUnstaffed;
    const icaoColor = dotColor;
    const hasBadges = badges.length > 0;

    const [anchor, setAnchor] = useState({ x: 0, y: hasBadges ? 0.3 : 0.5 });
    const [tracksViewChanges, setTracksViewChanges] = useState(true);
    const layoutCountRef = useRef(0);
    const containerSizeRef = useRef({ width: 0, height: 0 });
    const topRowSizeRef = useRef({ y: 0, height: 0 });

    const tryComputeAnchor = useCallback(() => {
        if (layoutCountRef.current < 2) return;
        const { width, height } = containerSizeRef.current;
        const { y: topY, height: topH } = topRowSizeRef.current;
        if (width <= 0 || height <= 0) return;
        const dotCenterX = DOT_SIZE / 2;
        const dotCenterY = topY + topH / 2;
        setAnchor({ x: dotCenterX / width, y: dotCenterY / height });
        setTracksViewChanges(false);
    }, []);

    const onContainerLayout = useCallback((e) => {
        const { width, height } = e.nativeEvent.layout;
        containerSizeRef.current = { width, height };
        layoutCountRef.current += 1;
        tryComputeAnchor();
    }, [tryComputeAnchor]);

    const onTopRowLayout = useCallback((e) => {
        const { y, height } = e.nativeEvent.layout;
        topRowSizeRef.current = { y, height };
        layoutCountRef.current += 1;
        tryComputeAnchor();
    }, [tryComputeAnchor]);

    useEffect(() => {
        if (isAndroid) {
            const timer = setTimeout(() => setTracksViewChanges(false), 200);
            return () => clearTimeout(timer);
        }
    }, []);

    return (
        <Marker
            coordinate={{ latitude: airport.latitude, longitude: airport.longitude }}
            title={airport.icao}
            anchor={anchor}
            onPress={() => onPress(airport)}
            tracksViewChanges={tracksViewChanges}
            tracksInfoWindowChanges={false}
        >
            <View style={styles.container} onLayout={onContainerLayout}>
                <View style={styles.topRow} onLayout={onTopRowLayout}>
                    <View style={[styles.dot, { backgroundColor: dotColor }]} />
                    <Text style={[styles.icao, { color: icaoColor }]}>{airport.icao}</Text>
                    {(departures > 0 || arrivals > 0) && (
                        <View style={styles.trafficRow}>
                            {departures > 0 && (
                                <Text style={styles.trafficDep}>{'▲'}{departures}</Text>
                            )}
                            {arrivals > 0 && (
                                <Text style={styles.trafficArr}>{'▼'}{arrivals}</Text>
                            )}
                        </View>
                    )}
                </View>
                {hasBadges && (
                    <View style={styles.badgeRow}>
                        {badges.map((badge) => (
                            <View
                                key={badge.key}
                                style={[
                                    styles.badgePill,
                                    { backgroundColor: badge.color },
                                ]}
                            >
                                <Text style={styles.badgeLetter}>
                                    {badge.letter}
                                </Text>
                            </View>
                        ))}
                    </View>
                )}
            </View>
        </Marker>
    );
});

export default LocalAirportMarker;

const styles = StyleSheet.create({
    container: {
        paddingRight: 4,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: DOT_SIZE,
        height: DOT_SIZE,
        borderRadius: DOT_SIZE / 2,
    },
    icao: {
        fontFamily: tokens.fontFamily.monoMedium,
        fontSize: ICAO_FONT_SIZE,
        marginLeft: DOT_GAP,
    },
    badgeRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 1,
        marginLeft: DOT_SIZE + DOT_GAP,
        gap: 3,
    },
    badgePill: {
        borderRadius: 3,
        paddingHorizontal: 5,
        paddingVertical: 1,
    },
    badgeLetter: {
        fontFamily: tokens.fontFamily.monoMedium,
        fontSize: BADGE_FONT_SIZE,
        fontWeight: '700',
        color: BADGE_TEXT_COLOR,
        lineHeight: 14,
    },
    trafficRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 6,
        gap: 4,
    },
    trafficDep: {
        fontFamily: tokens.fontFamily.monoMedium,
        fontSize: TRAFFIC_FONT_SIZE,
        fontWeight: 'bold',
        color: TRAFFIC_GREEN,
    },
    trafficArr: {
        fontFamily: tokens.fontFamily.monoMedium,
        fontSize: TRAFFIC_FONT_SIZE,
        fontWeight: 'bold',
        color: TRAFFIC_RED,
    },
});
