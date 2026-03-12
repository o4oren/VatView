import {MD3LightTheme} from 'react-native-paper';

const blueGreyNew = [
    {
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#616161'
            }
        ]
    },
    {
        'elementType': 'labels.text.stroke',
        'stylers': [
            {
                'color': '#f5f5f5'
            }
        ]
    },
    {
        'featureType': 'administrative',
        'stylers': [
            {
                'visibility': 'simplified'
            }
        ]
    },
    {
        'featureType': 'administrative.country',
        'stylers': [
            {
                'visibility': 'on'
            }
        ]
    },
    {
        'featureType': 'administrative.country',
        'elementType': 'geometry.stroke',
        'stylers': [
            {
                'visibility': 'on'
            }
        ]
    },
    {
        'featureType': 'administrative.land_parcel',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'administrative.land_parcel',
        'elementType': 'geometry.stroke',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'administrative.land_parcel',
        'elementType': 'labels.text',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'administrative.locality',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'administrative.locality',
        'elementType': 'labels.text',
        'stylers': [
            {
                'color': '#a3a3a3'
            },
            {
                'visibility': 'on'
            }
        ]
    },
    {
        'featureType': 'administrative.locality',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'administrative.neighborhood',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'administrative.neighborhood',
        'elementType': 'labels.text',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'administrative.province',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'administrative.province',
        'elementType': 'geometry.stroke',
        'stylers': [
            {
                'visibility': 'on'
            }
        ]
    },
    {
        'featureType': 'administrative.province',
        'elementType': 'labels.text',
        'stylers': [
            {
                'color': '#a3a3a3'
            },
            {
                'visibility': 'simplified'
            }
        ]
    },
    {
        'featureType': 'landscape',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'color': '#f5f5f5'
            }
        ]
    },
    {
        'featureType': 'landscape.natural.landcover',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'color': '#f5f5f5'
            }
        ]
    },
    {
        'featureType': 'landscape.natural.terrain',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'color': '#f5f5f5'
            }
        ]
    },
    {
        'featureType': 'poi',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'poi.business',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'poi.park',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'color': '#e8e8e8'
            }
        ]
    },
    {
        'featureType': 'poi.park',
        'elementType': 'labels.text',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'road',
        'elementType': 'labels',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'road.arterial',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'road.highway',
        'stylers': [
            {
                'visibility': 'on'
            }
        ]
    },
    {
        'featureType': 'road.highway',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'color': '#e8e8e8'
            }
        ]
    },
    {
        'featureType': 'road.highway',
        'elementType': 'geometry.stroke',
        'stylers': [
            {
                'color': '#c7c7c7'
            }
        ]
    },
    {
        'featureType': 'road.highway',
        'elementType': 'labels',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'road.highway.controlled_access',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'road.local',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'transit.station',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'transit.station.airport',
        'stylers': [
            {
                'visibility': 'on'
            }
        ]
    },
    {
        'featureType': 'water',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'color': '#b8daff'
            }
        ]
    },
    {
        'featureType': 'water',
        'elementType': 'labels.text',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    }
];

export default {
    blueGrey: {
        customMapStyle: blueGreyNew,
        theme: {
            ...MD3LightTheme,
            roundness: 2,
            colors: {
                ...MD3LightTheme.colors,
                primary: '#2a5d99',
                secondary: '#2a5d99',
                onSurface: '#000000',
                outline: '#c1c1c1',
                onPrimary: '#ffffff',
                onSurfaceVariant: '#808080',
                secondaryContainer: '#e3f2fd',
                surface: '#ffffff',
            },
        },
        inactiveTabTint: 'rgba(255,255,255,0.6)',
        bottomBarIconSize: 32,
        appCircleStroke: 'rgb(159,8,8)',
        appCircleFill: 'rgba(227,133,133, 0.1)',
        appCircleStrokeWidth: 1,
        firStrokeColor: 'rgb(74,142,205)',
        firStrokeWidth: 1,
        firFill: 'rgba(153,203,231, 0.15)',
        uirStrokeColor: 'rgb(95,161,222)',
        uirStrokeWidth: 0,
        uirFill: 'rgba(153,231,175, 0.2)',
        aircraftColor: '#2a5d99' ,
        firTextStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'rgb(74,142,205)'
        },
        uirTextStyle: {
            fontSize: 16,
            fontWeight: 'bold',
            color: 'rgb(37,134,13)'
        },
        safeAreaView: {
            flex: 1,
            backgroundColor: '#2a5d99',
        }
    },
    googleDefault: {customMapStyle: []}
};