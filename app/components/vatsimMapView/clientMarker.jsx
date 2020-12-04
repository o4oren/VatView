import React, {useEffect, useRef, useState} from 'react';
import {Dimensions, Image, StyleSheet, Text, View} from 'react-native';
import MapView, {Circle, Polygon} from 'react-native-maps';
import {APP, ATC, CTR, DEL, GND, EXCLUDED_CALLSIGNS, FSS, PILOT, TWR_ATIS, OBS} from '../../util/consts';
import theme from './theme';
import {useSelector} from 'react-redux';

export default function clientMarker(props) {
    const APP_RADIUS = 80000;
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const [tracksViewChanges, setTrackViewChanges] = useState(true);
    const client = props.client;
    let title, markerStyle, rotation, anchor;

    const coordinate={latitude: client.latitude, longitude: client.longitude};
    const onPress = (client) => {
        props.onPress(client);
    };
    const stopTracking = () => {
        setTrackViewChanges(false);
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
        airspace.firs = staticAirspaceData.firBoundaries.filter(fir => fir.icao === icao);

        if (airspace.firs.length === 0) {
            let fallbackFir = staticAirspaceData.firs.find(fir => fir.prefix == icao);
            let firIcao;
            if (fallbackFir != undefined) {
                firIcao = fallbackFir.icao;
            } else {
                const airport = staticAirspaceData.airports.find(airport => airport.iata == icao);
                if (airport != undefined) {
                    firIcao = airport.fir;
                }
            }
            // all
            // firs = staticAirspaceData.firBoundaries.filter( fir => fir.icao == firIcao);

            // non oceanic
            airspace.firs = staticAirspaceData.firBoundaries.filter( fir => fir.icao == firIcao && !fir.isOceanic);
        }

        // if we did not resolve firs, we check if UIR
        if(airspace.firs.length === 0)
        {
            const uir = staticAirspaceData.uirs.find(uir => uir.icao == icao);
            if (uir != undefined) {
                // calclute center of centers
                let latitudeSum = 0;
                let longitudeSum = 0;
                uir.firs.forEach(firIcao => {
                    const fir = staticAirspaceData.firBoundaries.find(fir => fir.icao === firIcao);
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
                        tracksViewChanges={tracksViewChanges}
                        tracksInfoWindowChanges={tracksViewChanges}
                        onMapReady = {() => {this.setIsMapInitialized(true);}}
                        // anchor={{x: 0.5, y: 0.5}}
                    >
                        <Text
                            key={client.cid + '-uri-text-'}
                            style={theme.blueGrey.uirTextStyle}
                            onLoad={stopTracking}
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
                        tracksViewChanges={tracksViewChanges}
                        tracksInfoWindowChanges={tracksViewChanges}
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
        tracksViewChanges={tracksViewChanges}
        tracksInfoWindowChanges={false}
    >
        <View>
            <Image
                source={client.image}
                onLoad={stopTracking}
                fadeDuration={0}
            />
        </View>
    </MapView.Marker>;
}

const getStyle = (markerType) => {
    switch (markerType) {
    case 'AIRCRAFT':
        return styles.aircraftStyle;
    case 'TWR':
        return styles.towerStyle;
    default:
        return styles.aircraftStyle;
    }
};

const styles = StyleSheet.create({
    aircraftStyle: {
        width: 32,
        height: 32
    },
    towerStyle: {
        width: 32,
        height: 32
    }
});