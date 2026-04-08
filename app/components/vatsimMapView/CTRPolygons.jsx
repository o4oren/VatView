import {Marker, Polygon} from 'react-native-maps';
import {Text} from 'react-native';
import React, {useRef, useCallback} from 'react';
import {useTheme} from '../../common/ThemeProvider';
import {EXCLUDED_CALLSIGNS} from '../../common/consts';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {markNewSelection} from '../detailPanel/DetailPanelProvider';
import {union} from '@turf/union';
import {polygon as turfPolygon, featureCollection} from '@turf/helpers';

// Used to hide polygons while keeping them in the React tree (Android workaround — see MapComponent.jsx)
const TRANSPARENT = 'rgba(0,0,0,0)';

// Convert our {latitude, longitude} ring to GeoJSON [lng, lat] ring (closed)
const toGeoRing = (points) => {
    const ring = points.map(p => [p.longitude, p.latitude]);
    // GeoJSON rings must be closed
    if (ring.length > 0 && (ring[0][0] !== ring[ring.length - 1][0] || ring[0][1] !== ring[ring.length - 1][1])) {
        ring.push(ring[0]);
    }
    return ring;
};

// Convert GeoJSON [lng, lat] ring back to {latitude, longitude}
const fromGeoRing = (ring) => ring.slice(0, -1).map(c => ({latitude: c[1], longitude: c[0]}));

// Union all FIR polygons for a UIR into merged outer boundary polygons.
// Returns array of {points, holes} or null on failure (caller falls back to individual FIRs).
const unionFirs = (firs) => {
    try {
        const features = [];
        for (const fir of firs) {
            if (!fir || !fir.points || fir.points.length < 3) continue;
            const outerRing = toGeoRing(fir.points);
            if (outerRing.length < 4) continue;
            const holeRings = (fir.holes || []).map(toGeoRing).filter(r => r.length >= 4);
            features.push(turfPolygon([outerRing, ...holeRings]));
        }
        if (features.length < 2) return null;

        const merged = union(featureCollection(features));
        if (!merged) return null;

        const geom = merged.geometry;
        if (geom.type === 'Polygon') {
            return [{
                points: fromGeoRing(geom.coordinates[0]),
                holes: geom.coordinates.slice(1).map(fromGeoRing)
            }];
        } else if (geom.type === 'MultiPolygon') {
            return geom.coordinates.map(poly => ({
                points: fromGeoRing(poly[0]),
                holes: poly.slice(1).map(fromGeoRing)
            }));
        }
        return null;
    } catch (e) {
        console.warn('UIR union failed, falling back to individual FIRs', e);
        return null;
    }
};

// Evict cached overlays after this many consecutive polls without the controller (~100s at 20s polling)
const STALE_EVICT_THRESHOLD = 5;

const CTRPolygons = React.memo(function CTRPolygons({visible = true}) {
    const dispatch = useDispatch();
    const staticAirspaceData = useSelector(state => state.staticAirspaceData);
    const ctr = useSelector(state => state.vatsimLiveData.clients.ctr);
    const fss = useSelector(state => state.vatsimLiveData.clients.fss);
    const cachedFirBoundaries = useSelector(state => state.vatsimLiveData.cachedFirBoundaries);
    const {activeTheme} = useTheme();

    const airspaceCacheRef = useRef(new Map());
    const staleTallyRef = useRef(new Map());
    const polygons = [];
    const activeKeys = new Set();

    const onPress = useCallback((client) => {
        markNewSelection();
        dispatch(allActions.appActions.clientSelected(client));
    }, [dispatch]);

    const getAirspaceCoordinates = client => {
        let isOceanic = false;
        const callsignPrefix = client.callsign.split('_')[0];

        let airspace = {
            isUir: false,
            firs: [],
            callsign: client.callsign
        };

        // exclude problematic FSSs
        if (EXCLUDED_CALLSIGNS.includes(client.callsign) || client.frequency === '199.998' || client.callsign.split('_').pop() === 'OBS') {
            return airspace;
        }
        // If client is FIR
        if (cachedFirBoundaries[callsignPrefix]) {
            cachedFirBoundaries[callsignPrefix].forEach(fir => {
                airspace.firs.push(fir);
            });
        } else {
            // if we did not find by icao
            const fir = staticAirspaceData.firs.find(f => f.prefix == callsignPrefix);
            if(fir && fir.icao) {
                if (cachedFirBoundaries[fir.icao]) {
                    cachedFirBoundaries[fir.icao].forEach(f => airspace.firs.push(f));
                }
            }

        }

        if (airspace.firs.length === 0) {
            let fallbackFirIcao;
            for (let fir of staticAirspaceData.firs) {
                if (fir.prefix === callsignPrefix || fir.firBoundary === callsignPrefix) {
                    fallbackFirIcao = fir.icao;
                    // we have to iterate to prevent fetching the oceanic only
                    if (cachedFirBoundaries[fallbackFirIcao]) {
                        cachedFirBoundaries[fallbackFirIcao].forEach(fir => {
                            if (fir != null && (isOceanic === true || !fir.isOceanic) && fir.isExtention === false) {
                                airspace.firs.push(fir);
                            }
                        });
                    }
                }
            }
        }

        // if we did not resolve firs, we check if UIR
        if (!airspace.firs[0]) {
            const uir = staticAirspaceData.uirs[callsignPrefix];
            if (uir) {
                airspace.isUir = true;
                let latitudeSum = 0;
                let longitudeSum = 0;
                if (uir.firs !== undefined && uir.firs.length > 0) {
                    uir.firs.forEach(firIcao => {
                        if (!cachedFirBoundaries[firIcao]) return;
                        cachedFirBoundaries[firIcao].forEach(fir => {
                            if (fir) {
                                airspace.firs.push(fir);
                                latitudeSum += fir.center.latitude;
                                longitudeSum += fir.center.longitude;
                            }
                        });
                    });
                    airspace.icao = callsignPrefix;
                    airspace.center = {
                        latitude: latitudeSum / uir.firs.length,
                        longitude: longitudeSum / uir.firs.length
                    };
                    // Pre-compute union once at cache-fill time, not at render time
                    airspace.mergedPolygons = unionFirs(airspace.firs)
                        || airspace.firs.map(f => ({points: f.points, holes: f.holes || []}));
                }
            }
        }

        return airspace;
    };

    const renderPolygonElements = (clientKey, cached, isVisible) => {
        const {client, airspace} = cached;
        const elements = [];
        if (airspace.isUir) {
            const uirTextStyle = {fontSize: 16, fontWeight: 'bold', color: activeTheme.atc.uir};
            // mergedPolygons is pre-computed and stored in cache — no union work at render time
            const mergedPolygons = airspace.mergedPolygons;
            mergedPolygons.forEach((poly, i) => {
                elements.push(
                    <Polygon
                        key={`${clientKey}-uir-polygon-${i}`}
                        coordinates={poly.points}
                        holes={poly.holes || []}
                        strokeColor={isVisible ? activeTheme.atc.uir : TRANSPARENT}
                        fillColor={isVisible ? activeTheme.atc.uirFill : TRANSPARENT}
                        strokeWidth={isVisible ? activeTheme.atc.uirStrokeWidth : 0}
                        geodesic={true}
                        tappable={isVisible}
                        onPress={() => onPress(client)}
                    />
                );
            });
            if (airspace.center && isVisible) {
                elements.push(
                    <Marker
                        key={`${clientKey}-uir-marker`}
                        coordinate={airspace.center}
                        tracksViewChanges={false}
                        tracksInfoWindowChanges={false}
                    >
                        <Text
                            key={`${clientKey}-uir-text`}
                            style={uirTextStyle}
                            onPress={() => onPress(client)}
                        >
                            {client.callsign}
                        </Text>
                    </Marker>
                );
            }
        } else {
            const firTextStyle = {fontSize: 16, fontWeight: 'bold', color: activeTheme.atc.fir};
            airspace.firs.forEach((fir, i) => {
                if (!fir.center) return;
                elements.push(
                    <Polygon
                        key={`${clientKey}-polygon-${fir.icao || 'segment'}-${i}`}
                        coordinates={fir.points}
                        holes={fir.holes || []}
                        strokeColor={isVisible ? activeTheme.atc.fir : TRANSPARENT}
                        fillColor={isVisible ? activeTheme.atc.firFill : TRANSPARENT}
                        strokeWidth={isVisible ? activeTheme.atc.firStrokeWidth : 0}
                        geodesic={true}
                        tappable={isVisible}
                        onPress={() => onPress(client)}
                    />
                );
                if (isVisible) {
                    elements.push(
                        <Marker
                            key={`${clientKey}-marker-${fir.icao || 'segment'}-${i}`}
                            coordinate={fir.center}
                            tracksViewChanges={false}
                            tracksInfoWindowChanges={false}
                        >
                            <Text
                                style={firTextStyle}
                                onPress={() => onPress(client)}
                            >
                                {fir.icao}
                            </Text>
                        </Marker>
                    );
                }
            });
        }
        return elements;
    };

    // Resolve airspace for active controllers and cache the result
    for (let icao in fss) {
        fss[icao].forEach(fssClient => {
            const clientKey = `fss-${fssClient.callsign}`;
            activeKeys.add(clientKey);
            if (!airspaceCacheRef.current.has(clientKey)) {
                airspaceCacheRef.current.set(clientKey, {
                    client: fssClient,
                    airspace: getAirspaceCoordinates(fssClient),
                });
            } else {
                // Update client data (e.g. frequency changes) but keep cached airspace
                airspaceCacheRef.current.get(clientKey).client = fssClient;
            }
        });
    }

    for (let icao in ctr) {
        ctr[icao].forEach(ctrClient => {
            const clientKey = `ctr-${ctrClient.callsign}`;
            activeKeys.add(clientKey);
            if (!airspaceCacheRef.current.has(clientKey)) {
                airspaceCacheRef.current.set(clientKey, {
                    client: ctrClient,
                    airspace: getAirspaceCoordinates(ctrClient),
                });
            } else {
                airspaceCacheRef.current.get(clientKey).client = ctrClient;
            }
        });
    }

    // Render all cached entries, evict stale ones
    airspaceCacheRef.current.forEach((cached, clientKey) => {
        if (activeKeys.has(clientKey)) {
            staleTallyRef.current.delete(clientKey);
            polygons.push(renderPolygonElements(clientKey, cached, visible));
        } else {
            const tally = (staleTallyRef.current.get(clientKey) || 0) + 1;
            if (tally > STALE_EVICT_THRESHOLD) {
                airspaceCacheRef.current.delete(clientKey);
                staleTallyRef.current.delete(clientKey);
            } else {
                staleTallyRef.current.set(clientKey, tally);
                polygons.push(renderPolygonElements(clientKey, cached, false));
            }
        }
    });

    return <>{polygons}</>;
});

export default CTRPolygons;
