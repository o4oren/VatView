import MapView, {Polyline} from 'react-native-maps';
import {useTheme} from '../../common/ThemeProvider';
import allActions from '../../redux/actions';
import generateCtrPolygons from './CTRPolygons';
import PilotMarkers from './PilotMarkers';
import generateAirportMarkers from './AirportMarkers';
import {StyleSheet, View} from 'react-native';
import React, {useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';

const MapComponent = ({onMapPress}) => {
    const dispatch = useDispatch();
    const ref = useRef(null);
    const {activeMapStyle} = useTheme();
    const ctr = useSelector(state => state.vatsimLiveData.clients.ctr);
    const fss = useSelector(state => state.vatsimLiveData.clients.fss);
    const airportAtc = useSelector(state => state.vatsimLiveData.clients.airportAtc);
    const cachedAirports = useSelector(state => state.vatsimLiveData.cachedAirports);
    const cachedFirBoundaries = useSelector(state => state.vatsimLiveData.cachedFirBoundaries);
    const selectedClient = useSelector(state => state.app.selectedClient);
    const initialRegion = useSelector(state => state.app.initialRegion);
    const filters = useSelector(state => state.app.filters);

    return <MapView
        ref={ref}
        style={styles.mapStyle}
        customMapStyle={activeMapStyle}
        // provider={PROVIDER_GOOGLE}
        rotateEnabled={false}
        toolbarEnabled={false}
        initialRegion={initialRegion}
        onPress={onMapPress}
        onRegionChangeComplete={region => dispatch(allActions.appActions.saveInitialRegion(region))}
    >
        {getMarkers(ctr, fss, airportAtc, cachedAirports, cachedFirBoundaries, filters)}
        {filters.pilots && <PilotMarkers />}
        {renderFromToPath(selectedClient, cachedAirports, filters.pilots)}
    </MapView>;
};

const getMarkers = (ctr, fss, airportAtc, cachedAirports, cachedFirBoundaries, filters) => {
    // ANDROID WORKAROUND: react-native-maps does not properly remove native
    // Polygon/Circle overlays when their React elements unmount on Android
    // (see https://github.com/react-native-maps/react-native-maps/issues/5052,
    // #5080, #3783). Removing polygons from the tree leaves invisible "ghost"
    // overlays that accumulate on each 20s data poll, causing doubled polygons
    // and polygons that stay visible after the ATC filter is toggled off.
    // Fix: always keep polygons in the React tree and toggle their fill/stroke
    // to transparent when hidden. React reconciles by stable overlay keys,
    // so no extra native overlays are created — only props are updated.
    const ctrMarkers = generateCtrPolygons(ctr, fss, cachedFirBoundaries, filters.atc);
    const airportMarkers = generateAirportMarkers(airportAtc, cachedAirports, filters.atc);
    const markers = [
        ctrMarkers,
        airportMarkers,
    ].flat(1).sort((a,b) => {
        return a.key > b.key ? 1 : (b.key > a.key ? -1 : 0);
    });
    return markers;
};

// ANDROID WORKAROUND: Polylines suffer from the same ghost overlay issue as
// Polygons (see getMarkers comment). Use two permanent Polyline elements with
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
