import React, {useEffect, useState} from 'react';
import Provider from 'react-redux/lib/components/Provider';
import {applyMiddleware, createStore} from 'redux';
import combineReducers from './app/redux/reducers/rootReducer';
import MainApp from './app/components/mainApp/MainApp';
import {IconButton, Provider as PaperProvider} from 'react-native-paper';
import {retrieveSavedState} from './app/common/storageService';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';
import {INITIAL_REGION} from './app/common/consts';
import theme from './app/common/theme';
import AppLoading from 'expo-app-loading';
import {SafeAreaProvider} from 'react-native-safe-area-context/src/SafeAreaContext';

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
        app: {
            initialRegion: state.savedState.initialRegion != null ? state.savedState.initialRegion.region : INITIAL_REGION,
            filters: {pilots: true, atc: true, searchQuery: ''}
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
    const Stack = createStackNavigator();
    return (
        <Provider store={store}>
            <PaperProvider theme={theme.blueGrey.theme}>
                <SafeAreaProvider>
                    <NavigationContainer>
                        <Stack.Navigator>
                            <Stack.Screen
                                name="MainApp"
                                component={MainApp}
                                options={{
                                    headerTitle: 'VatView',
                                    headerStyle: {
                                        backgroundColor: '#2A5D99',
                                    },
                                    headerTintColor: '#ffffff',
                                    headerRight: () => (
                                        <IconButton
                                            icon="dots-vertical"
                                            color={'white'}
                                            size={20}
                                            onPress={() => console.log('Pressed')}
                                        />
                                    ),
                                    // headerLeft: () => (
                                    //     <Avatar.Image size={24} source={require('./assets/icon-32.png')} />
                                    // )
                                }}
                            />
                        </Stack.Navigator>
                    </NavigationContainer>
                </SafeAreaProvider>
            </PaperProvider>
        </Provider>
    );
}
