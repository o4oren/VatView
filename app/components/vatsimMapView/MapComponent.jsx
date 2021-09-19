import MapView, {Polyline} from 'react-native-maps';
import theme from '../../common/theme';
import allActions from '../../redux/actions';
import generateCtrPolygons from './CTRPolygons';
import generatePilotMarkers from './PilotMarkers';
import generateAirportMarkers from './AirportMarkers';
import {StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getAirportByICAO, getAirportsByCodesArray} from '../../common/staticDataAcessLayer';

const MapComponent = ({screenSize}) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const initialRegion = useSelector(state => state.app.initialRegion);
    const [airports, setAirports] = useState([]);
    // console.log(ref);

    useEffect(() => {
        if(Object.keys(clients.airportAtc).length > 0) {
            getAirportsByCodesArray(Object.keys(clients.airportAtc), (airports) => {
                setAirports(airports);
            });
        }
    }, [clients]);

    return <MapView
        ref={ref}
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        customMapStyle={theme.blueGrey.customMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        initialRegion={initialRegion}
        onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
    >
        {getMarkers(clients, selectedClient, airports)}
    </MapView>;
};

const getMarkers = (clients, selectedClient, airports) => {
    const markers = [
        generateCtrPolygons(clients.ctr, clients.fss),
        generatePilotMarkers(),
        generateAirportMarkers(clients.airportAtc, airports),
        renderToPath(selectedClient),
        renderFromPath(selectedClient)

    ].flat(1).sort((a,b) => {
        return a.key > b.key ? 1 : (b.key > a.key ? -1 : 0);
    });
    return markers;
};

const renderFromPath = (airports, selectedClient) => {
    if(selectedClient != null && selectedClient.flight_plan != null && selectedClient.flight_plan.departure != null) {
        const depAirport = airports.icao[selectedClient.flight_plan.departure];
        if(depAirport && depAirport.latitude) {
            return 	<View key={selectedClient.key + '_from_path'}>
                <Polyline
                    coordinates={[
                        { latitude: depAirport.latitude, longitude: depAirport.longitude },
                        { latitude: selectedClient.latitude, longitude: selectedClient.longitude }
                    ]}
                    strokeColor="red"
                    geodesic={true}
                    strokeWidth={3}
                    key={`${selectedClient.callsign}_path`}
                />
            </View>;
        }
    }
};

const renderToPath = (selectedClient) => {
    if(selectedClient != null && selectedClient.flight_plan != null && selectedClient.flight_plan.arrival != null) {
        const destAirport = getAirportByICAO(selectedClient.flight_plan.arrival);
        if(destAirport && destAirport.latitude) {
            return 	<View key={selectedClient.key + '_to_path'}>
                <Polyline
                    coordinates={[
                        { latitude: selectedClient.latitude, longitude: selectedClient.longitude },
                        { latitude: destAirport.latitude, longitude: destAirport.longitude }
                    ]}
                    strokeColor="green"
                    geodesic={true}
                    strokeWidth={3}
                />
            </View>;
        }
    }
};

const styles = StyleSheet.create({
    mapStyle: {
        flex:1
    }
});

export default MapComponent;
