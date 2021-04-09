import React from 'react';
import {StyleSheet, FlatList, SafeAreaView} from 'react-native';
import {useSelector} from 'react-redux';
import { Card } from 'react-native-paper';
import FilterBar from '../filterBar/FilterBar';
import ClientDetails from '../clientDetails/ClientDetails';
import {getAirportByCode} from '../../common/airportTools';

export default function VatsimListView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const filters = useSelector(state => state.app.filters);

    const aggregatedClient = (clients) => {
        let aggregatedClients = [];

        // aggregatedClients.push(...clients.pilots);
        if(filters.atc) {
            Object.entries(clients.airportAtc).forEach(c => c[1].forEach(c1 => aggregatedClients.push(c1)));
            Object.entries(clients.ctr).forEach(c => c[1].forEach(c1 => aggregatedClients.push(c1)));
        }

        if(filters.pilots)
            clients.pilots.forEach(p => aggregatedClients.push(p));

        aggregatedClients.sort(function(a, b){
            if(a.callsign < b.callsign) { return -1; }
            if(a.callsign > b.callsign) { return 1; }
            return 0;
        });

        if(filters.searchQuery.trim() != '') {
            return aggregatedClients.filter(c => {
                if((c.callsign && c.callsign.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim())) ||
                    (c.name.toLowerCase() && c.name.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim()))||
                    (c.cid && c.cid == filters.searchQuery) ||
                    (c.flight_plan && c.flight_plan.aircraft.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim())) ||
                    (getAirportByCode(filters.searchQuery.toLowerCase().substr(0,3)) != null)
                )
                    return true;
                else
                    return false;
            });
        }
        return aggregatedClients;
    };
    const Item = (client)=>(<Card>
        <ClientDetails
            client = {client.item}
            showAtis={true}
        />
    </Card>);

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