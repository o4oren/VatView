import React, {useEffect, useRef, useState} from 'react';
import MapView, { Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import {StyleSheet, Text, View, Dimensions} from 'react-native';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import theme from '../../common/theme';
import BottomSheet from 'reanimated-bottom-sheet';
import ClientDetails from './clientDetails';
import PilotMarkers from './PilotMarkers';
import AppCircles from './AppCircles';
import CTRPolygons from './CTRPolygons';
import AirportMarkers from './AirportMarkers';

export default function VatsimMapView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const app = useSelector(state => state.app);
    const dispatch = useDispatch();
    const mapRef = useRef(null);
    const sheetRef = React.useRef(null);
    const selectedClient = useSelector(state => state.app.selectedClient);

    const [screenSize, setScreenSize] = useState({width: Dimensions.get('window').width, height: Dimensions.get('window').height});

    const updateScreenSize = () => {
        setScreenSize({width: Dimensions.get('window').width, height: Dimensions.get('window').height});
    };

    const renderContent = () => (
        <ClientDetails
            client={selectedClient}
        />
    );

    useEffect(() => {
        if(selectedClient !== undefined)
            sheetRef.current.snapTo(1);
    }, [selectedClient]);

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
                <CTRPolygons
                    style={{zIndex: 4}}
                    ctr={clients.ctr}
                    fss={clients.fss}
                />
                <AppCircles
                    app={clients.app}
                    style={{zIndex: 3}}
                />
                {/*// TODO aerodrome markers*/}
                <PilotMarkers
                    style={{zIndex: 2}}
                    pilots={clients.pilots}
                />
                <AirportMarkers
                    style={{zIndex: 1}}
                    airports={clients.airportAtc}
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
