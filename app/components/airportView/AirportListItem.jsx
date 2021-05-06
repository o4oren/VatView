import {Card, List, Avatar} from 'react-native-paper';
import React from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import theme from '../../common/theme';
import {StyleSheet} from 'react-native';
import {addTimeToDate, getDateFromString, getZuluTimeFromDate} from '../../common/timeDIstanceTools';
import * as Analytics from 'expo-firebase-analytics';

const generateAtcList = (airportAtc) => {
    return airportAtc.map(atc =>
        <List.Item
            key={atc.callsign + '_' + atc.cid}
            title={atc.callsign + ' - ' + atc.name}
            description={'Frequency: ' + atc.frequency}
            left={() => <Avatar.Image source={atc.image} size={32} style={styles.avatar}/>}
        />);
};

const generateFlightsList = (flights) => {
    return flights.map(flight => {
        const depTime = getDateFromString(flight.flight_plan.deptime);
        const eta = addTimeToDate(depTime, flight.flight_plan.enroute_time);

        return <List.Item
            key={flight.callsign + '_' + flight.cid}
            title={flight.callsign + ' - ' + flight.name}
            left={() => <Avatar.Image source={flight.image} size={flight.imageSize} style={styles.avatar}/>}
            description={
                flight.flight_plan.aircraft_short + ' from ' + flight.flight_plan.departure + ' to ' + flight.flight_plan.arrival + '\n'
                + 'Departure time: ' + getZuluTimeFromDate(depTime) + '   ETA: ' + getZuluTimeFromDate(eta)
            }
        />;
    });
};

export default function AirportListItem({airport, country, airportAtc, flights}) {
    const [expandedArrivals, setExpandedArrivals] = React.useState(false);
    const [expandedDepartures, setExpandedDepartures] = React.useState(false);
    const [expandedAtc, setExpandedAtc] = React.useState(false);

    const pressArrivals = () => {
        Analytics.logEvent('ExpandedArrivals', {
            action: expandedArrivals ? 'close' : 'open',
            airport: airport,
        });
        setExpandedArrivals(!expandedArrivals);
    };
    const pressDepartures = () => {
        Analytics.logEvent('ExpandedDepartures', {
            action: expandedDepartures ? 'close' : 'open',
            airport: airport,
        });
        setExpandedDepartures(!expandedDepartures);
    };
    const pressAtc = () => {
        Analytics.logEvent('ExpandedAtc', {
            action: expandedAtc ? 'close' : 'open',
            airport: airport,
        });
        setExpandedAtc(!expandedAtc);
    };

    return <Card>
        <Card.Title title={airport.icao} subtitle={airport.name +', ' + country} />
        <Card.Content>
            <List.Accordion
                key={1}
                title={(airportAtc ? airportAtc.length : 0) + ' ATC positions'}
                left={props => <MaterialIcons name={'flight-takeoff'} size={24} color={theme.blueGrey.theme.colors.primary}/>}
                expanded={expandedAtc}
                onPress={pressAtc}>
                {airportAtc ? generateAtcList(airportAtc) : null}
            </List.Accordion>
            <List.Accordion
                key={2}
                title={flights.departures.length + ' Departing flights'}
                left={props => <MaterialIcons name={'flight-takeoff'} size={24} color={theme.blueGrey.theme.colors.primary}/>}
                expanded={expandedDepartures}
                onPress={pressDepartures}>
                {generateFlightsList(flights.departures)}
            </List.Accordion>
            <List.Accordion
                key={3}
                title={flights.arrivals.length + ' Arriving flights'}
                left={props => <MaterialIcons name={'flight-land'} size={24} color={theme.blueGrey.theme.colors.primary}/>}
                expanded={expandedArrivals}
                onPress={pressArrivals}>
                {generateFlightsList(flights.arrivals)}
            </List.Accordion>
        </Card.Content>
    </Card>;
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: 'transparent'
    }
});