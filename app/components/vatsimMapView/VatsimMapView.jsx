import React, {useEffect, useRef, useState} from 'react';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import ClientMarker from './clientMarker';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import theme from '../../common/theme';
import BottomSheet from 'reanimated-bottom-sheet';
import ClientDetails from './clientDetails';
import {PILOT} from '../../common/consts';
import PilotMarkers from './PilotMarkers';
import AppCircles from './AppCircles';
import CTRPolygons from './CTRPolygons';

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const modClients = useSelector(state => state.vatsimLiveData.modClients);

    const app = useSelector(state => state.app);
    const markers = useSelector(state => state.vatsimLiveData.markers);
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const sheetRef = React.useRef(null);
    const [selectedClient, setSelectedClient] = useState();

    const [screenSize, setScreenSize] = useState({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        console.debug('update markers');
        updateClientMarkers().then(markers => {
            dispatch(allActions.vatsimLiveDataActions.markersUpdated(markers));
            console.log(markers);
            setMapReady(true);
            console.log('modClients', modClients);
        });
    }, [clients]);

    const updateScreenSize = () => {
        setScreenSize({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    };

    const renderContent = () => (
        <ClientDetails
            client={selectedClient}
        />
    );

    const openDetailsSheet = (client) => {
        setSelectedClient(client);
        sheetRef.current.snapTo(0);
    };

    const updateClientMarkers = async () => {
        const markers = clients.map((client, index ) => {
            if(client.clienttype != PILOT)
                return <ClientMarker
                    key={client.cid + '-' + client.callsign + '-' + index}
                    client={client}
                    mapReady={mapReady}
                    onPress={openDetailsSheet.bind(this, client)}
                />;
        });
        return markers;
    };

    return (
        <View
            style={[styles.container, {width: screenSize.wisth, height: setScreenSize.height}]}
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
                <AppCircles app={modClients.app} />
                <CTRPolygons ctr={modClients.ctr} fss={modClients.fss}/>
                <PilotMarkers
                    pilots={modClients.pilots}
                    mapReady={mapReady}
                />
            </MapView>
            <BottomSheet
                ref={sheetRef}
                snapPoints={[450, 300, 0]}
                borderRadius={10}
                renderContent={renderContent}
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
    },
});
