import React from 'react';
import {StyleSheet, FlatList, SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import { Avatar, Card, Paragraph } from 'react-native-paper';
import FilterBar from '../filterBar/FilterBar';

export default function VatsimListView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const filters = useSelector(state => state.app.filters);

    const aggregatedClient = (clients) => {
        let aggregatedClients = [];
        // aggregatedClients.push(...clients.pilots);
        if(filters.atc) {
            Object.entries(clients.airportAtc).forEach(c => c[1].forEach(c1 => aggregatedClients.push(c1)));
            Object.entries(clients.app).forEach(c => c[1].forEach(c1 => aggregatedClients.push(c1)));
            Object.entries(clients.ctr).forEach(c => c[1].forEach(c1 => aggregatedClients.push(c1)));
        }

        if(filters.flights)
            clients.pilots.forEach(p => aggregatedClients.push(p));

        if(filters.searchQuery.trim() != '') {
            aggregatedClients = aggregatedClients.filter(c => {
                if((c.callsign && c.callsign.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim())) ||
                    (c.realname && c.realname.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim()))||
                    (c.cid && c.cid == filters.searchQuery.trim()) ||
                    (c.aircraft && c.aircraft.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim())))
                    return true;
                else
                    return false;
            });
        }
        return aggregatedClients.sort(function(a, b){
            if(a.callsign < b.callsign) { return -1; }
            if(a.callsign > b.callsign) { return 1; }
            return 0;
        });
    };
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
        <FilterBar />
        <FlatList
            data = {aggregatedClient(clients)}
            renderItem={Item}
            keyExtractor = {(client, i) => client.callsign + client.cid + '_' + i}
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