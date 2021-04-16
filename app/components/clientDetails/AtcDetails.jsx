import React from 'react';
import {Avatar, Card, Text} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {CTR, facilities} from '../../common/consts';
import {getFirCountry, getFirFromPrefix} from '../../common/firResolver';
import {getAirportByCode} from '../../common/airportTools';
import {useSelector} from 'react-redux';

const resolveAtcCallsign = (atc, countries, firs, airports) => {
    const prefix = atc.callsign.split('_')[0];
    if(atc.facility == CTR) {
        const fir = getFirFromPrefix(prefix, firs);
        const country = getFirCountry(fir.icao, countries);
        if(!fir || !country) return null;
        return <Text>{fir ? (fir.name + ' ' + ((country.callsign) ? country.callsign : 'Center')) : null}</Text>;
    } else {
        const airport = getAirportByCode(prefix, airports);
        const country = getFirCountry(airport.fir, countries);

        if(!airport || !country) return null;
        return <Text>{airport.name + ', ' + facilities[atc.facility].long}</Text>;
    }
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
            {resolveAtcCallsign(props.atc, data.countries, data.firs, data.airports)}
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