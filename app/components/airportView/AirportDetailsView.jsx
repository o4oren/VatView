import React from 'react';
import {StyleSheet, SafeAreaView, View} from 'react-native';
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