import React, {useEffect} from 'react';
import MapView, {Circle, Marker, Polygon, PROVIDER_GOOGLE} from 'react-native-maps';
import {StyleSheet, View, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import getAircraftIcon from '../../util/aircraftIconResolver';
import theme from './theme';
export default function VatsimMapView() {
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const settings = useSelector(state => state.settings);
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateData);
        dispatch(allActions.staticAirspaceDataActions.getFirBoundaries);
        dispatch(allActions.staticAirspaceDataActions.getVATSpyData);
        const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), 60 * 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    const getFirCoordinates = callsign => {
        const icao = callsign.split('_')[0];
        let fir = staticAirspaceData.firBoundaries.find(fir => fir.icao === icao);
        if (fir == undefined) {
            let fallbackFir = staticAirspaceData.firs.find(fir => fir.prefix == icao);
            let firIcao;
            if (fallbackFir != undefined) {
                firIcao = fallbackFir.icao;
            } else {
                const airport = staticAirspaceData.airports.find(airport => airport.iata == icao);
                if (airport != undefined) {
                    firIcao = airport.fir;
                } else {
                    console.log('Not found!', icao);
                }
            }
            fir = staticAirspaceData.firBoundaries.find( fir => fir.icao == firIcao);
            if (fir != undefined)
                return fir.points;
        } else
            return fir.points;
        return [];
    };

    const addAircraftMarkers = () => {
        return vatsimLiveData.clients.map((client, index )=> {
            if(client.clienttype === 'PILOT') {
                return <Marker
                    key={index}
                    coordinate={{latitude: client.latitude, longitude: client.longitude}}
                    title={client.callsign}
                    image={getAircraftIcon(client.planned_aircraft)}
                    rotation={client.heading}
                    anchor={{x: 0.5, y: 0.5}}
                />;
            } else if (client.clienttype === 'ATC') {
                if(client.callsign.split('_').pop() === 'TWR') {
                    return <Marker
                        key={index}
                        coordinate={{latitude: client.latitude, longitude: client.longitude}}
                        title={client.callsign}
                        image={require('../../../assets/tower-96.png')}
                        anchor={{x: 0.5, y: 0.5}}
                    />;
                } else if (client.callsign.split('_').pop() === 'APP' || client.callsign.split('_').pop() === 'DEP') {
                    return <Circle
                        key={index}
                        center={{latitude: client.latitude, longitude: client.longitude}}
                        radius = {80000}
                        title={client.callsign}
                        strokeColor={theme.blueGrey.appCircleStroke}
                        fillColor={theme.blueGrey.appCircleFill}
                        strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                    />;
                } else if (client.callsign.split('_').pop() === 'CTR') {
                    return <Polygon
                        key={index}
                        coordinates={getFirCoordinates(client.callsign)}
                        strokeColor={theme.blueGrey.ctrStrokeColor}
                        fillColor={theme.blueGrey.ctrFill}
                        strokeWidth={theme.blueGrey.ctrStrokeWidth}
                    />;
                }
            }
        });
    };

    return (
        <View style={styles.container}>
            <MapView
                style={styles.mapStyle}
                customMapStyle={theme.blueGrey.customMapStyle}
                provider={PROVIDER_GOOGLE}
                rotateEnabled={false}
                initialRegion={settings.initialRegion}
                onRegionChangeComplete={region => dispatch(allActions.settingsActions.saveInitialRegion(region))}
            >
                {addAircraftMarkers()}
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
