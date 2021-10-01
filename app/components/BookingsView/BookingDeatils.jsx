import {Card, Text} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import React from 'react';

export default function BookingDetails({booking}) {
    return <Card style={styles.card}>
        <Card.Title title={booking.callsign} subtitle={booking.cid + ' - ' + booking.name} />
        <Card.Content>
            <Text>Start: {new Date(booking.time_start).toUTCString()}</Text>
            <Text>End: {new Date(booking.time_end).toUTCString()}</Text>
        </Card.Content>
    </Card>;
}
const styles = StyleSheet.create({
    card: {
        margin: 10
    }
});