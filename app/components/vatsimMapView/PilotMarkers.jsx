import {Marker} from 'react-native-maps';
import {Image, Platform} from 'react-native';
import React, {useCallback, useRef, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {mapIcons} from '../../common/iconsHelper';
import {getZoomBand, GROUND_SPEED_THRESHOLD} from '../../common/consts';

const isAndroid = Platform.OS === 'android';

export const pilotMarkerItemPropsEqual = (prev, next) =>
    prev.pilot.key === next.pilot.key &&
    prev.pilot.latitude === next.pilot.latitude &&
    prev.pilot.longitude === next.pilot.longitude &&
    prev.pilot.heading === next.pilot.heading &&
    prev.pilotImage === next.pilotImage &&
    prev.onPress === next.onPress;

const PilotMarkerItem = React.memo(({pilot, pilotImage, pilotImageSize, onPress}) => {
    return isAndroid ? (
        <Marker
            coordinate={{latitude: pilot.latitude, longitude: pilot.longitude}}
            title={pilot.callsign}
            anchor={{x: 0.5, y: 0.5}}
            rotation={pilot.heading}
            flat={true}
            onPress={() => onPress(pilot)}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
            image={pilotImage}
        />
    ) : (
        <Marker
            coordinate={{latitude: pilot.latitude, longitude: pilot.longitude}}
            title={pilot.callsign}
            anchor={{x: 0.5, y: 0.5}}
            onPress={() => onPress(pilot)}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
        >
            <Image
                source={pilotImage}
                fadeDuration={0}
                style={{height: pilotImageSize, width: pilotImageSize, transform: [{rotate: `${pilot.heading}deg`}]}}
            />
        </Marker>
    );
}, pilotMarkerItemPropsEqual);

const defaultImageSize = isAndroid ? 64 : 32;

const PilotMarkers = React.memo(function PilotMarkers({zoomLevel}) {
    const selectedClient = useSelector(state => state.app.selectedClient);
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);

    const dispatch = useDispatch();
    const selectedClientRef = useRef(selectedClient);
    useEffect(() => {
        selectedClientRef.current = selectedClient;
    }, [selectedClient]);
    const onPress = useCallback((pilot) => {
        if(selectedClientRef.current && pilot.callsign == selectedClientRef.current.callsign) {
            dispatch(allActions.appActions.clientSelected(null));
        } else {
            dispatch(allActions.appActions.clientSelected(pilot));
        }
    }, [dispatch]);

    const zoomBand = getZoomBand(zoomLevel);

    return pilots
        .filter(pilot => {
            const groundspeed = Number(pilot.groundspeed);
            const hasValidGroundspeed = Number.isFinite(groundspeed);

            return (
                zoomBand === 'airport' ||
                pilot.callsign === selectedClient?.callsign ||
                !hasValidGroundspeed ||
                groundspeed > GROUND_SPEED_THRESHOLD
            );
        })
        .map(pilot => {
            const pilotImage = pilot.image || mapIcons.B737;
            const pilotImageSize = pilot.image ? pilot.imageSize : defaultImageSize;

            return <PilotMarkerItem
                key={pilot.key}
                pilot={pilot}
                pilotImage={pilotImage}
                pilotImageSize={pilotImageSize}
                onPress={onPress}
            />;
        });
});

export default PilotMarkers;
