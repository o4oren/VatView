import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ToggleButton, TextInput, Searchbar} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';

export default function FilterBar() {
    const filters = useSelector(state => state.app.filters);
    const dispatch = useDispatch();

    const flightsFilterClicked = () => dispatch(allActions.appActions.flightsFilterClicked());
    const atcFilterCLicked = () => dispatch(allActions.appActions.atcFilterClicked());
    const onChangeSearch = (text) => dispatch(allActions.appActions.searchQueryChanged(text));
    console.log(filters);
    return <View style={styles.container}>
        <ToggleButton
            style={styles.button}
            icon='airplane'
            onPress={flightsFilterClicked}
            color="white"
            status={filters.flights ? 'checked' : 'unchecked'}
        />
        <ToggleButton
            style={styles.button}
            icon='radar' status='unchecked'
            onPress={atcFilterCLicked}
            color="white"
            status={filters.atc ? 'checked' : 'unchecked'}
        />
        {/*<ToggleButton style={styles.button} icon='earth' status='checked' color="white"></ToggleButton>*/}

        <Searchbar
            style={styles.textInput}
            palceholder="Callsign, Name, CID or Aircraft"
            dense='true'
            onChangeText={onChangeSearch}
            value={filters.searchQuery}
            // onChangeText={text => setText(text)}
        />
    </View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4d7199',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        padding: 5,
        paddingTop: 10,
        paddingBottom: 10,
    },
    button: {
        marginEnd: 10,
    },
    textInput: {
        flex: 1,
    }
});