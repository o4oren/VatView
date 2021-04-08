import VatsimMapView from '../vatsimMapView/VatsimMapView';
import VatsimListView from '../vatsimListView/VatsimListView';
import React, {useEffect} from 'react';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import theme from '../../common/theme';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {MaterialCommunityIcons} from '@expo/vector-icons';
export default function mainApp() {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const barHeight = Platform.OS === 'ios' ? 90 : 60;
    // Kick start api calls to get data
    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateData);
        const now = Date.now();
        if(staticAirspaceData.version == undefined
            || staticAirspaceData.version < STATIC_DATA_VERSION
            || now - staticAirspaceData.lastUpdated > ONE_MONTH) {
            dispatch(allActions.staticAirspaceDataActions.getFirBoundaries);
            dispatch(allActions.staticAirspaceDataActions.getVATSpyData);
        }
        const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), 60 * 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    // const Tab = createMaterialBottomTabNavigator();
    const Tab = createBottomTabNavigator();


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
    </Tab.Navigator>;
}
