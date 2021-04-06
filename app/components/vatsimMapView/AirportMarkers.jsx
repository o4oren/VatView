import MapView from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {getAirportByCode} from '../../common/airportTools';

export default function AirportMarkers(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const dispatch = useDispatch();

    const airportMarkers = [];

    // let onPress = (airport) => {
    //     dispatch(allActions.appActions.clientSelected(airport));
    // };

    for (let icao in props.airportAtc) {
        // const tower = props.airports[icao].filter(client => client.facility === TWR_ATIS && client.callsign.split('_').pop() == 'TWR');
        const airport = getAirportByCode(icao, airports);
        if (airports != null) {
            airportMarkers.push(
                <MapView.Marker
                    key={icao}
                    coordinate={{latitude: airport.latitude, longitude: airport.longitude}}
                    title={airport.icao}
                    anchor={{x: 0.5, y: 1}}
                    // onPress={onPress(icao)}
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