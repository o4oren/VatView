import React from 'react';
import {View, ScrollView, Text, StyleSheet, Dimensions} from 'react-native';
import {useSelector} from 'react-redux';
import { Avatar, Button, Card, Title, Paragraph } from 'react-native-paper';

export default function VatsimListView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);

    return <View>
        <ScrollView>
            {
                clients.map(
                    (client, index) => <Card key={index} style={styles.card}>
                        <Card.Title
                            title = {client.callsign}
                            subtitle = {client.realname}
                            left = {() => <Avatar.Image source={client.image} size={32} style={styles.avatar} />}
                        />
                        <Card.Content>
                            <Paragraph>
                                Altitude: {client.altitude}{'\n'}
                                Ground speed: {client.groundspeed} kts{'\n'}
                                Aircraft: {client.planned_aircraft}{'\n'}
                                {client.planned_depairport} -> {client.planned_destairport}{'\n'}
                            </Paragraph>
                        </Card.Content>
                    </Card>
                )
            }
        </ScrollView>
    </View>;
}

const styles = StyleSheet.create({
    avatar: {
        backgroundColor: 'white',
    },
    card: {
        margin: 10
    },
});