import {storeInitialRegion} from '../../util/storageService';
export const INITIAL_REGION_LOADED = 'INITIAL_REGION_LOADED';
export const REGION_UPDATED = 'REGION_UPDATED';
export const FAVORITES_SAVED = 'FAVORITES_SAVED';

const initialRegionLoaded = (region) => {
    return {
        type: INITIAL_REGION_LOADED,
        payload: {initialRegion: region}
    };
};

const regionUpdated = (region) => {
    return {
        type: REGION_UPDATED,
        payload: {region: region}
    };
};

export function saveInitialRegion(region) {
    return async function saveRegion(dispatch, getState) {
        const initialRegion = { region };
        await storeInitialRegion(initialRegion);
        dispatch(regionUpdated(initialRegion));
    };
}

export default {
    initialRegionLoaded: initialRegionLoaded,
    regionUpdated: regionUpdated,
    saveInitialRegion: saveInitialRegion
};