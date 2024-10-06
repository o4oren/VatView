import theme from '../../common/theme';
import VatsimMapView from '../vatsimMapView/VatsimMapView';
import VatsimListView from '../vatsimListView/VatsimListView';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AirportDetailsView from '../airportView/AirportDetailsView';
import VatsimEventsView from '../EventsView/VatsimEventsView';
import {Platform} from 'react-native';
import {MaterialCommunityIcons} from "@expo/vector-icons";

export default function MainTabNavigator() {
    const tab = createBottomTabNavigator();
    const barHeight = Platform.OS === 'ios' ? 90 : 60;

    return <tab.Navigator
        screenOptions={{
            headerShown: false,
            tabBarItemStyle:{
                height: barHeight,
                padding: 10
            },
            tabBarStyle: {
                height: barHeight,
            }
    }}
        tabBarOptions={{
            activeBackgroundColor: theme.blueGrey.theme.colors.primary,
            inactiveBackgroundColor: theme.blueGrey.theme.colors.primary,
            activeTintColor: 'white',
            inactiveTintColor: theme.blueGrey.theme.colors.onBackground,
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
