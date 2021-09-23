import React from 'react';
import {StyleSheet, FlatList, SafeAreaView, View} from 'react-native';
import {useSelector} from 'react-redux';
import { Card } from 'react-native-paper';
import FilterBar from '../filterBar/FilterBar';
import ClientDetails from '../clientDetails/ClientDetails';
import theme from '../../common/theme';
import {getAirportsByICAOAsync} from '../../common/staticDataAcessLayer';

export default function VatsimListView() {
    const clients = useSelector(state => state.vatsimLiveData.clients);
    const filters = useSelector(state => state.app.filters);

    const aggregatedClient = (clients) => {
        let aggregatedClients = [];

        // aggregatedClients.push(...clients.pilots);
        if(filters.atc) {
            if(clients.airportAtc && Object.keys(clients.airportAtc).length > 0)
                Object.entries(clients.airportAtc).forEach(c => c[1].forEach(c1 => aggregatedClients.push(c1)));
            if(clients.ctr && Object.keys(clients.ctr).length > 0)
                Object.entries(clients.ctr).forEach(c => c[1].forEach(c1 => aggregatedClients.push(c1)));
        }

        if(filters.pilots)
            clients.pilots.forEach(p => aggregatedClients.push(p));

        aggregatedClients.sort(function(a, b){
            if(a.callsign < b.callsign) { return -1; }
            if(a.callsign > b.callsign) { return 1; }
            return 0;
        });

        if(filters.searchQuery.trim()) {
            return aggregatedClients.filter(c => {
                return !!((c.callsign && c.callsign.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim())) ||
                    (c.name.toLowerCase() && c.name.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim())) ||
                    (c.cid && c.cid == filters.searchQuery) ||
                    (c.flight_plan && c.flight_plan.aircraft.toLowerCase().startsWith(filters.searchQuery.toLowerCase().trim())) ||
                    (filters.searchQuery.length > 3 && getAirportsByICAOAsync([filters.searchQuery.toLowerCase().substr(0, 3)]) != null));
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

    return <SafeAreaView style={theme.blueGrey.safeAreaView}>
        <FilterBar />
        <View style={styles.container}>
            <FlatList
                data = {aggregatedClient(clients)}
                renderItem={Item}
                keyExtractor = {(client, i) => client.callsign + client.cid + '_' + i}
            />
        </View>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    }
});