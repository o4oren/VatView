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


export const firBoundariesUpdated = (firBoundaries) => {
    console.log('firBoundaries updated', firBoundaries);
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
    const response = await fetch(
        'https://raw.githubusercontent.com/vatsimnetwork/vatspy-data-project/master/FIRBoundaries.dat');
    let body = await response.text();
    const lines = body.split(/\r?\n/);
    let numInsertedFirs = 0;
    for (let i=0; i < lines.length; i++) {
        if (!lines[i].match(/^\d/)) {
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
                insertFirBoundaries(fir, (isSuccess) => {
                    console.log('were here');
                    if(isSuccess) {
                        ++numInsertedFirs;
                        if(numInsertedFirs % 10 == 0) {
                            dispatch(appActions.loadingDb({
                                airports: getState().app.loadingDb.airports,
                                firs: numInsertedFirs
                            }));
                        }
                    }
                });
            }
        }
    }

    dispatch(appActions.loadingDb({
        airports: getState().app.loadingDb.airports,
        firs: numInsertedFirs
    }));

    // used to store the empty object. TODO remove this
    storeFirBoundaries(null);
};

const getVATSpyData = async (dispatch, getState) => {
    const response = await fetch(
        'https://raw.githubusercontent.com/vatsimnetwork/vatspy-data-project/master/VATSpy.dat');
    let body = await response.text();

    const lines = body.split(/\r?\n/);
    let section = COUNTRIES;
    let countries = {};
    const airports = {icao: {}, iata: {}};
    const firs = [];
    const uirs = {};
    let airportTokens = [];
    let airportIndex = 0;

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
                if(airportTokens.length == 140) {
                    console.log('inserting airports ' + airportIndex + ' - ' + (airportIndex + airportTokens.length));
                    insertAirports(airportTokens, (res) => dispatch(appActions.loadingDb({
                        airports: res.insertId,
                        firs: getState().app.loadingDb.firs
                    })));
                    airportIndex += airportTokens.length;
                    airportTokens = [];
                }
                // TODO remove - old airports implementation
                // if(!airports.icao[tokens[0]]) {
                //     airports.icao[tokens[0]] =
                //         {
                //             icao: tokens[0],
                //             name: tokens[1],
                //             latitude: Number(tokens[2]),
                //             longitude: Number(tokens[3]),
                //             iata: tokens[4],
                //             fir: tokens[5],
                //             isPseaudo: tokens[6]
                //         };
                // }
                // if(!airports.icao[tokens[4]]) {
                //     airports.iata[tokens[4]] =
                //         {
                //             icao: tokens[0]
                //         };
                // }
                break;
            case FIR:
                if(airportTokens.length > 0) {
                    console.log('inserting airports ' + airportIndex + ' - ' + (airportIndex + airportTokens.length));
                    insertAirports(airportTokens, (res) => dispatch(appActions.loadingDb({
                        airports: res.insertId,
                        firs: getState().app.loadingDb.firs
                    })));
                    airportIndex += airportTokens.length;
                    airportTokens = [];
                }
                firs.push(
                    {
                        icao: tokens[0],
                        name: tokens[1],
                        prefix: tokens[2],
                        position: tokens[3]
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

    const lastUpdated = Date.now();
    console.log('before storing');
    await storeStaticAirspaceData({
        countries: countries,
        airports: airports,
        firs: firs,
        uirs: uirs,
        lastUpdated: lastUpdated,
        version: STATIC_DATA_VERSION
    });
    console.log('vatspyDataUpdated');
    countAirports();
    dispatch(vatspyDataUpdated(countries, airports, firs, uirs, lastUpdated, STATIC_DATA_VERSION));
};

export default {
    firBoundariesUpdated: firBoundariesUpdated,
    vatspyDataUpdated: vatspyDataUpdated,
    getFirBoundaries: getFirBoundaries,
    getVATSpyData: getVATSpyData
};
