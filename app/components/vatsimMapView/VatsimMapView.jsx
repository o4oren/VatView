import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import theme from '../../common/theme';
import ClientDetails from '../clientDetails/ClientDetails';
import MapComponent from './MapComponent';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import analytics from '../../common/analytics';

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const dispatch = useDispatch();
    const sheetRef = useRef(null);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const [prevSelectedClient, setPrevSelectedClient] = useState({});
    const lastLoggedClientRef = useRef(null);
    const [screenSize, setScreenSize] = useState({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    const updateScreenSize = () => {
        setScreenSize({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    };

    useEffect(() => {
        if (selectedClient == null)
            sheetRef.current.snapToIndex(0);
        else if(prevSelectedClient == null || (
            (selectedClient.cid != null && selectedClient.cid !== prevSelectedClient.cid) ||
            (selectedClient.icao != null && selectedClient.icao !== prevSelectedClient.icao)
        )) {
            sheetRef.current.snapToIndex(0);
        } else if(selectedClient.cid == prevSelectedClient.cid || selectedClient.icao !== prevSelectedClient.icao)
            return;
        setPrevSelectedClient(selectedClient);
    }, [selectedClient]);

    // if selected client is not null, we update it with the one from the new update
    useEffect(() => {
        if(selectedClient != null) {
            const newClient = clients.pilots.filter(p => p.cid === selectedClient.cid);
            if(newClient.length > 0)
                dispatch(allActions.appActions.clientSelected(newClient[0]));
            else
                dispatch(allActions.appActions.clientSelected(selectedClient));
        }
    }, [clients]);

    return (
        <SafeAreaView
            style={[theme.blueGrey.safeAreaView, {width: screenSize.width, flex: 1}]}
            onLayout={updateScreenSize}
        >
            <MapComponent
                screenSize={screenSize}
            />
            <BottomSheet
                ref={sheetRef}
                enablePanDownToClose={true}
                snapPoints={[300, 400]}
                borderRadius={10}
                index={-1}
                onChange={(index) => {
                    if (index === -1) {
                        lastLoggedClientRef.current = null;
                        return;
                    }
                    const client = selectedClient;
                    if (client) {
                        const clientKey = client.cid || client.icao;
                        if (clientKey !== lastLoggedClientRef.current) {
                            lastLoggedClientRef.current = clientKey;
                            const eventName = client.cid ? 'sheet_open_pilot' : 'sheet_open_atc';
                            const params = client.cid
                                ? { callsign: client.callsign, cid: String(client.cid) }
                                : { icao: client.icao };
                            analytics.logEvent(eventName, params);
                        }
                    }
                }}
            >
                <BottomSheetView>
                    <ClientDetails
                        client={selectedClient}
                        fill={true}
                    />
                </BottomSheetView>
            </BottomSheet>
        </SafeAreaView>
    );
}

