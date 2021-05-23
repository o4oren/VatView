import MapView, {Polyline} from 'react-native-maps';
import theme from '../../common/theme';
import allActions from '../../redux/actions';
import generateCtrPolygons from './CTRPolygons';
import generatePilotMarkers from './PilotMarkers';
import generateAirportMarkers from './AirportMarkers';
import {StyleSheet, View} from 'react-native';
import React, {useRef, useState} from 'react';
import {useDispatch} from 'react-redux';

const MapComponent = ({clients, selectedClient, airports, screenSize, initialRegion}) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const [mapBoundaries, setMapBoundaries ] = useState(null);

    const regionChanged = (region) => {
        if (ref == null)
            return;
        ref.current.getMapBoundaries().then(boundaries => {
            const lamin = Math.min(boundaries.northEast.latitude, boundaries.southWest.latitude);
            const lamax = Math.max(boundaries.northEast.latitude, boundaries.southWest.latitude);
            const lomin = Math.min(boundaries.northEast.longitude, boundaries.southWest.longitude);
            const lomax = Math.max(boundaries.northEast.longitude, boundaries.southWest.longitude);
            setMapBoundaries({
                lamin: lamin,
                lamax: lamax,
                lomin: lomin,
                lomax: lomax
            });
        });
        dispatch(allActions.appActions.saveInitialRegion(region));
    };

    // console.log(ref);
    return <MapView
        ref={ref}
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        customMapStyle={theme.blueGrey.customMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        initialRegion={initialRegion}
        onMapReady={region => regionChanged(region)}
        onRegionChangeComplete={region => regionChanged(region)}
    >
        {getMarkers(clients, airports, selectedClient, mapBoundaries)}
    </MapView>;
};

const getMarkers = (clients, airports, selectedClient, mapBoundaries) => {
    if(mapBoundaries == {})
        return [];
    const markers = [
        generateCtrPolygons(clients.ctr, clients.fss),
        generatePilotMarkers(clients.pilots, mapBoundaries),
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