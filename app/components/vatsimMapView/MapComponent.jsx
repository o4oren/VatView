import MapView, {Polyline} from 'react-native-maps';
import {useTheme} from '../../common/ThemeProvider';
import allActions from '../../redux/actions';
import generateCtrPolygons from './CTRPolygons';
import generatePilotMarkers from './PilotMarkers';
import generateAirportMarkers from './AirportMarkers';
import {StyleSheet, View} from 'react-native';
import React, {useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';

const MapComponent = ({screenSize}) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const {activeMapStyle} = useTheme();
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const initialRegion = useSelector(state => state.app.initialRegion);

    const clients = vatsimLiveData.clients;
    const airports = vatsimLiveData.cachedAirports;
    const cachedFirBoundaries = vatsimLiveData.cachedFirBoundaries;

    return <MapView
        ref={ref}
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        customMapStyle={activeMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        toolbarEnabled={false}
        initialRegion={initialRegion}
        onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
    >
        {getMarkers(clients, airports, cachedFirBoundaries)}
        {renderFromToPath(selectedClient, airports)}
    </MapView>;
};

const getMarkers = (clients, airports, cachedFirBoundaries) => {
    const markers = [
        generateCtrPolygons(clients.ctr, clients.fss, cachedFirBoundaries),
        generatePilotMarkers(),
        generateAirportMarkers(clients.airportAtc, airports),
    ].flat(1).sort((a,b) => {
        return a.key > b.key ? 1 : (b.key > a.key ? -1 : 0);
    });
    return markers;
};

const renderFromToPath = (selectedClient, airports) => {
    if(selectedClient && selectedClient.flight_plan != null && selectedClient.flight_plan.departure != null) {
        const departure = getAirportByCode(selectedClient.flight_plan.departure, airports);
        const arrival = getAirportByCode(selectedClient.flight_plan.arrival, airports);
        const depLine = departure != null ? <Polyline
            coordinates={[
                { latitude: departure.latitude, longitude: departure.longitude },
                { latitude: selectedClient.latitude, longitude: selectedClient.longitude }
            ]}
            strokeColor="red"
            geodesic={true}
            strokeWidth={3}
            key={`${selectedClient.callsign}_from_path`}
            lineCap={'round'}
        /> : null;

        const arrLine = arrival != null ? <Polyline
            coordinates={[
                { latitude: selectedClient.latitude, longitude: selectedClient.longitude },
                { latitude: arrival.latitude, longitude: arrival.longitude }
            ]}
            strokeColor="green"
            geodesic={true}
            strokeWidth={3}
            key={`${selectedClient.callsign}_to_path`}
        /> : null;

        return [depLine, arrLine].filter(Boolean);
    }
    return [];
};

const styles = StyleSheet.create({
    mapStyle: {
        flex:1
    }
});

export default MapComponent;
