import {storeFirBoundaries, storeStaticAirspaceData} from '../../common/storageService';
import {STATIC_DATA_VERSION} from '../../common/consts';
import {countAirports, insertAirports, insertFirBoundaries} from '../../common/staticDataAcessLayer';
import appActions from './appActions';

export const FIR_BOUNDARIES_UPDATED = 'FIR_BOUNDARIES_UPDATED';
export const VATSPY_DATA_UPDATED = 'VATSPY_DATA_UPDATED';

const COUNTRIES = '[Countries]';
const AIRPORTS = '[Airports]';
const UIR = '[UIRs]';
const FIR = '[FIRs]';
const IDL = '[IDL]';
const AIRPORTS_CHUNK_SIZE = 140;


export const firBoundariesUpdated = (firBoundaries) => {
    return {
        type: FIR_BOUNDARIES_UPDATED,
        payload: {firBoundaries: firBoundaries}
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

// FIR boundaries fields are as follow:
// 0 - ICAO
// 1 - Is Oceanic
// 2 - Is Extension
// 3 - Point Count
// 4 - Min Lat
// 5 - Min Lon
// 6 - Max Lat
// 7 - Max Lon
// 8 - Center Lat
// 9 - Center Lon
const getFirBoundaries = async (dispatch, getState) => {
    const dataUrls = await fetch(
        'https://api.vatsim.net/api/map_data/');
    const dataUrlsJson = await dataUrls.json();
    const response = await fetch(
        dataUrlsJson.fir_boundaries_dat_url);
    let body = await response.text();
    const lines = body.trim().split(/\r?\n/);
    let numInsertedFirs = 0;

    for (let i = 0; i <= lines.length; i++) {
        if (lines[i] && !lines[i].match(/^\d/)) {
            let fir = {};
            const fields = lines[i].split('|');
            fir.icao = fields[0];
            fir.pointCount = fields[3];
            fir.center = {
                latitude: Number(fields[8]),
                longitude: Number(fields[9])
            };
            fir.isOceanic = fields[1];
            fir.isExtention = fields[2];
            const points = [];
            const anchor = i;
            for (let j = 1; j <= fields[3]; j++) {
                const point = lines[anchor + j].split('|');
                if (point[0] == 90) point[0] = 85;
                if (point[0] == -90) point[0] = -85;
                points.push({
                    latitude: Number(point[0]),
                    longitude: Number(point[1])
                });
                i++;
            }
            fir.points = points;

            if(fir.icao && fir.icao.length > 0) {
                await insertFirBoundaries(fir, (isSuccess) => {
                    if(isSuccess) {
                        ++numInsertedFirs;
                        if(numInsertedFirs % 100 == 0) {
                            dispatch(appActions.loadingDb({
                                airports: getState().app.loadingDb.airports,
                                firs: numInsertedFirs
                            }));
                        }
                    }

                });
                if(i == lines.length - 1) {
                    // we're at the end of the file
                    console.log('===================', getState().app.loadingDb.airports + '  ' + getState().app.loadingDb.firs);
                    if(getState().app.loadingDb.firs > 520) {
                        console.log('***************=', getState().app.loadingDb.airports + '  ' + getState().app.loadingDb.firs);
                        dispatch(appActions.saveFirBoundariesLoaded(true));
                    }
                }
            }
        }
    }

    console.log({
        airports: getState().app.loadingDb.airports,
        firs: numInsertedFirs
    });
    dispatch(appActions.loadingDb({
        airports: getState().app.loadingDb.airports,
        firs: numInsertedFirs
    }));

    // used to store the empty object. TODO remove this
    storeFirBoundaries(null);
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
    firBoundariesUpdated: firBoundariesUpdated,
    vatspyDataUpdated: vatspyDataUpdated,
    getFirBoundaries: getFirBoundaries,
    getVATSpyData: getVATSpyData
};
