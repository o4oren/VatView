import React, {useEffect, useRef} from 'react';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import NetworkStatus from '../networkStatus/networkStatus';
import EventDetailsView from '../EventsView/EventDetailsView';
import MetarView from '../MetarView/MetarView';
import {initDb} from '../../common/staticDataAcessLayer';
import LoadingView from '../LoadingView/LoadingView';
import BookingsView from '../BookingsView/BookingsView';
import * as NavigationBar from 'expo-navigation-bar';
import {Platform} from 'react-native';
import analytics from '../../common/analytics';


export default function mainApp() {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const airportsLoaded = useSelector(state => state.app.airportsLoaded);
    const firBoundariesLoaded = useSelector(state => state.app.firBoundariesLoaded);
    useEffect(() => {
        analytics.setUserProperty('user_type', 'anonymous');
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync('hidden');
        }
    }, []);

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
            dispatch(allActions.staticAirspaceDataActions.getBoundaryData);
            dispatch(allActions.staticAirspaceDataActions.getVATSpyData);
        }
    }, []);

    // load events and bookings
    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateEvents);
        dispatch(allActions.vatsimLiveDataActions.updateBookings);
    }, []);

    // Background check for boundary data updates
    useEffect(() => {
        if (isReady()) {
            dispatch(allActions.staticAirspaceDataActions.checkBoundaryUpdates);
        }
    }, [airportsLoaded, firBoundariesLoaded]);


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

    const Stack = createNativeStackNavigator();
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
                analytics.logScreenView(currentRouteName, currentRouteName);
            }

            // Save the current route name for later comparison
            routeNameRef.current = currentRouteName;
        }}
    >
        <Stack.Navigator
            screenOptions={{
                headerShown: false,
            }}
        >
            <Stack.Screen
                name="VatView"
                component={MainTabNavigator}
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
