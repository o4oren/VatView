import React, {useRef, useCallback} from 'react';
import {Animated, View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {useFocusEffect} from '@react-navigation/native';
import {useTheme} from '../../common/ThemeProvider';
import {tokens} from '../../common/themeTokens';
import VatsimMapView from '../vatsimMapView/VatsimMapView';
import VatsimListView from '../vatsimListView/VatsimListView';
import AirportDetailsView from '../airportView/AirportDetailsView';
import VatsimEventsView from '../EventsView/VatsimEventsView';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import FloatingNavIsland from '../navigation/FloatingNavIsland';
import analytics from '../../common/analytics';

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

export default function MainTabNavigator() {
    const tab = createBottomTabNavigator();
    const {activeTheme} = useTheme();
    return <View style={StyleSheet.absoluteFillObject}>
        <tab.Navigator
        screenListeners={({ route }) => ({
            tabPress: () => {
                analytics.logEvent('nav_tab_switch', { tab_name: route.name });
            },
        })}
        screenOptions={{
            tabBarActiveTintColor: activeTheme.accent.primary,
            tabBarInactiveTintColor: activeTheme.text.secondary,
            headerShown: false,
            tabBarStyle: { display: 'none' }
        }}
    >
        <tab.Screen
            name="Map"
            component={MapTab}
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
            component={ListTab}
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
            component={AirportsTab}
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
            component={EventsTab}
            options={{
                tabBarIcon: ({color, size}) => (
                    <MaterialCommunityIcons
                        name="calendar-star"
                        size={size}
                        color={color}
                    />
                ),
            }}
        />
    </tab.Navigator>
        {/* TODO: Story 2.4 will move FloatingNavIsland into MapOverlayGroup */}
        <FloatingNavIsland />
    </View>;
}
