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
        setClientMarkers(updateClientMarkers());
    }, [vatsimLiveData]);

    const renderContent = () => (
        <ClientDetails
            client={selectedClient}
        />
    );

    const openDetailsSheet = (client) => {
        setSelectedClient(client);
        sheetRef.current.snapTo(0);
    };

    const updateClientMarkers = () => {
        // facilitytype:
        // 0 - OBS, 1 - FSS, 2 - DEL, 3 GND, 4 - TWR/ATIS, 5 - APP, 6 - CTR
        const markers = vatsimLiveData.clients.map((client, index )=> {
            return <ClientMarker
                key={client.cid + '-' + client.callsign + '-' + index}
                client={client}
                onPress={openDetailsSheet.bind(this, client)}
            />;
        });
        return markers;
    };

    return (
        <View style={styles.container}>
            <MapView
                ref={mapRef}
                style={styles.mapStyle}
                customMapStyle={theme.blueGrey.customMapStyle}
                provider={PROVIDER_GOOGLE}
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
        width: Dimensions.get('window').width,
        height: Dimensions.get('window').height,
    },
});
