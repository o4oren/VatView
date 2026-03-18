import React from 'react';
import {Image, View, StyleSheet} from 'react-native';
import ListItem from '../shared/ListItem';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';
import {DEL, GND, TWR_ATIS, APP, CTR, FSS, facilities} from '../../common/consts';

/* eslint-disable react-native/no-raw-text */

const FACILITY_BADGE = {
    [DEL]:     { letter: 'C', tokenKey: 'clearance' },
    [GND]:     { letter: 'G', tokenKey: 'ground' },
    [TWR_ATIS]:{ letter: 'T', tokenKey: 'tower' },
    [APP]:     { letter: 'A', tokenKey: 'approach' },
    [CTR]:     { letter: 'E', tokenKey: 'ctr' },
    [FSS]:     { letter: 'F', tokenKey: 'fss' },
};

function LeftSlot({client, activeTheme}) {
    const isPilot = client.facility == null;
    if (isPilot) {
        if (client.image) {
            return (
                <View style={styles.leftSlotInner}>
                    <Image source={client.image} style={styles.aircraftIcon} resizeMode="contain" />
                </View>
            );
        }
        return (
            <View style={styles.leftSlotInner}>
                <ThemedText variant="body" color={activeTheme.accent.primary}>✈</ThemedText>
            </View>
        );
    }
    const badge = FACILITY_BADGE[client.facility];
    const letter = badge?.letter ?? '?';
    const color = badge ? activeTheme.atc.badge[badge.tokenKey] : activeTheme.text.muted;
    const facilityShort = facilities[client.facility]?.short ?? '';
    return (
        <View style={styles.leftSlotInner}>
            <View style={[styles.facilityBadge, {backgroundColor: color}]}>
                <ThemedText variant="caption" color="#FFFFFF" style={styles.badgeLetter}>{letter}</ThemedText>
            </View>
            {facilityShort ? (
                <ThemedText variant="caption" color={activeTheme.text.muted} style={styles.facilityLabel}>{facilityShort}</ThemedText>
            ) : null}
        </View>
    );
}

function TrailingSlot({client, activeTheme}) {
    const isPilot = client.facility == null;
    if (isPilot) {
        const fl = client.altitude != null ? `FL${Math.round(client.altitude / 100)}` : '';
        return (
            <ThemedText variant="data-sm" color={activeTheme.text.muted}>{fl}</ThemedText>
        );
    }
    return (
        <ThemedText variant="data-sm" color={activeTheme.text.muted}>{client.frequency ?? ''}</ThemedText>
    );
}

/* eslint-enable react-native/no-raw-text */

export default function ClientCard({client, onPress}) {
    const {activeTheme} = useTheme();

    const isPilot = client.facility == null;
    const subtitle = isPilot
        ? (client.flight_plan?.arrival
            ? `${client.name} → ${client.flight_plan.arrival}`
            : client.name)
        : client.name;

    return (
        <ListItem
            leftSlot={<LeftSlot client={client} activeTheme={activeTheme} />}
            title={client.callsign}
            titleVariant="callsign"
            subtitle={subtitle}
            trailingSlot={<TrailingSlot client={client} activeTheme={activeTheme} />}
            onPress={onPress}
            accessibilityLabel={client.callsign}
        />
    );
}

const styles = StyleSheet.create({
    leftSlotInner: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 40,
        height: 40,
    },
    aircraftIcon: {
        width: 28,
        height: 28,
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
});
