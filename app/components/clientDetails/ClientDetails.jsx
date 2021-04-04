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

    const renderBody = () => {
        // console.log('props', props.client);
        if(props.client === undefined)
            return;
        if(props.client.clienttype === 'PILOT') {
            return (
                <View>
                    <Card.Title
                        title = {props.client.callsign}
                        subtitle = {props.client.realname + ' (' + props.client.cid +')'}
                        left = {() => <Avatar.Image source={props.client.image} size={32} style={styles.avatar} />}
                        right = {() => <Text>{props.client.planned_aircraft}</Text>}
                    />
                    <Card.Content>
                        <Text>Position: {props.client.latitude}:{props.client.longitude}</Text>
                        <Text>Altitude: {props.client.altitude}</Text>
                        <Text>Heading: {props.client.heading}</Text>
                        <Text>Ground speed: {props.client.groundspeed}</Text>
                        <Text>Departure: {getDate(props.client.planned_deptime).toUTCString()}</Text>
                        <Text>Origin: {props.client.planned_depairport + ' ' + getAirportName(props.client.planned_depairport)}</Text>
                        <Text>Dest: {props.client.planned_destairport + ' ' + getAirportName(props.client.planned_destairport) }</Text>
                        <Text>Distance flown: {getDistanceFromAirport(props.client.planned_depairport)}</Text>
                        <Text>Distance remaining: {getDistanceFromAirport(props.client.planned_destairport)}</Text>
                        <Text>Flight plan: {props.client.planned_route}</Text>
                        <Text>Remarks: {props.client.planned_remarks}</Text>
                    </Card.Content>
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
                    <Text>{props.showAtis ? 'ATIS message: ' + props.client.atis_message : ''}</Text>
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