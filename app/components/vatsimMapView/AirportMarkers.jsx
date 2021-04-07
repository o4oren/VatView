import MapView, {Circle} from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {getAirportByCode} from '../../common/airportTools';
import AppCircles from './AppCircles';
import {APP, APP_RADIUS, DEL, GND, TWR_ATIS} from '../../common/consts';
import theme from '../../common/theme';

export default function AirportMarkers(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports);

    const dispatch = useDispatch();

    const airportMarkers = [];

    let onPress = (airport) => {
        dispatch(allActions.appActions.clientSelected(airport));
    };

    for (let icao in props.airportAtc) {
        // const tower = props.airports[icao].filter(client => client.facility === TWR_ATIS && client.callsign.split('_').pop() == 'TWR');
        const airport = getAirportByCode(icao, airports);
        let delivery = false;
        let ground = false;
        let tower = false;
        let app = false;
        let atis = false;

        if (airport != null) {
            props.airportAtc[icao].forEach(atc => {
                switch (atc.facility) {
                case APP:
                    app = true;
                    airportMarkers.push(
                        <Circle
                            key={icao + '_APP_' + atc.cid}
                            center={{latitude: airport.latitude, longitude: airport.longitude}}
                            radius={APP_RADIUS}
                            title={atc.callsign}
                            strokeColor={theme.blueGrey.appCircleStroke}
                            fillColor={theme.blueGrey.appCircleFill}
                            strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                        />
                    );
                    break;
                case DEL:
                    delivery = true;
                    break;
                case GND:
                    ground = true;
                    break;
                case TWR_ATIS:
                    if(atc.callsign.endsWith('ATIS'))
                        atis = true;
                    else
                        tower = true;
                    break;
                default:
                    break;
                }
            });


            let image = require('../../../assets/tower-32.png');
            if(app && !ground && !tower)
            {
                console.log('here');
                image = require('../../../assets/radar-32.png');

            }

            airportMarkers.push(
                <MapView.Marker
                    key={icao}
                    coordinate={{latitude: airport.latitude, longitude: airport.longitude}}
                    title={airport.icao}
                    anchor={{x: 0.5, y: 1}}
                    onPress={() => onPress(airport)}
                    tracksViewChanges={false}
                    tracksInfoWindowChanges={false}
                >
                    <Image
                        source={image}
                        fadeDuration={0}
                    />
                </MapView.Marker>
            );
        }
    }
    return airportMarkers;
}