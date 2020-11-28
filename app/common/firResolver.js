import {binarySearch} from './binarySearch';

export function getFirFromPrefix(prefix, firs) {
    let fir = binarySearch(firs, 'icao', prefix);
    if(fir) return fir;

    return firs.find(f => f.prefix === prefix);
}

export function getFirCountry(fir, countries) {
    if(!fir || !countries)
        return null;
    return countries[fir.substr(0,2)];
}
