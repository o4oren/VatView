import React from 'react';
import {View, ScrollView, StyleSheet,} from 'react-native';
import { Icon, Button, Title, Paragraph,} from 'react-native-paper';

export default function FilterBar() {

    return <View style={styles.container}>
        <Button style={styles.button} icon='airplane' mode="contained">Aircraft</Button>
        <Button style={styles.button} icon='radar' mode="contained">ATC</Button>
        <Button style={styles.button} icon='earth' mode="contained">Country</Button>
    </View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#7095c1',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        padding: 5,
        paddingTop: 10,
        paddingBottom: 10,
    },
    button: {
        marginEnd: 10,
    }
});