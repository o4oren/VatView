import {Card} from 'react-native-paper';
import {StyleSheet, Text, View} from 'react-native';
import React from 'react';

export default function BookingDetails({booking}) {
    return <Card style={styles.card}>
        <Text>Callsign: {booking.callsign}</Text>
        <Text>Name: {booking.name}</Text>
        <Text>CID: {booking.cid}</Text>
        <Text>Start: {booking.time_start}</Text>
        <Text>end: {booking.time_end}</Text>
    </Card>;
}
const styles = StyleSheet.create({
    card: {
        margin: 10
    }
});