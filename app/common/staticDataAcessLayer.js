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
        tx.executeSql(
            'create table if not exists airports (icao text not null, iata text, name text, latitude real, longitude real, fir text, isPseaudo integer, primary key (icao, iata) on conflict ignore );',
        );
        tx.executeSql(
            'create index if not exists airports_iata_index on airports(icao);'
        );
        tx.executeSql(
            'create index if not exists airports_iata_index on airports(iata);'
        );
        tx.executeSql(
            'create index if not exists airports_iata_index on airports(name);'
        );

        tx.executeSql(
            'create table if not exists firs (icao text primary key not null, name text, prefix text, position text);'
        );
        tx.executeSql(
            'create table if not exists uirs (icao text primary key not null, name text);'
        );
        tx.executeSql(
            'create table if not exists firs_in_uir (icao text not null, fir_icao text not null, primary key (icao, fir_icao));'
        );
    });
};

export const insertAirports = (airportTokens) => {
    getDb().transaction((tx) => {
        const placeholders = airportTokens.map(() => ('(?,?,?,?,?,?,?)')).join(',');
        tx.executeSql(
            'insert into airports (icao, name, latitude, longitude, iata, fir, isPseaudo) values ' + placeholders + ';',
            airportTokens.flat(1),
            (_, res) => console.log(res.insertId),
            (_, err) => {
                console.log('error', {error: err, airport: airportTokens});
            }
        );
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

export const getAirportsByCodesArray = (codes, callback) => {
    if(codes.length == 0 || !codes) {
        callback([]);
        return;
    }
    const mappedCodes = codes.map(code => {return '\'' + code + '\'';}).join(',');
    getDb().transaction((tx) => {
        tx.executeSql(
            `select * from airports where icao in (${mappedCodes}) or iata in (${mappedCodes});`,
            null,
            (_, res) => {
                // console.log('query', {
                //     codes: codes,
                //     res: res,
                // });
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
    getDb().transaction((tx) => {
        tx.executeSql(
            'select count(*) from airports;',
            null,
            (_, res) => {
                console.log('count', res);
            },
            (_, err) => {
                console.log('error', err);
            }
        );
    });
};