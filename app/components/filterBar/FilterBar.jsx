import React from 'react';
import {View, StyleSheet} from 'react-native';
import {ToggleButton, Searchbar} from 'react-native-paper';
import theme from '../../common/theme';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';

export default function FilterBar() {
    const filters = useSelector(state => state.app.filters);
    const dispatch = useDispatch();

    const pilotsFilterClicked = () => dispatch(allActions.appActions.pilotsFilterClicked());
    const atcFilterClicked = () => dispatch(allActions.appActions.atcFilterClicked());
    const onChangeSearch = (text) => dispatch(allActions.appActions.searchQueryChanged(text));

    return <View style={styles.container}>
        <ToggleButton
            style={styles.button}
            icon='airplane'
            onPress={pilotsFilterClicked}
            iconColor={theme.blueGrey.theme.colors.onPrimary}
            accessibilityLabel='Pilots filter'
            status={filters.pilots ? 'checked' : 'unchecked'}
        />
        <ToggleButton
            style={styles.button}
            icon='radar'
            onPress={atcFilterClicked}
            iconColor={theme.blueGrey.theme.colors.onPrimary}
            accessibilityLabel='Air traffic control filter'
            status={filters.atc ? 'checked' : 'unchecked'}
        />
        {/*<ToggleButton style={styles.button} icon='earth' status='checked' color="white"></ToggleButton>*/}

        <Searchbar
            style={styles.textInput}
            placeholder="Callsign, Name, CID or Aircraft"
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
        borderWidth: 0,
        borderColor: 'transparent',
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300
    }
});