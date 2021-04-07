import React, {useEffect, useRef, useState} from 'react';
import MapView, { Polyline } from 'react-native-maps';
import {StyleSheet, View, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import theme from '../../common/theme';
import BottomSheet from 'reanimated-bottom-sheet';
import ClientDetails from '../clientDetails/ClientDetails';
import PilotMarkers from './PilotMarkers';
import AppCircles from './AppCircles';
import CTRPolygons from './CTRPolygons';
import AirportMarkers from './AirportMarkers';

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const airports = useSelector(state => state.staticAirspaceData.airports.icao);
    const app = useSelector(state => state.app);
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const sheetRef = React.useRef(null);
    const selectedClient = useSelector(state => state.app.selectedClient);

    const [screenSize, setScreenSize] = useState({width: Dimensions.get('window').width, height: Dimensions.get('window').height});

    const updateScreenSize = () => {
        setScreenSize({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    };

    const renderFromPath = () => {
        if(selectedClient != null && selectedClient.flight_plan != null && selectedClient.flight_plan.departure != null) {
            const depAirport = airports[selectedClient.flight_plan.departure];
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
            const destAirport = airports[selectedClient.flight_plan.arrival];
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

    useEffect(() => {
        if(selectedClient != null) {
            sheetRef.current.snapTo(1);
        }
    }, [selectedClient]);

    // if selected client is not null, we update it with the one from the new update
    useEffect(() => {
        if(selectedClient !== undefined) {
            const newClient = clients.pilots.filter(p => p.cid == selectedClient.cid);
            if(newClient.length > 0)
                dispatch(allActions.appActions.clientSelected(newClient[0]));
            else
                dispatch(allActions.appActions.clientSelected(null));
        }
    }, [clients]);

    return (
        <View
            style={[styles.container, {width: screenSize.width, height: setScreenSize.height}]}
            onLayout={updateScreenSize}
        >
            <MapView
                ref={mapRef}
                style={[styles.mapStyle, {width: screenSize.width, height: setScreenSize.height}]}
                customMapStyle={theme.blueGrey.customMapStyle}
                // provider={PROVIDER_GOOGLE}
                rotateEnabled={false}
                initialRegion={app.initialRegion}
                onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
            >
                {/*{markers}*/}
                <CTRPolygons
                    style={{zIndex: 4}}
                    ctr={clients.ctr}
                    fss={clients.fss}
                />
                {/*// TODO aerodrome markers*/}
                <PilotMarkers
                    style={{zIndex: 2}}
                    pilots={clients.pilots}
                />
                <AirportMarkers
                    style={{zIndex: 1}}
                    airportAtc={clients.airportAtc}
                />
                {renderFromPath()}
                {renderToPath()}
            </MapView>
            <BottomSheet
                ref={sheetRef}
                snapPoints={[450, 300, 0]}
                borderRadius={10}
                renderContent={() => (<ClientDetails
                    client={selectedClient}
                />)}
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
        flex:1
        // width: screen.width,
        // height: screen.height,
    }
});
