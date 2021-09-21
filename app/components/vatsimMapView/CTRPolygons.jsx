import MapView, {Polygon} from 'react-native-maps';
import {Text, View} from 'react-native';
import React from 'react';
import theme from '../../common/theme';
import {EXCLUDED_CALLSIGNS} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import * as Analytics from 'expo-firebase-analytics';

export default function generateCtrPolygons(ctr, fss) {
    const dispatch = useDispatch();
    const firs = useSelector(state => state.staticAirspaceData.firs);
    const uirs = useSelector(state => state.staticAirspaceData.uirs);
    const firBoundaries = useSelector(state => state.staticAirspaceData.firBoundaries);

    console.log('fb', firBoundaries);
    const polygons = [];

    let onPress = (client) => {
        Analytics.logEvent('SelectAirport', {
            callsign: client.callsign,
            purpose: 'Clicking a CTR polygon',
        });
        dispatch(allActions.appActions.clientSelected(client));
    };

    const getAirspaceCoordinates = client => {
        // console.log(client);
        // Because of CZEG_FSS actually being a CTR, returned the logic from before relying on facilitytype
        let isOceanic = false;
        const callsignPrefix = client.callsign.split('_')[0];
        // TODO proper condition to determine oceanic firs

        let airspace = {
            isUir: false,
            firs: [],
            callsign: client.callsign
        };

        // exclude problematic FSSs
        if (EXCLUDED_CALLSIGNS.includes(client.callsign) || client.frequency === '199.998' || client.callsign.split('_').pop() === 'OBS') {
            console.log('Excluded client: ' + client.callsign);
            return airspace;
        }
        // If client is FIR
        if (firBoundaries[callsignPrefix]) {
            firBoundaries[callsignPrefix].forEach(fir => {
                airspace.firs.push(fir);
            });
        }

        if (airspace.firs.length === 0) {
            let fallbackFirIcao;
            for (let fir of firs) {
                if (fir.prefix === callsignPrefix || fir.position === callsignPrefix) {
                    fallbackFirIcao = fir.icao;
                    // we have to iterate to prevent fetching the oceanic only
                    if (firBoundaries[fallbackFirIcao]) {
                        firBoundaries[fallbackFirIcao].forEach(fir => {
                            if (fir != null && (isOceanic === true || !fir.isOceanic) && fir.isExtention === false) {
                                airspace.firs.push(fir);
                            }
                        });
                    }
                }
            }
        }

        // if we did not resolve firs, we check if UIR
        if (!airspace.firs[0]) {
            const uir = uirs[callsignPrefix];
            if (uir) {
                // airspace.isUir = true;
                // // calclute center of centers
                // let latitudeSum = 0;
                // let longitudeSum = 0;
                // console.log('uirs', uir);
                //
                // if (uir.firs !== undefined && uir.firs.length > 0) {
                //     uir.firs.forEach(firIcao => {
                //         firBoundaries[firIcao].forEach(fir => {
                //             if (fir) {     // preventing crash when not every fir in UIR can be resolved
                //                 airspace.firs.push(fir);
                //                 latitudeSum += fir.center.latitude;
                //                 longitudeSum += fir.center.longitude;
                //             }
                //         });
                //     });
                //     airspace.icao = callsignPrefix;
                //     airspace.center = {
                //         latitude: latitudeSum / uir.firs.length,
                //         longitude: longitudeSum / uir.firs.length
                //     };
                // }
            }
        }

        if (airspace.firs.length === 0)
            console.log('Airspace could not be resolved - ' + client.callsign + ' facility type: ' + client.facility);
        return airspace;
    };

    const calculatePolygon = client => {
        const airspace = getAirspaceCoordinates(client);

        if (airspace.isUir) {
            const boundaries = airspace.firs.map((fir, i) =>
                <Polygon
                    key={client.cid + '-uir--polygon-' + i}
                    coordinates={fir.points}
                    strokeColor={theme.blueGrey.uirStrokeColor}
                    fillColor={theme.blueGrey.uirFill}
                    strokeWidth={theme.blueGrey.uirStrokeWidth}
                    geodesic={true}
                    tappable={true}
                    onPress={() => onPress(client)}
                />
            );

            return (
                <View key={client.callsign + '_' + client.cid + '-uir-v'}
                    style={{zIndex: 2}}
                >
                    {boundaries}
                    <MapView.Marker
                        key={client.callsign + '_' + client.cid + '-marker'}
                        coordinate={airspace.center}
                        tracksViewChanges={false}
                        tracksInfoWindowChanges={false}
                        // anchor={{x: 0.5, y: 0.5}}
                    >
                        <Text
                            key={client.cid + '-uir-text'}
                            style={theme.blueGrey.uirTextStyle}
                            onPress={() => onPress(client)}
                        >
                            {client.callsign}
                        </Text>
                    </MapView.Marker>
                </View>
            );
        } else {
            return <View key={client.callsign + '-' + client.cid}>
                {airspace.firs.map((fir, i) =>
                    <View
                        key={client.callsign + '-' + i}
                        style={{zIndex: 1}}
                    >
                        <Polygon
                            key={client.cid + '-polygon-' + fir.center.latitude + '_' + fir.center.longitude}
                            coordinates={fir.points}
                            strokeColor={theme.blueGrey.firStrokeColor}
                            fillColor={theme.blueGrey.firFill}
                            strokeWidth={theme.blueGrey.firStrokeWidth}
                            geodesic={true}
                            tappable={true}
                            onPress={() => onPress(client)}
                        />
                        <MapView.Marker
                            key={client.cid + '-marker-' + fir.center.latitude + '_' + fir.center.longitude}
                            coordinate={fir.center}
                            tracksViewChanges={false}
                            tracksInfoWindowChanges={false}
                            // anchor={{x: 0.5, y: 0.5}}
                        >
                            <Text
                                key={client.cid + '-' + fir.icao + '-' + fir.center.latitude + '_' + fir.center.longitude}
                                style={theme.blueGrey.firTextStyle}
                                onPress={() => onPress(client)}
                            >
                                {fir.icao}
                            </Text>
                        </MapView.Marker>
                    </View>
                )}
            </View>;
        }
    };

    for (let icao in fss) {
        fss[icao].forEach(fssClient =>{
            polygons.push(calculatePolygon(fssClient));
        });
    }

    for (let icao in ctr) {
        ctr[icao].forEach(ctrClient =>{
            polygons.push(calculatePolygon(ctrClient));
        });
    }

    return polygons;
}