import React from 'react';
import {View, StyleSheet} from 'react-native';
import ListItem from '../shared/ListItem';
import ThemedText from '../shared/ThemedText';
import {useTheme} from '../../common/ThemeProvider';
import {facilities} from '../../common/consts';

/* eslint-disable react-native/no-raw-text */

function LeftSlot({client, activeTheme}) {
    const isPilot = client.facility == null;
    if (isPilot) {
        return (
            <View style={styles.leftSlotInner}>
                <ThemedText variant="body" color={activeTheme.accent.primary}>✈</ThemedText>
            </View>
        );
    }
    const facilityShort = facilities[client.facility]?.short ?? '?';
    return (
        <View style={styles.leftSlotInner}>
            <ThemedText variant="caption" color={activeTheme.text.muted}>{facilityShort}</ThemedText>
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
    },
});
