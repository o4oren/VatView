import {Circle, Marker} from 'react-native-maps';
import {Image, Platform} from 'react-native';
import React from 'react';
import {useDispatch} from 'react-redux';
import allActions from '../../redux/actions';
import {APP, APP_RADIUS, DEL, GND, TWR_ATIS} from '../../common/consts';
import theme from '../../common/theme';
import {mapIcons} from '../../common/iconsHelper';
import {getAirportByCode} from '../../common/airportTools';

export default function generateAirportMarkers(airportAtc, airports) {
    const dispatch = useDispatch();
    const airportMarkers = [];

    let onPress = (airport) => {
        // Analytics.logEvent('SelectAirport', {
        //     callsign: airport.icao,
        //     purpose: 'Clicking an airport atc',
        // });
        dispatch(allActions.appActions.clientSelected(airport));
    };

    if(Object.keys(airportAtc).length==0) {
        console.log('return empty', airportAtc);
        return [];
    }

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
                case APP:
                    app = true;
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
                    break;
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
                image = Platform.OS === 'ios' ? mapIcons.radar32 : mapIcons.radar64;
                if ((ground || tower))
                    image = Platform.OS === 'ios' ? mapIcons.towerRadar32 : mapIcons.towerRadar64;
                else if (atis || delivery)
                    image = Platform.OS === 'ios' ? mapIcons.antennaRadar32 : mapIcons.antennaRadar64;
            } else {
                if (ground || tower)
                    image = Platform.OS === 'ios' ? mapIcons.tower32 : mapIcons.tower64;
                else if (atis || delivery)
                    image = Platform.OS === 'ios' ? mapIcons.antenna32 : mapIcons.antenna64;
            }

            // Fallback for unrecognized facility types — prevents red pin markers
            if (!image) {
                console.warn('Unknown ATC facility type at', airport.icao);
                image = Platform.OS === 'ios' ? mapIcons.tower32 : mapIcons.tower64;
            }

            // Key includes ATC composition so marker updates when staffing changes
            const atcSuffix = `${app ? 'a' : ''}${tower ? 't' : ''}${ground ? 'g' : ''}${atis ? 's' : ''}${delivery ? 'd' : ''}`;

            airportMarkers.push(
                <Marker
                    key={airport.icao + '_' + atcSuffix}
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
                        style={[{ height: 32, width: 32 }]}
                    />
                </Marker>
            );
        } else {
            console.log('cannot add marker', airport);
        }
    }
    return airportMarkers;
}
