import React, {useEffect, useState} from 'react';
import Provider from 'react-redux/lib/components/Provider';
import {applyMiddleware, createStore} from 'redux';
import combineReducers from './app/redux/reducers/rootReducer';
import { AppLoading } from 'expo';
import VatsimMapView from './app/components/vatsimMapView/VatsimMapView';
import {retrieveSavedState} from './app/services/storageService';
import {Button, Dimensions, StyleSheet} from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import { AsyncStorage } from 'react-native';
import {INITIAL_REGION} from './app/util/consts';

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware));

export default function App() {
    const [state, setState] = useState({isReady: false});
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
        settings: {
            initialRegion: state.savedState.initialRegion != null ? state.savedState.initialRegion.region : INITIAL_REGION,
        },
        staticAirspaceData: {
            firBoundaries: state.savedState.staticAirspaceData != null ? state.savedState.firBoundaries : [],
            countries: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.countries : [],
            airports: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.airports : [],
            firs: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.firs : [],
            uirs: state.savedState.staticAirspaceData != null ? state.savedState.staticAirspaceData.uirs : [],
            lastUpdated: state.savedState.staticAirspaceData != undefined ? state.savedState.staticAirspaceData.lastUpdated : 0
        }
    };

    const store = createStore(combineReducers, preloadedState, composedEnhancer);
    const Stack = createStackNavigator();
    return (
        <Provider store={store}>
            <NavigationContainer>
                <Stack.Navigator>
                    <Stack.Screen
                        name="Map"
                        component={VatsimMapView}
                        options={{
                            headerTitle: 'VatView',
                            headerStyle: {
                                backgroundColor: '#2A5D99',
                            },
                            headerTintColor: '#ffffff',
                            headerRight: () => (
                                <Button
                                    onPress={() => alert('This is a button!')}
                                    title="Info"
                                    color="#fff"
                                    style={styles.button}
                                />
                            ),
                        }}
                    />
                </Stack.Navigator>
            </NavigationContainer>
        </Provider>
    );
}

const styles = StyleSheet.create({
    button: {
        backgroundColor: '#fff',
    },
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});