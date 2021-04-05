import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Caption, Card, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {calculateDistanceFromAirport, getAirportNameByCode} from '../../common/airportTools';
import FlightStatus from './FlightStatus';

export default function ClientDetails(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports);

    const getDate = time => {
        const min = time % 100;
        const hours = (time - min) / 100;
        const date = new Date();
        date.setUTCHours(hours);
        date.setUTCMinutes(min);
        return date;
    };

    const getDistanceFromAirport = (icao) => {
        const airport = airports.icao[icao];
        let distance;
        if(airport && airport.latitude) {
            distance = calculateDistanceFromAirport(props.client, airport);
        }
        if(distance)
            return <Text>{distance} nm</Text>;
    };

    const getFlightDetails = () => {
        if(props.client.flight_plan != null) {
            return <Card.Content>
                <FlightStatus pilot={props.client} />
                <Text>Flight plan:</Text>
                <Caption>{props.client.flight_plan.route}</Caption>
                <Text>Remarks:</Text>
                <Caption>{props.client.flight_plan.remarks}</Caption>
            </Card.Content>;
        }
    };

    const renderBody = () => {
        console.log(props.client);
        if(props.client == null)
            return;
        if(props.client.facility == null) {
            return (
                <View>
                    <Card.Title
                        title = {props.client.callsign}
                        subtitle = {props.client.name + ' (' + props.client.cid +')'}
                        left = {() => <Avatar.Image source={props.client.image} size={32} style={styles.avatar} />}
                        right = {() => <Text>{props.client.flight_plan != null ? props.client.flight_plan.aircraft_short : ''}</Text>}
                    />
                    {getFlightDetails()}
                </View>
            );
        }

        return (
            <View>
                <Card.Title
                    title = {props.client.callsign}
                    subtitle = {props.client.realname}
                    left = {() => <Avatar.Image source={props.client.image} size={32} style={styles.avatar} />}
                    right = {() => <Text>{props.client.frequency}</Text>}
                />
                <Card.Content>
                    {(props.client.text_atis !=null) && <Text>Message:</Text>}
                    {(props.client.text_atis !=null) && (
                        props.client.text_atis.map((line, i) => <Text key={i}>{line}</Text>)
                    )}
                </Card.Content>
            </View>
        );
    };
    return (
        <View
            style={
                {
                    backgroundColor: 'white',
                    padding: 16,
                    // height: 450,
                }
            }
        >
            {renderBody()}
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: 'white',
    },
    status: {
        flex: 1
    }
});