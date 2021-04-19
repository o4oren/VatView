import React, {useEffect, useState} from 'react';
import Provider from 'react-redux/lib/components/Provider';
import {applyMiddleware, createStore} from 'redux';
import combineReducers from './app/redux/reducers/rootReducer';
import MainApp from './app/components/mainApp/MainApp';
import {Provider as PaperProvider} from 'react-native-paper';
import {retrieveSavedState} from './app/common/storageService';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {INITIAL_REGION} from './app/common/consts';
import theme from './app/common/theme';
import AppLoading from 'expo-app-loading';

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

export default function App() {
    const [state, setState] = useState({isReady: false});

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
            <AppLoading>Loading</AppLoading>
        );
    }

    const preloadedState = {
        app: {
            initialRegion: state.savedState.initialRegion != null ? state.savedState.initialRegion.region : INITIAL_REGION,
            selectedAirport: state.savedState.selectedAirport != null ? state.savedState.selectedAirport : null,
            filters: {pilots: true, atc: true, searchQuery: ''
            }
        },
        staticAirspaceData: {
            firBoundaries: state.savedState.staticAirspaceData != null ? state.savedState.firBoundaries : [],
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
                <MainApp />
            </PaperProvider>
        </Provider>
    );
}
