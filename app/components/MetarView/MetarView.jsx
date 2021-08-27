import React, {useEffect, useState} from 'react';
import {StyleSheet, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {Searchbar, Text} from 'react-native-paper';
import allActions from '../../redux/actions';

export default function MetarView(props) {
    const metar = useSelector(state => state.metar.metar);
    const [searchTerm, setSearchTerm] = useState('');
    const dispatch = useDispatch();

    const onChangeSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        if(searchTerm.length === 4)
            dispatch(allActions.metarActions.metarRequsted(searchTerm));
    };

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
        <Text>{metar}</Text>
    </View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4d7199',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 5
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300
    }
});