import {storeStaticAirspaceData, storeFirGeoJson, storeTraconBoundaries, storeReleaseTag, getReleaseTag, FIR_GEOJSON_RELEASE_TAG_KEY, TRACON_RELEASE_TAG_KEY} from '../../common/storageService';
import {STATIC_DATA_VERSION} from '../../common/consts';
import {countAirports, insertAirports} from '../../common/staticDataAcessLayer';
import appActions from './appActions';
import {fetchLatestRelease, findAssetUrl, parseFirGeoJson, parseTraconJson} from '../../common/boundaryService';

export const BOUNDARY_DATA_UPDATED = 'BOUNDARY_DATA_UPDATED';
export const VATSPY_DATA_UPDATED = 'VATSPY_DATA_UPDATED';

const COUNTRIES = '[Countries]';
const AIRPORTS = '[Airports]';
const UIR = '[UIRs]';
const FIR = '[FIRs]';
const IDL = '[IDL]';
const AIRPORTS_CHUNK_SIZE = 140;


const boundaryDataUpdated = (firBoundaryLookup, traconBoundaryLookup) => {
    return {
        type: BOUNDARY_DATA_UPDATED,
        payload: {firBoundaryLookup, traconBoundaryLookup}
    };
};

const vatspyDataUpdated = (countries, airports, firs, uirs, lastUpdated, version) => {
    return {
        type: VATSPY_DATA_UPDATED,
        payload: {
            countries: countries,
            airports: airports,
            firs: firs,
            uirs: uirs,
            lastUpdated: lastUpdated,
            version: version
        }
    };
};

const getBoundaryData = async (dispatch) => {
    try {
        const firRelease = await fetchLatestRelease('vatsimnetwork', 'vatspy-data-project');
        const firAssetUrl = findAssetUrl(firRelease.assets, 'Boundaries.geojson');
        const firResponse = await fetch(firAssetUrl);
        const firRawJson = await firResponse.text();
        await storeFirGeoJson(firRawJson);
        await storeReleaseTag(FIR_GEOJSON_RELEASE_TAG_KEY, firRelease.tag);

        const traconRelease = await fetchLatestRelease('vatsimnetwork', 'simaware-tracon-project');
        const traconAssetUrl = findAssetUrl(traconRelease.assets, 'TRACONBoundaries.geojson');
        const traconResponse = await fetch(traconAssetUrl);
        const traconRawJson = await traconResponse.text();
        await storeTraconBoundaries(traconRawJson);
        await storeReleaseTag(TRACON_RELEASE_TAG_KEY, traconRelease.tag);

        const firLookup = parseFirGeoJson(JSON.parse(firRawJson));
        const traconLookup = parseTraconJson(JSON.parse(traconRawJson));
        dispatch(boundaryDataUpdated(firLookup, traconLookup));
        dispatch(appActions.saveFirBoundariesLoaded(true));
    } catch (err) {
        console.error('getBoundaryData failed:', err);
        // Set Redux state so app proceeds past loading screen, but do NOT
        // persist to AsyncStorage — App.js will force retry on next cold start
        // if boundary files are missing from disk.
        dispatch({type: 'FIR_BOUNDARIES_LOADED', payload: {firBoundariesLoaded: true}});
    }
};

// eslint-disable-next-line no-unused-vars
const checkBoundaryUpdates = async (dispatch) => {
    try {
        const [currentFirTag, currentTraconTag] = await Promise.all([
            getReleaseTag(FIR_GEOJSON_RELEASE_TAG_KEY),
            getReleaseTag(TRACON_RELEASE_TAG_KEY)
        ]);
        const [firRelease, traconRelease] = await Promise.all([
            fetchLatestRelease('vatsimnetwork', 'vatspy-data-project'),
            fetchLatestRelease('vatsimnetwork', 'simaware-tracon-project')
        ]);
        if (firRelease.tag !== currentFirTag) {
            const url = findAssetUrl(firRelease.assets, 'Boundaries.geojson');
            const resp = await fetch(url);
            await storeFirGeoJson(await resp.text());
            await storeReleaseTag(FIR_GEOJSON_RELEASE_TAG_KEY, firRelease.tag);
        }
        if (traconRelease.tag !== currentTraconTag) {
            const url = findAssetUrl(traconRelease.assets, 'TRACONBoundaries.geojson');
            const resp = await fetch(url);
            await storeTraconBoundaries(await resp.text());
            await storeReleaseTag(TRACON_RELEASE_TAG_KEY, traconRelease.tag);
        }
    } catch (err) {
        console.log('Background boundary update check failed:', err);
    }
};

/**
 * Inserts the airports into the db in chunks of 140 (because of max permitted ? in Android)
 * @param airportTokens
 * @param dispatch
 * @param getState
 */
function insertAirportIntoDb(airportTokens, dispatch) {
    Array.from(
        {length: Math.ceil(airportTokens.length / AIRPORTS_CHUNK_SIZE)},
        (_, index) => airportTokens.slice(index * AIRPORTS_CHUNK_SIZE, (index + 1) * AIRPORTS_CHUNK_SIZE)
    ).forEach(async (chunk, index) => {
        await insertAirports(chunk, () => {
            // console.log('inserting airports count ' + lastRowId);
            if ((index * AIRPORTS_CHUNK_SIZE) + chunk.length === airportTokens.length) {
                dispatch(appActions.saveAirportsLoaded(true));
            }
        });
    });
}

const getVATSpyData = async (dispatch) => {
    const dataUrls = await fetch(
        'https://api.vatsim.net/api/map_data/');
    const dataUrlsJson = await dataUrls.json();

    const response = await fetch(
        dataUrlsJson.vatspy_dat_url);
    let body = await response.text();

    const lines = body.split(/\r?\n/);
    let section = COUNTRIES;
    let countries = {};
    const airports = {icao: {}, iata: {}};
    const firs = [];
    const uirs = {};
    let airportTokens = [];

    await lines.forEach((line) => {
        if(line.startsWith('['))
        {
            section = line.trim();
        }

        if (!line.startsWith(';') && !line.startsWith('[') && line != '') {
            const tokens = line.split('|');
            switch (section) {
            case COUNTRIES:
                countries[tokens[1]]={
                    country: tokens[0],
                    callsign: tokens[2]
                };
                break;
            case AIRPORTS:
                airportTokens.push(tokens);
                break;
            case FIR:
                firs.push(
                    {
                        icao: tokens[0],
                        name: tokens[1],
                        prefix: tokens[2],
                        firBoundary: tokens[3]
                    }
                );
                break;
            case UIR:
                uirs[tokens[0]] =
                    {
                        icao: tokens[0],
                        name: tokens[1],
                        firs: tokens[2].split(',')
                    };
                break;
            case IDL:
                break;
            default:
                console.log('error. Line is ', line);
            }
        }
    });

    await insertAirportIntoDb(airportTokens, dispatch);

    const lastUpdated = Date.now();
    await storeStaticAirspaceData({
        countries: countries,
        airports: airports,
        firs: firs,
        uirs: uirs,
        lastUpdated: lastUpdated,
        version: STATIC_DATA_VERSION
    });
    console.log('vatspyDataUpdated', vatspyDataUpdated);
    await countAirports();
    dispatch(vatspyDataUpdated(countries, airports, firs, uirs, lastUpdated, STATIC_DATA_VERSION));
};

export default {
    boundaryDataUpdated: boundaryDataUpdated,
    vatspyDataUpdated: vatspyDataUpdated,
    getBoundaryData: getBoundaryData,
    checkBoundaryUpdates: checkBoundaryUpdates,
    getVATSpyData: getVATSpyData
};
