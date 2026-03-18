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

export const getAirportsByICAOAsync = (codes) => {
    if (!codes || codes.length === 0) {
        return Promise.resolve([]);
    }
    const placeholders = codes.map(() => ('?')).join(',');
    return new Promise((resolve, reject) => {
        getDb().then((tx) => {
            try{
                let res = tx.getAllSync(
                    `select * from airports where icao in (${placeholders});`,
                    codes);
                resolve(res);
            } catch (err) {
                console.log('error', err);
                reject(err);
            }
        });
    });
};

//returns a promise of all airports whose icao, iata, or name contains the searchTerm
export const findAirportsByCodeOrNamePrefixAsync = (searchTerm) => {
    const pattern = '%' + searchTerm + '%';
    return new Promise((resolve, reject) => {
        getDb().then((tx) => {
            try {
                let res = tx.getAllSync(
                    'select * from airports where icao like ? or iata like ? or name like ? COLLATE NOCASE;',
                    [pattern, pattern, pattern]);
                resolve(res);
            } catch(err) {
                console.log('error', err);
                reject(err);
            }
        });
    });
};

export const getAirportsByCodesArray = (codes, callback) => {
    if(codes.length == 0 || !codes) {
        callback([]);
        return;
    }
    const mappedCodes = codes.map(code => {return '\'' + code + '\'';}).join(',');
    getDb().then((tx) => {
        try {
            let res = tx.getAllSync(
                `select * from airports where (icao in (${mappedCodes}) or iata in (${mappedCodes}));`,
                null);
            callback(res);
        } catch (err) {
            console.log('query error', {
                err: err,
                q: `select * from airports where icao in (${mappedCodes});`
            });
            callback([]);
        }
    });
};

export const countAirports = async () => {
    let tx = await getDb();
    let res = await tx.getFirstAsync('select count(*) as count from airports;');
    return res.count;
};

