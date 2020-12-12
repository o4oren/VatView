import React from 'react';
import {View, ScrollView, Text} from 'react-native';
import {useSelector} from 'react-redux';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';

export default function VatsimListView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);

    return <View>
        <ScrollView>
            {
                clients.map(
                    (client, index) => <Card key={index}>
                        <Card.Content>
                            <Title>{client.callsign}</Title>
                            <Paragraph>
                                {client.realname}{'\n'}
                                Altitude: {client.altitude}{'\n'}
                                Ground speed: {client.groundspeed} kts{'\n'}
                                AircraftBotto: {client.planned_aircraft}{'\n'}
                                {client.planned_depairport} -> {client.planned_destairport}{'\n'}
                            </Paragraph>
                        </Card.Content>
                    </Card>
                )
            }
        </ScrollView>
    </View>;
}