import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, StyleSheet} from 'react-native';
import MapView from 'react-native-maps';

export default function clientMarker(props) {
    const [tracksViewChanges, setTrackViewChanges] = useState(true);
    const stopTracking = () => {
        setTrackViewChanges(false);
    };

    return <MapView.Marker
        key={'client-at-' + props.coordinate.longitude + ':' + props.coordinate.latitude}
        coordinate={props.coordinate}
        title={props.title}
        image={props.image}
        rotation={props.rotation}
        anchor={props.anchor}
        onPress={props.onPress}
        tracksViewChanges={tracksViewChanges}
        tracksInfoWindowChanges={false}
        onLoad={stopTracking}
    >
        {/*<Image*/}
        {/*    source={props.image}*/}
        {/*    style={getStyle(props.markerStyle)}*/}
        {/*    onLoad=*/}
        {/*    fadeDuration={0}*/}
        {/*/>*/}
    </MapView.Marker>;
}

const getStyle = (markerType) => {
    switch (markerType) {
    case 'AIRCRAFT':
        return styles.aircraftStyle;
    case 'TWR':
        return styles.towerStyle;
    default:
        return styles.aircraftStyle;
    }
};

const styles = StyleSheet.create({
    aircraftStyle: {
        width: 32,
        height: 32
    },
    towerStyle: {
        width: 32,
        height: 32
    }
});