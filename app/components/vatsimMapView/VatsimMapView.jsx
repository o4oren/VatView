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
        console.log('useeffect called')
        function getVatsimData() {
            vatsimApiService.getVatsimLiveData().then(json =>
                dispatch(allActions.vatsimDataActions.dataUpdated(json))
            );
        }
        getVatsimData()
        const interval = setInterval(() => getVatsimData(), 60 * 1000)
        return () => {
            clearInterval(interval);
        }
    }, [])


    const addAircraftMarkers = () => {
        return vatsimData.clients.map(client => {
                if(client.clienttype === 'PILOT') {
                    return <Marker
                        key={client.callsign}
                        coordinate={{latitude: client.latitude, longitude: client.longitude}}
                        title={client.callsign}
                        image={require('../../../assets/airplane.png')}
                        rotation={client.heading}
                        anchor={{x: 0.5, y: 0.5}}
                    />
                } else if (client.clienttype === 'ATC') {
                    if(client.callsign.split('_').pop() === 'TWR') {
                        console.log(client.callsign)
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