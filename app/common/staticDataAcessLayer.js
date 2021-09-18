import * as SQLite from 'expo-sqlite';

let db;

export const initDb = () => {
    db = SQLite.openDatabase('vatsim_static_data.db', null, null, null);
    db.transaction((tx) => {
        // tx.executeSql('drop table if exists airports');
        tx.executeSql(
            'create table if not exists airports (icao text not null, iata text, name text, latitude real, longitude real, fir text, isPseaudo integer, primary key (icao, iata));',
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
    db.transaction((tx) => {
        const placeholders = airportTokens.map(() => ('(?,?,?,?,?,?,?)')).join(',');
        tx.executeSql(
            'insert into airports (icao, name, latitude, longitude, iata, fir, isPseaudo) values ' + placeholders + ';',
            airportTokens.flat(1),
            (_, res) => console.log('s',res[0]),
            (_, err) => {
                console.log('error', {error: err, airport: airportTokens});
            }
        );
    });
};

export const getAirportByCode = (code) => {
    db.transaction((tx) => {
        tx.executeSql(
            'select * from airports where icao == ? or iata == ?;',
            [code],
            (_, res) => {
                // console.log('query', {
                //     code: code,
                //     res: res,
                //     apt: res.rows.item(0)
                // });
                // TODO
            },
            (_, err) => {
                console.log('error', err);
            }
        );
    });

};

export const getAirportsByCodesArray = (codes, callback) => {
    const mappedCodes = codes.map(code => {return '\'' + code + '\'';}).join(',');
    db.transaction((tx) => {
        tx.executeSql(
            `select * from airports where icao in (${mappedCodes});`,
            [mappedCodes].flat(1),
            (_, res) => {
                // console.log('query', {
                //     code: code,
                //     res: res,
                //     apt: res.rows.item(0)
                // });
                console.log('r', res);
                callback(res.rows._array);
            },
            (_, err) => {
                console.log('error', err);
            }
        );
    });
};

export const countAirports = () => {
    db.transaction((tx) => {
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