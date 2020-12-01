import React, {useEffect, useRef, useState} from 'react';
import MapView, {Circle, Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import getAircraftIcon from '../../util/aircraftIconResolver';
import theme from './theme';
import {EXCLUDED_CALLSIGNS} from '../../util/consts';

export default function VatsimMapView() {
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const settings = useSelector(state => state.settings);
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;

    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateData);
        const now = Date.now();
        if(now - staticAirspaceData.lastUpdated > ONE_MONTH) {
            dispatch(allActions.staticAirspaceDataActions.getFirBoundaries);
            dispatch(allActions.staticAirspaceDataActions.getVATSpyData);
        }
        const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), 60 * 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const getAirspaceCoordinates = callsign => {
        const icao = callsign.split('_')[0];
        let airspace = {
            isUir: false,
            firs: []
        };

        // exclude problematic FSSs
        if (EXCLUDED_CALLSIGNS.includes(callsign)) {
            return airspace;
        }

        airspace.firs = staticAirspaceData.firBoundaries.filter(fir => fir.icao === icao);

        if (airspace.firs.length == 0) {
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

            // if we couldn't find FIR by FIR, IATA or aiport - try UIR
            if (airspace.firs.length == 0) {
                const uir = staticAirspaceData.uirs.find(uir => uir.icao == icao);
                if (uir != undefined) {
                    // for center of centers
                    let latitudeSum = 0;
                    let longitudeSum = 0;
                    uir.firs.forEach(firIcao => {
                        const fir = staticAirspaceData.firBoundaries.find(fir => fir.icao === firIcao);
                        airspace.isUir = true;
                        airspace.firs.push(fir);
                        latitudeSum += fir.center.latitude;
                        longitudeSum += fir.center.longitude;
                    });
                    airspace.center = {
                        latitude: latitudeSum / uir.firs.length,
                        longitude: longitudeSum / uir.firs.length
                    };
                }  else {
                    console.log('Not found!', callsign);
                    airspace.firs = [];
                    return airspace;
                }
            }
        }

        return airspace;
    };

    const updateClientMarkers = () => {
        return vatsimLiveData.clients.map((client, index )=> {
            if(client.clienttype === 'PILOT') {
                let text = client.callsign;
                return <Marker
                    key={client.cid + '-aircraft-' + index}
                    coordinate={{latitude: client.latitude, longitude: client.longitude}}
                    title={text}
                    image={getAircraftIcon(client.planned_aircraft)}
                    rotation={client.heading}
                    anchor={{x: 0.5, y: 0.5}}
                />;
            } else if (client.clienttype === 'ATC') {
                if(client.callsign.split('_').pop() === 'TWR') {
                    return <Marker
                        key={client.cid + '-tower-' + index}
                        coordinate={{latitude: client.latitude, longitude: client.longitude}}
                        title={client.callsign}
                        image={require('../../../assets/tower-96.png')}
                        anchor={{x: 0.5, y: 1}}
                    />;
                } else if (client.callsign.split('_').pop() === 'APP' || client.callsign.split('_').pop() === 'DEP') {
                    return <Circle
                        key={client.cid + '-circle-' + index}
                        center={{latitude: client.latitude, longitude: client.longitude}}
                        radius = {80000}
                        title={client.callsign}
                        strokeColor={theme.blueGrey.appCircleStroke}
                        fillColor={theme.blueGrey.appCircleFill}
                        strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                    />;
                } else if (client.callsign.split('_').pop() === 'CTR' || client.callsign.split('_').pop() === 'FSS') {
                    const airspace = getAirspaceCoordinates(client.callsign);
                    if(airspace.isUir) {
                        const boundaries = airspace.firs.map((fir, fIndex) =>
                            <Polygon
                                key={client.cid + '-polygon-' + fIndex}
                                coordinates={fir.points}
                                strokeColor={theme.blueGrey.uirStrokeColor}
                                fillColor={theme.blueGrey.uirFill}
                                strokeWidth={theme.blueGrey.uirStrokeWidth}
                            />
                        );

                        return  (<View key={client.cid + '-uir-v'}>
                            {boundaries}
                            <MapView.Marker
                                key={client.callsign + 'uir-marker-'}
                                coordinate={airspace.center}
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
                            />
                            <MapView.Marker
                                key={client.cid + '-marker-' + fIndex}
                                coordinate={fir.center}
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
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.mapStyle}
                customMapStyle={theme.blueGrey.customMapStyle}
                provider={PROVIDER_GOOGLE}
                rotateEnabled={false}
                initialRegion={settings.initialRegion}
                onRegionChangeComplete={region => dispatch(allActions.settingsActions.saveInitialRegion(region))}
            >
                {updateClientMarkers()}
            </MapView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    mapStyle: {
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
