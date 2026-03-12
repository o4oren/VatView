import React, {useEffect, useState} from 'react';
import {Provider} from 'react-redux';
import {applyMiddleware, legacy_createStore as createStore} from 'redux';
import combineReducers from './app/redux/reducers/rootReducer';
import MainApp from './app/components/mainApp/MainApp';
import {Provider as PaperProvider} from 'react-native-paper';
import {retrieveSavedState} from './app/common/storageService';
import { thunk as thunkMiddleware } from 'redux-thunk';
import { composeWithDevTools } from '@redux-devtools/extension';
import {INITIAL_REGION} from './app/common/consts';
import theme from './app/common/theme';
import {Text, View} from 'react-native';
import {StatusBar} from 'expo-status-bar';

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

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
    const [state, setState] = useState({isReady: false});

    // clearStorage();
    useEffect(() => {
        async function loadStateFromStorage() {
            const savedState = await retrieveSavedState();
            setState({
                isReady: true,
                savedState: savedState
            });
        }
        loadStateFromStorage();
    }, []);

    if(!state.isReady) {
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
            firBoundariesLoaded: state.savedState.firBoundariesLoaded || false,
            loadingDb: {
                airports: 0,
                firs: 0
            },
        },
        staticAirspaceData: {
            firBoundaries: {},
            countries: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.countries : {},
            airports: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.airports : {},
            firs: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.firs : {},
            uirs: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.uirs : {},
            lastUpdated: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.lastUpdated : 0,
            version: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.version : 0
        }
    };
    // console.log(preloadedState);
    const store = createStore(combineReducers, preloadedState, composedEnhancer);
    return (
        <Provider store={store}>
            <PaperProvider theme={theme.blueGrey.theme}>
                <StatusBar
                    backgroundColor={theme.blueGrey.theme.colors.primary}
                    style={theme.blueGrey.theme.colors.onBackground}
                />
                <MainApp />
            </PaperProvider>
        </Provider>
    );
}
