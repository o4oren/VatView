import React, {useEffect} from "react";
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {StyleSheet, View, Dimensions} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import vatsimApiService from '../../services/vatsimApiService';
import allActions from '../../redux/actions';

export default function VatsimMapView() {
    const traffic = useSelector(state => state.traffic);
    const dispatch = useDispatch();

    useEffect(() => {
        vatsimApiService.getVatsimTraffic().then(json =>
            dispatch(allActions.trafficActions.trafficUpdated(json))
        );
        console.log('traffic', traffic);
    }, []);

    const addAircraftMarkers = () => {
        return traffic.aircraft.map(aircraft =>
            <Marker
                coordinate={{latitude: aircraft.lat, longitude: aircraft.lon}}
                title={aircraft.callsign}
                image={require('../../../assets/airplane.png')}
                rotation={aircraft.hdg}
            />
        )
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