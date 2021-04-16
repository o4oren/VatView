import React from 'react';
import {Card} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import AtcDetails from './AtcDetails';
import {useSelector} from 'react-redux';
import {getFirCountry, getFirFromPrefix} from '../../common/firResolver';

export default function CtrDetails({ctr, prefix}) {
    const data = useSelector(state => state.staticAirspaceData);
    const fir = getFirFromPrefix(prefix, data.firs);
    const country = getFirCountry(fir, data.countries);

    return <View style={styles.container}>
        <Card.Title
            title = {fir ? (fir.name + ' ' + (country.callsign ? country.callsign : 'Center')) : null}
        />
        {ctr.map(c => <AtcDetails
            atc={c}
            key={c.key}
            country={country}
            fir={fir}
        />)}
    </View>;
}

const styles = StyleSheet.create({
    container: {
    },
});