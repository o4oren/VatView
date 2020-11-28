import React, {useEffect} from "react";
import MapView, {Circle, Marker, PROVIDER_GOOGLE} from "react-native-maps";
import {StyleSheet, View, Dimensions} from "react-native";
import {useDispatch, useSelector} from "react-redux";
import vatsimApiService from '../../services/vatsimApiService';
import allActions from '../../redux/actions';

export default function VatsimMapView() {
    const vatsimData = useSelector(state => state.vatsimData);
    const dispatch = useDispatch();

    useEffect(() => {
        vatsimApiService.getVatsimLiveData().then(json =>
            dispatch(allActions.vatsimDataActions.dataUpdated(json))
        );
    }, []);

    const addAircraftMarkers = () => {
        return vatsimData.aircraft.map(aircraft =>
            <Marker
                key={aircraft.cid}
                coordinate={{latitude: aircraft.latitude, longitude: aircraft.longitude}}
                title={aircraft.callsign}
                image={require('../../../assets/airplane.png')}
                rotation={aircraft.heading}
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