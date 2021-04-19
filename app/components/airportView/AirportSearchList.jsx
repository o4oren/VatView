import React, {useState} from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Button, Card, Paragraph, Searchbar, Text, Title} from 'react-native-paper';
import {findAirportsByNamePrefix} from '../../common/airportTools';
import {getAirportCountryFromIcao} from './AirportDetailsView';
import AirportListItem from './AirportListItem';

const calculateFlights = (airportIcao, pilots, prefiles) => {
    const departures = [];
    const arrivals = [];
    console.log('p', prefiles);
    pilots.forEach(p => {
        if(p.flight_plan) {
            if (p.flight_plan.departure === airportIcao)
                departures.push(p);
            if (p.flight_plan.arrival === airportIcao)
                arrivals.push(p);
        }
    });

    prefiles.forEach(p => {
        if(p.flight_plan) {
            if (p.flight_plan.departure === airportIcao)
                departures.push(p);
            if (p.flight_plan.arrival === airportIcao)
                arrivals.push(p);
        }
    });

    return {
        departures: departures,
        arrivals: arrivals
    };
};


export default function AirportSearchList() {
    const {airports, countries} = useSelector(state => state.staticAirspaceData);
    const {airportAtc, pilots} = useSelector(state => state.vatsimLiveData.clients);
    const prefiles = useSelector(state => state.vatsimLiveData.prefiles);

    const [filteredAirportList, setFilteredAirportList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');

    const renderItem = (item) =>{
        return <AirportListItem
            airport = {item.item}
            country = {getAirportCountryFromIcao(item.item.icao, countries).country}
            airportAtc = {(airportAtc[item.item.icao] && airportAtc[item.item.icao].length > 0) ? airportAtc[item.item.icao] : []}
            flights = {calculateFlights(item.item.icao, pilots, prefiles)}
        />;
    };


    const onChangeSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        if(searchTerm.length > 1) {
            setFilteredAirportList(findAirportsByNamePrefix(searchTerm, airports));
        } else {
            setFilteredAirportList([]);
        }
    };

    return <View>
        <View style={styles.container}>
            <Searchbar
                style={styles.textInput}
                palceholder="Callsign, Name, CID or Aircraft"
                dense='true'
                onChangeText={onChangeSearch}
                value={searchTerm}
            />

        </View>
        <FlatList
            data={filteredAirportList}
            renderItem={renderItem}
            keyExtractor={item => item.item}
        />
    </View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4d7199',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        padding: 5
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300
    }
});