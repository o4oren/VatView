import React from 'react';
import {StyleSheet, View} from 'react-native';
import AtcDetails from './AtcDetails';

export default function CtrDetails({ctr}) {
    return <View style={styles.container}>
        {ctr.map(c => <AtcDetails
            atc={c}
            key={c.key}
        />)}
    </View>;
}

const styles = StyleSheet.create({
    container: {
    },
});