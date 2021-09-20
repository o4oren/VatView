import MapView, {Polyline} from 'react-native-maps';
import theme from '../../common/theme';
import allActions from '../../redux/actions';
import generateCtrPolygons from './CTRPolygons';
import generatePilotMarkers from './PilotMarkers';
import generateAirportMarkers from './AirportMarkers';
import {StyleSheet, View} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getAirportsByICAOAsync, getAirportsByCodesArray} from '../../common/staticDataAcessLayer';

const MapComponent = ({screenSize}) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const initialRegion = useSelector(state => state.app.initialRegion);
    const [airports, setAirports] = useState([]);
    const [fromToCoords, setFromToCoords] = useState(null);

    // console.log(ref);

    useEffect(() => {
        if(Object.keys(clients.airportAtc).length > 0) {
            getAirportsByCodesArray(Object.keys(clients.airportAtc), (airports) => {
                setAirports(airports);
            });
        }
    }, [clients]);

    useEffect(() => {
        if(selectedClient == null || !selectedClient.flight_plan || !selectedClient.flight_plan.departure) {
            setFromToCoords(null);
        } else {
            getAirportsByICAOAsync([selectedClient.flight_plan.departure, selectedClient.flight_plan.arrival]).then((airports) => {
                const depAirport = airports.find(apt => apt.icao == selectedClient.flight_plan.departure);
                const arrAirport = airports.find(apt => apt.icao == selectedClient.flight_plan.arrival);
                if(depAirport && arrAirport) {
                    setFromToCoords({
                        from: {latitude: depAirport.latitude, longitude: depAirport.longitude},
                        to: {latitude: arrAirport.latitude, longitude: arrAirport.longitude},
                    });
                } else {
                    console.log('Could not resolve pilot\'s airports');
                    setFromToCoords(null);
                }
            }, (err) => {
                console.log('Promise rejected', err);
                setFromToCoords(null);
            });
        }
        
    }, [selectedClient]);

    return <MapView
        ref={ref}
        style={[styles.mapStyle, {width: screenSize.width, height: screenSize.height}]}
        customMapStyle={theme.blueGrey.customMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        initialRegion={initialRegion}
        onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
    >
        {getMarkers(clients, selectedClient, airports, fromToCoords)}
    </MapView>;
};

const getMarkers = (clients, selectedClient, airports, fromToCoords) => {
    const markers = [
        generateCtrPolygons(clients.ctr, clients.fss),
        generatePilotMarkers(),
        generateAirportMarkers(clients.airportAtc, airports),
        renderFromToPath(selectedClient, fromToCoords)
    ].flat(1).sort((a,b) => {
        return a.key > b.key ? 1 : (b.key > a.key ? -1 : 0);
    });
    return markers;
};

const renderFromToPath = (selectedClient, fromToCoords) => {
    if(fromToCoords != null) {
        return 	<View key={selectedClient.key + '_from_path'}>
            <Polyline
                coordinates={[
                    { latitude: fromToCoords.from.latitude, longitude: fromToCoords.from.longitude },
                    { latitude: selectedClient.latitude, longitude: selectedClient.longitude }
                ]}
                strokeColor="red"
                geodesic={true}
                strokeWidth={3}
                key={`${selectedClient.callsign}_from_path`}
            />
            <Polyline
                coordinates={[
                    { latitude: selectedClient.latitude, longitude: selectedClient.longitude },
                    { latitude: fromToCoords.to.latitude, longitude: fromToCoords.to.longitude }
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
