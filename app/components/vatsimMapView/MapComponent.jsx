import MapView, {Polyline} from 'react-native-maps';
import theme from '../../common/theme';
import allActions from '../../redux/actions';
import generateCtrPolygons from './CTRPolygons';
import generatePilotMarkers from './PilotMarkers';
import generateAirportMarkers from './AirportMarkers';
import {StyleSheet} from 'react-native';
import React, {useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';

const MapComponent = ({clients, selectedClient, airports, screenSize}) => {
    const app = useSelector(state => state.app);
    const dispatch = useDispatch();
    const mapRef = useRef(null);

    // if(mapRef && mapRef.current) console.log(mapRef.current.props.children[0].sort((a,b) => {
    //     return (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0);
    // }));
    // if(mapRef)
    // {
    //     console.log('prev', prevMarkers);
    //     const currentMarkers = mapRef.current.props.children[1].map(c => c.key).sort();
    //     console.log('keys', );
    //     prevMarkers.forEach(marker => {
    //         if(marker.key )
    //     })
    //     prevMarkers = [];
    // }

    return <MapView
        ref={mapRef}
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        customMapStyle={theme.blueGrey.customMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        initialRegion={app.initialRegion}
        onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
    >
        {getMarkers(clients, airports)}
        {renderFromPath(airports, selectedClient)}
        {renderToPath(airports, selectedClient)}
    </MapView>;
};

const getMarkers = (clients, airports) => {
    const markers = [
        generateCtrPolygons(clients.ctr, clients.fss),
        generatePilotMarkers(clients.pilots),
        generateAirportMarkers(clients.airportAtc, airports),
    ].flat(1);
    console.log('markers', markers);
    return markers;
};

const renderFromPath = (airports, selectedClient) => {
    if(selectedClient != null && selectedClient.flight_plan != null && selectedClient.flight_plan.departure != null) {
        const depAirport = airports.icao[selectedClient.flight_plan.departure];
        if(depAirport && depAirport.latitude) {
            return 	<Polyline
                coordinates={[
                    { latitude: depAirport.latitude, longitude: depAirport.longitude },
                    { latitude: selectedClient.latitude, longitude: selectedClient.longitude }
                ]}
                strokeColor="red"
                geodesic={true}
                strokeWidth={3}
                key={`${selectedClient.callsign}_path`}
            />;
        }
    }
};

const renderToPath = (airports, selectedClient) => {
    if(selectedClient != null && selectedClient.flight_plan != null && selectedClient.flight_plan.arrival != null) {
        const destAirport = airports.icao[selectedClient.flight_plan.arrival];
        if(destAirport && destAirport.latitude) {
            return 	<Polyline
                coordinates={[
                    { latitude: selectedClient.latitude, longitude: selectedClient.longitude },
                    { latitude: destAirport.latitude, longitude: destAirport.longitude }
                ]}
                strokeColor="green"
                geodesic={true}
                strokeWidth={3}
            />;
        }
    }
};

const styles = StyleSheet.create({
    mapStyle: {
        flex:1
    }
});

export default MapComponent;