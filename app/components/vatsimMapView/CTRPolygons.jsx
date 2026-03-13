import MapView, {Marker, Polygon} from 'react-native-maps';
import {Text} from 'react-native';
import React from 'react';
import theme from '../../common/theme';
import {EXCLUDED_CALLSIGNS} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';

export default function generateCtrPolygons(ctr, fss, cachedFirBoundaries) {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const polygons = [];

    let onPress = (client) => {
        // Analytics.logEvent('SelectAirport', {
        //     callsign: client.callsign,
        //     purpose: 'Clicking a CTR polygon',
        // });
        dispatch(allActions.appActions.clientSelected(client));
    };

    const getAirspaceCoordinates = client => {
        // console.log(client);
        // Because of CZEG_FSS actually being a CTR, returned the logic from before relying on facilitytype
        let isOceanic = false;
        const callsignPrefix = client.callsign.split('_')[0];
        // console.log(callsignPrefix, client);
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
        if (cachedFirBoundaries[callsignPrefix]) {
            console.log(callsignPrefix + ' is in cached boundaries');
            cachedFirBoundaries[callsignPrefix].forEach(fir => {
                airspace.firs.push(fir);
            });
        } else {
            // if we did not find by icao
            const fir = staticAirspaceData.firs.find(f => f.prefix == callsignPrefix);
            if(fir && fir.icao) {
                console.log(callsignPrefix + ' is not in cached boundaries');
                if (cachedFirBoundaries[fir.icao]) {
                    cachedFirBoundaries[fir.icao].forEach(f => airspace.firs.push(f));
                }
            }

        }

        if (airspace.firs.length === 0) {
            let fallbackFirIcao;
            for (let fir of staticAirspaceData.firs) {
                if (fir.prefix === callsignPrefix || fir.firBoundary === callsignPrefix) {
                    fallbackFirIcao = fir.icao;
                    // we have to iterate to prevent fetching the oceanic only
                    if (cachedFirBoundaries[fallbackFirIcao]) {
                        cachedFirBoundaries[fallbackFirIcao].forEach(fir => {
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
            const uir = staticAirspaceData.uirs[callsignPrefix];
            if (uir) {
                airspace.isUir = true;
                // calclute center of centers
                let latitudeSum = 0;
                let longitudeSum = 0;
                if (uir.firs !== undefined && uir.firs.length > 0) {
                    uir.firs.forEach(firIcao => {
                        if (!cachedFirBoundaries[firIcao]) return;
                        cachedFirBoundaries[firIcao].forEach(fir => {
                            if (fir) {     // preventing crash when not every fir in UIR can be resolved
                                airspace.firs.push(fir);
                                latitudeSum += fir.center.latitude;
                                longitudeSum += fir.center.longitude;
                            }
                        });
                    });
                    airspace.icao = callsignPrefix;
                    airspace.center = {
                        latitude: latitudeSum / uir.firs.length,
                        longitude: longitudeSum / uir.firs.length
                    };
                }
            }
        }

        if (airspace.firs.length === 0)
            console.log('Airspace could not be resolved - ' + client.callsign + ' facility type: ' + client.facility + ' prefix used: ' + callsignPrefix);
        return airspace;
    };

    const calculatePolygon = client => {
        const airspace = getAirspaceCoordinates(client);
        const elements = [];
        if (airspace.isUir) {
            airspace.firs.forEach((fir, i) => {
                elements.push(
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
            });
            if (airspace.center) {
                elements.push(
                    <Marker
                        key={client.callsign + '_' + client.cid + '-marker'}
                        coordinate={airspace.center}
                        tracksViewChanges={false}
                        tracksInfoWindowChanges={false}
                    >
                        <Text
                            key={client.cid + '-uir-text'}
                            style={theme.blueGrey.uirTextStyle}
                            onPress={() => onPress(client)}
                        >
                            {client.callsign}
                        </Text>
                    </Marker>
                );
            }
        } else {
            airspace.firs.forEach((fir, i) => {
                if (!fir.center) return;
                elements.push(
                    <Polygon
                        key={client.cid + '-polygon-' + i}
                        coordinates={fir.points}
                        strokeColor={theme.blueGrey.firStrokeColor}
                        fillColor={theme.blueGrey.firFill}
                        strokeWidth={theme.blueGrey.firStrokeWidth}
                        geodesic={true}
                        tappable={true}
                        onPress={() => onPress(client)}
                    />
                );
                elements.push(
                    <Marker
                        key={client.cid + '-marker-' + i}
                        coordinate={fir.center}
                        tracksViewChanges={false}
                        tracksInfoWindowChanges={false}
                    >
                        <Text
                            style={theme.blueGrey.firTextStyle}
                            onPress={() => onPress(client)}
                        >
                            {fir.icao}
                        </Text>
                    </Marker>
                );
            });
        }
        return elements;
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