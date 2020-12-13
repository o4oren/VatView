import MapView from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import {TWR_ATIS} from '../../common/consts';

export default function AirportMarkers(props) {
    const airportMarkers = [];
    for (let icao in props.airports) {
        const tower = props.airports[icao].filter(client => client.facilitytype === TWR_ATIS && client.callsign.split('_').pop() == 'TWR');
        if (tower.length > 0 ) {
            airportMarkers.push(
                <MapView.Marker
                    key={icao}
                    coordinate={{latitude: tower[0].latitude, longitude: tower[0].longitude}}
                    title={tower[0].callsign}
                    anchor={{x: 0.5, y: 1}}
                    // onPress={props.onPress}
                    tracksViewChanges={false}
                    tracksInfoWindowChanges={false}
                >
                    <Image
                        source={require('../../../assets/tower-32.png')}
                        fadeDuration={0}
                    />
                </MapView.Marker>
            );
        }
    }

    return airportMarkers;
}