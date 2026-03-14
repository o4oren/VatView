import {parseFirGeoJson, parseTraconJson, lookupTracon} from '../boundaryService';

// ── Fixtures ──────────────────────────────────────────────────────────

const firGeoJsonFixture = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                id: 'CZEG',
                oceanic: '0',
                label_lat: '53.5',
                label_lon: '-114.0'
            },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [[- 120, 49], [-110, 49], [-110, 60], [-120, 60], [-120, 49]]
                ]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 'EDGG',
                oceanic: '0',
                label_lat: '50.0',
                label_lon: '8.5'
            },
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [
                        [[7, 49], [10, 49], [10, 51], [7, 51], [7, 49]],
                        [[8, 49.5], [9, 49.5], [9, 50.5], [8, 50.5], [8, 49.5]]
                    ]
                ]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 'BIRD',
                oceanic: '1',
                label_lat: '65.0',
                label_lon: '-20.0'
            },
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [
                        [[-30, 60], [-10, 60], [-10, 70], [-30, 70], [-30, 60]]
                    ],
                    [
                        [[-25, 62], [-15, 62], [-15, 68], [-25, 68], [-25, 62]]
                    ]
                ]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 'POLE_TEST',
                oceanic: '0',
                label_lat: '89.0',
                label_lon: '0'
            },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [[-10, 90], [10, 90], [10, -90], [-10, -90], [-10, 90]]
                ]
            }
        }
    ]
};

const traconGeoJsonFixture = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            properties: {
                id: 'A80',
                prefix: ['ATL'],
                name: 'Atlanta Approach',
            },
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [
                        [[-85, 33], [-84, 33], [-84, 34], [-85, 34], [-85, 33]]
                    ]
                ]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 'A80_DEP',
                prefix: ['ATL'],
                suffix: 'DEP',
                name: 'Atlanta Departure',
            },
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [[-85.5, 33.2], [-83.5, 33.2], [-83.5, 34.2], [-85.5, 34.2], [-85.5, 33.2]]
                ]
            }
        },
        {
            type: 'Feature',
            properties: {
                id: 'N90',
                prefix: ['JFK', 'LGA', 'EWR'],
                name: 'New York TRACON',
            },
            geometry: {
                type: 'MultiPolygon',
                coordinates: [
                    [
                        [[-74, 40], [-73, 40], [-73, 41], [-74, 41], [-74, 40]],
                        [[-73.8, 40.4], [-73.5, 40.4], [-73.5, 40.7], [-73.8, 40.7], [-73.8, 40.4]]
                    ]
                ]
            }
        }
    ]
};

// ── parseFirGeoJson tests ─────────────────────────────────────────────

describe('parseFirGeoJson', () => {
    let lookup;

    beforeAll(() => {
        lookup = parseFirGeoJson(firGeoJsonFixture);
    });

    test('returns object keyed by feature id', () => {
        expect(lookup).toHaveProperty('CZEG');
        expect(lookup).toHaveProperty('EDGG');
        expect(lookup).toHaveProperty('BIRD');
    });

    test('each entry is an array', () => {
        expect(Array.isArray(lookup['CZEG'])).toBe(true);
        expect(lookup['CZEG'].length).toBe(1);
    });

    test('Polygon geometry produces correct points', () => {
        const czeg = lookup['CZEG'][0];
        expect(czeg.points.length).toBe(5);
        expect(czeg.points[0]).toEqual({latitude: 49, longitude: -120});
        expect(czeg.points[1]).toEqual({latitude: 49, longitude: -110});
    });

    test('entry has required shape for CTRPolygons', () => {
        const czeg = lookup['CZEG'][0];
        expect(czeg).toHaveProperty('icao', 'CZEG');
        expect(czeg).toHaveProperty('points');
        expect(czeg).toHaveProperty('holes');
        expect(czeg).toHaveProperty('center');
        expect(czeg).toHaveProperty('isOceanic');
        expect(czeg).toHaveProperty('isExtention', false);
        expect(czeg).toHaveProperty('pointCount');
        expect(czeg.center).toEqual({latitude: 53.5, longitude: -114.0});
    });

    test('MultiPolygon with holes extracts holes correctly', () => {
        const edgg = lookup['EDGG'][0];
        expect(edgg.points.length).toBe(5);
        expect(edgg.holes.length).toBe(1);
        expect(edgg.holes[0].length).toBe(5);
        expect(edgg.holes[0][0]).toEqual({latitude: 49.5, longitude: 8});
    });

    test('MultiPolygon with multiple polygons creates multiple entries', () => {
        expect(lookup['BIRD'].length).toBe(2);
        const first = lookup['BIRD'][0];
        const second = lookup['BIRD'][1];
        expect(first.points[0]).toEqual({latitude: 60, longitude: -30});
        expect(second.points[0]).toEqual({latitude: 62, longitude: -25});
    });

    test('oceanic flag is mapped correctly', () => {
        expect(lookup['CZEG'][0].isOceanic).toBe(0);
        expect(lookup['BIRD'][0].isOceanic).toBe(1);
    });

    test('latitude ±90 clamped to ±85 (strict equality)', () => {
        const pole = lookup['POLE_TEST'][0];
        expect(pole.points[0]).toEqual({latitude: 85, longitude: -10});
        expect(pole.points[1]).toEqual({latitude: 85, longitude: 10});
        expect(pole.points[2]).toEqual({latitude: -85, longitude: 10});
        expect(pole.points[3]).toEqual({latitude: -85, longitude: -10});
    });

    test('latitude 89.9 is NOT clamped (strict equality check)', () => {
        // Create a GeoJSON with lat close to but not exactly 90
        const edgeCase = parseFirGeoJson({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {id: 'EDGE', oceanic: '0', label_lat: '0', label_lon: '0'},
                geometry: {type: 'Polygon', coordinates: [[[0, 89.9], [1, 89.9], [1, -89.9], [0, -89.9], [0, 89.9]]]}
            }]
        });
        expect(edgeCase['EDGE'][0].points[0].latitude).toBe(89.9);
        expect(edgeCase['EDGE'][0].points[2].latitude).toBe(-89.9);
    });

    test('handles empty/null input gracefully', () => {
        expect(parseFirGeoJson(null)).toEqual({});
        expect(parseFirGeoJson({})).toEqual({});
        expect(parseFirGeoJson({features: []})).toEqual({});
    });

    test('skips features without id', () => {
        const result = parseFirGeoJson({
            type: 'FeatureCollection',
            features: [{
                type: 'Feature',
                properties: {},
                geometry: {type: 'Polygon', coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]]}
            }]
        });
        expect(Object.keys(result).length).toBe(0);
    });
});

// ── parseTraconJson tests ─────────────────────────────────────────────

describe('parseTraconJson', () => {
    let lookup;

    beforeAll(() => {
        lookup = parseTraconJson(traconGeoJsonFixture);
    });

    test('returns object with byPrefix and byPrefixAndSuffix', () => {
        expect(lookup).toHaveProperty('byPrefix');
        expect(lookup).toHaveProperty('byPrefixAndSuffix');
    });

    test('prefix-only entries indexed in byPrefix', () => {
        expect(lookup.byPrefix).toHaveProperty('ATL');
        expect(lookup.byPrefix['ATL'].length).toBe(1);
        expect(lookup.byPrefix['ATL'][0].id).toBe('A80');
    });

    test('suffix entries indexed in byPrefixAndSuffix', () => {
        expect(lookup.byPrefixAndSuffix).toHaveProperty('ATL_DEP');
        expect(lookup.byPrefixAndSuffix['ATL_DEP'][0].id).toBe('A80_DEP');
    });

    test('multi-prefix entries indexed under each prefix', () => {
        expect(lookup.byPrefix).toHaveProperty('JFK');
        expect(lookup.byPrefix).toHaveProperty('LGA');
        expect(lookup.byPrefix).toHaveProperty('EWR');
        expect(lookup.byPrefix['JFK'][0].id).toBe('N90');
        expect(lookup.byPrefix['LGA'][0].id).toBe('N90');
    });

    test('Polygon geometry normalized to polygon objects with coordinates and holes', () => {
        const depEntry = lookup.byPrefixAndSuffix['ATL_DEP'][0];
        expect(depEntry.polygons.length).toBe(1);
        expect(depEntry.polygons[0]).toHaveProperty('coordinates');
        expect(depEntry.polygons[0]).toHaveProperty('holes');
        expect(depEntry.polygons[0].coordinates.length).toBe(5);
        expect(depEntry.polygons[0].coordinates[0]).toEqual({latitude: 33.2, longitude: -85.5});
    });

    test('MultiPolygon with holes extracts them', () => {
        const n90 = lookup.byPrefix['JFK'][0];
        expect(n90.polygons.length).toBe(1);
        expect(n90.polygons[0].coordinates.length).toBe(5);
        expect(n90.polygons[0].holes.length).toBe(1);
        expect(n90.polygons[0].holes[0].length).toBe(5);
    });

    test('entry has expected shape', () => {
        const a80 = lookup.byPrefix['ATL'][0];
        expect(a80).toHaveProperty('id', 'A80');
        expect(a80).toHaveProperty('name', 'Atlanta Approach');
        expect(a80).toHaveProperty('prefix');
        expect(a80).toHaveProperty('suffix', null);
        expect(a80).toHaveProperty('polygons');
    });

    test('handles empty/null input gracefully', () => {
        const empty = parseTraconJson(null);
        expect(empty.byPrefix).toEqual({});
        expect(empty.byPrefixAndSuffix).toEqual({});
    });
});

// ── lookupTracon tests ────────────────────────────────────────────────

describe('lookupTracon', () => {
    let lookup;

    beforeAll(() => {
        lookup = parseTraconJson(traconGeoJsonFixture);
    });

    test('returns prefix-only match for APP controller', () => {
        const result = lookupTracon(lookup, 'ATL', 'APP');
        expect(result).not.toBeNull();
        expect(result.id).toBe('A80');
    });

    test('returns suffix-specific match for DEP controller', () => {
        const result = lookupTracon(lookup, 'ATL', 'DEP');
        expect(result).not.toBeNull();
        expect(result.id).toBe('A80_DEP');
    });

    test('returns match for multi-prefix TRACON', () => {
        expect(lookupTracon(lookup, 'JFK', 'APP').id).toBe('N90');
        expect(lookupTracon(lookup, 'LGA', 'APP').id).toBe('N90');
        expect(lookupTracon(lookup, 'EWR', 'APP').id).toBe('N90');
    });

    test('returns null for unknown prefix', () => {
        expect(lookupTracon(lookup, 'XXXX', 'APP')).toBeNull();
    });

    test('returns null for null/empty lookup', () => {
        expect(lookupTracon(null, 'ATL', 'APP')).toBeNull();
        expect(lookupTracon({}, 'ATL', 'APP')).toBeNull();
    });

    test('deduplication: same TRACON for APP and DEP when no suffix entry', () => {
        const appResult = lookupTracon(lookup, 'JFK', 'APP');
        const depResult = lookupTracon(lookup, 'JFK', 'DEP');
        // Both fall through to prefix-only since no JFK_DEP suffix entry
        expect(appResult.id).toBe(depResult.id);
        expect(appResult.id).toBe('N90');
    });
});

// ── Integration test with real GeoJSON data ───────────────────────────

describe('Integration: real GeoJSON data', () => {
    let firLookup;
    let traconLookup;

    beforeAll(async () => {
        // Fetch real data from GitHub releases API
        const firRelease = await fetch(
            'https://api.github.com/repos/vatsimnetwork/vatspy-data-project/releases/latest',
            {headers: {'Accept': 'application/vnd.github.v3+json'}}
        );
        const firReleaseJson = await firRelease.json();
        const firAsset = firReleaseJson.assets.find(a => a.name === 'Boundaries.geojson');
        const firResp = await fetch(firAsset.browser_download_url);
        const firData = await firResp.json();
        firLookup = parseFirGeoJson(firData);

        const traconRelease = await fetch(
            'https://api.github.com/repos/vatsimnetwork/simaware-tracon-project/releases/latest',
            {headers: {'Accept': 'application/vnd.github.v3+json'}}
        );
        const traconReleaseJson = await traconRelease.json();
        const traconAsset = traconReleaseJson.assets.find(a => a.name === 'TRACONBoundaries.geojson');
        const traconResp = await fetch(traconAsset.browser_download_url);
        const traconData = await traconResp.json();
        traconLookup = parseTraconJson(traconData);
    }, 30000);

    test('FIR lookup has substantial entries', () => {
        const keys = Object.keys(firLookup);
        console.log(`FIR lookup: ${keys.length} entries`);
        expect(keys.length).toBeGreaterThan(400);
    });

    test('known FIR entries exist with correct shape', () => {
        // EGTT (London FIR) should exist
        expect(firLookup).toHaveProperty('EGTT');
        const egtt = firLookup['EGTT'][0];
        expect(egtt.points.length).toBeGreaterThan(3);
        expect(egtt.points[0]).toHaveProperty('latitude');
        expect(egtt.points[0]).toHaveProperty('longitude');
        expect(egtt.center).toHaveProperty('latitude');
        expect(egtt.center).toHaveProperty('longitude');
        expect(typeof egtt.isOceanic).toBe('number');
        expect(egtt.isExtention).toBe(false);
        expect(Array.isArray(egtt.holes)).toBe(true);
    });

    test('all FIR entries have valid coordinates (no NaN)', () => {
        let checked = 0;
        for (const key in firLookup) {
            firLookup[key].forEach(entry => {
                entry.points.forEach(pt => {
                    expect(pt.latitude).not.toBeNaN();
                    expect(pt.longitude).not.toBeNaN();
                    expect(Math.abs(pt.latitude)).toBeLessThanOrEqual(85);
                });
                checked++;
            });
        }
        console.log(`Validated ${checked} FIR boundary entries`);
    });

    test('TRACON lookup has substantial entries', () => {
        const prefixCount = Object.keys(traconLookup.byPrefix).length;
        console.log(`TRACON lookup: ${prefixCount} prefix entries`);
        expect(prefixCount).toBeGreaterThan(100);
    });

    test('known TRACON entries exist with correct shape', () => {
        // ATL should exist
        expect(traconLookup.byPrefix).toHaveProperty('ATL');
        const atl = traconLookup.byPrefix['ATL'][0];
        expect(atl).toHaveProperty('id');
        expect(atl).toHaveProperty('name');
        expect(atl).toHaveProperty('polygons');
        expect(atl.polygons.length).toBeGreaterThan(0);
        expect(atl.polygons[0].coordinates.length).toBeGreaterThan(3);
        expect(atl.polygons[0].coordinates[0]).toHaveProperty('latitude');
        expect(atl.polygons[0].coordinates[0]).toHaveProperty('longitude');
    });

    test('lookupTracon works with real data', () => {
        const result = lookupTracon(traconLookup, 'ATL', 'APP');
        expect(result).not.toBeNull();
        expect(result.name).toContain('Atlanta');
    });

    test('all TRACON polygon coordinates are valid (no NaN)', () => {
        let checked = 0;
        for (const key in traconLookup.byPrefix) {
            traconLookup.byPrefix[key].forEach(entry => {
                entry.polygons.forEach(poly => {
                    poly.coordinates.forEach(pt => {
                        expect(pt.latitude).not.toBeNaN();
                        expect(pt.longitude).not.toBeNaN();
                    });
                });
                checked++;
            });
        }
        console.log(`Validated ${checked} TRACON entries`);
    });
});
