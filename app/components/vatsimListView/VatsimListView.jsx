import React, {useEffect, useRef, useState} from 'react';
import {FlatList, Keyboard, Platform, Pressable, StyleSheet, TextInput, View} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import {useNavigation} from '@react-navigation/native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import ThemedText from '../shared/ThemedText';
import FilterChipsRow from '../shared/FilterChipsRow';
import ClientCard from './ClientCard';
import allActions from '../../redux/actions';
import {CTR} from '../../common/consts';

/* eslint-disable react-native/no-raw-text */

const aggregatedClients = (clients, filters) => {
    let result = [];

    if (filters.atc) {
        if (clients.airportAtc) {
            Object.values(clients.airportAtc).forEach(arr => result.push(...arr));
        }
        if (clients.ctr) {
            Object.values(clients.ctr).forEach(arr => result.push(...arr));
        }
    }

    if (filters.pilots) {
        result.push(...clients.pilots);
    }

    result.sort((a, b) => (a.callsign < b.callsign ? -1 : a.callsign > b.callsign ? 1 : 0));

    if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase().trim();
        return result.filter(c =>
            (c.callsign && c.callsign.toLowerCase().startsWith(q)) ||
            (c.name && c.name.toLowerCase().startsWith(q)) ||
            (c.cid && String(c.cid) === q)
        );
    }

    return result;
};

export default function VatsimListView() {
    const dispatch = useDispatch();
    const navigation = useNavigation();
    const {activeTheme} = useTheme();
    const insets = useSafeAreaInsets();

    const clients = useSelector(state => state.vatsimLiveData.clients);
    const filters = useSelector(state => state.app.filters);

    const [localSearch, setLocalSearch] = useState(filters.searchQuery);
    const debounceTimer = useRef(null);

    useEffect(() => {
        return () => {
            if (debounceTimer.current) {
                clearTimeout(debounceTimer.current);
            }
        };
    }, []);

    const onSearchChange = (text) => {
        setLocalSearch(text);
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        if (!text.trim()) {
            dispatch(allActions.appActions.searchQueryChanged(''));
            return;
        }
        debounceTimer.current = setTimeout(() => {
            dispatch(allActions.appActions.searchQueryChanged(text));
        }, 300);
    };

    const onClearSearch = () => {
        setLocalSearch('');
        if (debounceTimer.current) {
            clearTimeout(debounceTimer.current);
        }
        dispatch(allActions.appActions.searchQueryChanged(''));
    };

    const onItemPress = (client) => {
        Keyboard.dismiss();
        dispatch(allActions.appActions.clientSelected(client));
        if (client.latitude != null && client.longitude != null) {
            const delta = client.facility === CTR ? 8 : 0.35;
            dispatch(allActions.appActions.flyToClient({
                latitude: client.latitude,
                longitude: client.longitude,
                delta,
            }));
        }
        navigation.navigate('Map');
    };

    const filteredClients = aggregatedClients(clients, filters);

    const renderItem = ({item}) => (
        <ClientCard client={item} onPress={() => onItemPress(item)} />
    );

    const keyExtractor = (client, i) => `${client.callsign}${client.cid}_${i}`;

    const searchInputBg = activeTheme.surface.elevated;
    const searchTextColor = activeTheme.text.primary;

    const noMatchText = `No matches for ${filters.searchQuery}`;

    return (
        <View style={[styles.container, {backgroundColor: activeTheme.surface.base}]}>
            <FilterChipsRow style={[styles.controlsRow, {paddingTop: insets.top + 12}]} />

            <View style={styles.searchContainer}>
                <TextInput
                    style={[styles.searchInput, {backgroundColor: searchInputBg, color: searchTextColor}]}
                    placeholder="Search callsign..."
                    placeholderTextColor={activeTheme.text.muted}
                    value={localSearch}
                    onChangeText={onSearchChange}
                    returnKeyType="done"
                    onSubmitEditing={() => Keyboard.dismiss()}
                    clearButtonMode={Platform.OS === 'ios' ? 'while-editing' : 'never'}
                />
                {Platform.OS !== 'ios' && localSearch.length > 0 && (
                    <Pressable onPress={onClearSearch} style={styles.clearBtn} accessibilityLabel="Clear search">
                        <ThemedText variant="body" color={activeTheme.text.muted}>×</ThemedText>
                    </Pressable>
                )}
            </View>

            {filteredClients.length === 0 && filters.searchQuery.trim() ? (
                <View style={styles.emptyState}>
                    <ThemedText variant="body-sm" color={activeTheme.text.muted}>{noMatchText}</ThemedText>
                </View>
            ) : (
                <FlatList
                    data={filteredClients}
                    renderItem={renderItem}
                    keyExtractor={keyExtractor}
                    keyboardShouldPersistTaps="handled"
                    onScrollBeginDrag={() => Keyboard.dismiss()}
                />
            )}
        </View>
    );
}

/* eslint-enable react-native/no-raw-text */

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    controlsRow: {
        paddingHorizontal: 16,
        paddingBottom: 4,
    },
    searchContainer: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        position: 'relative',
    },
    searchInput: {
        height: 40,
        borderRadius: 10,
        paddingHorizontal: 12,
        fontSize: 15,
        fontFamily: tokens.fontFamily.mono,
    },
    clearBtn: {
        position: 'absolute',
        right: 28,
        top: 0,
        bottom: 0,
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 32,
    },
});
