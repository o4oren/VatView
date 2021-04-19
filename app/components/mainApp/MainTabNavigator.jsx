import theme from '../../common/theme';
import VatsimMapView from '../vatsimMapView/VatsimMapView';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import VatsimListView from '../vatsimListView/VatsimListView';
import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import AirportDetailsView from '../airportView/AirportDetailsView';

export default function MainTabNavigator() {
    const Tab = createBottomTabNavigator();
    const barHeight = Platform.OS === 'ios' ? 90 : 60;

    return <Tab.Navigator
        tabBarOptions={{
            activeBackgroundColor: theme.blueGrey.theme.colors.primary,
            inactiveBackgroundColor: theme.blueGrey.theme.colors.primary,
            activeTintColor: 'white',
            inactiveTintColor: theme.blueGrey.theme.colors.onBackground,
            tabStyle: {
                padding: 10   //Padding 0 here
            },
            style: {
                height: barHeight,
                backgroundColor: theme.blueGrey.theme.colors.primary,

            }
        }}
    >
        <Tab.Screen
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
        <Tab.Screen
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
        <Tab.Screen
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
    </Tab.Navigator>;
}
