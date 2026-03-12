import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, SafeAreaView, View} from 'react-native';
import theme from '../../common/theme';
import {useSelector} from 'react-redux';
import EventListItem from './EventListItem';
import {IconButton, Searchbar} from 'react-native-paper';
import {DatePickerModal} from 'react-native-paper-dates';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';

export default function VatsimEventsView({navigation}) {
    const events = useSelector(state => state.vatsimLiveData.events);
    const [filteredEvents, setFilteresEvents] = useState(events);
    const [searchTerm, setSearchTerm] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [date, setDate] = React.useState(undefined);
    const [open, setOpen] = React.useState(false);

    const onDismissSingle = React.useCallback(() => {
        setOpen(false);
    }, [setOpen]);

    const onConfirmSingle = React.useCallback(
        (params) => {
            setOpen(false);
            setDate(params.date);
        },
        [setOpen, setDate]
    );

    useEffect(() => {
        onChangeSearch(searchTerm);
        setIsReady(true);
    }, [isReady]);

    useEffect(() => {
        onChangeSearch(searchTerm);
    }, [date]);

    const onChangeSearch = (searchTerm) => {
        setSearchTerm(searchTerm);
        let list = events;
        if(searchTerm.length > 2) {
            list = events.filter(event => {
                return event.name.includes(searchTerm)
                || (event.airports && (event.airports.filter(a => {return a.icao == searchTerm.toUpperCase();}) > 0));
            });
        }
        if(date) {
            list = list.filter(event => {
                return getDateFromUTCString(event.start_time).toDateString() == date.toDateString()
                || getDateFromUTCString(event.end_time).toDateString() == date.toDateString();
            });
        }
        setFilteresEvents(list);

    };

    const dateFilterPressed = () => {
        if(date) {
            setDate(undefined);
        }
        setOpen(true);
    };

    const renderItem = ({item}) => (
        <EventListItem
            event={item}
            navigation={navigation}
        />
    );

    return <SafeAreaView style={theme.blueGrey.safeAreaView}>
        <View style={styles.container}>
            <DatePickerModal
                // locale={'en'} optional, default: automatic
                mode="single"
                visible={open}
                onDismiss={onDismissSingle}
                date={date}
                onConfirm={onConfirmSingle}
                validRange={{
                    startDate: new Date(),  // optional
                    // endDate: new Date(), // optional
                }}
                // onChange={} // same props as onConfirm but triggered without confirmed by user
                saveLabel="Select date" // optional
                // label="Select date" // optional
                // animationType="slide" // optional, default is 'slide' on ios/android and 'none' on web
            />
            <IconButton
                icon="calendar"
                iconColor={theme.blueGrey.theme.colors.secondaryContainer}
                size={20}
                onPress={dateFilterPressed}
            />
            <Searchbar
                style={styles.textInput}
                placeholder="Description or airport"
                dense='true'
                onChangeText={onChangeSearch}
                value={searchTerm}
            />
        </View>
        <View style={styles.flatlist}>
            <FlatList
                data={filteredEvents}
                renderItem={renderItem}
                keyExtractor={item => item.id.toString()}
            />
        </View>
    </SafeAreaView>;
}

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#4d7199',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 5
    },
    flatlist: {
        backgroundColor: theme.blueGrey.theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 5,
        height: '100%'
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300,
    }
});