import React, {useEffect, useRef, useState} from 'react';
import {SafeAreaView, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import theme from '../../common/theme';
import BottomSheet from 'reanimated-bottom-sheet';
import ClientDetails from '../clientDetails/ClientDetails';
import MapComponent from './MapComponent';

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const dispatch = useDispatch();
    const sheetRef = useRef(null);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const initialRegion = useSelector(state => state.app.initialRegion);
    const [prevSelectedClient, setPrevSelectedClient] = useState({});
    const [screenSize, setScreenSize] = useState({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    const updateScreenSize = () => {
        setScreenSize({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    };

    useEffect(() => {
        if (selectedClient == null)
            sheetRef.current.snapTo(2);
        else if(prevSelectedClient == null || (
            (selectedClient.cid != null && selectedClient.cid !== prevSelectedClient.cid) ||
            (selectedClient.icao != null && selectedClient.icao !== prevSelectedClient.icao)
        )) {
            sheetRef.current.snapTo(1);
        } else if(selectedClient.cid == prevSelectedClient.cid || selectedClient.icao !== prevSelectedClient.icao)
            return;
        setPrevSelectedClient(selectedClient);
    }, [selectedClient]);

    // if selected client is not null, we update it with the one from the new update
    useEffect(() => {
        if(selectedClient !== undefined) {
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
                initialRegion={initialRegion}
                clients={clients}
                selectedClient={selectedClient}
                airports={airports}
                screenSize={screenSize}
            />
            <BottomSheet
                ref={sheetRef}
                snapPoints={[400, 300, 0]}
                borderRadius={10}
                renderContent={() => (<ClientDetails
                    client={selectedClient}
                    fill={true}
                />)}
                initialSnap={2}
            />
        </SafeAreaView>
    );
}

