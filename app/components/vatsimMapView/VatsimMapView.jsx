import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import theme from '../../common/theme';
import ClientDetails from '../clientDetails/ClientDetails';
import MapComponent from './MapComponent';
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const dispatch = useDispatch();
    const sheetRef = useRef(null);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const [prevSelectedClient, setPrevSelectedClient] = useState({});
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

