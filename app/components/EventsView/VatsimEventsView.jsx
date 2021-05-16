import React from 'react';
import {StyleSheet, FlatList, SafeAreaView, View, Text, Image} from 'react-native';
import FilterBar from '../filterBar/FilterBar';
import theme from '../../common/theme';
import {useSelector} from 'react-redux';
import {Dimensions} from 'react-native';

export default function VatsimEventsView() {
    const events = useSelector(state => state.vatsimLiveData.events);
    const dimensions = Dimensions.get('window');

    const imageHeight = Math.round(dimensions.width * 9 / 16);
    const imageWidth = dimensions.width;

    const renderItem = ({item}) => (
        <View>
            <Text>Event: {item.name}</Text>
            <Image
                source={{uri: item.banner}}
                resizeMode={'cover'}
                style={{ width: imageWidth, height: imageHeight, marginBottom: 10 }}
            />
        </View>
    );


    console.log('events', events);
    return <SafeAreaView style={theme.blueGrey.safeAreaView}>
        <FilterBar />
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
        backgroundColor: 'white',
        flex: 1
    }
});