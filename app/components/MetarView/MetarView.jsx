import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Divider, Searchbar, Text} from 'react-native-paper';
import allActions from '../../redux/actions';
import {getAirportByCode} from '../../common/airportTools';
import * as Analytics from 'expo-firebase-analytics';
import {translateCondition, translateCloudCode} from '../../common/metarTools';

export default function MetarView({route}) {
    const metar = useSelector(state => state.metar.metar);
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();
    useEffect(() => {
        if(route.params && route.params.icao) {
            onChangeSearch(route.params.icao);
        }
    }, [route.params]);

    const onChangeSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        if(searchTerm.length === 4) {
            Analytics.logEvent('request_METAR', {
                icao: searchTerm,
                purpose: 'Getting METAR',
            });
            dispatch(allActions.metarActions.metarRequsted(searchTerm));
        }
    };

    const displayClouds = () => {
        if(!metar.clouds || metar.clouds.length === 0) {
            return <Text>No clouds</Text>;
        }
        return <View>
            <Text>Clouds:</Text>
            {metar.clouds.map(layer => {
                return <Text key={layer.code+layer.base_feet_agl}>{translateCloudCode(layer.code)} at {layer.base_feet_agl} ft AGL</Text>;
            })}
        </View>;
    };

    const displayConditions = () => {
        if(!metar.conditions || metar.conditions.length === 0) {
            return null;
        }
        return <View>
            <Text>
                {metar.conditions.map(cond => {
                    return translateCondition(cond.code) + ' ';
                })}
            </Text>
        </View>;
    };

    function displayMetar() {
        if(searchTerm.length != 4) {
            return <View></View>;
        }
        if(metar && Object.keys(metar).length > 0) {
            return   <View style={styles.metarDisplay}>
                <Text>{metar.raw_text}</Text>
                <Divider style={styles.divider}/>
                <Text>{airports && airports.icao && getAirportByCode(metar.icao, airports) ? getAirportByCode(metar.icao, airports).name : ''}</Text>
                {displayConditions()}
                <Text>Observed on {metar.observed.toUTCString()}</Text>
                <Text>Flight conditions: {metar.flight_category}</Text>
                <Divider style={styles.divider}/>
                <Text>Altimeter: {Number(metar.barometer.hg).toFixed(2)} hg / {Number(metar.barometer.mb).toFixed(0)} mb</Text>
                <Text>Temperature: {metar.temperature.celsius} &#x2103; / {Number(metar.temperature.fahrenheit).toFixed(0)} &#x2109;</Text>
                <Text>Due Point: {metar.dewpoint.celsius} &#x2103; / {Number(metar.dewpoint.fahrenheit).toFixed(0)} &#x2109;</Text>
                <View style={styles.line}>
                    {/*<IconButton*/}
                    {/*    style={{transform: [{rotate: `${metar.wind.degrees - 180}deg`}],}}*/}
                    {/*    icon={'navigation'}*/}
                    {/*/>*/}
                    <Text style={styles.centeredVertically}>Wind: {metar.wind.degrees} at {Number(metar.wind.speed_kts).toFixed(0)} kts {}</Text>
                </View>
                {metar.wind.speed_kts != metar.wind.gust_kts ?
                    <Text>Gust: {Number(metar.wind.gust_kts).toFixed(0)} kts {}</Text>
                    : null}
                <Text>Humidity: {Number(metar.humidity_percent).toFixed(0)}%</Text>
                <Divider style={styles.divider}/>
                <Text>Visibility: {metar.visibility.miles} sm</Text>
                {metar.ceiling ? <Text>Ceiling: {translateCloudCode(metar.ceiling.code)} at {metar.ceiling.feet_agl} ft AGL</Text> : <View />}
                {displayClouds()}
                <Divider style={styles.divider}/>
                <Text>* The weather information presented in this app is obtained via the VATSIM network API, and is for use only in a simulated flight environment. Do not use for real world aviation or other activities.</Text>
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
    centeredVertically: {
        alignSelf: 'center'
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300
    },
    line: {
        flexDirection: 'row'
    },
    divider: {
        marginTop: 5,
        marginBottom: 5
    }
});