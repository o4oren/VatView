import MapView, {Circle} from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import theme from '../../common/theme';
import {APP_RADIUS} from '../../common/consts';

export default function AppCircles(props) {

    const appCircles = [];

    for (let icao in props.app) {
        props.app[icao].forEach(approachClient =>{
            appCircles.push(
                <Circle
                    key={approachClient.cid}
                    center={{latitude: approachClient.latitude, longitude: approachClient.longitude}}
                    radius={APP_RADIUS}
                    title={approachClient.callsign}
                    strokeColor={theme.blueGrey.appCircleStroke}
                    fillColor={theme.blueGrey.appCircleFill}
                    strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                />);
        });
    }

    return appCircles;
}