import React from 'react';
import {useSelector} from 'react-redux';
import {Caption, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import AtcDetails from './AtcDetails';

export default function AirportAtcDetils(props) {
    const airport = props.airport;
    const airportAtc = useSelector(state => state.vatsimLiveData.clients.airportAtc);

    const getAtcClients =  () => {
        console.log('in', airportAtc[airport.icao]);
        return airportAtc[airport.icao].map(atc => {
            // return <View>
            //     <Text>{atc.name}</Text>
            //     <View style={styles.textContainer}>
            //         <Text>{atc.callsign}</Text>
            //         <Text>{atc.frequency}</Text>
            //     </View>
            // </View>;
            return <AtcDetails
                atc={atc}
            />;
        });
    };

    if(airportAtc[airport.icao] != null) 

        return <View style={styles.container}>
            <View style={styles.textContainer}>
                <Text>{airport.icao}</Text>
                <Text>{airport.name}</Text>
            </View>
            {getAtcClients()}
        </View>;

    return null;
}

const styles = StyleSheet.create({
    container: {
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});