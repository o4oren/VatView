import { AsyncStorage } from 'react-native';

const FAVORITES = 'FAVORITES';
const INITIAL_REGION = 'INITIAL_REGION';

export const storeFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(FAVORITES, JSON.stringify(favorites));
  } catch (err) {
    console.log('Error storing favorites', err);
  }
};

export const storeInitialRegion = async (region) => {
  try {
    await AsyncStorage.setItem(INITIAL_REGION, JSON.stringify(region));
  } catch (err) {
    console.log('Error storing favorites', err);
  }
};

export const retrieveSavedState = async () => {
  try {
    const promises = [AsyncStorage.getItem(FAVORITES), AsyncStorage.getItem(INITIAL_REGION),];
    const [favorites, initialRegion] = await Promise.all(promises);
    return {
      initialRegion: JSON.parse(initialRegion),
    };
  } catch (err) {
    console.log('Error stored preferences', err);
    return null;
  }
};
