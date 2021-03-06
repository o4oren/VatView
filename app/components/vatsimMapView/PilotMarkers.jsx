import MapView from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import {useDispatch} from 'react-redux';
import allActions from '../../redux/actions';

export default function PilotMarkers(props) {

    const dispatch = useDispatch();

    const pilotMarkers = props.pilots.map( pilot => {
        const styleIos = Platform.OS === 'ios' ?
            {
                transform: [{rotate: `${pilot.heading}deg`}],
            } : {};

        let onPress = () => {
            dispatch(allActions.appActions.clientSelected(pilot));
        };

        return <MapView.Marker
            key={pilot.cid}
            coordinate={{latitude: pilot.latitude, longitude: pilot.longitude}}
            title={pilot.callsign}
            anchor={{x: 0.5, y: 0.5}}
            rotation={pilot.heading}
            // icon={client.image}
            onPress={() => onPress()}
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