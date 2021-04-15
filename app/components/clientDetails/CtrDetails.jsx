import React from 'react';
import {Card} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import AtcDetails from './AtcDetails';
import {useSelector} from 'react-redux';

export default function CtrDetails({ctr, prefix}) {
    const firs = useSelector(state => state.staticAirspaceData.firs);
    const fir = firs.find(f => f.icao === prefix);

    return <View style={styles.container}>
        <Card.Title
            title = {prefix}
            subtitle = {fir ? fir.name : null}
        />
        {ctr.map(c => <AtcDetails atc={c} key={c.key} />)}
    </View>;
}

const styles = StyleSheet.create({
    container: {
    },
});