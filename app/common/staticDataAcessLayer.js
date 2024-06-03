import * as SQLite from 'expo-sqlite';
let db;

export const getDb = async () => {
    if (!db) {
        db = await SQLite.openDatabaseAsync('vatsim_static_data.db', {});
    }
    return db;
};

export const initDb = () => {
    console.log('Initializing db');
    getDb().then(async (tx) => {
        await tx.runAsync('drop table if exists airports');
        await tx.runAsync('drop table if exists fir_boundaries');
        await tx.runAsync('drop table if exists boundary_points');

        await tx.runAsync(
            'create table if not exists airports (icao text not null, iata text, name text, latitude real, longitude real, fir text, isPseaudo integer, primary key (icao) on conflict ignore );',
        );

        await tx.runAsync(
            'create index if not exists airports_iata_index on airports(iata);'
        );
        await tx.runAsync(
            'create index if not exists airports_iata_index on airports(name);'
        );

        await tx.runAsync(
            'create table if not exists fir_boundaries (icao text not null, isOceanic integer, isExtention integer, latitude real, longitude real, pointCount integer, primary key (icao,  isOceanic, isExtention));'
        );

        await tx.runAsync(
            'create index if not exists firBoundaries_index on fir_boundaries(icao);'
        );

        await tx.runAsync(
            'create table if not exists boundary_points (icao text not null, isOceanic integer, isExtention integer, latitude real, longitude real, foreign key (icao,  isOceanic, isExtention) references fir_boundaries);'
        );

        await tx.runAsync(
            'create index if not exists boundary_points_index on boundary_points(icao);'
        );
    });
};

export const insertAirports = (airportTokens, callback) => {
    getDb().then(async (tx) => {
        const placeholders = airportTokens.map(() => ('(?,?,?,?,?,?,?)')).join(',');
        let res = await tx.runAsync(
            'insert into airports (icao, name, latitude, longitude, iata, fir, isPseaudo) values ' + placeholders + ';',
            airportTokens.flat(1));
        callback(res.lastInsertRowId);
    });
};

export const insertFirBoundaries = (fir, callback) => {
    getDb().then((tx) => {
        let res = tx.runSync(
            'insert into fir_boundaries (icao, isOceanic, isExtention, latitude, longitude, pointCount) values (?,?,?,?,?,?);',
            [fir.icao, fir.isOceanic, fir.isExtention, fir.center.latitude, fir.center.longitude, fir.pointCount]
        );
        insertPoints(fir, callback);
    });
};

export const insertPoints = (fir, callback) => {
    getDb().then((tx) => {
        console.log('inserting points for fir ' + fir.icao);
        const placeholders = fir.points.map(() => (`('${fir.icao}',${fir.isOceanic},'${fir.isExtention}',?,?)`)).join(',');
        tx.runSync(
            'insert into boundary_points (icao, isOceanic, isExtention, latitude, longitude) values ' + placeholders + ';',
            fir.points.map(point => {return [point.latitude, point.longitude];}).flat(1));
        callback(true);
    });
};

export const getFirsFromDB = (codes) => {
    const placeholders = codes.map(() => ('?')).join(',');
    return new Promise((resolve, reject) => {
        getDb().transaction((tx) => {
            tx.executeSql(
                `select * from fir_boundaries where fir_boundaries.icao in (${placeholders});`,
                codes,
                (_, res) => {
                    // console.log('query', {
                    //     codes: codes,
                    //     q: `select * from airports where icao in (${placeholders});`,
                    //     res: res,
                    // });
                    resolve(res.rows._array);
                },
                (_, err) => {
                    console.log('error', err);
                    reject(err);
                }
            );
        });
    });
};

export const getFirPointsFromDB = (fir) => {
    return new Promise((resolve, reject) => {
        getDb().transaction((tx) => {
            tx.executeSql(
                'select latitude, longitude from boundary_points where icao = ? and isOceanic = ? and isExtention = ?;',
                [fir.icao, fir.isOceanic, fir.isExtention],
                (_, res) => {
                    // console.log('query', {
                    //     fir: fir,
                    //     q: `select latitude, longitude from boundary_points where icao = '${fir.icao}' and isOceanic = ${fir.isOceanic} and isExtention = ${fir.isExtention};`,
                    //     res: res,
                    // });
                    fir.center = {};
                    fir.center.longitude = fir.longitude;
                    fir.center.latitude = fir.latitude;
                    fir.points = res.rows._array;
                    // console.log(fir);
                    resolve(fir);
                },
                (_, err) => {
                    console.log('error', err);
                    reject(err);
                }
            );
        });
    });
};


export const getAirportsByICAOAsync = (codes) => {
    const placeholders = codes.map(() => ('?')).join(',');
    return new Promise((resolve, reject) => {
        getDb().transaction((tx) => {
            tx.executeSql(
                `select * from airports where icao in (${placeholders});`,
                codes,
                (_, res) => {
                    // console.log('query', {
                    //     codes: codes,
                    //     q: `select * from airports where icao in (${placeholders});`,
                    //     res: res,
                    // });
                    resolve(res.rows._array);
                },
                (_, err) => {
                    console.log('error', err);
                    reject(err);
                }
            );
        });
    });
};

//returns a promise of all the airports whose icao or IATA equals or name starts with the searchTerm
export const findAirportsByCodeOrNamePrefixAsync = (searchTerm) => {
    return new Promise((resolve, reject) => {
        getDb().transaction((tx) => {
            tx.executeSql(
                `select * from airports where icao = ? or iata = ? or name like '${searchTerm}%' COLLATE NOCASE;`,
                [searchTerm.toUpperCase(), searchTerm.toUpperCase()],
                (_, res) => {
                    console.log('query', {
                        searchTerm: searchTerm,
                        q: `select * from airports where icao = ? or iata = ? or name like '${searchTerm}%' COLLATE NOCASE;`,
                        res: res,
                    });
                    resolve(res.rows._array);
                },
                (_, err) => {
                    console.log('error', err);
                    reject(err);
                }
            );
        });
    });
};

export const getAirportsByCodesArray = (codes, callback) => {
    if(codes.length == 0 || !codes) {
        callback([]);
        return;
    }
    const mappedCodes = codes.map(code => {return '\'' + code + '\'';}).join(',');
    getDb().transaction((tx) => {
        tx.executeSql(
            `select * from airports where (icao in (${mappedCodes}) or iata in (${mappedCodes}));`,
            null,
            (_, res) => {
                // console.log('query', {
                //     codes: codes,
                //     res: res,
                // });
                // console.log(res.rows._array.length);
                callback(res.rows._array);
            },
            (_, err) => {
                console.log('query error', {
                    err: err,
                    q: `select * from airports where icao in (${mappedCodes});`
                });
            }
        );
    });
};

export const countAirports = async () => {
    let tx = await getDb();
    let res = await tx.getFirstAsync('select count(*) as count from airports;');
    return res.count;
};

export const countFirBoundaries = async () => {
    let tx = await getDb();
    let res = tx.getFirstAsync('select count(*) as count from fir_boundaries;');
    return res.count;
};