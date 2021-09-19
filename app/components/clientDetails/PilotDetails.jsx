import React, {useEffect, useState} from 'react';
import {Avatar, Caption, Card, ProgressBar, Text} from 'react-native-paper';
import {getDistanceFromLatLonInNm} from '../../common/timeDIstanceTools';
import {StyleSheet, View} from 'react-native';
import {getAirportByICAO} from '../../common/staticDataAcessLayer';

export default function PilotDetails({pilot}) {

    const [depAirport, setDepAirport] = useState(null);
    const [arrAirport, setArrAirport] = useState(null);

    useEffect(() => {
        if(pilot.flight_plan) {
            getAirportByICAO(pilot.flight_plan.arrival, (airport) => {
                console.log('aaa', airport);
                setDepAirport(airport);
            });
            getAirportByCode(pilot.flight_plan.arrival, (airport) => setArrAirport(airport));
        }
    }, []);

    console.log('a', arrAirport);
    console.log('d', depAirport);
    const renderFlightDetails = () => {
        let flown, distance;
        if(depAirport && arrAirport) {
            distance = getDistanceFromLatLonInNm({
                lat: depAirport.latitude,
                lon: depAirport.longitude
            },
            {
                lat: arrAirport.latitude,
                lon: arrAirport.longitude
            });

            flown = getDistanceFromLatLonInNm({
                lat: depAirport.latitude,
                lon: depAirport.longitude
            },
            {
                lat: pilot.latitude,
                lon: pilot.longitude
            });
        }

        if(pilot.flight_plan != null && flown && distance) {
            return <Card.Content>
                {renderFlightStatus(flown, distance)}
                <Text>Flight plan:</Text>
                <Caption>{pilot.flight_plan.route}</Caption>
                <Text>Remarks:</Text>
                <Caption>{pilot.flight_plan.remarks}</Caption>
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
                <Text>{depAirport.icao}</Text>
                <Text>{arrAirport.icao}</Text>
            </View>
            <ProgressBar
                style={styles.progress}
                progress={flown / distance}
            />
            <View style={styles.textContainer}>
                <Caption style={styles.name}>{depAirport.name}</Caption>
                <Caption style={styles.name}>{arrAirport.name}</Caption>
            </View>
            <View style={styles.textContainer}>
                <View>
                    <Text>Alt: {pilot.altitude} ft</Text>
                    <Text>Hdg: {pilot.heading}</Text>
                    <Text>Speed: {pilot.groundspeed} kts</Text>
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
                title = {pilot.callsign}
                subtitle = {pilot.name + ' (' + pilot.cid +')'}
                left = {() => <Avatar.Image source={pilot.image} size={32} style={styles.avatar} />}
                right = {() => <Text>{pilot.flight_plan != null ? pilot.flight_plan.aircraft_short : ''}</Text>}
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