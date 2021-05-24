import MapView from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {Platform, View} from 'react-native';
import * as Analytics from 'expo-firebase-analytics';

export default function generatePilotMarkers(pilots) {
    const selectedClient = useSelector(state => state.app.selectedClient);
    const dispatch = useDispatch();

    const pilotMarkers = pilots.map( pilot => {
        const styleIos = Platform.OS === 'ios' ?
            {
                transform: [{rotate: `${pilot.heading}deg`}],
            } : {};

        let onPress = (pilot) => {
            Analytics.logEvent('SelectedPilot', {
                callsign: pilot.callsign,
                purpose: 'Clicking a flight',
            });
            if(selectedClient && pilot.callsign == selectedClient.callsign) {
                dispatch(allActions.appActions.clientSelected(null));
            } else {
                dispatch(allActions.appActions.clientSelected(pilot));
            }
        };

        return <View key={pilot.key} last_updated={pilot.last_updated}>
            <MapView.Marker
                coordinate={{latitude: pilot.latitude, longitude: pilot.longitude}}
                title={pilot.callsign}
                anchor={{x: 0.5, y: 0.5}}
                rotation={pilot.heading}
                onPress={() => onPress(pilot)}
                tracksViewChanges={false}
                tracksInfoWindowChanges={false}
            >
                <Image
                    source={pilot.image}
                    fadeDuration={0}
                    style={[styleIos, { height: pilot.imageSize, width: pilot.imageSize }]}
                />
            </MapView.Marker>
        </View>;

    });

    return pilotMarkers;
}