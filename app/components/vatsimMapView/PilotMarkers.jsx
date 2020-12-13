import MapView from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';

export default function PilotMarkers(props) {

    console.log('p', props);
    
    const pilotMarkers = props.pilots.map( pilot => {
        const styleIos = Platform.OS === 'ios' ?
            {
                transform: [{rotate: `${pilot.heading}deg`}],
            } : {};
        return <MapView.Marker
            // key={'client-at-' + props.coordinate.longitude + ':' + props.coordinate.latitude}
            coordinate={{latitude: pilot.latitude, longitude: pilot.longitude}}
            title={pilot.callsign}
            anchor={{x: 0.5, y: 0.5}}
            rotation={pilot.heading}
            // icon={client.image}
            onPress={props.onPress}
            tracksViewChanges={!props.mapReady}
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