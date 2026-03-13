import theme from '../../common/theme';
import VatsimMapView from '../vatsimMapView/VatsimMapView';
import VatsimListView from '../vatsimListView/VatsimListView';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AirportDetailsView from '../airportView/AirportDetailsView';
import VatsimEventsView from '../EventsView/VatsimEventsView';
import {MaterialCommunityIcons} from "@expo/vector-icons";
import analytics from '../../common/analytics';

export default function MainTabNavigator() {
    const tab = createBottomTabNavigator();
    return <tab.Navigator
        screenListeners={({ route }) => ({
            tabPress: () => {
                analytics.logEvent('nav_tab_switch', { tab_name: route.name });
            },
        })}
        screenOptions={{
            tabBarActiveTintColor: theme.blueGrey.theme.colors.onPrimary,
            tabBarInactiveTintColor: theme.blueGrey.inactiveTabTint,
            headerShown: false,
            tabBarStyle: {
                backgroundColor: theme.blueGrey.theme.colors.primary,
            }
    }}
    >
        <tab.Screen
            name="Map"
            component={VatsimMapView}
            options={{
                tabBarIcon: ({ color, size }) => (
                    <MaterialCommunityIcons
                        name="map"
                        size={size}
                        color={color}
                    />
                ),
            }}
        />
        <tab.Screen
            name="List"
            component={VatsimListView}
            options={{
                tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons
                        name="format-list-bulleted"
                        size={size}
                        color={color}
                    />
                ),
            }}
        />
        <tab.Screen
            name="Airports"
            component={AirportDetailsView}
            options={{
                tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons
                        name="airport"
                        size={size}
                        color={color}
                    />
                ),
            }}
        />
        <tab.Screen
            name="Events"
            component={VatsimEventsView}
            options={{
                tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons
                        name="calendar"
                        size={size}
                        color={color}
                    />
                ),
            }}
        />
    </tab.Navigator>;
}
