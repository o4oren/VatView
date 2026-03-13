import React, {useEffect, useState} from 'react';
import {Avatar, Card, List, ProgressBar, Text} from 'react-native-paper';
import {getDistanceFromLatLonInNm} from '../../common/timeDIstanceTools';
import {Image, StyleSheet, View} from 'react-native';
import {getAirportsByICAOAsync} from '../../common/staticDataAcessLayer';
import {airlineLogos} from '../../common/airlineLogos';

export default function PilotDetails({pilot}) {

    const [pilotAirports, setPilotAirports] = useState({
        depAirport: null,
        arrAirport: null
    });

    useEffect( () => {
        let isMounted = true;
        if(isMounted === true && pilot.flight_plan) {
            resolveAirports().then(airports => {
                setPilotAirports(airports);
            });
        }
        return () => {
            isMounted = false;
        }
    }, [pilot]);

    const resolveAirports = async () => {
        const airports =  await getAirportsByICAOAsync([pilot.flight_plan.departure, pilot.flight_plan.arrival]);

        if(airports.length === 0) {
            return {
                depAirport: null,
                arrAirport: null
            };
        }
        const depAirport = airports.find(airport => airport.icao == pilot.flight_plan.departure);
        const arrAirport = airports.find(airport => airport.icao == pilot.flight_plan.arrival);

        return {
            depAirport: depAirport,
            arrAirport: arrAirport
        };
    };

    const renderFlightDetails = () => {
        let flown, distance;
        if(pilotAirports.depAirport && pilotAirports.arrAirport) {
            distance = getDistanceFromLatLonInNm({
                lat: pilotAirports.depAirport.latitude,
                lon: pilotAirports.depAirport.longitude
            },
            {
                lat: pilotAirports.arrAirport.latitude,
                lon: pilotAirports.arrAirport.longitude
            });

            flown = getDistanceFromLatLonInNm({
                lat: pilotAirports.depAirport.latitude,
                lon: pilotAirports.depAirport.longitude
            },
            {
                lat: pilot.latitude,
                lon: pilot.longitude
            });
        }

        if(pilot.flight_plan != null && flown >=0  && distance >= 0) {
            return <Card.Content>
                {renderFlightStatus(flown, distance)}
                <Text>Flight plan:</Text>
                <Text variant="bodySmall">{pilot.flight_plan.route}</Text>
                <Text>Remarks:</Text>
                <Text variant="bodySmall">{pilot.flight_plan.remarks}</Text>
            </Card.Content>;
        } else {
            return <Card.Content>
                <Text>Flight plan not filed</Text>
            </Card.Content>;
        }
    };

    const renderFlightStatus = (flown, distance) => {
        let percentage = distance != 0 ? flown / distance : 0;
        return <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text>{pilotAirports.depAirport.icao}</Text>
                <Text>{pilotAirports.arrAirport.icao}</Text>
            </View>
            <ProgressBar
                style={styles.progress}
                progress={percentage}
            />
            <View style={styles.textContainer}>
                <Text variant="bodySmall" style={styles.name}>{pilotAirports.depAirport.name}</Text>
                <Text variant="bodySmall" style={styles.name}>{pilotAirports.arrAirport.name}</Text>
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
                        <Text>{distance == 0 ? 0 : distance - flown} nm</Text>
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
                left = {() => <View>
                    <Avatar.Image source={pilot.image} size={32} style={styles.avatar} />
                    <Text>{pilot.flight_plan != null ? pilot.flight_plan.aircraft_short : ''}</Text>
                </View>}
                right={() => <Image source={airlineLogos[pilot.callsign.substr(0,3)]}  style={styles.logo} />}
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
    },
    logo: {
        width: 60,
        height: 60
    }
});