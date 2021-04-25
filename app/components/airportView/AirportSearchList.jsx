import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, View} from 'react-native';
import {useSelector} from 'react-redux';
import {Searchbar} from 'react-native-paper';
import {findAirportsByNamePrefix, getAirportCountryFromIcao} from '../../common/airportTools';
import AirportListItem from './AirportListItem';

const calculateFlights = (airportIcao, pilots, prefiles) => {
    const departures = [];
    const arrivals = [];

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
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        onChangeSearch(searchTerm);
        setIsReady(true);
    }, [isReady]);

    const renderItem = (item) =>{
        const country = getAirportCountryFromIcao(item.item.icao, countries);
        return <AirportListItem
            key={item.item.icao}
            airport = {item.item}
            country = {country ? country.country : ''}
            airportAtc = {(airportAtc[item.item.icao] && airportAtc[item.item.icao].length > 0) ? airportAtc[item.item.icao] : null}
            flights = {calculateFlights(item.item.icao, pilots, prefiles)}
        />;
    };


    const onChangeSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        if(searchTerm.length > 1) {
            setFilteredAirportList(findAirportsByNamePrefix(searchTerm, airports));
        } else {
            const list = Object.keys(airports.icao).filter(a => {
                return Object.keys(airportAtc).includes(a);
            }).map(icao => airports.icao[icao]);
            setFilteredAirportList(list);
        }
    };

    return <View>
        <View style={styles.container}>
            <Searchbar
                style={styles.textInput}
                palceholder="airport"
                dense='true'
                onChangeText={onChangeSearch}
                value={searchTerm}
            />
        </View>
        {
            <FlatList
                data={filteredAirportList}
                renderItem={renderItem}
                keyExtractor={item => item.icao}
            />
        }

    </View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4d7199',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 5
    },
    placeholder: {
        alignSelf:'center'
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300
    }
});