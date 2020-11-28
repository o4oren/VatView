const getAircraftIcon = code => {
    let icon = require('../../assets/aircraft/black/boeing-737-icon-000000-64.png');

    if(!code)
        return icon

    const b737strings = ['B737', 'B732', 'B733', 'B734', 'B735', 'B736', 'B737', 'B738', 'B739'];
    const b747strings = ['B741', 'B742', 'B744', 'B748', 'B74L', 'B74R'];
    const a320strings = ['A320', 'A321', 'A319', 'A318'];
    const a380strings = ['A380', 'A388', 'A389'];
    const a330strings = ['A330', 'A332', 'A333', 'A350', 'A351', 'A359', 'A306', 'A310'];
    const a340strings = ['A340', 'A342', 'A343', 'A435', 'A346'];
    const b777strings = ['B777', 'B772', 'B773', 'B77W', 'B77L'];
    const b787strings = ['B787', 'B788', 'B789', 'B78J'];
    const bizjetstings = ['C25C', 'E190', 'E170', 'C550', 'E195', 'CR9', 'GJ5', 'DF7', 'B721', 'B722',
    ]

    const gastrings = ['C172', 'C182', 'PA22', 'C208', 'V206', 'CRJ1', 'CRJ2', 'CRJX', 'C25B', 'C56X', 'C500', 'C510',
    'C560', 'F2TH', 'E120'];

    b737strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/boeing-737-icon-000000-64.png');
        }
    });

    b747strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/boeing-747-icon-000000-64.png');
        }
    });

    a320strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/airbus-a320-icon-000000-64.png');
        }
    });

    gastrings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/cessna-icon-000000-64.png');
        }
    });

    a330strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/airbus-a330-icon-000000-64.png');
        }
    });

    a340strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/airbus-a340-icon-000000-64.png');
        }
    });

    a380strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/airbus-a380-icon-000000-64.png');
        }
    });

    b777strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/boeing-777-icon-000000-64.png');
        }
    });

    b787strings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/boeing-787-icon-000000-64.png');
        }
    });

    bizjetstings.forEach(aCode => {
        if (code.includes(aCode)) {
            icon = require('../../assets/aircraft/black/fokker-100-icon-000000-64.png');
        }
    });

    return icon;
}

export default getAircraftIcon;