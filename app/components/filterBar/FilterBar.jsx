import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ToggleButton, Searchbar} from 'react-native-paper';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';

export default function FilterBar() {
    const filters = useSelector(state => state.app.filters);
    const dispatch = useDispatch();

    const pilotsFilterClicked = () => dispatch(allActions.appActions.pilotsFilterClicked());
    const atcFilterCLicked = () => dispatch(allActions.appActions.atcFilterClicked());
    const onChangeSearch = (text) => dispatch(allActions.appActions.searchQueryChanged(text));

    return <View style={styles.container}>
        <ToggleButton
            style={styles.button}
            icon='airplane'
            onPress={pilotsFilterClicked}
            color="white"
            status={filters.pilots ? 'checked' : 'unchecked'}
        />
        <ToggleButton
            style={styles.button}
            icon='radar'
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
        />
    </View>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4d7199',
        alignItems: 'center',
        justifyContent: 'flex-start',
        flexDirection: 'row',
        padding: 5
    },
    button: {
        marginEnd: 10,
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300
    }
});