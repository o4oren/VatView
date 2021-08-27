
const conditionCodes = {
    minus: 'Light intensity',
    plus: 'Heavy intensity',
    vc: 'In the vicinity',
    MI:	'Shallow',
    PR:	'Partial',
    BC:	'Patches',
    DR:	'Low drifting',
    BL:	'Blowing',
    SH:	'Showers',
    TS:	'Thunderstorm',
    FZ:	'Freezing',
    RA:	'Rain',
    DZ:	'Drizzle',
    SN:	'Snow',
    SG:	'Snow Grains',
    IC:	'Ice Crystals',
    PL:	'Ice Pellets',
    GR:	'Hail',
    GS:	'Graupel, Snow Pellets and/or Small Hail',
    UP:	'Unknown Precipitation',
    FG:	'Fog',
    BR:	'Mist',
    HZ:	'Haze',
    VA:	'Volcanic Ash',
    DU:	'Widespread Dust',
    FU:	'Smoke',
    SA:	'Sand',
    PY:	'Spray',
    SQ:	'Squall',
    PO:	'Dust',
    DS:	'Duststorm',
    SS:	'Sandstorm',
    FC:	'Funnel Cloud'
};


const cloudCodes = {
    SKC:	'No cloud/Sky clear',
    NCD:	'Nil Cloud detected',
    CLR:	'No clouds below 12,000 ft (3,700 m) (U.S.) or 25,000 ft (7,600 m) (Canada)', 
    NSC:	'No (nil) significant cloud',
    FEW:	'Few',
    SCT:	'Scattered',
    BKN:	'Broken',
    OVC:	'Overcast',
    VV:	'Vertical Visibility'
};

export const translateCondition = (condition) => {
    let foundCondition = null;
    if(condition == '-')
        condition = 'minus';
    if(condition == '+')
        condition = 'plus';

    if(conditionCodes[condition]) {
        foundCondition = conditionCodes[condition];
    }

    return foundCondition ? foundCondition : condition;
};

export const translateCloudCode = (code) => {
    let foundCloud = cloudCodes[code];
    return foundCloud ? foundCloud : code;
};