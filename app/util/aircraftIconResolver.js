const getAircraftIcon = (code) => {
    let icon = require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-28.png');
    if(!code)
        return icon;

    const b737strings = ['B737', 'B732', 'B733', 'B734', 'B735', 'B736', 'B737', 'B738', 'B739'];
    const b747strings = ['B741', 'B742', 'B744', 'B7', 'B74L', 'B74R'];
    const a320strings = ['A320', 'A321', 'A319', 'A318', 'A21N', 'A20N'];
    const a380strings = ['A380', 'A388', 'A389'];
    const a330strings = ['A330', 'A332', 'A333', 'A338', 'A339', 'A350', 'A351', 'A359', 'A306', 'A310'];
    const a340strings = ['A340', 'A342', 'A343', 'A435', 'A346'];
    const b777strings = ['B777', 'B772', 'B773', 'B77W', 'B77L'];
    const b787strings = ['B787', 'B788', 'B789', 'B78J'];
    const bizjetstings = ['C25C', 'E190', 'E170', 'C550', 'E195', 'CR9', 'GJ5', 'DF7', 'B721', 'B722',
    ];

    const gastrings = ['C172', 'C182', 'C152', 'PA22', 'C208', 'V206', 'CRJ1', 'CRJ2', 'CRJX', 'C25B', 'C56X', 'C500', 'C510',
        'C560', 'F2TH', 'E120'];

    b737strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/boeing-737-icon-24.png');
        }
    });

    b747strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/boeing-747-icon-36.png');
        }
    });

    a320strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/airbus-a320-icon-24.png');
        }
    });

    gastrings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/cessna-icon-16.png');
        }
    });

    a330strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/airbus-a330-icon-32.png');
        }
    });

    a340strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/airbus-a340-icon-32.png');
        }
    });

    a380strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/airbus-a380-icon-36.png');
        }
    });

    b777strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/boeing-777-icon-32.png');
        }
    });

    b787strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/boeing-787-dreamliner-icon-32.png');
        }
    });

    bizjetstings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/blue-2A5D99/fokker-100-icon-24.png');
        }
    });

    return icon;
};

export default getAircraftIcon;