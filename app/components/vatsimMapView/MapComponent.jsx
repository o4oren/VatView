import MapView, {Polyline} from 'react-native-maps';
import {useTheme} from '../../common/ThemeProvider';
import allActions from '../../redux/actions';
import CTRPolygons from './CTRPolygons';
import PilotMarkers from './PilotMarkers';
import AirportMarkers from './AirportMarkers';
import {AppState, Platform, StyleSheet} from 'react-native';
import React, {useEffect, useRef, useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';
import {useIsFocused} from '@react-navigation/native';

// ANDROID WORKAROUND: When the app resumes from background or the Map tab
// regains focus, the native Google Maps view can show default red pins for
// markers that mounted while the surface was not actively drawing (with
// tracksViewChanges={false}, the native layer never re-snapshots). Incrementing
// the MapView key forces a full native remount, clearing stale overlays.
const useMapRemountKey = (isTabFocused) => {
    const [mapKey, setMapKey] = useState(0);
    const appStateRef = useRef(AppState.currentState);
    const wasUnfocusedRef = useRef(false);

    useEffect(() => {
        if (Platform.OS !== 'android') return;

        const sub = AppState.addEventListener('change', (nextState) => {
            if (appStateRef.current.match(/inactive|background/) && nextState === 'active') {
                setMapKey(k => k + 1);
            }
            appStateRef.current = nextState;
        });
        return () => sub.remove();
    }, []);

    useEffect(() => {
        if (Platform.OS !== 'android') return;

        if (!isTabFocused) {
            wasUnfocusedRef.current = true;
        } else if (wasUnfocusedRef.current) {
            wasUnfocusedRef.current = false;
            setMapKey(k => k + 1);
        }
    }, [isTabFocused]);

    return mapKey;
};

const computeZoomLevel = (latitudeDelta) => {
    if (!latitudeDelta || latitudeDelta <= 0) return 4;
    return Math.log2(360 / latitudeDelta);
};

const MapComponent = ({onMapPress}) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const isFocused = useIsFocused();
    const mapKey = useMapRemountKey(isFocused);
    const {activeMapStyle} = useTheme();
    const cachedAirports = useSelector(state => state.vatsimLiveData.cachedAirports);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const initialRegion = useSelector(state => state.app.initialRegion);
    const filters = useSelector(state => state.app.filters);
    const pendingFlyTo = useSelector(state => state.app.pendingFlyTo);
    const [zoomLevel, setZoomLevel] = useState(
        () => computeZoomLevel(initialRegion?.latitudeDelta)
    );

    useEffect(() => {
        if (!pendingFlyTo || !ref.current) return;
        // On Android the map tab is still mid-transition when this fires,
        // so animateToRegion is silently dropped. Defer past the transition.
        const delay = Platform.OS === 'android' ? 350 : 0;
        const timer = setTimeout(() => {
            if (!ref.current) return;
            const delta = pendingFlyTo.delta ?? 0.35;
            ref.current.animateToRegion({
                latitude: pendingFlyTo.latitude,
                longitude: pendingFlyTo.longitude,
                latitudeDelta: delta,
                longitudeDelta: delta,
            }, 600);
            dispatch(allActions.appActions.flyToConsumed());
        }, delay);
        return () => clearTimeout(timer);
    }, [pendingFlyTo, dispatch]);

    return <MapView
        key={mapKey}
        ref={ref}
        style={styles.mapStyle}
        customMapStyle={activeMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        toolbarEnabled={false}
        initialRegion={initialRegion}
        onPress={onMapPress}
        onRegionChangeComplete={region => {
            dispatch(allActions.appActions.saveInitialRegion(region));
            const zoom = computeZoomLevel(region.latitudeDelta);
            setZoomLevel(zoom);
        }}
    >
        <CTRPolygons visible={filters.atc} />
        <AirportMarkers visible={filters.atc} zoomLevel={zoomLevel} />
        {filters.pilots && <PilotMarkers zoomLevel={zoomLevel} />}
        {renderFromToPath(selectedClient, cachedAirports, filters.pilots)}
    </MapView>;
};

// ANDROID WORKAROUND: Polylines suffer from the same ghost overlay issue as
// Polygons (see above). Use two permanent Polyline elements with
// fixed keys that never unmount. Toggle coordinates and color instead.
const TRANSPARENT = 'rgba(0,0,0,0)';
const ZERO_COORD = [{latitude: 0, longitude: 0}, {latitude: 0, longitude: 0}];

const renderFromToPath = (selectedClient, airports, pilotsVisible) => {
    let depCoords = ZERO_COORD;
    let arrCoords = ZERO_COORD;
    let showDep = false;
    let showArr = false;

    if (pilotsVisible && selectedClient?.flight_plan?.departure) {
        const departure = getAirportByCode(selectedClient.flight_plan.departure, airports);
        const arrival = getAirportByCode(selectedClient.flight_plan.arrival, airports);
        if (departure) {
            showDep = true;
            depCoords = [
                {latitude: departure.latitude, longitude: departure.longitude},
                {latitude: selectedClient.latitude, longitude: selectedClient.longitude},
            ];
        }
        if (arrival) {
            showArr = true;
            arrCoords = [
                {latitude: selectedClient.latitude, longitude: selectedClient.longitude},
                {latitude: arrival.latitude, longitude: arrival.longitude},
            ];
        }
    }

    return [
        <Polyline
            key="active_dep_path"
            coordinates={depCoords}
            strokeColor={showDep ? 'red' : TRANSPARENT}
            geodesic={true}
            strokeWidth={showDep ? 3 : 0}
            lineCap={'round'}
        />,
        <Polyline
            key="active_arr_path"
            coordinates={arrCoords}
            strokeColor={showArr ? 'green' : TRANSPARENT}
            geodesic={true}
            strokeWidth={showArr ? 3 : 0}
        />,
    ];
};

const styles = StyleSheet.create({
    mapStyle: {
        flex:1
    }
});

export default MapComponent;
