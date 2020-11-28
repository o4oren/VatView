import { AsyncStorage } from 'react-native';

const FAVORITES = 'FAVORITES';

export const storeFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(FAVORITES, JSON.stringify(favorites));
  } catch (err) {
    console.log('Error storing favorites', err);
  }
};

export const retrieveSavedState = async () => {
  try {
    const promises = [AsyncStorage.getItem(FAVORITES), ];
    const [favorites, ] = await Promise.all(promises);

  } catch (err) {
    console.log('Error stored preferences', err);
    return null;
  }
};
