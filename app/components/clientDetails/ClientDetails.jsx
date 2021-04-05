import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Caption, Card, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {calculateDistanceFromAirport, getAirportByCode, getAirportNameByCode} from '../../common/airportTools';
import FlightStatus from './FlightStatus';
import {getDistanceFromLatLonInNm} from '../../common/distance';

export default function ClientDetails(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports);

    const getFlightDetails = (pilot, depAirport, arrAirport) => {
        if(pilot.flight_plan != null && pilot.flown && pilot.distance) {
            return <Card.Content>
                <FlightStatus pilot={pilot} depAirport={depAirport} arrAirport={arrAirport}/>
                <Text>Flight plan:</Text>
                <Caption>{props.client.flight_plan.route}</Caption>
                <Text>Remarks:</Text>
                <Caption>{props.client.flight_plan.remarks}</Caption>
            </Card.Content>;
        }
    };

    const renderBody = () => {
        if(props.client == null)
            return;
        
        // if pilot
        if(props.client.facility == null) {
            const pilot = props.client;
            const depAriport = pilot.flight_plan && getAirportByCode(pilot.flight_plan.departure, airports);
            const arrAirport = pilot.flight_plan && getAirportByCode(pilot.flight_plan.arrival, airports);

            if(depAriport && arrAirport) {
                const distance = getDistanceFromLatLonInNm({
                    lat: depAriport.latitude,
                    lon: depAriport.longitude
                },
                {
                    lat: arrAirport.latitude,
                    lon: arrAirport.longitude
                });

                const flown = getDistanceFromLatLonInNm({
                    lat: depAriport.latitude,
                    lon: depAriport.longitude
                },
                {
                    lat: pilot.latitude,
                    lon: pilot.longitude
                });

                pilot.flown = flown;
                pilot.distance = distance;
            }

            return (
                <View>
                    <Card.Title
                        title = {pilot.callsign}
                        subtitle = {pilot.name + ' (' + pilot.cid +')'}
                        left = {() => <Avatar.Image source={pilot.image} size={32} style={styles.avatar} />}
                        right = {() => <Text>{pilot.flight_plan != null ? pilot.flight_plan.aircraft_short : ''}</Text>}
                    />
                    {getFlightDetails(pilot, depAriport, arrAirport)}
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