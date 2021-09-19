import React from 'react';
import {View} from 'react-native';
import {useSelector} from 'react-redux';
import {getAirportByCode} from '../../common/airportTools';
import PilotDetails from './PilotDetails';
import AirportAtcDetils from './AirportAtcDetails';
import AtcDetails from './AtcDetails';
import CtrDetails from './CtrDetails';
import {CTR} from '../../common/consts';

export default function ClientDetails(props) {
    const airports = useSelector(state => state.staticAirspaceData.airports);
    const centers = useSelector(state => state.vatsimLiveData.clients.ctr);

    const renderBody = () => {
        if(props.client == null)
            return null;

        // if airport
        if(props.client.icao != null) {
            const airport = props.client;
            return <AirportAtcDetils
                airport = {airport}
            />;
        }

        // if CTR
        if(props.client.facility === CTR) {

            const prefix = props.client.callsign.split('_')[0];
            if(centers[prefix] != null)
                return <CtrDetails
                    ctr={centers[prefix]}
                    prefix={prefix}
                />;
        }

        // if pilot
        if(props.client.facility == null) {
            const pilot = props.client;
            return <PilotDetails
                pilot={pilot}
            />;
        }
        return (
            <AtcDetails
                atc={props.client}
                showAtis={!!props.showAtis}
            />
        );
    };

    return (
        <View
            style={
                {
                    backgroundColor: 'white',
                    paddingHorizontal: 20,
                    minHeight: props.fill ? 450 : null
                }
            }
        >
            {renderBody()}
        </View>
    );
}
