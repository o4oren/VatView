import React from 'react';
import {Avatar, Card, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {CTR, APP, GND, DEL, facilities, TWR_ATIS, FSS} from '../../common/consts';
import {getFirCountry, getFirFromPrefix} from '../../common/firResolver';
import {getAirportByCode} from '../../common/airportTools';
import {useSelector} from 'react-redux';

const resolveAtcCallsign = (atc, countries, firs, airports, uirs) => {
    const prefix = atc.callsign.split('_')[0];
    const fir = getFirFromPrefix(prefix, firs);
    let country = fir ? getFirCountry(fir.icao, countries) : null;


    if(atc.facility == CTR) {
        if(!fir || !country) return null;
        return <Text>{fir.name + ' ' + ((country.callsign) ? country.callsign : 'Center')}</Text>;
    } else if([APP, TWR_ATIS, GND, DEL].includes(atc.facility)){
        const airport = getAirportByCode(prefix, airports);
        country = airport ? getFirCountry(airport.fir, countries) : null;
        if(!airport || !country) return null;
        return <Text>{airport.name + ', ' + (atc.callsign.endsWith('ATIS') ? 'ATIS' : facilities[atc.facility].long)}</Text>;
    } else if(atc.facility == FSS) {
        return <Text>{(uirs[prefix] ? uirs[prefix].name  + ', ' : '') + facilities[atc.facility].long}</Text>;
    }
    return <Text>{fir.name + ', ' + facilities[atc.facility].long}</Text>;
};

export default function AtcDetails(props) {
    const data = useSelector(state => state.staticAirspaceData);
    return (
        <View key={props.atc.key}>
            <Card.Title
                style = {styles.title}
                title = {props.atc.callsign}
                subtitle = {props.atc.name + ' (' + props.atc.cid +')'}
                left = {() => <Avatar.Image source={props.atc.image} size={32} style={styles.avatar} />}
                right = {() => <Text>{props.atc.frequency}</Text>}
            />
            {resolveAtcCallsign(props.atc, data.countries, data.firs, data.airports, data.uirs)}
            <Text>Logged in at: {new Date(props.atc.logon_time).toUTCString()}</Text>
            {(props.showAtis && props.atc.text_atis) ? <Card.Content>
                <Text>Message:</Text>
                {props.atc.text_atis.map((line, i) => <Text key={i}>{line}</Text>)}
            </Card.Content> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: 'white',
    },
    title: {
        paddingRight: 16
    }
});