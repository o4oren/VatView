import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, SafeAreaView, View, Text} from 'react-native';
import theme from '../../common/theme';
import {useSelector} from 'react-redux';
import {IconButton, Searchbar, Colors} from 'react-native-paper';
import {DatePickerModal} from 'react-native-paper-dates';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';

export default function BookingsView({navigation}) {
    const bookings = useSelector(state => state.vatsimLiveData.bookings.bookings.atcs.booking);
    const [filteredBookings, setFilteredBookings] = useState(bookings);
    const [searchTerm, setSearchTerm] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [date, setDate] = React.useState(undefined);
    const [open, setOpen] = React.useState(false);

    console.log('bookings in view', bookings);

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
        let list = bookings;
        if(searchTerm.length > 0) {
            list = bookings.filter(booking => {
                return booking.callsign.startsWith(searchTerm.toUpperCase(), 0);
            });
        }
        if(date) {
            list = list.filter(event => {
                return getDateFromUTCString(event.start_time).toDateString() == date.toDateString()
                || getDateFromUTCString(event.end_time).toDateString() == date.toDateString();
            });
        }
        console.log('list', list);
        setFilteredBookings(list);
    };

    const dateFilterPressed = () => {
        if(date) {
            setDate(undefined);
        }
        setOpen(true);
    };

    const renderItem = ({item}) => (
        <View>
            <Text>Callsign: {item.callsign}</Text>
            <Text>Name: {item.name}</Text>
            <Text>CID: {item.cid}</Text>
            <Text>Start: {item.time_start}</Text>
            <Text>end: {item.time_end}</Text>
        </View>
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
                color={Colors.blue50}
                size={20}
                onPress={dateFilterPressed}
            />
            <Searchbar
                style={styles.textInput}
                placeholder="Position prefix"
                dense='true'
                onChangeText={onChangeSearch}
                value={searchTerm}
            />
        </View>
        <View style={styles.flatlist}>
            <FlatList
                data={filteredBookings}
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
        backgroundColor: Colors.white,
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