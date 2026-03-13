import {Marker} from 'react-native-maps';
import {Image} from 'react-native';
import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {Platform} from 'react-native';
import {mapIcons} from '../../common/iconsHelper';

export default function generatePilotMarkers() {
    const selectedClient = useSelector(state => state.app.selectedClient);
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);

    const dispatch = useDispatch();
    const isAndroid = Platform.OS === 'android';
    const defaultImageSize = isAndroid ? 64 : 32;
    const pilotMarkers = pilots.map( pilot => {
        const pilotImage = pilot.image || mapIcons.B737;
        const pilotImageSize = pilot.image ? pilot.imageSize : defaultImageSize;
        if (!pilot.image) {
            console.warn('Pilot missing image:', pilot.callsign);
        }

        let onPress = (pilot) => {
            // Analytics.logEvent('SelectedPilot', {
            //     callsign: pilot.callsign,
            //     purpose: 'Clicking a flight',
            // });
            if(selectedClient && pilot.callsign == selectedClient.callsign) {
                dispatch(allActions.appActions.clientSelected(null));
            } else {
                dispatch(allActions.appActions.clientSelected(pilot));
            }
        };

        return <Marker
            key={pilot.key}
            coordinate={{latitude: pilot.latitude, longitude: pilot.longitude}}
            title={pilot.callsign}
            anchor={{x: 0.5, y: 0.5}}
            rotation={isAndroid ? pilot.heading : undefined}
            flat={isAndroid}
            onPress={() => onPress(pilot)}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
        >
            <Image
                source={pilotImage}
                fadeDuration={0}
                style={isAndroid
                    ? { height: pilotImageSize, width: pilotImageSize }
                    : { height: pilotImageSize, width: pilotImageSize, transform: [{rotate: `${pilot.heading}deg`}] }
                }
            />
        </Marker>;
    });

    return pilotMarkers;
}
