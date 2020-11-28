import React, {useEffect} from "react";
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {StyleSheet, View, Dimensions} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import vatsimApiService from '../../services/vatsimApiService';
import allActions from '../../redux/actions';
import getAircraftIcon from '../../util/aircraftIconResolver'

export default function VatsimMapView() {
    const vatsimLiveData = useSelector(state => state.vatsimLiveData);
    const dispatch = useDispatch();

    useEffect(() => {
        function getVatsimData() {
            vatsimApiService.getVatsimLiveData().then(json =>
                dispatch(allActions.vatsimLiveDataActions.dataUpdated(json))
            );
        }
        getVatsimData()
        const interval = setInterval(() => getVatsimData(), 60 * 1000)
        return () => {
            clearInterval(interval);
        }
    }, [])

    const addAircraftMarkers = () => {
        return vatsimLiveData.clients.map(client => {
                if(client.clienttype === 'PILOT') {
                    return <Marker
                        key={client.callsign}
                        coordinate={{latitude: client.latitude, longitude: client.longitude}}
                        title={client.callsign}
                        image={getAircraftIcon(client.planned_aircraft)}
                        rotation={client.heading}
                        anchor={{x: 0.5, y: 0.5}}
                    />
                } else if (client.clienttype === 'ATC') {
                    if(client.callsign.split('_').pop() === 'TWR') {
                        return <Marker
                            key={client.callsign}
                            coordinate={{latitude: client.latitude, longitude: client.longitude}}
                            title={client.callsign}
                            image={require('../../../assets/tower-128.png')}
                            anchor={{x: 0.5, y: 0.5}}
                        />
                    } else if (client.callsign.split('_').pop() === 'APP' || client.callsign.split('_').pop() === 'DEP') {
                        return <Circle
                            center={{latitude: client.latitude, longitude: client.longitude}}
                            radius = {74000}
                            title={client.callsign}
                            strokeColor='#EC1616'
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
                provider={PROVIDER_GOOGLE}
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