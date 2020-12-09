import React from 'react';
import {Image, Text, View} from 'react-native';
import MapView, {Circle, Polygon} from 'react-native-maps';
import {APP, ATC, CTR, DEL, GND, EXCLUDED_CALLSIGNS, FSS, PILOT, TWR_ATIS, OBS} from '../../common/consts';
import theme from '../../common/theme';
import {useSelector} from 'react-redux';

export default function clientMarker(props) {
    const APP_RADIUS = 80000;
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const client = props.client;
    let title, anchor;

    let rotation = client.heading !== null ? client.heading : 0;

    const coordinate = {latitude: client.latitude, longitude: client.longitude};
    const onPress = (client) => {
        props.onPress(client);
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
            const uir = staticAirspaceData.uirs.find(uir => uir.icao == callsignPrefix);
            if (uir != undefined) {
                airspace.isUir = true;
                // calclute center of centers
                let latitudeSum = 0;
                let longitudeSum = 0;
                if(uir.firs != undefined) {
                    uir.firs.forEach(firIcao => {
                        if(staticAirspaceData.firBoundaries[firIcao] !== undefined) {
                            staticAirspaceData.firBoundaries[firIcao].forEach(fir => {
                                if (fir != undefined) {     // preventing crash when not every fir in UIR can be resolved
                                    airspace.firs.push(fir);
                                    latitudeSum += fir.center.latitude;
                                    longitudeSum += fir.center.longitude;
                                }
                            });
                        }
                    });
                }

                airspace.icao = callsignPrefix;
                airspace.center = {
                    latitude: latitudeSum / uir.firs.length,
                    longitude: longitudeSum / uir.firs.length
                };
            }
        }

        if (airspace.firs.length === 0)
            console.log('Airspace could not be resolved - ' + client.callsign + ' facility type: ' + client.facilitytype);
        return airspace;
    };
    if (client.latitude == undefined || client.longitude == undefined) console.log(client.callsign + ' has no lat/long');

    if (client.clienttype === PILOT) {
        title = client.callsign;
        anchor = {x: 0.5, y: 0.5};
    } else if (client.clienttype === ATC) {
        if (client.facilitytype === OBS) {
            return <View/>;
        }
        if (client.facilitytype === TWR_ATIS) {
            // TWR / ATIS / GND / DEL
            if (client.callsign.split('_').pop() === 'ATIS') {
                title = client.callsign;
                anchor = {x: 0.5, y: 1};
            } else {
                title = client.callsign;
                anchor = {x: 0.5, y: 1};
            }
        } else if (client.facilitytype === GND || client.facilitytype === DEL) {
            // TWR / ATIS
            title = client.callsign;
            anchor = {x: 0.5, y: 1};
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

    const styleIos = Platform.OS === 'ios' ?
        {
            transform: [{rotate: `${rotation}deg`}],
        } : {};


    return <MapView.Marker
        // key={'client-at-' + props.coordinate.longitude + ':' + props.coordinate.latitude}
        coordinate={coordinate}
        title={title}
        anchor={anchor}
        rotation={rotation}
        // icon={client.image}
        onPress={onPress}
        tracksViewChanges={!props.mapReady}
        tracksInfoWindowChanges={false}
    >
        <Image
            source={client.image}
            fadeDuration={0}
            style={[styleIos, { height: client.imageSize, width: client.imageSize }]}
        />
    </MapView.Marker>;
}
