import React, {useState} from 'react';
import {StyleSheet, FlatList, SafeAreaView, View} from 'react-native';
import {useSelector} from 'react-redux';
import theme from '../../common/theme';
import AirportSearchList from './AirportSearchList';

export default function AirportDetailsView() {
    const {airportAtc, pilots} = useSelector(state => state.vatsimLiveData.clients);
    const prefiles = useSelector(state => state.vatsimLiveData.clients.prefiles);
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const selectedAirport = useSelector(state => state.app.selectedAirport);

    return <SafeAreaView style={theme.blueGrey.safeAreaView}>
        <View style={styles.container}>
            <AirportSearchList/>
        </View>
    </SafeAreaView>;
}

export function getAirportCountryFromIcao(icao, countries) {
    if(!icao || !countries)
        return null;
    return countries[icao.substr(0,2)];
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    }
});