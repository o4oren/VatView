import React, {useRef, useCallback} from 'react';
import {Animated} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useFocusEffect} from '@react-navigation/native';
import {tokens} from '../../common/themeTokens';
import VatsimMapView from '../vatsimMapView/VatsimMapView';
import VatsimListView from '../vatsimListView/VatsimListView';
import AirportDetailsView from '../airportView/AirportDetailsView';
import VatsimEventsView from '../EventsView/VatsimEventsView';
import Settings from '../settings/Settings';
import FloatingNavIsland from '../navigation/FloatingNavIsland';

function FadeScreen({children}) {
    const opacity = useRef(new Animated.Value(0)).current;

    useFocusEffect(
        useCallback(() => {
            Animated.timing(opacity, {
                toValue: 1,
                duration: tokens.animation.duration.normal,
                useNativeDriver: true,
            }).start();
            return () => {
                opacity.setValue(0);
            };
        }, [opacity])
    );

    return (
        <Animated.View style={{flex: 1, opacity}}>
            {children}
        </Animated.View>
    );
}

function MapTab() { return <FadeScreen><VatsimMapView /></FadeScreen>; }
function ListTab() { return <FadeScreen><VatsimListView /></FadeScreen>; }
function AirportsTab() { return <FadeScreen><AirportDetailsView /></FadeScreen>; }
function EventsTab() { return <FadeScreen><VatsimEventsView /></FadeScreen>; }
function SettingsTab() { return <FadeScreen><Settings /></FadeScreen>; }

export default function MainTabNavigator() {
    const tab = createBottomTabNavigator();
    return <tab.Navigator
        tabBar={(props) => <FloatingNavIsland {...props} />}
        screenOptions={{
            headerShown: false,
            tabBarStyle: { position: 'absolute', backgroundColor: 'transparent', borderTopWidth: 0, elevation: 0 },
        }}
    >
        <tab.Screen
            name="Map"
            component={MapTab}
        />
        <tab.Screen
            name="List"
            component={ListTab}
        />
        <tab.Screen
            name="Airports"
            component={AirportsTab}
        />
        <tab.Screen
            name="Events"
            component={EventsTab}
        />
        <tab.Screen
            name="Settings"
            component={SettingsTab}
        />
    </tab.Navigator>;
}
