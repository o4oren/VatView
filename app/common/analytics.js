import { getAnalytics, logEvent as firebaseLogEvent, setUserProperty as firebaseSetUserProperty, setUserId as firebaseSetUserId } from '@react-native-firebase/analytics';

async function logEvent(eventName, params) {
    try {
        if (__DEV__) {
            console.log('[Analytics]', eventName, params);
        }
        await firebaseLogEvent(getAnalytics(), eventName, params);
    } catch (error) {
        if (__DEV__) {
            console.warn('[Analytics] logEvent error:', error);
        }
    }
}

async function logScreenView(screenName, screenClass) {
    try {
        if (__DEV__) {
            console.log('[Analytics] screen_view', screenName, screenClass);
        }
        await firebaseLogEvent(getAnalytics(), 'screen_view', {
            screen_name: screenName,
            screen_class: screenClass,
        });
    } catch (error) {
        if (__DEV__) {
            console.warn('[Analytics] logScreenView error:', error);
        }
    }
}

async function setUserProperty(name, value) {
    try {
        if (__DEV__) {
            console.log('[Analytics] setUserProperty', name, value);
        }
        await firebaseSetUserProperty(getAnalytics(), name, value);
    } catch (error) {
        if (__DEV__) {
            console.warn('[Analytics] setUserProperty error:', error);
        }
    }
}

async function setUserId(id) {
    try {
        if (__DEV__) {
            console.log('[Analytics] setUserId', id);
        }
        await firebaseSetUserId(getAnalytics(), id);
    } catch (error) {
        if (__DEV__) {
            console.warn('[Analytics] setUserId error:', error);
        }
    }
}

export default {
    logEvent,
    logScreenView,
    setUserProperty,
    setUserId,
};
