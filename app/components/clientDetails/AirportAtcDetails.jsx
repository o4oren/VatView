import React from 'react';
import {useSelector} from 'react-redux';
import {Card, Button} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import AtcDetails from './AtcDetails';
import { useNavigation } from '@react-navigation/native';
import theme from '../../common/theme';

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
    const navigation = useNavigation();
    if(!airportAtc[airport.icao]) return null;
    return <View style={styles.container}>
        <Card.Title
            title = {airport.icao}
            subtitle = {airport.name}
            right =   {() => <Button
                icon="weather-partly-snowy-rainy"
                textColor={theme.blueGrey.theme.colors.onSurfaceVariant}
                onPress={() => {
                    navigation.navigate('Metar', {
                        icao: airport.icao
                    })
                }}
            >METAR</Button>}
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