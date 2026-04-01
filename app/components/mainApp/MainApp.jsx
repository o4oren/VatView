import React, {useEffect, useRef, useState} from 'react';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import EventDetailsView from '../EventsView/EventDetailsView';
import MetarView from '../MetarView/MetarView';
import MyVatsimSettings from '../settings/MyVatsimSettings';
import {initDb} from '../../common/staticDataAcessLayer';
import LoadingView from '../LoadingView/LoadingView';
import * as NavigationBar from 'expo-navigation-bar';
import {Platform} from 'react-native';
import analytics from '../../common/analytics';
import {useTheme} from '../../common/ThemeProvider';
import {init as initAircraftIcons} from '../../common/aircraftIconService';


export default function mainApp() {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const airportsLoaded = useSelector(state => state.app.airportsLoaded);
    const firBoundariesLoaded = useSelector(state => state.app.firBoundariesLoaded);
    const pollingInterval = useSelector(state => state.app.pollingInterval);
    const {activeTheme} = useTheme();
    const [iconsReady, setIconsReady] = useState(false);

    // Initialize aircraft icon cache with current theme
    useEffect(() => {
        initAircraftIcons(activeTheme)
            .then(() => {
                dispatch(allActions.appActions.iconCacheUpdated());
            })
            .catch((error) => {
                // Keep app startup non-blocking: PilotMarkers has a PNG fallback path.
                console.warn('Aircraft icon init failed, using fallback icons:', error);
            })
            .finally(() => {
                setIconsReady(true);
            });
    }, [activeTheme]);

    useEffect(() => {
        analytics.setUserProperty('user_type', 'anonymous');
        if (Platform.OS === 'android') {
            NavigationBar.setVisibilityAsync('hidden');
        }
    }, []);

    // Kick start api calls get static data as needed
    useEffect(() => {
        const now = Date.now();
        if(staticAirspaceData.version == null
            || !airportsLoaded
            || !firBoundariesLoaded
            || staticAirspaceData.version < STATIC_DATA_VERSION
            || Object.keys(staticAirspaceData.firs).length === 0
            || now - staticAirspaceData.lastUpdated > ONE_MONTH) {
            initDb();
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
        return airportsLoaded && firBoundariesLoaded && iconsReady && Object.keys(staticAirspaceData.firs).length > 0;
    }

    useEffect(() => {
        if(isReady()) {
            dispatch(allActions.vatsimLiveDataActions.updateData);
            const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), pollingInterval);
            return () => {
                clearInterval(interval);
            };
        }
    }, [staticAirspaceData, airportsLoaded, firBoundariesLoaded, iconsReady, pollingInterval]);

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
                name="Event Details"
                component={EventDetailsView}
            />
            <Stack.Screen
                name="Metar"
                component={MetarView}
            />
            <Stack.Screen
                name="MyVatsimSettings"
                component={MyVatsimSettings}
            />
        </Stack.Navigator>
    </NavigationContainer>;

}
