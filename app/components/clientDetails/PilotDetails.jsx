import React from 'react';
import {Avatar, Caption, Card, ProgressBar, Text} from 'react-native-paper';
import {getDistanceFromLatLonInNm} from '../../common/timeDIstanceTools';
import {StyleSheet, View} from 'react-native';

export default function PilotDetails(props) {
    const renderFlightDetails = () => {
        let flown, distance;
        if(props.depAirport && props.arrAirport) {
            distance = getDistanceFromLatLonInNm({
                lat: props.depAirport.latitude,
                lon: props.depAirport.longitude
            },
            {
                lat: props.arrAirport.latitude,
                lon: props.arrAirport.longitude
            });

            flown = getDistanceFromLatLonInNm({
                lat: props.depAirport.latitude,
                lon: props.depAirport.longitude
            },
            {
                lat: props.pilot.latitude,
                lon: props.pilot.longitude
            });
        }

        if(props.pilot.flight_plan != null && flown && distance) {
            return <Card.Content>
                {renderFlightStatus(flown, distance)}
                <Text>Flight plan:</Text>
                <Caption>{props.pilot.flight_plan.route}</Caption>
                <Text>Remarks:</Text>
                <Caption>{props.pilot.flight_plan.remarks}</Caption>
            </Card.Content>;
        } else {
            return <Card.Content>
                <Text>Flight plan not filed</Text>
            </Card.Content>;
        }
    };

    const renderFlightStatus = (flown, distance) => {
        return <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text>{props.depAirport.icao}</Text>
                <Text>{props.arrAirport.icao}</Text>
            </View>
            <ProgressBar
                style={styles.progress}
                progress={flown / distance}
            />
            <View style={styles.textContainer}>
                <Caption style={styles.name}>{props.depAirport.name}</Caption>
                <Caption style={styles.name}>{props.arrAirport.name}</Caption>
            </View>
            <View style={styles.textContainer}>
                <View>
                    <Text>Alt: {props.pilot.altitude} ft</Text>
                    <Text>Hdg: {props.pilot.heading}</Text>
                    <Text>Speed: {props.pilot.groundspeed} kts</Text>
                </View>
                <View>
                    <View style={styles.textContainer}>
                        <Text>Distance:</Text>
                        <Text>{distance} nm</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text>Flown:</Text>
                        <Text>{flown} nm</Text>
                    </View>
                    <View style={styles.textContainer}>
                        <Text>Remaining: </Text>
                        <Text>{distance - flown} nm</Text>
                    </View>
                </View>
            </View>
        </View>;
    };

    return (
        <View>
            <Card.Title
                style = {styles.title}
                title = {props.pilot.callsign}
                subtitle = {props.pilot.name + ' (' + props.pilot.cid +')'}
                left = {() => <Avatar.Image source={props.pilot.image} size={32} style={styles.avatar} />}
                right = {() => <Text>{props.pilot.flight_plan != null ? props.pilot.flight_plan.aircraft_short : ''}</Text>}
            />
            {renderFlightDetails()}
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: 'white',
    },
    progress: {
        flexGrow: 1,
    },
    container: {
        marginBottom: 1
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    title: {
        paddingRight: 16
    }
});