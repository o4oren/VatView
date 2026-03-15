import {Circle, Marker, Polygon} from 'react-native-maps';
import {Image, Platform} from 'react-native';
import React, {useCallback, useRef} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {APP, APP_RADIUS, DEL, GND, TWR_ATIS} from '../../common/consts';
import theme from '../../common/theme';
import {mapIcons, getAtcIcon} from '../../common/iconsHelper';
import {getAirportByCode} from '../../common/airportTools';
import {lookupTracon} from '../../common/boundaryService';

const isAndroid = Platform.OS === 'android';
// Used to hide polygons while keeping them in the React tree (Android workaround — see MapComponent.jsx)
const TRANSPARENT = 'rgba(0,0,0,0)';

// Evict cached overlays after this many consecutive polls without the controller (~100s at 20s polling)
const STALE_EVICT_THRESHOLD = 5;

const AirportMarkerItem = React.memo(({airport, image, onPress}) => {
    return isAndroid ? (
        <Marker
            coordinate={{latitude: airport.latitude, longitude: airport.longitude}}
            title={airport.icao}
            anchor={{x: 0.5, y: 1}}
            onPress={() => onPress(airport)}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
            image={image}
        />
    ) : (
        <Marker
            coordinate={{latitude: airport.latitude, longitude: airport.longitude}}
            title={airport.icao}
            anchor={{x: 0.5, y: 1}}
            onPress={() => onPress(airport)}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
        >
            <Image
                source={image}
                fadeDuration={0}
                style={{height: 32, width: 32}}
            />
        </Marker>
    );
}, (prev, next) =>
    prev.airport.icao === next.airport.icao &&
    prev.airport.latitude === next.airport.latitude &&
    prev.airport.longitude === next.airport.longitude &&
    prev.image === next.image &&
    prev.onPress === next.onPress
);

export default function generateAirportMarkers(airportAtc, airports, visible = true) {
    const dispatch = useDispatch();
    const traconBoundaryLookup = useSelector(state => state.staticAirspaceData.traconBoundaryLookup);
    const traconPolygonCacheRef = useRef(new Map());
    const appCircleCacheRef = useRef(new Map());
    const staleTallyRef = useRef(new Map());
    const airportMarkers = [];
    const visibleTraconKeys = new Set();
    const visibleCircleKeys = new Set();

    const onPress = useCallback((airport) => {
        dispatch(allActions.appActions.clientSelected(airport));
    }, [dispatch]);

    const renderedTracons = new Set();

    for (const icao in airportAtc) {
        // const tower = props.airports[icao].filter(client => client.facility === TWR_ATIS && client.callsign.split('_').pop() == 'TWR');
        const airport = getAirportByCode(icao, airports);
        let delivery = false;
        let ground = false;
        let tower = false;
        let app = false;
        let atis = false;
        let image = null;

        if (airport != null && airportAtc && airportAtc[airport.icao] && airportAtc[airport.icao].length > 0) {
            airportAtc[airport.icao].forEach(atc => {
                switch (atc.facility) {
                case APP: {
                    app = true;
                    const callsignPrefix = atc.callsign.split('_')[0];
                    const callsignSuffix = atc.callsign.split('_').pop();
                    const tracon = lookupTracon(traconBoundaryLookup, callsignPrefix, callsignSuffix);
                    if (tracon) {
                        const traconKey = tracon.id;
                        if (!renderedTracons.has(traconKey)) {
                            renderedTracons.add(traconKey);
                            tracon.polygons.forEach((poly, i) => {
                                const overlayKey = `${traconKey}-polygon-${i}`;
                                traconPolygonCacheRef.current.set(overlayKey, {
                                    coordinates: poly.coordinates,
                                    holes: poly.holes,
                                    airport,
                                });
                                visibleTraconKeys.add(overlayKey);
                            });
                        }
                    } else {
                        const circleKey = `${atc.callsign}-app-circle`;
                        appCircleCacheRef.current.set(circleKey, {
                            center: {latitude: atc.latitude, longitude: atc.longitude},
                            title: atc.callsign,
                        });
                        visibleCircleKeys.add(circleKey);
                    }
                    break;
                }
                case DEL:
                    delivery = true;
                    break;
                case GND:
                    ground = true;
                    break;
                case TWR_ATIS:
                    if(atc.callsign.endsWith('ATIS'))
                        atis = true;
                    else
                        tower = true;
                    break;
                default:
                    break;
                }
            });

            if(app) {
                image = getAtcIcon('radar');
                if ((ground || tower))
                    image = getAtcIcon('towerRadar');
                else if (atis || delivery)
                    image = getAtcIcon('antennaRadar');
            } else {
                if (ground || tower)
                    image = getAtcIcon('tower');
                else if (atis || delivery)
                    image = getAtcIcon('antenna');
            }

            // Fallback for unrecognized facility types — prevents red pin markers
            if (!image) {
                console.warn('Unknown ATC facility type at', airport.icao);
                image = getAtcIcon('tower');
            }

            if (visible) {
                airportMarkers.push(
                    <AirportMarkerItem
                        key={airport.icao}
                        airport={airport}
                        image={image}
                        onPress={onPress}
                        tracksViewChanges={false}
                    />
                );
            }
        } else {
            console.log('cannot add marker', airport);
        }
    }

    // Render cached TRACON polygons, evict stale ones
    traconPolygonCacheRef.current.forEach((overlay, overlayKey) => {
        if (visibleTraconKeys.has(overlayKey)) {
            staleTallyRef.current.delete(overlayKey);
            airportMarkers.push(
                <Polygon
                    key={overlayKey}
                    coordinates={overlay.coordinates}
                    holes={overlay.holes}
                    strokeColor={visible ? theme.blueGrey.appCircleStroke : TRANSPARENT}
                    fillColor={visible ? theme.blueGrey.appCircleFill : TRANSPARENT}
                    strokeWidth={visible ? theme.blueGrey.appCircleStrokeWidth : 0}
                    geodesic={true}
                    tappable={visible}
                    onPress={() => onPress(overlay.airport)}
                />
            );
        } else {
            const tally = (staleTallyRef.current.get(overlayKey) || 0) + 1;
            if (tally > STALE_EVICT_THRESHOLD) {
                traconPolygonCacheRef.current.delete(overlayKey);
                staleTallyRef.current.delete(overlayKey);
            } else {
                staleTallyRef.current.set(overlayKey, tally);
                airportMarkers.push(
                    <Polygon
                        key={overlayKey}
                        coordinates={overlay.coordinates}
                        holes={overlay.holes}
                        strokeColor={TRANSPARENT}
                        fillColor={TRANSPARENT}
                        strokeWidth={0}
                        geodesic={true}
                        tappable={false}
                    />
                );
            }
        }
    });

    // Render cached APP circles, evict stale ones
    appCircleCacheRef.current.forEach((circle, circleKey) => {
        if (visibleCircleKeys.has(circleKey)) {
            staleTallyRef.current.delete(circleKey);
            airportMarkers.push(
                <Circle
                    key={circleKey}
                    center={circle.center}
                    radius={APP_RADIUS}
                    title={circle.title}
                    strokeColor={visible ? theme.blueGrey.appCircleStroke : TRANSPARENT}
                    fillColor={visible ? theme.blueGrey.appCircleFill : TRANSPARENT}
                    strokeWidth={visible ? theme.blueGrey.appCircleStrokeWidth : 0}
                />
            );
        } else {
            const tally = (staleTallyRef.current.get(circleKey) || 0) + 1;
            if (tally > STALE_EVICT_THRESHOLD) {
                appCircleCacheRef.current.delete(circleKey);
                staleTallyRef.current.delete(circleKey);
            } else {
                staleTallyRef.current.set(circleKey, tally);
                airportMarkers.push(
                    <Circle
                        key={circleKey}
                        center={circle.center}
                        radius={APP_RADIUS}
                        title={circle.title}
                        strokeColor={TRANSPARENT}
                        fillColor={TRANSPARENT}
                        strokeWidth={0}
                    />
                );
            }
        }
    });

    return airportMarkers;
}
