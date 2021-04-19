import {Card, Paragraph, Text} from 'react-native-paper';
import React from 'react';

export default function AirportListItem({airport, country, airportAtc, flights}) {
    console.log('f', flights);
    return <Card>
        <Card.Title title={airport.icao} subtitle={airport.name +', ' + country} />
        <Card.Content>
            <Text>ATC: {airportAtc ? airportAtc.length : null}</Text>
            <Text>Departures: {flights.departures.length} Arrival: {flights.arrivals.length}</Text>
        </Card.Content>
    </Card>;
}