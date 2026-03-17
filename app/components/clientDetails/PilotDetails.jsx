import React from 'react';
import {View} from 'react-native';
import {useDetailPanel} from '../detailPanel/DetailPanelProvider';
import PilotLevel1Summary from './PilotLevel1Summary';
import PilotLevel2Details from './PilotLevel2Details';
import PilotLevel3Full from './PilotLevel3Full';

export default function PilotDetails({pilot}) {
    const {disclosureLevel} = useDetailPanel();

    return (
        <View>
            <PilotLevel1Summary pilot={pilot} />
            {disclosureLevel >= 2 && <PilotLevel2Details pilot={pilot} />}
            {disclosureLevel >= 3 && <PilotLevel3Full pilot={pilot} />}
        </View>
    );
}
