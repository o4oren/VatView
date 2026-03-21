import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useTheme} from '../../common/ThemeProvider';
import {getAtcBadges} from '../../common/airportBadgeHelper';
import ListItem from '../shared/ListItem';
import ThemedText from '../shared/ThemedText';
import AirportDetailCard from '../clientDetails/AirportDetailCard';

/* eslint-disable react-native/no-raw-text */

function BadgeRow({airportAtc, activeTheme}) {
    const badges = getAtcBadges(airportAtc, activeTheme);
    const badgeStyles = badges.map(badge => ({
        ...badge,
        style: [styles.badge, {backgroundColor: badge.color}],
    }));
    const unstaffedDotStyle = React.useMemo(() => (
        [styles.dot, {backgroundColor: activeTheme.atc.airportDotUnstaffed}]
    ), [activeTheme.atc.airportDotUnstaffed]);

    if (badges.length === 0) {
        return (
            <View style={unstaffedDotStyle} />
        );
    }
    return (
        <View style={styles.badgeRowWrapper}>
            <View style={styles.badgeRow}>
                {badgeStyles.map(badge => (
                    <View key={badge.key} style={badge.style}>
                        <ThemedText variant="caption" color="#FFFFFF">{badge.letter}</ThemedText>
                    </View>
                ))}
            </View>
        </View>
    );
}

function TrafficTrailing({flights}) {
    const {activeTheme} = useTheme();
    if (!flights) {
        return (
            <View style={styles.trafficTrailing}>
                <ThemedText variant="data-sm" color={activeTheme.text.muted}>{'▲ —'}</ThemedText>
                <ThemedText variant="data-sm" color={activeTheme.text.muted}>{'▼ —'}</ThemedText>
            </View>
        );
    }
    const dep = flights.departures.length;
    const arr = flights.arrivals.length;
    return (
        <View style={styles.trafficTrailing}>
            <ThemedText variant="data-sm" color="#1A7F37">{'▲ ' + dep}</ThemedText>
            <ThemedText variant="data-sm" color="#CF222E">{'▼ ' + arr}</ThemedText>
        </View>
    );
}

export default function AirportListItem({
    airport,
    airportAtc,
    flights,
    isExpanded,
    onToggle,
    showAtc = true,
    showTraffic = true,
}) {
    const {activeTheme} = useTheme();
    const expandedContainerStyle = React.useMemo(() => (
        [styles.expandedContainer, {backgroundColor: activeTheme.surface.base}]
    ), [activeTheme.surface.base]);

    const leftSlot = showAtc ? (
        <BadgeRow airportAtc={airportAtc || []} activeTheme={activeTheme} />
    ) : null;

    const trailingSlot = showTraffic ? (
        <TrafficTrailing flights={flights} />
    ) : null;

    return (
        <View>
            <ListItem
                leftSlot={leftSlot}
                title={airport.icao}
                titleVariant="callsign"
                subtitle={airport.name}
                trailingSlot={trailingSlot}
                onPress={onToggle}
                accessibilityLabel={airport.icao + ' ' + airport.name}
            />
            {isExpanded && (
                <View style={expandedContainerStyle}>
                    <AirportDetailCard
                        airport={airport}
                        showAtc={showAtc}
                        showTraffic={showTraffic}
                        trafficCounts={flights ? {
                            departures: flights.departures.length,
                            arrivals: flights.arrivals.length,
                        } : null}
                    />
                </View>
            )}
        </View>
    );
}

/* eslint-enable react-native/no-raw-text */

const styles = StyleSheet.create({
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    badgeRowWrapper: {
        flex: 1,
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    badgeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 3,
    },
    badge: {
        paddingHorizontal: 5,
        paddingVertical: 2,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    trafficTrailing: {
        alignItems: 'flex-end',
        gap: 2,
    },
    expandedContainer: {
        paddingHorizontal: 16,
        paddingBottom: 8,
    },
});
