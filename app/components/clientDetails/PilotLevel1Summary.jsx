import React from 'react';
import {Image, StyleSheet, View} from 'react-native';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';
import {airlineLogos} from '../../common/airlineLogos';

function formatAltitude(alt) {
    if (alt == null) {
        return '---';
    }
    return alt.toLocaleString('en-US');
}

export default function PilotLevel1Summary({pilot}) {
    const {activeTheme} = useTheme();
    const fp = pilot.flight_plan;
    const logo = airlineLogos[pilot.callsign.substr(0, 3)];

    if (!fp) {
        return (
            <View
                style={styles.container}
                accessibilityLabel={`Pilot ${pilot.callsign}, no flight plan filed`}
            >
                <View style={styles.topRow}>
                    <ThemedText variant="callsign">{pilot.callsign}</ThemedText>
                    {logo && <Image source={logo} style={styles.logo} />}
                </View>
                <ThemedText variant="body-sm" color={activeTheme.text.muted}>
                    {'No flight plan filed'}
                </ThemedText>
            </View>
        );
    }

    return (
        <View
            style={styles.container}
            accessibilityLabel={
                `Pilot ${pilot.callsign}, ${fp.aircraft_short}, ` +
                `from ${fp.departure} to ${fp.arrival}, ` +
                `altitude ${formatAltitude(pilot.altitude)} feet, ` +
                `groundspeed ${pilot.groundspeed} knots`
            }
        >
            <View style={styles.contentRow}>
                <View style={styles.contentMain}>
                    <View style={styles.topRow}>
                        <View style={styles.callsignRow}>
                            <ThemedText variant="callsign">{pilot.callsign}</ThemedText>
                            <ThemedText variant="data" color={activeTheme.text.secondary}>
                                {fp.aircraft_short}
                            </ThemedText>
                        </View>
                        <View style={styles.routeRow}>
                            <ThemedText variant="data">{fp.departure}</ThemedText>
                            <ThemedText variant="data-sm" color={activeTheme.text.muted}>
                                {' → '}
                            </ThemedText>
                            <ThemedText variant="data">{fp.arrival}</ThemedText>
                        </View>
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
});
