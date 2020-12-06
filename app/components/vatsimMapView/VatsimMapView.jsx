import React, {useEffect, useRef, useState} from 'react';
import MapView, { PROVIDER_GOOGLE } from 'react-native-maps';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import ClientMarker from './clientMarker';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import theme from './theme';
import BottomSheet from 'reanimated-bottom-sheet';
import ClientDetails from './clientDetails';

import {
    APP,
    ATC, CTR,
    EXCLUDED_CALLSIGNS,
    ONE_MIN,
    ONE_MONTH,
    PILOT,
    STATIC_DATA_VERSION,
    TWR_ATIS,
    FSS
} from '../../util/consts';

export default function VatsimMapView() {
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const settings = useSelector(state => state.settings);
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const sheetRef = React.useRef(null);
    const [selectedClient, setSelectedClient] = useState();
    const [clientMarkers, setClientMarkers] = useState([]);
    const [screenSize, setScreenSize] = useState({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    const [mapReady, setMapReady] = useState(false);

    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateData);
        const now = Date.now();
        if(staticAirspaceData.version == undefined
            || staticAirspaceData.version < STATIC_DATA_VERSION
            || now - staticAirspaceData.lastUpdated > ONE_MONTH) {
            dispatch(allActions.staticAirspaceDataActions.getFirBoundaries);
            dispatch(allActions.staticAirspaceDataActions.getVATSpyData);
        }
        const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), 60 * 1000);
        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        console.debug('update markers');
        updateClientMarkers().then(markers => {
            console.log('updating markers');
            setClientMarkers(markers);
            setTimeout(() => setMapReady(true), 1000);
        });
    }, [vatsimLiveData]);

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
        const markers = vatsimLiveData.clients.map((client, index )=> {
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
                initialRegion={settings.initialRegion}
                onRegionChangeComplete={region => dispatch(allActions.settingsActions.saveInitialRegion(region))}
            >
                {clientMarkers}
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
