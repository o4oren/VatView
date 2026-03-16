import React, {useCallback, useMemo, useState} from 'react';
import {View, StyleSheet} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import MapComponent from './MapComponent';
import MapOverlayGroup from '../mapOverlay/MapOverlayGroup';
import DetailPanelProvider, {requestDismiss} from '../detailPanel/DetailPanelProvider';

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
    const general = useSelector(state => state.vatsimLiveData.general);
    const dataStatus = useMemo(() => getDataStatus(general), [general]);
    const dispatch = useDispatch();
    const [sheetState, setSheetState] = useState('closed');

    const handleMapPress = useCallback((event) => {
        if (event?.nativeEvent?.action === 'marker-press') {
            return;
        }
        requestDismiss(dispatch);
    }, [dispatch]);

    return (
        <View
            style={StyleSheet.absoluteFillObject}
            experimental_accessibilityOrder={['map-overlay-group', 'map-content']}
        >
            <DetailPanelProvider onSheetStateChange={setSheetState}>
                <View style={StyleSheet.absoluteFillObject} nativeID='map-content'>
                    <MapComponent onMapPress={handleMapPress} />
                </View>
                <MapOverlayGroup dataStatus={dataStatus} sheetState={sheetState} />
            </DetailPanelProvider>
        </View>
    );
}
