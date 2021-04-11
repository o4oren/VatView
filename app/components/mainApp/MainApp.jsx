import React, {useEffect} from 'react';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import About from '../AppBar/About';
import {IconButton} from 'react-native-paper';
export default function mainApp() {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);

    // Kick start api calls get static data as needed
    useEffect(() => {
        const now = Date.now();

        if(staticAirspaceData.version == null
            || staticAirspaceData.firBoundaries.length == 0
            || staticAirspaceData.firs.length == 0
            || staticAirspaceData.version < STATIC_DATA_VERSION
            || now - staticAirspaceData.lastUpdated > ONE_MONTH) {
            console.log('Fetching vatspy static data!');
            dispatch(allActions.staticAirspaceDataActions.getFirBoundaries);
            dispatch(allActions.staticAirspaceDataActions.getVATSpyData);
        }
    }, []);


    useEffect(() => {
        if(staticAirspaceData.firBoundaries != null && staticAirspaceData.firs.length > 0) {
            console.log('starting to get data feed');
            dispatch(allActions.vatsimLiveDataActions.updateData);
            const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), 60 * 1000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [staticAirspaceData]);

    const Stack = createStackNavigator();

    return  <NavigationContainer>
        <Stack.Navigator
            screenOptions={({ navigation, route }) => ({
                headerTitle: 'VatView',
                headerStyle: {
                    backgroundColor: '#2A5D99',
                },
                headerTintColor: '#ffffff',
                headerRight: () => (
                    <IconButton
                        icon='dots-vertical'
                        color={'white'}
                        size={20}
                        onPress={() => navigation.navigate('About')}
                    />
                ),
                // headerLeft: () => (
                //     <Avatar.Image size={24} source={require('./assets/icon-32.png')} />
                // )
            })}
        >
            <Stack.Screen
                name="VatView"
                component={MainTabNavigator}
            />
            <Stack.Screen
                name="About"
                component={About}
            />
        </Stack.Navigator>
    </NavigationContainer>;

}
