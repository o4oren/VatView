import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Card, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {getDistanceFromLatLonInNm} from '../../common/distance';

export default function ClientDetails(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports.icao);

    const getAirportName = (icao) => {
        if(airports[icao]  !== undefined)
            return(airports[icao].name);
        return '';
    };

    const getDate = time => {
        const min = time % 100;
        const hours = (time - min) / 100;
        const date = new Date();
        date.setUTCHours(hours);
        date.setUTCMinutes(min);
        return date;
    };

    const getDistanceFromAirport = (icao) => {
        const airport = airports[icao];

        if(airport && airport.latitude) {
            return <Text>{getDistanceFromLatLonInNm({
                lat: airport.latitude,
                lon: airport.longitude
            }, {
                lat: props.client.latitude,
                lon: props.client.longitude
            })} nm</Text>;
        }
        return <Text />;
    };

    const getFlightDetails = () => {
        if(props.client.flight_plan != null) {
            return <Card.Content>
                <Text>Position: {props.client.latitude}:{props.client.longitude}</Text>
                <Text>Altitude: {props.client.altitude}</Text>
                <Text>Heading: {props.client.heading}</Text>
                <Text>Ground speed: {props.client.groundspeed}</Text>
                <Text>Departure: {getDate(props.client.flight_plan.deptime).toUTCString()}</Text>
                <Text>Origin: {props.client.flight_plan.departure + ' ' + getAirportName(props.client.flight_plan.departure)}</Text>
                <Text>Dest: {props.client.flight_plan.arrival + ' ' + getAirportName(props.client.flight_plan.arrival) }</Text>
                <Text>Distance flown: {getDistanceFromAirport(props.client.flight_plan.departure)}</Text>
                <Text>Distance remaining: {getDistanceFromAirport(props.client.flight_plan.arrival)}</Text>
                <Text>Flight plan: {props.client.flight_plan.route}</Text>
                <Text>Remarks: {props.client.flight_plan.remarks}</Text>
            </Card.Content>;
        }
    };

    const renderBody = () => {
        // console.log('props', props.client);
        if(props.client === undefined)
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
                    {(props.client.text_atis !=null) && props.client.text_atis.map((line, i) => <Text key={i}>{line}</Text>)}
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
    }
});