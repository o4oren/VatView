import React from 'react';
import {Text, View} from 'react-native';
import {useSelector} from 'react-redux';

export default function clientDetails() {
    const selectedClient = useSelector(state => state.app.selectedClient);
    // 6 = CTR, 4=TWR,
    const renderBody = () => {
        console.log(selectedClient);
        if(selectedClient === undefined)
            return;
        if(selectedClient.clienttype == 'PILOT') {
            return (
                <View>
                    <Text>Callsign: {selectedClient.callsign}</Text>
                    <Text>{selectedClient.latitude}:{selectedClient.longitude}</Text>
                    <Text>Altitude: {selectedClient.altitude}</Text>
                    <Text>Name: {selectedClient.realname}</Text>
                    <Text>Aircraft: {selectedClient.planned_aircraft}</Text>
                    <Text>Heading: {selectedClient.heading}</Text>
                    <Text>Ground speed: {selectedClient.groundspeed}</Text>
                    <Text>Origin: {selectedClient.planned_depairport}</Text>
                    <Text>Dest: {selectedClient.planned_destairport}</Text>
                    <Text>Flight plan: {selectedClient.planned_route}</Text>
                </View>
            );
        }

        return (
            <View>
                <Text>Callsign: {selectedClient.callsign}</Text>
                <Text>Name: {selectedClient.realname}</Text>
                <Text>Frequency: {selectedClient.frequency}</Text>
            </View>
        );
    };
    return (
        <View
            style={
                {
                    backgroundColor: 'white',
                    padding: 16,
                    height: 450,
                }
            }
        >
            {renderBody()}
        </View>
    );
}