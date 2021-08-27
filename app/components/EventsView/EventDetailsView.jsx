import React from 'react';
import {View, Dimensions} from 'react-native';
import {Card, Text} from 'react-native-paper';
import HTML from 'react-native-render-html';
import {ScrollView} from 'react-native';
import {getDateFromUTCString} from '../../common/timeDIstanceTools';

export default function EventDetailsView(props) {
    const dimensions = Dimensions.get('window');
    const imageHeight = Math.round((dimensions.width) * 9 / 16);
    const imageWidth = dimensions.width;
    const event = props.route.params.event;
    // console.log('event', event);

    const addRoutesIfExist = () => {
        if(event.routes.length == 0) {
            return null;
        }
        return <View>
            <Text>Route:</Text>
            {event.routes.map(route => <Text key={route.departure+'-'+route.arrival}>{route.departure} to {route.arrival}: {route.route}</Text>)}
        </View>;
    };

    return <ScrollView>
        <Card>
            <Card.Title title={event.name} />
            <Card.Cover source={{uri: event.banner}} style={{height: imageHeight, width: imageWidth}}/>
            <Card.Content>
                <Text>Start time: {getDateFromUTCString(event.start_time).toUTCString()}</Text>
                <Text>End time: {getDateFromUTCString(event.end_time).toUTCString()}</Text>
                <HTML source={{html: event.description || '<p></p>'}}/>
                {addRoutesIfExist()}
            </Card.Content>
        </Card>
    </ScrollView>;

}
