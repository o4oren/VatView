import React, {useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import ClientDetails from '../clientDetails/ClientDetails';
import MapComponent from './MapComponent';
import FloatingFilterChips from '../filterBar/FloatingFilterChips';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import analytics from '../../common/analytics';

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const dispatch = useDispatch();
    const sheetRef = useRef(null);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const [prevSelectedClient, setPrevSelectedClient] = useState({});
    const lastLoggedClientRef = useRef(null);

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
        if(selectedClient != null && selectedClient.cid != null) {
            // Check pilots
            const newPilot = clients.pilots.filter(p => p.cid === selectedClient.cid);
            if(newPilot.length > 0) {
                dispatch(allActions.appActions.clientSelected(newPilot[0]));
                return;
            }
            // Check airport ATC controllers
            for (const icao in clients.airportAtc) {
                const atcMatch = clients.airportAtc[icao].find(c => c.cid === selectedClient.cid);
                if (atcMatch) {
                    dispatch(allActions.appActions.clientSelected(atcMatch));
                    return;
                }
            }
            // Check CTR controllers
            for (const prefix in clients.ctr) {
                const ctrMatch = clients.ctr[prefix].find(c => c.cid === selectedClient.cid);
                if (ctrMatch) {
                    dispatch(allActions.appActions.clientSelected(ctrMatch));
                    return;
                }
            }
            // Check FSS controllers
            for (const prefix in clients.fss) {
                const fssMatch = clients.fss[prefix].find(c => c.cid === selectedClient.cid);
                if (fssMatch) {
                    dispatch(allActions.appActions.clientSelected(fssMatch));
                    return;
                }
            }
            // Client disconnected — clear selection
            dispatch(allActions.appActions.clientSelected(null));
        }
    }, [clients]);

    return (
        <View style={StyleSheet.absoluteFillObject}>
            <MapComponent />
            <FloatingFilterChips />
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
        </View>
    );
}

