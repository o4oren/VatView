import React from 'react';
import renderer, {act} from 'react-test-renderer';
import LocalAirportMarker from '../app/components/vatsimMapView/LocalAirportMarker';

jest.mock('react-native-maps', () => {
    const {View} = require('react-native');
    return {
        __esModule: true,
        Marker: (props) => <View {...props} testID="Marker" />,
    };
});

const darkTheme = {
    atc: {
        airportDot: '#3B7DD8',
        airportDotUnstaffed: '#484F58',
        badge: {
            clearance: '#656d76',
            ground: '#1a7f37',
            tower: '#d29922',
            approach: '#3b7dd8',
            atis: '#0ea5e9',
        },
        badgeBackground: 'rgba(255,255,255,0.10)',
    },
};

const makeAirport = (icao = 'EGLL') => ({
    icao,
    latitude: 51.47,
    longitude: -0.46,
});

const makeController = (callsign, facility) => ({callsign, facility});

const findAllByType = (tree, type) => {
    const results = [];
    const search = (node) => {
        if (!node) return;
        if (typeof node === 'string') return;
        if (node.type === type) results.push(node);
        if (node.children) node.children.forEach(search);
    };
    if (Array.isArray(tree)) tree.forEach(search);
    else search(tree);
    return results;
};

const findAllText = (tree) => findAllByType(tree, 'Text');

describe('LocalAirportMarker', () => {
    const onPress = jest.fn();

    beforeEach(() => {
        onPress.mockClear();
    });

    it('renders staffed marker with badges', () => {
        const atcList = [
            makeController('EGLL_TWR', 4),
            makeController('EGLL_GND', 3),
            makeController('EGLL_APP', 5),
        ];
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport()}
                    atcList={atcList}
                    trafficInfo={{departures: 12, arrivals: 8}}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        const texts = findAllText(json);
        const textContents = texts.map(t => (t.children || []).join(''));
        expect(textContents).toContain('EGLL');
        expect(textContents).toContain('G');
        expect(textContents).toContain('T');
        expect(textContents.filter(t => t === 'A')).toHaveLength(1);
    });

    it('renders unstaffed marker with no badges', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport('KJFK')}
                    atcList={[]}
                    trafficInfo={{departures: 3, arrivals: 1}}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        const texts = findAllText(json);
        const textContents = texts.map(t => (t.children || []).join(''));
        expect(textContents).toContain('KJFK');
        // No badge letters
        expect(textContents.filter(t => ['C', 'G', 'T'].includes(t))).toHaveLength(0);
    });

    it('shows correct badge letters with colored backgrounds for staffed airport', () => {
        const atcList = [
            makeController('EGLL_DEL', 2),
            makeController('EGLL_TWR', 4),
        ];
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport()}
                    atcList={atcList}
                    trafficInfo={null}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        const texts = findAllText(json);
        const badgeC = texts.find(t => (t.children || []).join('') === 'C');
        const badgeT = texts.find(t => (t.children || []).join('') === 'T');
        expect(badgeC).toBeDefined();
        expect(badgeT).toBeDefined();
        // Badge text is white, color is on the parent pill background
        expect(badgeC.props.style).toEqual(
            expect.objectContaining({color: '#FFFFFF'})
        );
    });

    it('renders traffic counts when non-zero', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport()}
                    atcList={[]}
                    trafficInfo={{departures: 5, arrivals: 0}}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        const texts = findAllText(json);
        const textContents = texts.map(t => (t.children || []).join(''));
        expect(textContents.some(t => t.includes('▲') && t.includes('5'))).toBe(true);
        expect(textContents.some(t => t.includes('▼'))).toBe(false);
    });

    it('does not render traffic section when counts are zero', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport()}
                    atcList={[makeController('EGLL_TWR', 4)]}
                    trafficInfo={{departures: 0, arrivals: 0}}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        const texts = findAllText(json);
        const textContents = texts.map(t => (t.children || []).join(''));
        expect(textContents.some(t => t.includes('▲') || t.includes('▼'))).toBe(false);
    });

    it('uses monospace font for ICAO text', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport()}
                    atcList={[]}
                    trafficInfo={null}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        const texts = findAllText(json);
        const icaoText = texts.find(t => (t.children || []).join('') === 'EGLL');
        expect(icaoText).toBeDefined();
        expect(icaoText.props.style).toEqual(
            expect.arrayContaining([expect.objectContaining({fontFamily: 'JetBrainsMono_500Medium'})])
        );
    });

    it('renders inside a Marker component for touch handling', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport()}
                    atcList={[]}
                    trafficInfo={null}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        expect(json.props.testID).toBe('Marker');
    });

    it('uses staffed dot color for staffed airports', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport()}
                    atcList={[makeController('EGLL_TWR', 4)]}
                    trafficInfo={null}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        const container = json.children[0];
        const topRow = container.children[0];
        const dot = topRow.children[0];
        const flatStyle = Object.assign({}, ...(Array.isArray(dot.props.style) ? dot.props.style : [dot.props.style]));
        expect(flatStyle.backgroundColor).toBe('#3B7DD8');
    });

    it('uses unstaffed dot color for unstaffed airports', () => {
        let tree;
        act(() => {
            tree = renderer.create(
                <LocalAirportMarker
                    airport={makeAirport()}
                    atcList={[]}
                    trafficInfo={{departures: 1, arrivals: 0}}
                    activeTheme={darkTheme}
                    onPress={onPress}
                />
            );
        });
        const json = tree.toJSON();
        const container = json.children[0];
        const topRow = container.children[0];
        const dot = topRow.children[0];
        const flatStyle = Object.assign({}, ...(Array.isArray(dot.props.style) ? dot.props.style : [dot.props.style]));
        expect(flatStyle.backgroundColor).toBe('#484F58');
    });
});
