import MapView, {Circle} from 'react-native-maps';
import {Image} from 'react-native';
import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import allActions from '../../redux/actions';
import {APP, APP_RADIUS, DEL, GND, TWR_ATIS} from '../../common/consts';
import theme from '../../common/theme';
import {mapIcons} from '../../common/iconsHelper';
import * as Analytics from 'expo-firebase-analytics';
import {getAirportByCode} from '../../common/airportTools';

export default function generateAirportMarkers(airportAtc, airports) {
    const dispatch = useDispatch();
    const airportMarkers = [];

    let onPress = (airport) => {
        Analytics.logEvent('SelectAirport', {
            callsign: airport.icao,
            purpose: 'Clicking an airport atc',
        });
        dispatch(allActions.appActions.clientSelected(airport));
    };

    if(Object.keys(airportAtc).length==0) {
        console.log('return empty', airportAtc);
        return [];
    }

    for (const icao in airportAtc) {
        // const tower = props.airports[icao].filter(client => client.facility === TWR_ATIS && client.callsign.split('_').pop() == 'TWR');
        const airport = getAirportByCode(icao, airports);
        let delivery = false;
        let ground = false;
        let tower = false;
        let app = false;
        let atis = false;
        let lastUpdated = null;
        let image = null;

        if (airport != null && airportAtc) {
            airportAtc[airport.icao].forEach(atc => {
                switch (atc.facility) {
                case APP:
                    app = true;
                    airportMarkers.push(
                        <Circle
                            key={atc.key}
                            center={{latitude: atc.latitude, longitude: atc.longitude}}
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

                // update last updated to the last station in this icao so that react reconciliation will detect the change
                lastUpdated = atc.last_updated;
            });

            if(app) {
                image = mapIcons.mapRadar;
                if ((ground || tower))
                    image = mapIcons.mapTowerRadar;
                else if (atis || delivery)
                    image = mapIcons.mapAntennaRadar;
            } else {
                if (ground || tower)
                    image = mapIcons.mapTower;
                else if (atis || delivery)
                    image = mapIcons.mapAntenna;
            }

            airportMarkers.push(
                <MapView.Marker
                    key={airport.icao + '_' + lastUpdated}
                    coordinate={{latitude: airport.latitude, longitude: airport.longitude}}
                    title={airport.icao}
                    anchor={{x: 0.5, y: 1}}
                    onPress={() => onPress(airport)}
                    tracksViewChanges={false}
                    tracksInfoWindowChanges={false}
                    image={image}
                >
                    {/*<Image*/}
                    {/*    source={image}*/}
                    {/*    fadeDuration={0}*/}
                    {/*/>*/}
                </MapView.Marker>
            );
        } else {
            console.log('cannot add marker', airport);
        }
    }
    // console.log('aiportAtc', airportAtc);
    // console.log('markers', airportMarkers);
    return airportMarkers;
}
