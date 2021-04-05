import React from 'react';
import {useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';
import {Caption, ProgressBar, Text} from 'react-native-paper';
import {getDistanceFromLatLonInNm} from '../../common/distance';
import {StyleSheet, View} from 'react-native';

export default function FlightStatus(props) {
    const pilot = props.pilot;
    return <View style={styles.container}>
        <View style={styles.textContainer}>
            <Text>{props.depAirport.icao}</Text>
            <Text>{props.arrAirport.icao}</Text>
        </View>
        <ProgressBar
            style={styles.progress}
            progress={pilot.flown / pilot.distance}
        />
        <View style={styles.textContainer}>
            <Caption style={styles.name}>{props.depAirport.name}</Caption>
            <Caption style={styles.name}>{props.depAirport.name}</Caption>
        </View>
        <View style={styles.textContainer}>
            <View>
                <Text>Alt: {pilot.altitude} ft</Text>
                <Text>Hdg: {pilot.heading}</Text>
                <Text>Speed: {pilot.groundspeed} kts</Text>
            </View>
            <View>
                <Text>Trip: {pilot.distance} nm</Text>
                <Text>Flown: {pilot.flown} nm</Text>
                <Text>Remaining: {pilot.distance - pilot.flown} nm</Text>
            </View>
        </View>
    </View>;
}

const styles = StyleSheet.create({
    progress: {
        flexGrow: 1,
    },
    container: {
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});