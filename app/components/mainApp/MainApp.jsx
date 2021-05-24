import React, {useEffect, useRef} from 'react';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import About from '../About/About';
import {IconButton, Menu} from 'react-native-paper';
import Settings from '../settings/Settings';
import * as Analytics from 'expo-firebase-analytics';
import NetworkStatus from '../networkStatus/newworkStatus';
import EventDetailsView from '../EventsView/EventDetailsView';

export default function mainApp() {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const [showMenu, setShowMenu] = React.useState(false);
    const openMenu = () => setShowMenu(true);
    const closeMenu = () => setShowMenu(false);

    // Kick start api calls get static data as needed
    useEffect(() => {
        const now = Date.now();

        if(staticAirspaceData.version == null
            || staticAirspaceData.version < STATIC_DATA_VERSION
            || !staticAirspaceData.firBoundaries
            || staticAirspaceData.firBoundaries.length === 0
            || Object.keys(staticAirspaceData.firs).length === 0
            || now - staticAirspaceData.lastUpdated > ONE_MONTH) {
            // console.log('ver', staticAirspaceData.version);
            // console.log('l', Object.keys(staticAirspaceData.firs).length);
            // console.log('static', STATIC_DATA_VERSION);

            console.log('Fetching vatspy static data!');
            dispatch(allActions.staticAirspaceDataActions.getFirBoundaries);
            dispatch(allActions.staticAirspaceDataActions.getVATSpyData);
        }
    }, []);

    // load events
    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateEvents);
    }, []);


    useEffect(() => {
        if(staticAirspaceData.firBoundaries != null && Object.keys(staticAirspaceData.firs).length) {
            console.log('starting to get data feed');
            dispatch(allActions.vatsimLiveDataActions.updateData);
            const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), 60 * 1000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [staticAirspaceData]);

    const Stack = createStackNavigator();
    const navigationRef = useRef();
    const routeNameRef = useRef();

    return  <NavigationContainer
        ref={navigationRef}
        onReady={() =>
            (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
        }
        onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.current.getCurrentRoute().name;

            if (previousRouteName !== currentRouteName) {
                await Analytics.setCurrentScreen(currentRouteName, currentRouteName);
            }

            // Save the current route name for later comparison
            routeNameRef.current = currentRouteName;
        }}
    >
        <Stack.Navigator
            screenOptions={({ navigation }) => ({
                headerTitle: 'VatView',
                headerStyle: {
                    backgroundColor: '#2A5D99',
                },
                headerTintColor: '#ffffff',
                headerRight: () => (
                    <Menu
                        visible={showMenu}
                        onDismiss={closeMenu}
                        anchor={                    
                            <IconButton
                                icon='dots-vertical'
                                color={'white'}
                                size={20}
                                onPress={() => openMenu()}
                            />
                        }>
                        {/*<Menu.Item onPress={() => {*/}
                        {/*    navigation.navigate('Settings');*/}
                        {/*    closeMenu();*/}
                        {/*}} icon="cog" title="Settings" />*/}
                        {/*<Divider />*/}
                        <Menu.Item onPress={() => {
                            navigation.navigate('About');
                            closeMenu();
                        }} icon="information-variant" title="About" />
                        <Menu.Item onPress={() => {
                            navigation.navigate('Network status');
                            closeMenu();
                        }} icon="cloud-outline" title="Network status" />
                    </Menu>
                ),
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
            <Stack.Screen
                name="Settings"
                component={Settings}
            />
            <Stack.Screen
                name="Network status"
                component={NetworkStatus}
            />
            <Stack.Screen
                name="Event Details"
                component={EventDetailsView}
            />
        </Stack.Navigator>
    </NavigationContainer>;

}
