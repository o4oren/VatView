import React, {useEffect, useState} from 'react';
import {StyleSheet, FlatList, View, } from 'react-native';
import {useSelector} from 'react-redux';
import {IconButton, Searchbar, Colors} from 'react-native-paper';
import {DatePickerModal} from 'react-native-paper-dates';
import BookingDetails from './BookingDeatils';
import {LinearGradient} from 'expo-linear-gradient';

export default function BookingsView() {
    const bookings = useSelector(state => state.vatsimLiveData.bookings);
    const [filteredBookings, setFilteredBookings] = useState(bookings);
    const [searchTerm, setSearchTerm] = useState('');
    const [isReady, setIsReady] = useState(false);
    const [date, setDate] = React.useState(undefined);
    const [open, setOpen] = React.useState(false);
    const colors=['#b4becb', '#e1e8f5'];
    const start = { x: 0, y: 0 };
    const end = { x: 1, y: 1 };

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
            list = list.filter(booking => {
                return (new Date(booking.start).toDateString()) == date.toDateString();
            });
        }
        setFilteredBookings(list);
    };

    const dateFilterPressed = () => {
        if(date) {
            setDate(undefined);
        }
        setOpen(true);
    };

    const renderItem = ({item}) => (
        <BookingDetails
            booking = {item}
            styles = {styles.booking}
        />
    );

    return <LinearGradient
        colors = {colors}
        start={start}
        end={end}
        style={[styles.container, styles.rotate]}>
        <View style={styles.searchContainer}>
            <DatePickerModal
                // locale={'en'} optional, default: automatic
                mode="single"
                visible={open}
                onDismiss={onDismissSingle}
                date={date}
                onConfirm={onConfirmSingle}
                validRange={{
                    start: new Date(),  // optional
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
        <FlatList
            data={filteredBookings}
            renderItem={renderItem}
            keyExtractor={item => item.id.toString()}
        />
    </LinearGradient>;
}

const styles = StyleSheet.create({
    searchContainer: {
        backgroundColor: '#4d7199',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        padding: 15,
    },
    container: {
        justifyContent: 'center',
        flexDirection: 'column',
        flex: 1
    },
    textArea: {
        margin: 20,
        flex: 1
    },
    metarDisplay: {
        padding: 15
    },
    centeredVertically: {
        alignSelf: 'center'
    },
    textInput: {
        flex: 1,
        borderRadius: 25,
        maxWidth: 300
    },
    line: {
        flexDirection: 'row'
    },
    divider: {
        marginTop: 5,
        marginBottom: 5
    }
});
