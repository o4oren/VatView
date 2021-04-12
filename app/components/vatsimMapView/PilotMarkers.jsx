import MapView from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import {useDispatch} from 'react-redux';
import allActions from '../../redux/actions';
import {Platform} from 'react-native';

export default function generatePilotMarkers(pilots) {

    const dispatch = useDispatch();

    const pilotMarkers = pilots.map( pilot => {
        const styleIos = Platform.OS === 'ios' ?
            {
                transform: [{rotate: `${pilot.heading}deg`}],
            } : {};

        let onPress = (pilot) => {
            dispatch(allActions.appActions.clientSelected(pilot));
        };

        return <MapView.Marker
            key={pilot.cid + '_' + pilot.callsign}
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
        </MapView.Marker>;
    });

    return pilotMarkers;
}