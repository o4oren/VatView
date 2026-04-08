import {Marker} from 'react-native-maps';
import {Image, Platform} from 'react-native';
import React, {useCallback, useRef, useEffect, useMemo} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {markNewSelection} from '../detailPanel/DetailPanelProvider';
import {mapIcons, getPilotMarkerRole} from '../../common/iconsHelper';
import {getMarkerImage} from '../../common/aircraftIconService';
import {getZoomBand, GROUND_SPEED_THRESHOLD} from '../../common/consts';

const isAndroid = Platform.OS === 'android';

// ANDROID WORKAROUND: Native Google Maps markers can leave ghost bitmaps at
// old positions when react-native-maps updates coordinates with
// tracksViewChanges={false}. Including a coarse coordinate hash in the React
// key forces a full native remount only when the pilot has moved ≥ ~1 km,
// clearing any stale overlay without the cost of remounting every frame.
const coordKey = isAndroid
    ? (lat, lng) => `${Math.round(lat * 100)}_${Math.round(lng * 100)}`
    : () => '';

// Equality: skip re-render if position, heading, cid, aircraft type, and role
// inputs haven't changed. Role and image are now resolved inside the item, so
// we compare the inputs that drive them (cid, myCid, friendCids, aircraftType).
export const pilotMarkerItemPropsEqual = (prev, next) =>
    prev.pilot.key === next.pilot.key &&
    prev.pilot.latitude === next.pilot.latitude &&
    prev.pilot.longitude === next.pilot.longitude &&
    prev.pilot.heading === next.pilot.heading &&
    prev.pilot.cid === next.pilot.cid &&
    prev.pilot.flight_plan?.aircraft === next.pilot.flight_plan?.aircraft &&
    prev.myCid === next.myCid &&
    prev.friendCids === next.friendCids &&
    prev.iconCacheVersion === next.iconCacheVersion &&
    prev.onPress === next.onPress;

const defaultImageSize = isAndroid ? 64 : 32;

// Role and image are resolved here, inside the memo boundary.
// They only run when pilotMarkerItemPropsEqual returns false.
const PilotMarkerItem = React.memo(({pilot, myCid, friendCids, iconCacheVersion: _v, onPress}) => {
    const role = getPilotMarkerRole(pilot, myCid, friendCids);
    const entry = getMarkerImage(pilot.flight_plan?.aircraft || null, role);
    const pilotImage = entry ? entry.image : (pilot.image || mapIcons.B737);
    const pilotImageSize = entry ? entry.sizeDp : (pilot.image ? pilot.imageSize : defaultImageSize);

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

const PilotMarkers = React.memo(function PilotMarkers({zoomLevel}) {
    const selectedClient = useSelector(state => state.app.selectedClient);
    const pilots = useSelector(state => state.vatsimLiveData.clients.pilots);
    const myCid = useSelector(state => state.app.myCid);
    const friendCids = useSelector(state => state.app.friendCids);
    // Re-render when the icon cache is rebuilt (theme change) so role colors update
    const iconCacheVersion = useSelector(state => state.app.iconCacheVersion);

    const dispatch = useDispatch();
    const selectedClientRef = useRef(selectedClient);
    useEffect(() => {
        selectedClientRef.current = selectedClient;
    }, [selectedClient]);

    const onPress = useCallback((pilot) => {
        if (selectedClientRef.current && pilot.callsign === selectedClientRef.current.callsign) {
            dispatch(allActions.appActions.clientSelected(null));
        } else {
            markNewSelection();
            dispatch(allActions.appActions.clientSelected(pilot));
        }
    }, [dispatch]);

    const zoomBand = getZoomBand(zoomLevel);

    const markers = useMemo(() => {
        const filtered = pilots.filter(pilot => {
            const groundspeed = Number(pilot.groundspeed);
            const hasValidGroundspeed = Number.isFinite(groundspeed);
            return (
                zoomBand === 'airport' ||
                pilot.callsign === selectedClient?.callsign ||
                !hasValidGroundspeed ||
                groundspeed > GROUND_SPEED_THRESHOLD
            );
        });

        return filtered.map(pilot => {
            const markerKey = isAndroid
                ? `${pilot.key}_${coordKey(pilot.latitude, pilot.longitude)}`
                : pilot.key;

            return (
                <PilotMarkerItem
                    key={markerKey}
                    pilot={pilot}
                    myCid={myCid}
                    friendCids={friendCids}
                    iconCacheVersion={iconCacheVersion}
                    onPress={onPress}
                />
            );
        });
    }, [pilots, zoomBand, selectedClient?.callsign, myCid, friendCids, iconCacheVersion, onPress]);

    return markers;
});

export default PilotMarkers;
