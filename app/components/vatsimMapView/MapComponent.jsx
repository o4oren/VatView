import MapView, {Polyline} from 'react-native-maps';
import theme from '../../common/theme';
import allActions from '../../redux/actions';
import generateCtrPolygons from './CTRPolygons';
import generatePilotMarkers from './PilotMarkers';
import generateAirportMarkers from './AirportMarkers';
import {StyleSheet, View} from 'react-native';
import React, {useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

const MapComponent = ({screenSize}) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const initialRegion = useSelector(state => state.app.initialRegion);

    // console.log(ref);
    return <MapView
        ref={ref}
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        customMapStyle={theme.blueGrey.customMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        initialRegion={initialRegion}
        onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
    >
        {getMarkers(clients, airports, selectedClient)}
    </MapView>;
};

const getMarkers = (clients, airports, selectedClient) => {
    const markers = [
        generateCtrPolygons(clients.ctr, clients.fss),
        generatePilotMarkers(clients.pilots),
        generateAirportMarkers(clients.airportAtc, airports),
        renderToPath(airports, selectedClient),
        renderFromPath(airports, selectedClient)

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

const renderToPath = (airports, selectedClient) => {
    if(selectedClient != null && selectedClient.flight_plan != null && selectedClient.flight_plan.arrival != null) {
        const destAirport = airports.icao[selectedClient.flight_plan.arrival];
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
