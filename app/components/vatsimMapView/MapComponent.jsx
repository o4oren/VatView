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
    const pilotsSet = new Set(clients.pilots.map(p => p.key));
    const renderFromPath = () => {
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
                />;
            }
        }
    };

    const renderToPath = () => {
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

    // if(mapRef) console.log(mapRef);
    // console.log('keys', mapRef.current.props.children[1].map(c => c.key).sort());
    return <MapView
        ref={mapRef}
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        customMapStyle={theme.blueGrey.customMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        initialRegion={app.initialRegion}
        onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
    >
        {generateCtrPolygons(clients.ctr, clients.fss)}
        {generatePilotMarkers(clients.pilots, pilotsSet)}
        {generateAirportMarkers(clients.airportAtc, airports)}
        {renderFromPath()}
        {renderToPath()}
    </MapView>;
};

const styles = StyleSheet.create({
    mapStyle: {
        flex:1
    }
});

export default MapComponent;