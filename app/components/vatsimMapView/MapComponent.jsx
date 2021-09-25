import MapView, {Polyline} from 'react-native-maps';
import theme from '../../common/theme';
import allActions from '../../redux/actions';
import generateCtrPolygons from './CTRPolygons';
import generatePilotMarkers from './PilotMarkers';
import generateAirportMarkers from './AirportMarkers';
import {StyleSheet, View} from 'react-native';
import React, {useRef, } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';

const MapComponent = ({screenSize}) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const initialRegion = useSelector(state => state.app.initialRegion);

    // console.log(ref);

    const clients = vatsimLiveData.clients;
    const airports = vatsimLiveData.cachedAirports;
    const cachedFirBoundaries = vatsimLiveData.cachedFirBoundaries;

    return <MapView
        ref={ref}
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        customMapStyle={theme.blueGrey.customMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        initialRegion={initialRegion}
        onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
    >
        {getMarkers(clients, selectedClient, airports, cachedFirBoundaries)}
    </MapView>;
};

const getMarkers = (clients, selectedClient, airports, cachedFirBoundaries) => {
    const markers = [
        generateCtrPolygons(clients.ctr, clients.fss, cachedFirBoundaries),
        generatePilotMarkers(airports),
        generateAirportMarkers(clients.airportAtc, airports),
        renderFromToPath(selectedClient,airports)
    ].flat(1).sort((a,b) => {
        return a.key > b.key ? 1 : (b.key > a.key ? -1 : 0);
    });
    return markers;
};

const renderFromToPath = (selectedClient, airports) => {
    if(selectedClient && selectedClient.flight_plan != null && selectedClient.flight_plan.departure != null) {
        const departure = getAirportByCode(selectedClient.flight_plan.departure, airports);
        const arrival = getAirportByCode(selectedClient.flight_plan.arrival, airports);
        console.log('s', selectedClient);
        console.log('a', airports);
        return 	<View key={selectedClient.key + '_from_path'}>
            <Polyline
                coordinates={[
                    { latitude: departure.latitude, longitude: departure.longitude },
                    { latitude: selectedClient.latitude, longitude: selectedClient.longitude }
                ]}
                strokeColor="red"
                geodesic={true}
                strokeWidth={3}
                key={`${selectedClient.callsign}_from_path`}
                lineCap={'round'}
            />
            <Polyline
                coordinates={[
                    { latitude: selectedClient.latitude, longitude: selectedClient.longitude },
                    { latitude: arrival.latitude, longitude: arrival.longitude }
                ]}
                strokeColor="green"
                geodesic={true}
                strokeWidth={3}
                key={`${selectedClient.callsign}_to_path`}
            />
        </View>;
    }
};

const styles = StyleSheet.create({
    mapStyle: {
        flex:1
    }
});

export default MapComponent;
