import React from 'react';
import {StyleSheet, FlatList, SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import { Avatar, Card, Paragraph } from 'react-native-paper';

export default function VatsimListView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);

    const Item = (client)=>(<Card style={styles.card}>
        <Card.Title
            title = {client.item.callsign}
            subtitle = {client.item.realname}
            left = {() => <Avatar.Image source={client.item.image} size={32} style={styles.avatar} />}
        />
        <Card.Content>
            <Paragraph>
                    Altitude: {client.item.altitude}{'\n'}
                    Ground speed: {client.item.groundspeed} kts{'\n'}
                    Aircraft: {client.item.planned_aircraft}{'\n'}
                {client.item.planned_depairport} -&gt {client.item.planned_destairport}{'\n'}
            </Paragraph>
        </Card.Content>
    </Card>
    );

    return <SafeAreaView style={styles.container}>
        <FlatList
            data = {clients.pilots}
            renderItem={Item}
            keyExtractor = {client => client.cid}
        />
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    avatar: {
        backgroundColor: 'white',
    },
    card: {
        margin: 10,
    },
});