import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, SafeAreaView, View} from 'react-native';
import theme from '../../common/theme';
import {useSelector} from 'react-redux';
import EventListItem from './EventListItem';
import {Searchbar} from 'react-native-paper';

export default function VatsimEventsView({navigation}) {
    const events = useSelector(state => state.vatsimLiveData.events);
    const [searchTerm, setSearchTerm] = useState('');
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        onChangeSearch(searchTerm);
        setIsReady(true);
    }, [isReady]);

    const onChangeSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        if(searchTerm.length > 1) {
            // setFilteredAirportList(findAirportsByNamePrefix(searchTerm, airports));
        } else {
            // const list = Object.keys(airports.icao).filter(a => {
            //     return Object.keys(airportAtc).includes(a);
            // }).map(icao => airports.icao[icao]);
            // setFilteredAirportList(list);
        }
    };

    console.log('n', navigation);
    const renderItem = ({item}) => (
        <EventListItem
            event={item}
            navigation={navigation}
        />
    );


    console.log('events', events);
    return <SafeAreaView style={theme.blueGrey.safeAreaView}>
        <View style={styles.container}>
            <Searchbar
                style={styles.textInput}
                palceholder="airport"
                dense='true'
                onChangeText={onChangeSearch}
                value={searchTerm}
            />
        </View>
        <View style={styles.container}>
            <FlatList
                data={events}
                renderItem={renderItem}
                keyExtractor={item => item.id}
            />
        </View>
    </SafeAreaView>;
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