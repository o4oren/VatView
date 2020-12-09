import React, {useEffect, useState} from 'react';
import Provider from 'react-redux/lib/components/Provider';
import {applyMiddleware, createStore} from 'redux';
import combineReducers from './app/redux/reducers/rootReducer';
import { AppLoading } from 'expo';
import { BottomNavigation, Text } from 'react-native-paper';
import VatsimMapView from './app/components/vatsimMapView/VatsimMapView';
import VatsimListView from './app/components/VatsimListView/VatsimListView';
import { Provider as PaperProvider } from 'react-native-paper';
import {retrieveSavedState} from './app/common/storageService';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {INITIAL_REGION} from './app/common/consts';
import theme from './app/common/theme';
const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

export default function App() {
    const [state, setState] = useState({isReady: false});
    const [index, setIndex] = React.useState(0);
    const [routes] = React.useState([
        { key: 'map', title: 'Map', icon: 'map' },
        { key: 'list', title: 'List', icon: 'format-list-bulleted' },
    ]);


    useEffect(() => {
        async function loadStateFromStorage() {
            // AsyncStorage.clear();  // clears local storage

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
        },
        staticAirspaceData: {
            firBoundaries: state.savedState.staticAirspaceData != null ? state.savedState.firBoundaries : [],
            countries: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.countries : {},
            airports: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.airports : {},
            firs: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.firs : [],
            uirs: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.uirs : [],
            lastUpdated: state.savedState.staticAirspaceData != undefined ? state.savedState.staticAirspaceData.lastUpdated : 0
        }
    };

    const store = createStore(combineReducers, preloadedState, composedEnhancer);

    const renderScene = BottomNavigation.SceneMap({
        map: VatsimMapView,
        list: VatsimListView,
    });


    return (
        <Provider store={store}>
            <PaperProvider theme={theme.blueGrey.theme}>
                <BottomNavigation
                    navigationState={{ index, routes }}
                    onIndexChange={setIndex}
                    renderScene={renderScene}
                />
            </PaperProvider>
        </Provider>
    );
}