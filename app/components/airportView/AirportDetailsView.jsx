import React, {useState} from 'react';
import {StyleSheet, FlatList, SafeAreaView, View} from 'react-native';
import {useSelector} from 'react-redux';
import theme from '../../common/theme';
import AirportSearchList from './AirportSearchList';

export default function AirportDetailsView() {
    return <SafeAreaView style={theme.blueGrey.safeAreaView}>
        <View style={styles.container}>
            <AirportSearchList/>
        </View>
    </SafeAreaView>;
}



const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    }
});