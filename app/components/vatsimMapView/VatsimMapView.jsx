import React, {useEffect} from "react";
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {StyleSheet, View, Dimensions} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import allActions from '../../redux/actions';
import getAircraftIcon from '../../util/aircraftIconResolver'
import theme from "./theme";

export default function VatsimMapView() {
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const settings = useSelector(state => state.settings)
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(allActions.vatsimLiveDataActions.updateData);
        const interval = setInterval(() => dispatch(allActions.vatsimLiveDataActions.updateData), 60 * 1000)
        return () => {
            clearInterval(interval);
        }
    }, [])

    const addAircraftMarkers = () => {
        return vatsimLiveData.clients.map((client, index )=> {
                if(client.clienttype === 'PILOT') {
                    return <Marker
                        key={index}
                        coordinate={{latitude: client.latitude, longitude: client.longitude}}
                        title={client.callsign}
                        image={getAircraftIcon(client.planned_aircraft)}
                        rotation={client.heading}
                        anchor={{x: 0.5, y: 0.5}}
                    />
                } else if (client.clienttype === 'ATC') {
                    if(client.callsign.split('_').pop() === 'TWR') {
                        return <Marker
                            key={index}
                            coordinate={{latitude: client.latitude, longitude: client.longitude}}
                            title={client.callsign}
                            image={require('../../../assets/tower-96.png')}
                            anchor={{x: 0.5, y: 0.5}}
                        />
                    } else if (client.callsign.split('_').pop() === 'APP' || client.callsign.split('_').pop() === 'DEP') {
                        return <Circle
                            key={index}
                            center={{latitude: client.latitude, longitude: client.longitude}}
                            radius = {74000}
                            title={client.callsign}
                            strokeColor={theme.blueGrey.circleStroke}
                            fillColor={theme.blueGrey.circleFill}
                            strokeWidth={2}
                        />
                    }
                }
        });
    }

    return (
        <View style={styles.container}>
            <MapView
                style={styles.mapStyle}
                customMapStyle={theme.blueGrey.customMapStyle}
                provider={PROVIDER_GOOGLE}
                rotateEnabled={false}
                initialRegion={settings.initialRegion}
                onRegionChangeComplete={region => dispatch(allActions.settingsActions.saveInitialRegion(region))}
            >
                {addAircraftMarkers()}
            </MapView>
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
