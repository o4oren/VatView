const { writeFileSync } = require('fs');
const { resolve } = require('path');

// Write Firebase config files from EAS secrets at build time.
// Locally, fall back to the files on disk if env vars are not set.
if (process.env.GOOGLE_SERVICES_JSON) {
    writeFileSync(resolve(__dirname, 'google-services.json'), process.env.GOOGLE_SERVICES_JSON);
}
if (process.env.GOOGLE_SERVICE_INFO_PLIST) {
    writeFileSync(resolve(__dirname, 'GoogleService-Info.plist'), process.env.GOOGLE_SERVICE_INFO_PLIST);
}

const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY || '';

module.exports = {
    expo: {
        name: 'VatView',
        slug: 'vatview',
        platforms: ['ios', 'android'],
        version: '2.0.0',
        orientation: 'default',
        userInterfaceStyle: 'automatic',
        icon: './graphics/icons/icon-1024-background.png',
        splash: {
            image: './assets/splash.png',
            resizeMode: 'contain',
            backgroundColor: '#ffffff',
        },
        updates: {
            fallbackToCacheTimeout: 0,
            url: 'https://u.expo.dev/700dac5e-72d8-45e4-8bf5-693f1bb78b70',
        },
        assetBundlePatterns: ['assets/**/*'],
        androidStatusBar: {
            barStyle: 'light-content',
        },
        ios: {
            supportsTablet: true,
            requireFullScreen: false,
            bundleIdentifier: 'com.gevahim.vatview',
            googleServicesFile: './GoogleService-Info.plist',
            config: {
                googleMapsApiKey,
            },
            infoPlist: {
                ITSAppUsesNonExemptEncryption: false,
                UIUserInterfaceStyle: 'Automatic',
            },
        },
        android: {
            package: 'com.gevahim.vatview',
            googleServicesFile: './google-services.json',
            adaptiveIcon: {
                foregroundImage: './assets/adaptive-icon.png',
                backgroundColor: '#FFFFFF',
            },
            config: {
                googleMaps: {
                    apiKey: googleMapsApiKey,
                },
            },
            permissions: [
                'READ_EXTERNAL_STORAGE',
                'WRITE_EXTERNAL_STORAGE',
                'INTERNET',
                'com.google.android.gms.permission.AD_ID',
            ],
        },
        web: {
            favicon: './assets/favicon.png',
        },
        plugins: [
            [
                'expo-build-properties',
                {
                    ios: {
                        newArchEnabled: true,
                    },
                },
            ],
            'expo-localization',
            'expo-sqlite',
            'expo-font',
            [
                'react-native-maps',
                {
                    androidGoogleMapsApiKey: googleMapsApiKey,
                },
            ],
            './plugins/withDisableLiquidGlass',
            './plugins/withModularHeaders',
            [
                '@react-native-firebase/app',
                {
                    analyticsCollectionEnabled: true,
                },
            ],
            '@react-native-firebase/crashlytics',
        ],
        description: 'VatView is a VATSIM map and information app.',
        githubUrl: 'https://github.com/o4oren/VatView',
        extra: {
            eas: {
                projectId: '700dac5e-72d8-45e4-8bf5-693f1bb78b70',
            },
        },
        owner: 'ogeva',
        runtimeVersion: {
            policy: 'appVersion',
        },
    },
};
