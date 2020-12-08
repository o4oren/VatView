const getAircraftIcon = (code) => {
    let icon = require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-64.png');
    let size = 28;
    if(!code)
        return [icon, size];

    const b737strings = ['B737', 'B764', 'B733', 'B734', 'B735', 'B736', 'B737', 'B738', 'B739'];
    const b747strings = ['B741', 'B742', 'B744', 'B748', 'B74L', 'B74R'];
    const a320strings = ['A320', 'A321', 'A319', 'A318', 'A21N', 'A20N'];
    const a380strings = ['A380', 'A388', 'A389'];
    const a330strings = ['A330', 'A364', 'A333', 'A338', 'A339', 'A350', 'A351', 'A359', 'A306', 'A310'];
    const a340strings = ['A340', 'A342', 'A343', 'A435', 'A346'];
    const b777strings = ['B777', 'B772', 'B773', 'B77W', 'B77L'];
    const b787strings = ['B787', 'B788', 'B789', 'B78J', 'B78W'];
    const bizjetstings = ['C25C', 'E190', 'E170', 'C550', 'E195', 'CR9', 'GJ5', 'DF7', 'B721', 'B722',
    ];

    const gastrings = ['C172', 'C182', 'C152', 'PA22', 'C208', 'V206', 'CRJ1', 'CRJ2', 'CRJX', 'C25B', 'C56X', 'C500', 'C510',
        'C560', 'F2TH', 'E120'];

    b737strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-64.png');
            size = 28;
        }
    });

    b747strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/boeing-747-icon-64.png');
            size = 36;
        }
    });

    a320strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/airbus-a320-icon-64.png');
            size = 28;
        }
    });

    gastrings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/cessna-icon-64.png');
            size = 16;
        }
    });

    a330strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/airbus-a330-icon-64.png');
            size = 32;
        }
    });

    a340strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/airbus-a340-icon-64.png');
            size = 32;
        }
    });

    a380strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/airbus-a380-icon-64.png');
            size = 36;
        }
    });

    b777strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/boeing-777-icon-64.png');
            size = 32;
        }
    });

    b787strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/boeing-787-dreamliner-icon-64.png');
            size = 32;
        }
    });

    bizjetstings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/fokker-100-icon-64.png');
            size = 24;
        }
    });

    return [icon, size];
};

export default getAircraftIcon;