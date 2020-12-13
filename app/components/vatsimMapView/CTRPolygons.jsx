import MapView, {Circle, Polygon} from 'react-native-maps';
import {Image, Text, View} from 'react-native';
import React from 'react';
import theme from '../../common/theme';
import {APP_RADIUS, EXCLUDED_CALLSIGNS} from '../../common/consts';
import {useSelector} from 'react-redux';

export default function AppCircles(props) {
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);

    const polygons = [];

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
        if (EXCLUDED_CALLSIGNS.includes(client.callsign) || client.frequency == '199.998' || client.callsign.split('_').pop() == 'OBS') {
            console.log('Excluded client: ' + client.callsign);
            return airspace;
        }
        // If client is FIR
        if (staticAirspaceData.firBoundaries[callsignPrefix] != undefined) {

            staticAirspaceData.firBoundaries[callsignPrefix].forEach(fir => {
                if (fir.icao === callsignPrefix) ;
                airspace.firs.push(fir);
            });
        }

        if (airspace.firs.length == 0) {
            let fallbackFirIcao;
            for (let fir of staticAirspaceData.firs) {
                // console.log('firs from static ', staticAirspaceData.firs[fir]);
                if (fir.prefix == callsignPrefix || fir.position == callsignPrefix) {
                    fallbackFirIcao = fir.icao;
                    // we have to iterate to prevent fetching the oceanic only
                    if (staticAirspaceData.firBoundaries[fallbackFirIcao] !== undefined) {
                        staticAirspaceData.firBoundaries[fallbackFirIcao].forEach(fir => {
                            if (fir != undefined && (isOceanic === true || !fir.isOceanic) && fir.isExtention == false) {
                                airspace.firs.push(fir);
                            }
                        });
                    }
                }
            }
        }

        // if we did not resolve firs, we check if UIR
        if (airspace.firs[0] == undefined) {
            const uir = staticAirspaceData.uirs[callsignPrefix];
            if (uir != undefined) {
                airspace.isUir = true;
                // calclute center of centers
                let latitudeSum = 0;
                let longitudeSum = 0;
                if (uir.firs !== undefined && uir.firs.length > 0) {
                    uir.firs.forEach(firIcao => {
                        staticAirspaceData.firBoundaries[firIcao].forEach(fir => {
                            if (fir != undefined) {     // preventing crash when not every fir in UIR can be resolved
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
            console.log('Airspace could not be resolved - ' + client.callsign + ' facility type: ' + client.facilitytype, client);
        return airspace;
    };
    
    const calculatePolygon = client => {
        const airspace = getAirspaceCoordinates(client);
        if (airspace.isUir) {
            const boundaries = airspace.firs.map((fir, fIndex) =>
                <Polygon
                    key={client.cid + '-polygon-' + fIndex}
                    coordinates={fir.points}
                    strokeColor={theme.blueGrey.uirStrokeColor}
                    fillColor={theme.blueGrey.uirFill}
                    strokeWidth={theme.blueGrey.uirStrokeWidth}
                    geodesic={true}
                    tappable={true}
                    // onPress={onPress}
                />
            );

            return (<View key={client.cid + '-uir-v'}>
                {boundaries}
                <MapView.Marker
                    coordinate={airspace.center}
                    tracksViewChanges={false}
                    tracksInfoWindowChanges={false}
                    // anchor={{x: 0.5, y: 0.5}}
                >
                    <Text
                        key={client.cid + '-uri-text-'}
                        style={theme.blueGrey.uirTextStyle}
                    >
                        {client.callsign}
                    </Text>
                </MapView.Marker>
            </View>
            );
        }

        return airspace.firs.map((fir, fIndex) =>
            <View key={client.callsign + '-' + fIndex}>
                <Polygon
                    key={client.cid + '-polygon-' + fIndex}
                    coordinates={fir.points}
                    strokeColor={theme.blueGrey.firStrokeColor}
                    fillColor={theme.blueGrey.firFill}
                    strokeWidth={theme.blueGrey.firStrokeWidth}
                    geodesic={true}
                    tappable={true}
                />
                <MapView.Marker
                    key={client.cid + '-marker-' + fIndex}
                    coordinate={fir.center}
                    tracksViewChanges={false}
                    tracksInfoWindowChanges={false}
                    // anchor={{x: 0.5, y: 0.5}}
                >
                    <Text
                        key={client.cid + '-' + fir.icao + '-' + fIndex}
                        style={theme.blueGrey.firTextStyle}
                    >
                        {fir.icao}
                    </Text>
                </MapView.Marker>
            </View>
        );
    };

    for (let icao in props.fss) {
        props.fss[icao].forEach(fssClient =>{
            polygons.push(calculatePolygon(fssClient));
        });
    }

    for (let icao in props.ctr) {
        props.ctr[icao].forEach(ctrClient =>{
            polygons.push(calculatePolygon(ctrClient));
        });
    }

    console.log('poly', polygons);
    return polygons;
}