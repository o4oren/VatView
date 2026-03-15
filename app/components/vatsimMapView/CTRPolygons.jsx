import MapView, {Marker, Polygon} from 'react-native-maps';
import {Text} from 'react-native';
import React, {useRef} from 'react';
import theme from '../../common/theme';
import {EXCLUDED_CALLSIGNS} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';

// Used to hide polygons while keeping them in the React tree (Android workaround — see MapComponent.jsx)
const TRANSPARENT = 'rgba(0,0,0,0)';

export default function generateCtrPolygons(ctr, fss, cachedFirBoundaries, visible = true) {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const cachedClientsRef = useRef(new Map());
    const polygons = [];
    const visibleAirspaceKeys = new Set();

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

    const calculatePolygon = (clientKey, client, isVisible) => {
        const airspace = getAirspaceCoordinates(client);
        const elements = [];
        if (airspace.isUir) {
            airspace.firs.forEach((fir, i) => {
                elements.push(
                    <Polygon
                        key={`${clientKey}-uir-polygon-${i}`}
                        coordinates={fir.points}
                        holes={fir.holes || []}
                        strokeColor={isVisible ? theme.blueGrey.uirStrokeColor : TRANSPARENT}
                        fillColor={isVisible ? theme.blueGrey.uirFill : TRANSPARENT}
                        strokeWidth={isVisible ? theme.blueGrey.uirStrokeWidth : 0}
                        geodesic={true}
                        tappable={isVisible}
                        onPress={() => onPress(client)}
                    />
                );
            });
            if (airspace.center && isVisible) {
                elements.push(
                    <Marker
                        key={`${clientKey}-uir-marker`}
                        coordinate={airspace.center}
                        tracksViewChanges={false}
                        tracksInfoWindowChanges={false}
                    >
                        <Text
                            key={`${clientKey}-uir-text`}
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
                        key={`${clientKey}-polygon-${fir.icao || 'segment'}-${i}`}
                        coordinates={fir.points}
                        holes={fir.holes || []}
                        strokeColor={isVisible ? theme.blueGrey.firStrokeColor : TRANSPARENT}
                        fillColor={isVisible ? theme.blueGrey.firFill : TRANSPARENT}
                        strokeWidth={isVisible ? theme.blueGrey.firStrokeWidth : 0}
                        geodesic={true}
                        tappable={isVisible}
                        onPress={() => onPress(client)}
                    />
                );
                if (isVisible) {
                    elements.push(
                        <Marker
                            key={`${clientKey}-marker-${fir.icao || 'segment'}-${i}`}
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
                }
            });
        }
        return elements;
    };

    for (let icao in fss) {
        fss[icao].forEach(fssClient =>{
            const clientKey = `fss-${fssClient.callsign}`;
            cachedClientsRef.current.set(clientKey, fssClient);
            visibleAirspaceKeys.add(clientKey);
        });
    }

    for (let icao in ctr) {
        ctr[icao].forEach(ctrClient =>{
            const clientKey = `ctr-${ctrClient.callsign}`;
            cachedClientsRef.current.set(clientKey, ctrClient);
            visibleAirspaceKeys.add(clientKey);
        });
    }

    cachedClientsRef.current.forEach((client, clientKey) => {
        polygons.push(calculatePolygon(clientKey, client, visible && visibleAirspaceKeys.has(clientKey)));
    });

    return polygons;
}