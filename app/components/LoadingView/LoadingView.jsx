import * as React from 'react';
import {Text, Title} from 'react-native-paper';
import {StyleSheet, View} from 'react-native';
import {LinearGradient} from 'expo-linear-gradient';
import {useSelector} from 'react-redux';

const colors=['#b4becb', '#e1e8f5'];
const start = { x: 0, y: 0 };
const end = { x: 1, y: 1 };

const LoadingView = () => {

    const loadingDb = useSelector(state => state.app.loadingDb);

    return <View style={styles.container}>
        <LinearGradient
            colors = {colors}
            start={start}
            end={end}
            style={[styles.container, styles.rotate]}>
            <View style={styles.textArea}>
                <Title>About VatView</Title>
                <Text>Airports {loadingDb.airports}</Text>
                <Text>Firs {loadingDb.firs}</Text>
                <Text>Copyright (c) Oren Geva 2021</Text>
            </View>
        </LinearGradient>
    </View>;
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1,
    },
    textArea: {
        margin: 20,
        flex: 1
    }
});
export default LoadingView;