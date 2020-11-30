const blueGrey = [
    {
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#f5f5f5'
            }
        ]
    },
    {
        'elementType': 'labels.icon',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
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
        'featureType': 'administrative.country',
        'elementType': 'geometry.stroke',
        'stylers': [
            {
                'color': '#9e9e9e'
            },
            {
                'visibility': 'on'
            },
            {
                'weight': 1.5
            }
        ]
    },
    {
        'featureType': 'administrative.country',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#9e9e9e'
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
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#bdbdbd'
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
        'featureType': 'poi',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#eeeeee'
            }
        ]
    },
    {
        'featureType': 'poi',
        'elementType': 'labels.text',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'poi',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#757575'
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
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#e5e5e5'
            }
        ]
    },
    {
        'featureType': 'poi.park',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#9e9e9e'
            }
        ]
    },
    {
        'featureType': 'road',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#ffffff'
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
        'featureType': 'road',
        'elementType': 'labels.icon',
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
        'featureType': 'road.arterial',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#757575'
            }
        ]
    },
    {
        'featureType': 'road.highway',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#dadada'
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
        'featureType': 'road.highway',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#616161'
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
        'featureType': 'road.local',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#9e9e9e'
            }
        ]
    },
    {
        'featureType': 'transit',
        'stylers': [
            {
                'visibility': 'off'
            }
        ]
    },
    {
        'featureType': 'transit.line',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#e5e5e5'
            }
        ]
    },
    {
        'featureType': 'transit.station',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#eeeeee'
            }
        ]
    },
    {
        'featureType': 'transit.station.airport',
        'elementType': 'geometry.fill',
        'stylers': [
            {
                'visibility': 'on'
            }
        ]
    },
    {
        'featureType': 'water',
        'elementType': 'geometry',
        'stylers': [
            {
                'color': '#c9c9c9'
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
    },
    {
        'featureType': 'water',
        'elementType': 'labels.text.fill',
        'stylers': [
            {
                'color': '#9e9e9e'
            }
        ]
    }
];

export default {
    blueGrey: { customMapStyle: blueGrey,
        appCircleStroke: 'rgb(159,8,8)',
        appCircleFill: 'rgba(227,133,133, 0.4)',
        appCircleStrokeWidth: 3,
        firStrokeColor: 'rgb(74,142,205)',
        firStrokeWidth: 2,
        firFill: 'rgba(153,203,231, 0.5)',
        uirStrokeColor: 'rgb(95,161,222)',
        uirStrokeWidth: 0,
        uirFill: 'rgba(153,231,175, 0.5)',
        aircraftColor: 'blue' ,
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
    },
    googleDefault: {customMapStyle: []}
};