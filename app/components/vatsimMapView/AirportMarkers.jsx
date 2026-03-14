import {Circle, Marker, Polygon} from 'react-native-maps';
import {Image, Platform} from 'react-native';
import React, {useCallback} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import allActions from '../../redux/actions';
import {APP, APP_RADIUS, DEL, GND, TWR_ATIS} from '../../common/consts';
import theme from '../../common/theme';
import {mapIcons, getAtcIcon} from '../../common/iconsHelper';
import {getAirportByCode} from '../../common/airportTools';
import {lookupTracon} from '../../common/boundaryService';

const isAndroid = Platform.OS === 'android';

const AirportMarkerItem = React.memo(({airport, image, onPress}) => {
    return isAndroid ? (
        <Marker
            coordinate={{latitude: airport.latitude, longitude: airport.longitude}}
            title={airport.icao}
            anchor={{x: 0.5, y: 1}}
            onPress={() => onPress(airport)}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
            image={image}
        />
    ) : (
        <Marker
            coordinate={{latitude: airport.latitude, longitude: airport.longitude}}
            title={airport.icao}
            anchor={{x: 0.5, y: 1}}
            onPress={() => onPress(airport)}
            tracksViewChanges={false}
            tracksInfoWindowChanges={false}
        >
            <Image
                source={image}
                fadeDuration={0}
                style={{height: 32, width: 32}}
            />
        </Marker>
    );
});

export default function generateAirportMarkers(airportAtc, airports) {
    const dispatch = useDispatch();
    const traconBoundaryLookup = useSelector(state => state.staticAirspaceData.traconBoundaryLookup);
    const airportMarkers = [];

    const onPress = useCallback((airport) => {
        dispatch(allActions.appActions.clientSelected(airport));
    }, [dispatch]);

    if(Object.keys(airportAtc).length==0) {
        console.log('return empty', airportAtc);
        return [];
    }

    const renderedTracons = new Set();

    for (const icao in airportAtc) {
        // const tower = props.airports[icao].filter(client => client.facility === TWR_ATIS && client.callsign.split('_').pop() == 'TWR');
        const airport = getAirportByCode(icao, airports);
        let delivery = false;
        let ground = false;
        let tower = false;
        let app = false;
        let atis = false;
        let image = null;

        if (airport != null && airportAtc && airportAtc[airport.icao] && airportAtc[airport.icao].length > 0) {
            airportAtc[airport.icao].forEach(atc => {
                switch (atc.facility) {
                case APP: {
                    app = true;
                    const callsignPrefix = atc.callsign.split('_')[0];
                    const callsignSuffix = atc.callsign.split('_').pop();
                    const tracon = lookupTracon(traconBoundaryLookup, callsignPrefix, callsignSuffix);
                    if (tracon) {
                        const traconKey = tracon.id;
                        if (!renderedTracons.has(traconKey)) {
                            renderedTracons.add(traconKey);
                            tracon.polygons.forEach((poly, i) => {
                                airportMarkers.push(
                                    <Polygon
                                        key={atc.key + '-tracon-' + i}
                                        coordinates={poly.coordinates}
                                        holes={poly.holes}
                                        strokeColor={theme.blueGrey.appCircleStroke}
                                        fillColor={theme.blueGrey.appCircleFill}
                                        strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                                        geodesic={true}
                                        tappable={true}
                                        onPress={() => onPress(airport)}
                                    />
                                );
                            });
                        }
                    } else {
                        airportMarkers.push(
                            <Circle
                                key={atc.key}
                                center={{latitude: atc.latitude, longitude: atc.longitude}}
                                radius={APP_RADIUS}
                                title={atc.callsign}
                                strokeColor={theme.blueGrey.appCircleStroke}
                                fillColor={theme.blueGrey.appCircleFill}
                                strokeWidth={theme.blueGrey.appCircleStrokeWidth}
                            />
                        );
                    }
                    break;
                }
                case DEL:
                    delivery = true;
                    break;
                case GND:
                    ground = true;
                    break;
                case TWR_ATIS:
                    if(atc.callsign.endsWith('ATIS'))
                        atis = true;
                    else
                        tower = true;
                    break;
                default:
                    break;
                }
            });

            if(app) {
                image = getAtcIcon('radar');
                if ((ground || tower))
                    image = getAtcIcon('towerRadar');
                else if (atis || delivery)
                    image = getAtcIcon('antennaRadar');
            } else {
                if (ground || tower)
                    image = getAtcIcon('tower');
                else if (atis || delivery)
                    image = getAtcIcon('antenna');
            }

            // Fallback for unrecognized facility types — prevents red pin markers
            if (!image) {
                console.warn('Unknown ATC facility type at', airport.icao);
                image = getAtcIcon('tower');
            }

            // Key includes ATC composition so marker updates when staffing changes
            const atcSuffix = `${app ? 'a' : ''}${tower ? 't' : ''}${ground ? 'g' : ''}${atis ? 's' : ''}${delivery ? 'd' : ''}`;

            airportMarkers.push(
                <AirportMarkerItem
                    key={airport.icao + '_' + atcSuffix}
                    airport={airport}
                    image={image}
                    onPress={onPress}
                    tracksViewChanges={false}
                />
            );
        } else {
            console.log('cannot add marker', airport);
        }
    }
    return airportMarkers;
}
