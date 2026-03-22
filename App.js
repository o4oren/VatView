import './global.css';
import React, {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import {applyMiddleware, legacy_createStore as createStore} from 'redux';
import combineReducers from './app/redux/reducers/rootReducer';
import MainApp from './app/components/mainApp/MainApp';
import {retrieveSavedState, getPollingInterval} from './app/common/storageService';
import {parseFirGeoJson, parseTraconJson} from './app/common/boundaryService';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import {INITIAL_REGION} from './app/common/consts';
import {StyleSheet, Text, View} from 'react-native';

import {GestureHandlerRootView} from 'react-native-gesture-handler';
import analyticsMiddleware from './app/common/analyticsMiddleware';
import {useFonts, JetBrainsMono_400Regular, JetBrainsMono_500Medium, JetBrainsMono_700Bold} from '@expo-google-fonts/jetbrains-mono';
import ThemeProvider from './app/common/ThemeProvider';
import StatusBarController from './app/common/StatusBarController';

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware, analyticsMiddleware));

// on top of your index.android.js file
const isAndroid = require('react-native').Platform.OS === 'android';
const isHermesEnabled = !!global.HermesInternal;

// polyfills for Intl - required by dates
if (isHermesEnabled || isAndroid) {

    require('@formatjs/intl-getcanonicallocales/polyfill');
    require('@formatjs/intl-locale/polyfill');


    require('@formatjs/intl-pluralrules/polyfill');
    require('@formatjs/intl-pluralrules/locale-data/en.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

    require('@formatjs/intl-displaynames/polyfill');
    require('@formatjs/intl-displaynames/locale-data/en.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

    require('@formatjs/intl-listformat/polyfill');
    require('@formatjs/intl-listformat/locale-data/en.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

    require('@formatjs/intl-numberformat/polyfill');
    require('@formatjs/intl-numberformat/locale-data/en.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

    require('@formatjs/intl-relativetimeformat/polyfill');
    require('@formatjs/intl-relativetimeformat/locale-data/en.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

    require('@formatjs/intl-datetimeformat/polyfill');
    require('@formatjs/intl-datetimeformat/locale-data/en.js'); // USE YOUR OWN LANGUAGE OR MULTIPLE IMPORTS YOU WANT TO SUPPORT

    require('@formatjs/intl-datetimeformat/add-golden-tz.js');



    // https://formatjs.io/docs/polyfills/intl-datetimeformat/#default-timezone

    if ('__setDefaultTimeZone' in Intl.DateTimeFormat) {

        // Set timezone using Expo localization
        try {
            const calendars = require('expo-localization').getCalendars();
            const tz = calendars && calendars[0] && calendars[0].timeZone;
            if (tz) {
                Intl.DateTimeFormat.__setDefaultTimeZone(tz);
            }
        }  catch (error) {
            console.log('tz error', error);
        }
    }
}

export default function App() {
    const [fontsLoaded] = useFonts({
        JetBrainsMono_400Regular,
        JetBrainsMono_500Medium,
        JetBrainsMono_700Bold,
    });
    const [state, setState] = useState({isReady: false});

    useEffect(() => {
        async function loadStateFromStorage() {
            const savedState = await retrieveSavedState();
            const savedPollingInterval = await getPollingInterval();
            let firBoundaryLookup = {};
            let traconBoundaryLookup = {};
            try {
                if (savedState.firGeoJson) {
                    firBoundaryLookup = parseFirGeoJson(JSON.parse(savedState.firGeoJson));
                }
                if (savedState.traconBoundaries) {
                    traconBoundaryLookup = parseTraconJson(JSON.parse(savedState.traconBoundaries));
                }
            } catch (err) {
                console.log('Error parsing boundary data on startup', err);
            }
            setState({
                isReady: true,
                savedState: savedState,
                firBoundaryLookup: firBoundaryLookup,
                traconBoundaryLookup: traconBoundaryLookup,
                pollingInterval: savedPollingInterval,
            });
        }
        loadStateFromStorage();
    }, []);

    if(!state.isReady || !fontsLoaded) {
        return (
            <View><Text>Loading</Text></View>
        );
    }

    const preloadedState = {
        app: {
            initialRegion: state.savedState.initialRegion != null ? state.savedState.initialRegion.region : INITIAL_REGION,
            selectedAirport: state.savedState.selectedAirport != null ? state.savedState.selectedAirport : null,
            filters: {pilots: true, atc: true, searchQuery: ''},
            airportsLoaded: state.savedState.airportsLoaded || false,
            firBoundariesLoaded: (state.savedState.firGeoJson && state.savedState.traconBoundaries)
                ? (state.savedState.firBoundariesLoaded || false)
                : false,
            loadingDb: {
                airports: 0,
                firs: 0
            },
            pollingInterval: state.pollingInterval || 60000,
        },
        staticAirspaceData: {
            countries: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.countries : {},
            airports: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.airports : {},
            firs: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.firs : {},
            uirs: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.uirs : {},
            lastUpdated: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.lastUpdated : 0,
            version: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.version : 0,
            firBoundaryLookup: state.firBoundaryLookup,
            traconBoundaryLookup: state.traconBoundaryLookup
        }
    };
    const store = createStore(combineReducers, preloadedState, composedEnhancer);
    return (
        <GestureHandlerRootView style={styles.root}>
            <ThemeProvider>
                <Provider store={store}>
                    <StatusBarController />
                    <MainApp />
                </Provider>
            </ThemeProvider>
        </GestureHandlerRootView>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1
    }
});
