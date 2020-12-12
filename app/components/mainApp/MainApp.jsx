import VatsimMapView from '../vatsimMapView/VatsimMapView';
import {Button} from 'react-native';
import VatsimListView from '../matsimListView/VatsimListView';
import React, {useEffect} from 'react';
import {createMaterialBottomTabNavigator} from '@react-navigation/material-bottom-tabs';
import allActions from '../../redux/actions';
import {ONE_MONTH, STATIC_DATA_VERSION} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import theme from '../../common/theme';
export default function mainApp() {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);

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

    const Tab = createMaterialBottomTabNavigator();


    return <Tab.Navigator
        barStyle={{
            backgroundColor: theme.blueGrey.theme.colors.primary,
        }}
    >
        <Tab.Screen
            name="Map"
            component={VatsimMapView}
            options={{
                tabBarIcon: 'map',
                paddingBotton: 36
            }}
        />
        <Tab.Screen
            name="List"
            component={VatsimListView}
            options={{
                tabBarIcon: 'format-list-bulleted',
            }}
        />
    </Tab.Navigator>;
}