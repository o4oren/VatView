import React, {useEffect, useRef, useState} from 'react';
import MapView, {Circle, Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import ClientMarker from './clientMarker';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import theme from './theme';
import BottomSheet from 'reanimated-bottom-sheet';
import {
    APP,
    ATC, CTR,
    EXCLUDED_CALLSIGNS,
    ONE_MIN,
    ONE_MONTH,
    PILOT,
    STATIC_DATA_VERSION,
    TWR_ATIS,
    FSS
} from '../../util/consts';
import ClientDetails from './clientDetails';

export default function VatsimMapView() {
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const settings = useSelector(state => state.settings);
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const sheetRef = React.useRef(null);
    const [selectedClient, setSelectedClient] = useState();
    const [isMapInitialized, setIsMapInitialized] = useState(true);


    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateData);
        const now = Date.now();
        if(staticAirspaceData.version == undefined
            || staticAirspaceData.version < STATIC_DATA_VERSION
            || now - staticAirspaceData.lastUpdated > ONE_MONTH) {
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
        // Because of CZEG_FSS actually being a CTR, returned the logic from before relying on facilitytype
        const icao = client.callsign.split('_')[0];
        let airspace = {
            isUir: false,
            firs: [],
            callsign: client.callsign
        };

        // exclude problematic FSSs
        if (EXCLUDED_CALLSIGNS.includes(client.callsign) || client.frequency == '199.998') {
            console.log('Excluded client: ' + client.callsign, client);
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
            console.log('Airspace could not be resolved!', {airspace: airspace, client: client});
        return airspace;
    };

    const updateClientMarkers = () => {
        // facilitytype:
        // 0 - OBS, 1 - FSS, 2 - DEL, 3 GND, 4 - TWR/ATIS, 5 - APP, 6 - CTR
        const markers = vatsimLiveData.clients.map((client, index )=> {
            if(client.clienttype === PILOT) {
                return <ClientMarker
                    key={client.cid + '-aircraft-' + index}
                    coordinate={{latitude: client.latitude, longitude: client.longitude}}
                    title={client.callsign}
                    image={client.icon}
                    markerStyle={'AIRCRAFT'}
                    rotation={client.heading}
                    anchor={{x: 0.5, y: 0.5}}
                    onPress={() => openDetailsSheet(client)}
                ></ClientMarker>;
            } else if (client.clienttype === ATC) {
                if (client.facilitytype === TWR_ATIS) {
                    // TWR / ATIS
                    if (client.callsign.split('_').pop() === 'ATIS') {
                        return <ClientMarker
                            key={client.cid + '-atis-' + index}
                            coordinate={{latitude: client.latitude, longitude: client.longitude}}
                            title={client.callsign}
                            // image={require('../../../assets/tower-96.png')}
                            anchor={{x: 0.5, y: 1}}
                            onPress={() => openDetailsSheet(client)}
                        />;
                    } else {
                        return <ClientMarker
                            key={client.cid + '-tower-' + index}
                            coordinate={{latitude: client.latitude, longitude: client.longitude}}
                            title={client.callsign}
                            image={client.icon}
                            markerStyle={'TWR'}
                            anchor={{x: 0.5, y: 1}}
                            onPress={() => openDetailsSheet(client)}
                        />;
                    }
                } else if (client.facilitytype === APP) {
                    // APP / DEP
                    return <Circle
                        key={client.cid + '-circle-' + index}
                        center={{latitude: client.latitude, longitude: client.longitude}}
                        radius={80000}
                        title={client.callsign}
                        strokeColor={theme.blueGrey.appCircleStroke}
                        fillColor={theme.blueGrey.appCircleFill}
                        strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                        onPress={() => openDetailsSheet(client)}
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
                                onPress={() => openDetailsSheet(client)}
                            />
                        );

                        return (<View key={client.cid + '-uir-v'}>
                            {boundaries}
                            <ClientMarker
                                key={client.callsign + 'uir-marker-'}
                                coordinate={airspace.center}
                                tracksViewChanges={!isMapInitialized}
                                tracksInfoWindowChanges={!isMapInitialized}
                                onMapReady = {() => {this.setIsMapInitialized(true);}}
                                // anchor={{x: 0.5, y: 0.5}}
                            >
                                <Text
                                    key={client.cid + '-uri-text-'}
                                    style={theme.blueGrey.uirTextStyle}
                                >
                                    {client.callsign}
                                </Text>
                            </ClientMarker>
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
                                onPress={() => openDetailsSheet(client)}
                            />
                            <ClientMarker
                                key={client.cid + '-marker-' + fIndex}
                                coordinate={fir.center}
                                tracksViewChanges={!isMapInitialized}
                                tracksInfoWindowChanges={!isMapInitialized}
                                // anchor={{x: 0.5, y: 0.5}}
                            >
                                <Text
                                    key={client.cid + '-' + fir.icao + '-' + fIndex}
                                    style={theme.blueGrey.firTextStyle}
                                >
                                    {fir.icao}
                                </Text>
                            </ClientMarker>
                        </View>
                    );
                }
            }
        });
        return markers;
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
