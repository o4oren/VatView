import React, {useEffect, useState} from 'react';
import Provider from 'react-redux/lib/components/Provider';
import {applyMiddleware, createStore} from "redux";
import combineReducers from "./app/redux/reducers/rootReducer";
import { AppLoading } from 'expo';
import VatsimMapView from './app/components/vatsimMapView/VatsimMapView';
import {retrieveSavedState} from "./app/services/storageService";
import {Button, Dimensions, StyleSheet} from 'react-native'
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import thunkMiddleware from 'redux-thunk';
import { composeWithDevTools } from 'redux-devtools-extension';

const composedEnhancer = composeWithDevTools(applyMiddleware(thunkMiddleware))
const store = createStore(combineReducers, composedEnhancer);

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
        <AppLoading />
    );
  }

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