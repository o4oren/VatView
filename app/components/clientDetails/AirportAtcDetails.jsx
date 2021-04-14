import React from 'react';
import {useSelector} from 'react-redux';
import {Card} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import AtcDetails from './AtcDetails';

const getAtcClients =  (airportAtc, airport) => {
    let atisExists = false;
    return airportAtc[airport.icao]
        .sort((a, b) => {
            if(a.callsign.endsWith('ATIS')) {
                atisExists = true;
                return 1;
            }
            return b.facility - a.facility;
        })
        .map((atc) => {
            return <AtcDetails
                atc={atc}
                showAtis={(!atisExists || atc.callsign.endsWith('ATIS'))}
                key={atc.key}
            />;
        });
};

export default function AirportAtcDetils(props) {
    const airport = props.airport;
    const airportAtc = useSelector(state => state.vatsimLiveData.clients.airportAtc);

    if(!airportAtc[airport.icao]) return null;
    return <View style={styles.container}>
        <Card.Title
            title = {airport.icao}
            subtitle = {airport.name}
        />
        {getAtcClients(airportAtc, airport)}
    </View>;
}

const styles = StyleSheet.create({
    container: {
    },
    textContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    }
});