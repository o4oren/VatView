import React, {useEffect, useRef} from 'react';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import MainTabNavigator from './MainTabNavigator';
import About from '../About/About';
import {IconButton, Menu} from 'react-native-paper';
import theme from '../../common/theme';
import Settings from '../settings/Settings';
import NetworkStatus from '../networkStatus/networkStatus';
import EventDetailsView from '../EventsView/EventDetailsView';
import MetarView from '../MetarView/MetarView';
import {initDb} from '../../common/staticDataAcessLayer';
import LoadingView from '../LoadingView/LoadingView';
import BookingsView from '../BookingsView/BookingsView';
import {StatusBar} from "expo-status-bar";

export default function mainApp() {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const [showMenu, setShowMenu] = React.useState(false);
    const openMenu = () => setShowMenu(true);
    const closeMenu = () => setShowMenu(false);
    const airportsLoaded = useSelector(state => state.app.airportsLoaded);
    const firBoundariesLoaded = useSelector(state => state.app.firBoundariesLoaded);
    // Kick start api calls get static data as needed
    useEffect(() => {
        const now = Date.now();
        // console.log('static', staticAirspaceData);
        if(staticAirspaceData.version == null
            || !airportsLoaded
            || !firBoundariesLoaded
            || staticAirspaceData.version < STATIC_DATA_VERSION
            || Object.keys(staticAirspaceData.firs).length === 0
            || now - staticAirspaceData.lastUpdated > ONE_MONTH) {
            // console.log('ver', staticAirspaceData.version);
            // console.log('l', Object.keys(staticAirspaceData.firs).length);
            // console.log('static', STATIC_DATA_VERSION);
            initDb();
            console.log('Fetching vatspy static data!');
            dispatch(allActions.appActions.saveAirportsLoaded(false));
            dispatch(allActions.appActions.saveFirBoundariesLoaded(false));
            dispatch(allActions.staticAirspaceDataActions.getFirBoundaries);
            dispatch(allActions.staticAirspaceDataActions.getVATSpyData);
        }
    }, []);

    // load events and bookings
    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateEvents);
        dispatch(allActions.vatsimLiveDataActions.updateBookings);
    }, []);


    function isReady() {
        console.log("airportsLoaded && firBoundariesLoaded &&  Object.keys(staticAirspaceData.firs).length", airportsLoaded + ' ' + firBoundariesLoaded + ' ' +  Object.keys(staticAirspaceData.firs).length)
            return airportsLoaded && firBoundariesLoaded &&  Object.keys(staticAirspaceData.firs).length > 0;
    }

    useEffect(() => {
        if(isReady()) {
            console.log('starting to get data feed');
            dispatch(allActions.vatsimLiveDataActions.updateData);
            const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), 20 * 1000);
            return () => {
                clearInterval(interval);
            };
        }
    }, [staticAirspaceData, airportsLoaded, firBoundariesLoaded]);

    const Stack = createStackNavigator();
    const navigationRef = useRef();
    const routeNameRef = useRef();

    if(!isReady()) {
        return <LoadingView />;
    }

    return  <NavigationContainer
        ref={navigationRef}
        onReady={() =>
            (routeNameRef.current = navigationRef.current.getCurrentRoute().name)
        }
        onStateChange={async () => {
            const previousRouteName = routeNameRef.current;
            const currentRouteName = navigationRef.current.getCurrentRoute().name;

            if (previousRouteName !== currentRouteName) {
                // await Analytics.setCurrentScreen(currentRouteName, currentRouteName);
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
                                iconColor={theme.blueGrey.theme.colors.onPrimary}
                                size={20}
                                accessibilityLabel='Menu'
                                onPress={() => openMenu()}
                            />
                        }>
                        {/*<Menu.Item onPress={() => {*/}
                        {/*    navigation.navigate('Settings');*/}
                        {/*    closeMenu();*/}
                        {/*}} icon="cog" title="Settings" />*/}
                        {/*<Divider />*/}
                        <Menu.Item onPress={() => {
                            navigation.navigate('Network status');
                            closeMenu();
                        }} icon="cloud-outline" title="Network status" />
                        <Menu.Item onPress={() => {
                            navigation.navigate('ATC Bookings');
                            closeMenu();
                        }} icon="calendar-range-outline" title="ATC Bookings" />
                        <Menu.Item onPress={() => {
                            navigation.navigate('Metar');
                            closeMenu();
                        }} icon="weather-partly-snowy-rainy" title="Metar" />
                        <Menu.Item onPress={() => {
                            navigation.navigate('About');
                            closeMenu();
                        }} icon="information-variant" title="About" />
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
            <Stack.Screen
                name="ATC Bookings"
                component={BookingsView}
            />
            <Stack.Screen
                name="Metar"
                component={MetarView}
            />
        </Stack.Navigator>
    </NavigationContainer>;

}
