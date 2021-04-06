import React from 'react';
import {StyleSheet, View} from 'react-native';
import {Avatar, Caption, Card, Text} from 'react-native-paper';
import {useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';
import PilotDetails from './PilotDetails';
import {getDistanceFromLatLonInNm} from '../../common/distance';
import AirportAtcDetils from './AirportAtcDetails';
import AtcDetails from './AtcDetails';

export default function ClientDetails(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports);



    const renderBody = () => {
        if(props.client == null)
            return;

        // if airport
        if(props.client.icao != null) {
            const airport = props.client;
            console.log('c', airport);

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
            />
        );
    };
    return (
        <View
            style={
                {
                    backgroundColor: 'white',
                    padding: 16,
                    // height: 450,
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