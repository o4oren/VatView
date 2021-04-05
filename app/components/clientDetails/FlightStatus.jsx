import React from 'react';
import {useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';
import {Caption, ProgressBar, Text} from 'react-native-paper';
import {getDistanceFromLatLonInNm} from '../../common/distance';
import {StyleSheet, View} from 'react-native';

export default function FlightStatus(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const pilot = props.pilot;
    
    const departure = getAirportByCode(pilot.flight_plan.departure, airports);
    const arrival = getAirportByCode(pilot.flight_plan.arrival, airports);

    const routeDistance = getDistanceFromLatLonInNm({
        lat: departure.latitude,
        lon: departure.longitude
    },
    {
        lat: arrival.latitude,
        lon: arrival.longitude
    });

    const distanceTraveled = getDistanceFromLatLonInNm({
        lat: departure.latitude,
        lon: departure.longitude
    },
    {
        lat: pilot.latitude,
        lon: pilot.longitude
    });

    const percentTraveled = distanceTraveled / routeDistance;
    console.log('p', percentTraveled);
    return <View style={styles.container}>
        <View style={styles.textContainer}>
            <Text>{departure.icao}</Text>
            <Text>{arrival.icao}</Text>
        </View>
        <ProgressBar
            style={styles.progress}
            progress={percentTraveled}
        />
        <View style={styles.textContainer}>
            <Caption style={styles.name}>{departure.name}</Caption>
            <Caption style={styles.name}>{arrival.name}</Caption>
        </View>
        <View style={styles.textContainer}>
            <View>
                <Text>Alt: {pilot.altitude} ft</Text>
                <Text>Hdg: {pilot.heading}</Text>
                <Text>Speed: {pilot.groundspeed} kts</Text>
            </View>
            <View>
                <Text>Trip: {routeDistance} nm</Text>
                <Text>Flown: {distanceTraveled} nm</Text>
                <Text>Remaining: {routeDistance - distanceTraveled} nm</Text>
            </View>
        </View>
    </View>;
}

const styles = StyleSheet.create({
    progress: {
        flexGrow: 1,
        minWidth: 200
    },
    container: {
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});