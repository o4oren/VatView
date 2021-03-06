import {storeInitialRegion} from '../../common/storageService';
export const INITIAL_REGION_LOADED = 'INITIAL_REGION_LOADED';
export const REGION_UPDATED = 'REGION_UPDATED';
export const CLIENT_SELECTED = 'CLIENT_SELECTED';


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

const clientSelected = (client) => {
    return {
        type: CLIENT_SELECTED,
        payload: {selectedClient: client}
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
    saveInitialRegion: saveInitialRegion,
    clientSelected: clientSelected,
};