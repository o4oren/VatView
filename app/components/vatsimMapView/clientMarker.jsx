import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import MapView, {Circle, Polygon} from 'react-native-maps';
import {APP, ATC, CTR, DEL, GND, EXCLUDED_CALLSIGNS, FSS, PILOT, TWR_ATIS, OBS} from '../../util/consts';
import theme from './theme';
import {useSelector} from 'react-redux';

export default function clientMarker(props) {
    const APP_RADIUS = 80000;
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const client = props.client;
    let title, rotation, anchor;

    const coordinate={latitude: client.latitude, longitude: client.longitude};
    const onPress = (client) => {
        props.onPress(client);
    };

    const getAirspaceCoordinates = client => {
        // console.log(client);
        // Because of CZEG_FSS actually being a CTR, returned the logic from before relying on facilitytype
        const icao = client.callsign.split('_')[0];
        let airspace = {
            isUir: false,
            firs: [],
            callsign: client.callsign
        };

        // exclude problematic FSSs
        if (EXCLUDED_CALLSIGNS.includes(client.callsign) || client.frequency == '199.998') {
            console.log('Excluded client: ' + client.callsign);
            return airspace;
        }

        // If client is FIR
        if(staticAirspaceData.firBoundaries[icao] != undefined) {
            airspace.firs.push(staticAirspaceData.firBoundaries[icao]);
        }

        if (airspace.firs[0] === undefined) {
            let fallbackFir;
            for (let fir in staticAirspaceData.firs) {
                if (fir.prefix == icao)
                    fallbackFir = fir;
            }
            let firIcao;
            if (fallbackFir != undefined) {
                firIcao = fallbackFir.icao;
            } else {
                const airport = staticAirspaceData.airports.iata == icao ? staticAirspaceData.airports.iata : undefined;
                if (airport != undefined) {
                    firIcao = airport.fir;
                }
            }
            // all
            // firs = staticAirspaceData.firBoundaries.filter( fir => fir.icao == firIcao);

            // non oceanic
            if (staticAirspaceData.firBoundaries[icao] != undefined && !staticAirspaceData.firBoundaries[icao].isOceanic) {
                airspace.firs.push(staticAirspaceData.firBoundaries[icao]);
            }
        }

        // if we did not resolve firs, we check if UIR
        if(airspace.firs[0] == undefined)
        {
            const uir = staticAirspaceData.uirs.find(uir => uir.icao == icao);
            if (uir != undefined) {
                // calclute center of centers
                let latitudeSum = 0;
                let longitudeSum = 0;
                uir.firs.forEach(firIcao => {
                    const fir = staticAirspaceData.firBoundaries[firIcao];
                    if (fir != undefined) {     // preventing crash when not every fir in UIR can be resolved
                        airspace.firs.push(fir);
                        latitudeSum += fir.center.latitude;
                        longitudeSum += fir.center.longitude;
                    }
                });
                airspace.icao = icao;
                airspace.center = {
                    latitude: latitudeSum / uir.firs.length,
                    longitude: longitudeSum / uir.firs.length
                };
                airspace.isUir = true;
            }
        }

        if(airspace.firs.length === 0)
            console.log('Airspace could not be resolved - ' + client.callsign + ' facility type: ' + client.facilitytype);
        return airspace;
    };
    if(client.latitude == undefined || client.longitude == undefined) console.log(client.callsign + ' has no lat/long');

    if (client.clienttype === PILOT) {
        title=client.callsign;
        rotation=client.heading;
        anchor={x: 0.5, y: 0.5};
    } else if (client.clienttype === ATC) {
        if (client.facilitytype === OBS) {
            return <View />;
        }
        if (client.facilitytype === TWR_ATIS) {
            // TWR / ATIS / GND / DEL
            if (client.callsign.split('_').pop() === 'ATIS') {
                title=client.callsign;
                anchor={x: 0.5, y: 1};
            } else {
                title=client.callsign;
                anchor={x: 0.5, y: 1};
            }
        } else if (client.facilitytype === GND || client.facilitytype === DEL) {
            // TWR / ATIS
            title=client.callsign;
            anchor={x: 0.5, y: 1};
        } else if (client.facilitytype === APP) {
            // APP / DEP
            return <Circle
                center={coordinate}
                radius={APP_RADIUS}
                title={client.callsign}
                strokeColor={theme.blueGrey.appCircleStroke}
                fillColor={theme.blueGrey.appCircleFill}
                strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                onPress={onPress}
            />;
        } else if (client.facilitytype === CTR || client.facilitytype === FSS) {
            // CTR
            console.log('calling for as coords', client.callsign);
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
                        onPress={onPress}
                    />
                );

                return (<View key={client.cid + '-uir-v'}>
                    {boundaries}
                    <MapView.Marker
                        coordinate={airspace.center}
                        tracksViewChanges={!props.mapReady}
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
                        onPress={onPress}
                    />
                    <MapView.Marker
                        key={client.cid + '-marker-' + fIndex}
                        coordinate={fir.center}
                        tracksViewChanges={!props.mapReady}
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
        }
    }

    return <MapView.Marker
        // key={'client-at-' + props.coordinate.longitude + ':' + props.coordinate.latitude}
        coordinate={coordinate}
        title={title}
        rotation={rotation}
        anchor={anchor}
        // icon={client.image}
        onPress={onPress}
        tracksViewChanges={!props.mapReady}
        tracksInfoWindowChanges={false}
    >
        <View>
            <Image
                source={client.image}
                fadeDuration={0}
            />
        </View>
    </MapView.Marker>;
}