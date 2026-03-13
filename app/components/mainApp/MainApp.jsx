import React, {useEffect, useRef} from 'react';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import {NavigationContainer, useNavigation} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import MainTabNavigator from './MainTabNavigator';
import About from '../About/About';
import {Menu} from 'react-native-paper';
import {Pressable} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import theme from '../../common/theme';
import Settings from '../settings/Settings';
import NetworkStatus from '../networkStatus/networkStatus';
import EventDetailsView from '../EventsView/EventDetailsView';
import MetarView from '../MetarView/MetarView';
import {initDb} from '../../common/staticDataAcessLayer';
import LoadingView from '../LoadingView/LoadingView';
import BookingsView from '../BookingsView/BookingsView';
import {StatusBar} from 'expo-status-bar';
import * as NavigationBar from 'expo-navigation-bar';
import {Platform} from 'react-native';
import analytics from '../../common/analytics';

function HeaderMenu() {
    const navigation = useNavigation();
    const [showMenu, setShowMenu] = React.useState(false);
    const [anchorLayout, setAnchorLayout] = React.useState(null);
    const closeMenu = () => setShowMenu(false);
    const openMenu = () => {
        if (anchorLayout) {
            setShowMenu(true);
        }
    };

    return (
        <Menu
            visible={showMenu}
            onDismiss={closeMenu}
            anchorPosition="bottom"
            anchor={
                <Pressable
                    onPress={openMenu}
                    onLayout={(e) => setAnchorLayout(e.nativeEvent.layout)}
                    accessibilityLabel='Menu'
                    style={({pressed}) => ({
                        padding: 8,
                        opacity: pressed ? 0.5 : 1,
                    })}
                >
                    <MaterialCommunityIcons
                        name="dots-vertical"
                        size={24}
                        color={theme.blueGrey.theme.colors.onPrimary}
                    />
                </Pressable>
            }>
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
    );
}

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
                headerTitle: 'VatView',
                headerStyle: {
                    backgroundColor: theme.blueGrey.theme.colors.primary,
                },
                headerTintColor: theme.blueGrey.theme.colors.onPrimary,
                headerRight: () => <HeaderMenu />,
            }}
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
