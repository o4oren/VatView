import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Divider, Searchbar, Text} from 'react-native-paper';
import allActions from '../../redux/actions';
import {getAirportByCode} from '../../common/airportTools';

export default function MetarView(props) {
    const metar = useSelector(state => state.metar.metar);
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    const onChangeSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        if(searchTerm.length === 4)
            dispatch(allActions.metarActions.metarRequsted(searchTerm));
    };

    function displayClouds() {
        if(!metar.clouds || metar.clouds.length === 0) {
            return <Text>No clouds</Text>;
        }
        return <View>
            <Text>Clouds:</Text>
            {metar.clouds.map(layer => {
                return <Text>{layer.code} at {layer.base_feet_agl} ft AGL</Text>;
            })}
        </View>;
    }

    function displayMetar() {
        console.log(metar);
        if(metar && Object.keys(metar).length > 0) {
            return   <View style={styles.metarDisplay}>
                <Text>{metar.raw_text}</Text>
                <Divider style={styles.divider}/>
                <Text>{airports && airports.icao && getAirportByCode(metar.icao, airports) ? getAirportByCode(metar.icao, airports).name : ''}</Text>
                <Text>Observed at {metar.observed.toUTCString()}</Text>
                <Text>Pressure: {Number(metar.barometer.hg).toFixed(2)} hg / {metar.barometer.mb} mb</Text>
                <Text>Temperature: {metar.temperature.celsius} &#x2103; / {Number(metar.temperature.fahrenheit).toFixed(0)} &#x2109;</Text>
                <Text>Due Point: {metar.dewpoint.celsius}c / {Number(metar.dewpoint.fahrenheit).toFixed(0)}f</Text>
                <Text>Winds: {metar.wind.degrees} at {Number(metar.wind.speed_kts).toFixed(0)} kts {}</Text>
                {metar.wind.speed_kts != metar.wind.gust_kts ?
                    <Text>Gust: {Number(metar.wind.gust_kts).toFixed(0)} kts {}</Text>
                    : null}
                <Text>Visibility: {metar.visibility.miles} sm</Text>
                {metar.ceiling ? <Text>Ceiling: {metar.ceiling.code} @ {metar.ceiling.feet_agl} ft AGL</Text> : <View />}
                {displayClouds()}
                <Text>Humidity: {Number(metar.humidity_percent).toFixed(0)}%</Text>
                <Text>Flight conditions: {metar.flight_category}</Text>
            </View>;
        }
        return null;
    }

    return <View>
        <View style={styles.container}>
            <Searchbar
                style={styles.textInput}
                placeholder="Airport ICAO"
                dense='true'
                onChangeText={onChangeSearch}
                value={searchTerm}
            />
        </View>
        {displayMetar()}

    </View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4d7199',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 15,
    },
    metarDisplay: {
        padding: 15
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300
    },
    divider: {
        marginTop: 5,
        marginBottom: 5
    }
});