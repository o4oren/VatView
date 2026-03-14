import * as FileSystem from 'expo-file-system/legacy';

export const fetchLatestRelease = async (owner, repo) => {
    const response = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/releases/latest`,
        {headers: {'Accept': 'application/vnd.github.v3+json'}}
    );
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    const data = await response.json();
    return {tag: data.tag_name, assets: data.assets};
};

export const findAssetUrl = (assets, filename) => {
    const asset = assets.find(a => a.name === filename);
    if (!asset) {
        throw new Error(`Asset "${filename}" not found in release`);
    }
    return asset.browser_download_url;
};

export const downloadBoundaryFile = async (url, localPath) => {
    const response = await fetch(url);
    const text = await response.text();
    await FileSystem.writeAsStringAsync(FileSystem.documentDirectory + localPath, text);
    return text;
};

export const parseFirGeoJson = (geojson) => {
    const lookup = {};
    if (!geojson || !geojson.features) return lookup;

    geojson.features.forEach(feature => {
        const id = feature.properties.id;
        if (!id) return;

        // Normalize Polygon → MultiPolygon
        const coords = feature.geometry.type === 'Polygon'
            ? [feature.geometry.coordinates]
            : feature.geometry.coordinates;
        const convertRing = (ring) => ring.map(coord => {
            const lat = coord[1] === 90 ? 85 : coord[1] === -90 ? -85 : coord[1];
            return {latitude: lat, longitude: coord[0]};
        });

        // MultiPolygon: [polygon[ring[coord]]]
        // Each polygon: ring[0] = outer boundary, ring[1+] = holes
        const parsedPolygons = coords.map(polygon => ({
            outer: convertRing(polygon[0]),
            holes: polygon.slice(1).map(convertRing)
        }));

        const first = parsedPolygons[0] || {outer: [], holes: []};
        const entry = {
            icao: id,
            points: first.outer,
            holes: first.holes,
            center: {
                latitude: parseFloat(feature.properties.label_lat) || 0,
                longitude: parseFloat(feature.properties.label_lon) || 0
            },
            isOceanic: feature.properties.oceanic === '1' ? 1 : 0,
            isExtention: false,
            pointCount: first.outer.length
        };

        if (!lookup[id]) {
            lookup[id] = [];
        }
        lookup[id].push(entry);

        // Additional polygons in MultiPolygon as separate entries
        for (let i = 1; i < parsedPolygons.length; i++) {
            lookup[id].push({
                ...entry,
                points: parsedPolygons[i].outer,
                holes: parsedPolygons[i].holes,
                pointCount: parsedPolygons[i].outer.length
            });
        }
    });

    return lookup;
};

export const parseTraconJson = (geojson) => {
    const lookup = {byPrefix: {}, byPrefixAndSuffix: {}};
    if (!geojson || !geojson.features) return lookup;

    geojson.features.forEach(feature => {
        const props = feature.properties;
        if (!props || !props.prefix) return;

        // Normalize geometry: Polygon → MultiPolygon
        let multiCoords;
        if (feature.geometry.type === 'Polygon') {
            multiCoords = [feature.geometry.coordinates];
        } else {
            multiCoords = feature.geometry.coordinates;
        }

        const convertCoords = (ring) => ring.map(coord => ({
            latitude: coord[1], longitude: coord[0]
        }));

        const polygons = multiCoords.map(polygon => ({
            coordinates: convertCoords(polygon[0]),
            holes: polygon.slice(1).map(convertCoords)
        }));

        const entry = {
            id: props.id,
            name: props.name,
            prefix: props.prefix,
            suffix: props.suffix || null,
            polygons: polygons
        };

        const prefixes = Array.isArray(props.prefix) ? props.prefix : [props.prefix];
        prefixes.forEach(prefix => {
            if (props.suffix) {
                const key = prefix + '_' + props.suffix;
                if (!lookup.byPrefixAndSuffix[key]) {
                    lookup.byPrefixAndSuffix[key] = [];
                }
                lookup.byPrefixAndSuffix[key].push(entry);
            } else {
                if (!lookup.byPrefix[prefix]) {
                    lookup.byPrefix[prefix] = [];
                }
                lookup.byPrefix[prefix].push(entry);
            }
        });
    });

    return lookup;
};

export const lookupTracon = (traconLookup, callsignPrefix, callsignSuffix) => {
    if (!traconLookup || !traconLookup.byPrefix) return null;

    // Check suffix-specific first (e.g., ATL_DEP)
    if (callsignSuffix) {
        const suffixKey = callsignPrefix + '_' + callsignSuffix;
        const suffixMatch = traconLookup.byPrefixAndSuffix[suffixKey];
        if (suffixMatch && suffixMatch.length > 0) {
            return suffixMatch[0];
        }
    }

    // Fall back to prefix-only
    const prefixMatch = traconLookup.byPrefix[callsignPrefix];
    if (prefixMatch && prefixMatch.length > 0) {
        return prefixMatch[0];
    }

    return null;
};
