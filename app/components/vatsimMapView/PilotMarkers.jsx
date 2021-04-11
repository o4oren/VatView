import MapView from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import {useDispatch} from 'react-redux';
import allActions from '../../redux/actions';
import {Platform} from 'react-native';

export default function PilotMarkers(props) {

    const dispatch = useDispatch();

    const pilotMarkers = props.pilots.map( pilot => {
        const styleIos = Platform.OS === 'ios' ?
            {
                transform: [{rotate: `${pilot.heading}deg`}],
            } : {};

        let onPress = (pilot) => {
            dispatch(allActions.appActions.clientSelected(pilot));
        };

        // const getImageForIos = () => {
        //     if(Platform.OS === 'ios')
        //         return <Image
        //             source={pilot.image}
        //             fadeDuration={0}
        //             style={[styleIos, { height: pilot.imageSize, width: pilot.imageSize }]}
        //         />;
        //     return null;
        // };

        return <MapView.Marker
            key={pilot.cid + '_' + pilot.callsign}
            coordinate={{latitude: pilot.latitude, longitude: pilot.longitude}}
            title={pilot.callsign}
            anchor={{x: 0.5, y: 0.5}}
            rotation={pilot.heading}
            // icon={Platform.OS === 'ios' ? null : pilot.image}
            onPress={() => onPress(pilot)}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
        >
            {/*{getImageForIos()}*/}
            <Image
                source={pilot.image}
                fadeDuration={0}
                style={[styleIos, { height: pilot.imageSize, width: pilot.imageSize }]}
            />
        </MapView.Marker>;
    });
    // console.log('pm',pilotMarkers.sort((a,b) => (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0)));

    return pilotMarkers;
}