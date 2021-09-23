import * as SQLite from 'expo-sqlite';
let db;

export const getDb = () => {
    if (!db) {
        db = SQLite.openDatabase('vatsim_static_data.db', null, null, null);
    }
    return db;
};

export const initDb = () => {
    console.log('Initializing db');
    getDb().transaction((tx) => {
        tx.executeSql('drop table if exists airports');
        tx.executeSql('drop table if exists fir_boundaries');
        tx.executeSql('drop table if exists boundary_points');

        tx.executeSql(
            'create table if not exists airports (icao text not null, iata text, name text, latitude real, longitude real, fir text, isPseaudo integer, primary key (icao) on conflict ignore );',
        );

        tx.executeSql(
            'create index if not exists airports_iata_index on airports(iata);'
        );
        tx.executeSql(
            'create index if not exists airports_iata_index on airports(name);'
        );

        tx.executeSql(
            'create table if not exists fir_boundaries (icao text not null, isOceanic integer, isExtention integer, latitude real, longitude real, pointCount integer, primary key (icao,  isOceanic, isExtention));'
        );

        tx.executeSql(
            'create index if not exists firBoundaries_index on fir_boundaries(icao);'
        );

        tx.executeSql(
            'create table if not exists boundary_points (icao text not null, isOceanic integer, isExtention integer, latitude real, longitude real, foreign key (icao,  isOceanic, isExtention) references fir_boundaries);'
        );

        tx.executeSql(
            'create index if not exists boundary_points_index on boundary_points(icao);'
        );
    });
};

export const insertAirports = (airportTokens, callback) => {
    getDb().transaction((tx) => {
        const placeholders = airportTokens.map(() => ('(?,?,?,?,?,?,?)')).join(',');
        tx.executeSql(
            'insert into airports (icao, name, latitude, longitude, iata, fir, isPseaudo) values ' + placeholders + ';',
            airportTokens.flat(1),
            (_, res) => callback(res),
            (_, err) => {
                console.log('error', {error: err, airport: airportTokens});
            }
        );
    });
};

export const insertFirBoundaries = (fir, callback) => {
    getDb().transaction((tx) => {
        tx.executeSql(
            'insert into fir_boundaries (icao, isOceanic, isExtention, latitude, longitude, pointCount) values (?,?,?,?,?,?);',
            [fir.icao, fir.isOceanic, fir.isExtention, fir.center.latitude, fir.center.longitude, fir.pointCount],
            async (_, res) => {
                // console.log('query', {
                //     fir: fir,
                //     q: 'insert into fir_boundaries (icao, isOceanic, isExtention, latitude, longitude, pointCount) values (?,?,?,?,?,?);',
                //     res: res,
                // });
                insertPoints(fir, callback);
            },
            (_, err) => {
                console.log('error', err);
                callback(false);
            }
        );
    });
};

export const insertPoints = (fir, callback) => {
    getDb().transaction((tx) => {
        console.log('inserting points for fir ' + fir.icao);
        const placeholders = fir.points.map(() => (`('${fir.icao}',${fir.isOceanic},'${fir.isExtention}',?,?)`)).join(',');
        tx.executeSql(
            'insert into boundary_points (icao, isOceanic, isExtention, latitude, longitude) values ' + placeholders + ';',
            fir.points.map(point => {return [point.latitude, point.longitude];}).flat(1),
            (_, res) => {
                // console.log('query', {
                //     fir: fir,
                //     q: 'insert into boundary_points (icao, isOceanic, isExtention, latitude, longitude) values ' + placeholders + ';',
                //     res: res,
                // });
                // console.log('points for ' + fir.icao, res.insertId);
                callback(true);
            },
            (_, err) => {
                console.log('error', err);
                callback(false);
            }
        );
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

export const countAirports = () => {
    return new Promise((resolve, reject) => {
        getDb().transaction((tx) => {
            tx.executeSql(
                'select count(*) as count from airports;',
                null,
                (_, res) => {
                    resolve(res);
                },
                (_, err) => {
                    reject(err);
                    console.log('error', err);
                }
            );
        });
    });
};

export const countFirBoundaries = () => {
    return new Promise((resolve, reject) => {
        getDb().transaction((tx) => {
            tx.executeSql(
                'select count(*) as count from fir_boundaries;',
                null,
                (_, res) => {
                    resolve(res);
                },
                (_, err) => {
                    reject(err);
                    console.log('error', err);
                }
            );
        });
    });
};