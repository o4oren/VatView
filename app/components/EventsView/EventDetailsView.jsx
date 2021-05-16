import React from 'react';
import {StyleSheet, View, Dimensions} from 'react-native';
import {Card, Text} from 'react-native-paper';
import HTML from 'react-native-render-html';
import {ScrollView} from 'react-native';

export default function EventDetailsView(props) {
    const dimensions = Dimensions.get('window');
    const imageHeight = Math.round((dimensions.width) * 9 / 16);
    const imageWidth = dimensions.width;
    const event = props.route.params.event;
    console.log('event', event);

    const addRoutesIfExist = () => {
        if(event.routes.length == 0) {
            return null;
        }
        return <View>
            <Text>Route:</Text>
            {event.routes.map(route => <Text>{route.departure} to {route.arrival}: {route.route}</Text>)}
        </View>;
    };

    return <ScrollView>
        <Card>
            <Card.Title title={event.name} />
            <Card.Cover source={{uri: event.banner}} style={{height: imageHeight, width: imageWidth}}/>
            <Card.Content>
                <HTML source={{html: event.description}}/>
                {addRoutesIfExist()}
            </Card.Content>
        </Card>
    </ScrollView>;

}

const styles = StyleSheet.create({
    container: {
        backgroundColor: 'white',
        flex: 1
    }
});