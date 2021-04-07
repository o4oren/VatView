import React from 'react';
import {useSelector} from 'react-redux';
import {Avatar, Card, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import AtcDetails from './AtcDetails';
import {TWR_ATIS} from '../../common/consts';

export default function AirportAtcDetils(props) {
    const airport = props.airport;
    const airportAtc = useSelector(state => state.vatsimLiveData.clients.airportAtc);

    const getAtcClients =  () => {
        let atisExists = false;
        return airportAtc[airport.icao]
            .sort((a, b) => {
                if(a.callsign.endsWith('ATIS')) {
                    atisExists = true;
                    return 1;
                }
                return b.facility - a.facility;
            })
            .map((atc, index) => {
                return <AtcDetails
                    atc={atc}
                    showAtis={(!atisExists || atc.callsign.endsWith('ATIS')) ? true : false}
                    key={atc.cid + '_' + index}
                />;
            });
    };

    if(airportAtc[airport.icao] != null)
        return <View style={styles.container}>
            <Card.Title
                title = {airport.icao}
                subtitle = {airport.name}
            />
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