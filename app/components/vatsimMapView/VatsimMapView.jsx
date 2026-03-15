import React, {useCallback, useEffect, useRef, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import ClientDetails from '../clientDetails/ClientDetails';
import MapComponent from './MapComponent';
import MapOverlayGroup from '../mapOverlay/MapOverlayGroup';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import analytics from '../../common/analytics';

function getDataStatus(general) {
    if (!general || !general.update_timestamp) {
        return 'error';
    }
    const updateTime = new Date(general.update_timestamp).getTime();
    if (Number.isNaN(updateTime)) {
        return 'error';
    }
    const delta = Date.now() - updateTime;
    return delta < 90000 ? 'live' : 'stale';
}

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const general = useSelector(state => state.vatsimLiveData.general);
    const dataStatus = getDataStatus(general);
    const dispatch = useDispatch();
    const sheetRef = useRef(null);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const [prevSelectedClient, setPrevSelectedClient] = useState({});
    const lastLoggedClientRef = useRef(null);
    const filters = useSelector(state => state.app.filters);
    const handleMapPress = useCallback((event) => {
        if (event?.nativeEvent?.action === 'marker-press') {
            return;
        }
        dispatch(allActions.appActions.clientSelected(null));
    }, [dispatch]);

    // Deselect pilot when the pilots filter is turned off (pilots have flight_plan)
    useEffect(() => {
        if (!filters.pilots && selectedClient?.flight_plan != null) {
            dispatch(allActions.appActions.clientSelected(null));
        }
    }, [filters.pilots]);

    // Deselect ATC when the ATC filter is turned off (ATC has no flight_plan)
    useEffect(() => {
        if (!filters.atc && selectedClient != null && selectedClient.flight_plan == null) {
            dispatch(allActions.appActions.clientSelected(null));
        }
    }, [filters.atc]);

    useEffect(() => {
        if (selectedClient == null) {
            sheetRef.current?.snapToIndex(-1);
        } else if(prevSelectedClient == null || (
            (selectedClient.cid != null && selectedClient.cid !== prevSelectedClient.cid) ||
            (selectedClient.icao != null && selectedClient.icao !== prevSelectedClient.icao)
        )) {
            sheetRef.current?.snapToIndex(0);
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
        <View
            style={StyleSheet.absoluteFillObject}
            experimental_accessibilityOrder={['map-overlay-group', 'map-content']}
        >
            <View style={StyleSheet.absoluteFillObject} nativeID='map-content'>
                <MapComponent onMapPress={handleMapPress} />
            </View>
            <MapOverlayGroup dataStatus={dataStatus} />
            <BottomSheet
                ref={sheetRef}
                enablePanDownToClose={true}
                snapPoints={[300, 400]}
                borderRadius={10}
                index={-1}
                onChange={(index) => {
                    if (index === -1) {
                        lastLoggedClientRef.current = null;
                        if (selectedClient != null) {
                            dispatch(allActions.appActions.clientSelected(null));
                        }
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
