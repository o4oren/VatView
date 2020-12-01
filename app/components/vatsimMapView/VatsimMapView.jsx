import React, {useEffect, useRef, useState} from 'react';
import MapView, {Circle, Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import getAircraftIcon from '../../util/aircraftIconResolver';
import theme from './theme';
import Animated from 'react-native-reanimated';
import BottomSheet from 'reanimated-bottom-sheet';
import {EXCLUDED_CALLSIGNS} from '../../util/consts';
import ClientDetails from './clientDetails';

export default function VatsimMapView() {
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const settings = useSelector(state => state.settings);
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const ONE_MONTH = 1000 * 60 * 60 * 24 * 30;
    const sheetRef = React.useRef(null);
    const [selectedClient, setSelectedClient] = useState();

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

    const renderContent = () => (
        <ClientDetails
            client={selectedClient}
        />
    );

    const openDetailsSheet = (client) => {
        setSelectedClient(client);
        sheetRef.current.snapTo(0);
    };

    const getAirspaceCoordinates = client => {
        console.log(client.callsign);
        const icao = client.callsign.split('_')[0];
        let airspace = {
            firs: []
        };

        // exclude problematic FSSs
        if (EXCLUDED_CALLSIGNS.includes(client.callsign)) {
            return airspace;
        }

        // If client is CTR
        if (client.facilitytype === 6) {
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
            }
        } else {
            // if client is UIR
            const uir = staticAirspaceData.uirs.find(uir => uir.icao == icao);
            if (uir != undefined) {
                // for center of centers
                let latitudeSum = 0;
                let longitudeSum = 0;
                uir.firs.forEach(firIcao => {
                    const fir = staticAirspaceData.firBoundaries.find(fir => fir.icao === firIcao);
                    airspace.firs.push(fir);
                    latitudeSum += fir.center.latitude;
                    longitudeSum += fir.center.longitude;
                });
                airspace.icao = icao;
                airspace.callsign = client.callsign;
                airspace.center = {
                    latitude: latitudeSum / uir.firs.length,
                    longitude: longitudeSum / uir.firs.length
                };
            }  else {
                console.log('Not found!', client.callsign);
                airspace.firs = [];
                return airspace;
            }
        }
        console.log(airspace);
        return airspace;
    };

    const updateClientMarkers = () => {
        // facilitytype:
        // 0 - OBS, 1 - FSS, 2 - DEL, 3 GND, 4 - TWR/ATIS, 5 - APP, 6 - CTR
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
                    onPress={() => openDetailsSheet(client)}
                />;
            } else if (client.clienttype === 'ATC') {
                if(client.facilitytype === 4) {
                    // TWR / ATIS
                    if(client.callsign.split('_').pop() === 'ATIS') {
                        return <Marker
                            key={client.cid + '-atis-' + index}
                            coordinate={{latitude: client.latitude, longitude: client.longitude}}
                            title={client.callsign}
                            // image={require('../../../assets/tower-96.png')}
                            anchor={{x: 0.5, y: 1}}
                            onPress={() => openDetailsSheet(client)}
                        />;
                    } else {
                        return <Marker
                            key={client.cid + '-tower-' + index}
                            coordinate={{latitude: client.latitude, longitude: client.longitude}}
                            title={client.callsign}
                            image={require('../../../assets/tower-96.png')}
                            anchor={{x: 0.5, y: 1}}
                            onPress={() => openDetailsSheet(client)}
                        />;
                    }
                } else if (client.facilitytype === 5) {
                    // APP / DEP
                    return <Circle
                        key={client.cid + '-circle-' + index}
                        center={{latitude: client.latitude, longitude: client.longitude}}
                        radius = {80000}
                        title={client.callsign}
                        strokeColor={theme.blueGrey.appCircleStroke}
                        fillColor={theme.blueGrey.appCircleFill}
                        strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                        onPress={() => openDetailsSheet(client)}
                    />;
                } else if (client.facilitytype === 6) {
                    // CTR 
                    const airspace = getAirspaceCoordinates(client);
                    return airspace.firs.map((fir, fIndex) =>
                        <View key={client.callsign + '-' + fIndex}>
                            <Polygon
                                key={client.cid + '-polygon-' + fIndex}
                                coordinates={fir.points}
                                strokeColor={theme.blueGrey.firStrokeColor}
                                fillColor={theme.blueGrey.firFill}
                                strokeWidth={theme.blueGrey.firStrokeWidth}
                                onPress={() => openDetailsSheet(client)}
                            />
                            <MapView.Marker
                                key={client.cid + '-marker-' + fIndex}
                                coordinate={fir.center}
                                onPress={() => openDetailsSheet(client)}
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
                } else if (client.facilitytype === 1) {
                    // FSS
                    console.log(client.facilitytype + ' ' + client.callsign);
                    const airspace = getAirspaceCoordinates(client);
                    const boundaries = airspace.firs.map((fir, fIndex) =>
                        <Polygon
                            key={client.cid + '-polygon-' + fIndex}
                            coordinates={fir.points}
                            strokeColor={theme.blueGrey.uirStrokeColor}
                            fillColor={theme.blueGrey.uirFill}
                            strokeWidth={theme.blueGrey.uirStrokeWidth}
                        />
                    );
                    const uirComponent = (<View key={client.cid + '-uir-v'}>
                        {boundaries}
                        <MapView.Marker
                            key={client.callsign + 'uir-marker-'}
                            coordinate={airspace.center}
                            onPress={() => openDetailsSheet(client)}
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
                    console.log('uir comp', uirComponent);
                    return  uirComponent;
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
            <BottomSheet
                ref={sheetRef}
                snapPoints={[450, 300, 0]}
                borderRadius={10}
                renderContent={renderContent}
                initialSnap={2}
            />
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
