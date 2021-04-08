import React from 'react';
import {StyleSheet, View} from 'react-native';
import {useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';
import PilotDetails from './PilotDetails';
import AirportAtcDetils from './AirportAtcDetails';
import AtcDetails from './AtcDetails';
import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';

export default function ClientDetails(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const bottomBarHeight = useBottomTabBarHeight();
    const renderBody = () => {
        if(props.client == null)
            return null;

        // if airport
        if(props.client.icao != null) {
            const airport = props.client;

            if(airport != null && airport.icao != null)
                return <AirportAtcDetils
                    airport = {airport}
                />;
        }

        // if pilot
        if(props.client.facility == null) {
            const pilot = props.client;
            const depAirport = pilot.flight_plan && getAirportByCode(pilot.flight_plan.departure, airports);
            const arrAirport = pilot.flight_plan && getAirportByCode(pilot.flight_plan.arrival, airports);
            return <PilotDetails
                pilot={pilot}
                depAirport={depAirport}
                arrAirport={arrAirport}
            />;
        }
        return (
            <AtcDetails
                atc={props.client}
                showAtis={props.showAtis ? true : false}
            />
        );
    };

    return (
        <View
            style={
                {
                    backgroundColor: 'white',
                    paddingBottom: props.fill ? bottomBarHeight : 20,
                    paddingHorizontal: 20,
                    height: props.fill ? 450 : null
                }
            }
        >
            {renderBody()}
        </View>
    );
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: '#ffffff',
    }
});