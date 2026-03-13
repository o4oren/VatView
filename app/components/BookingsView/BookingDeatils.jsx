import {Card, Text} from 'react-native-paper';
import {StyleSheet} from 'react-native';
import React from 'react';

export default function BookingDetails({booking}) {
    return <Card style={styles.card}>
        <Card.Title title={booking.callsign} subtitle={booking.cid} />
        <Card.Content>
            <Text>Start: {new Date(booking.start).toUTCString()}</Text>
            <Text>End: {new Date(booking.end).toUTCString()}</Text>
            <Text>Division: {booking.division} {booking.subdivision}</Text>
            <Text>Type: {booking.type}</Text>
        </Card.Content>
    </Card>;
}
const styles = StyleSheet.create({
    card: {
        margin: 10
    }
});