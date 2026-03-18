import { getAtcBadges } from '../app/common/airportBadgeHelper';

const darkTheme = {
    atc: {
        badge: {
            clearance: '#656d76',
            ground: '#1a7f37',
            tower: '#d29922',
            approach: '#3b7dd8',
            atis: '#0ea5e9',
            ctr: '#2BA99A',
            fss: '#A371F7',
        },
    },
};

const lightTheme = {
    atc: {
        badge: {
            clearance: '#8b949e',
            ground: '#1a7f37',
            tower: '#bf8700',
            approach: '#2a6bc4',
            atis: '#0284c7',
            ctr: '#1A7A6E',
            fss: '#8250DF',
        },
    },
};

const makeController = (callsign, facility) => ({ callsign, facility });

describe('getAtcBadges', () => {
    it('returns empty array for empty input', () => {
        expect(getAtcBadges([], darkTheme)).toEqual([]);
    });

    it('returns empty array for null input', () => {
        expect(getAtcBadges(null, darkTheme)).toEqual([]);
    });

    it('returns empty array for undefined input', () => {
        expect(getAtcBadges(undefined, darkTheme)).toEqual([]);
    });

    it('returns T badge for a tower controller', () => {
        const atcList = [makeController('EGLL_TWR', 4)];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toEqual([
            { letter: 'T', color: '#d29922', key: 'tower' },
        ]);
    });

    it('returns A (atis) badge for an ATIS controller', () => {
        const atcList = [makeController('EGLL_ATIS', 4)];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toEqual([
            { letter: 'A', color: '#0ea5e9', key: 'atis' },
        ]);
    });

    it('differentiates TWR from ATIS on facility 4', () => {
        const atcList = [
            makeController('EGLL_TWR', 4),
            makeController('EGLL_ATIS', 4),
        ];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toHaveLength(2);
        expect(badges[0]).toEqual({ letter: 'T', color: '#d29922', key: 'tower' });
        expect(badges[1]).toEqual({ letter: 'A', color: '#0ea5e9', key: 'atis' });
    });

    it('returns badges in facility hierarchy order (C, G, T, A-approach, A-atis)', () => {
        const atcList = [
            makeController('EGLL_APP', 5),
            makeController('EGLL_ATIS', 4),
            makeController('EGLL_DEL', 2),
            makeController('EGLL_GND', 3),
            makeController('EGLL_TWR', 4),
        ];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges.map(b => b.key)).toEqual([
            'clearance', 'ground', 'tower', 'approach', 'atis',
        ]);
    });

    it('deduplicates — multiple TWR controllers produce one T badge', () => {
        const atcList = [
            makeController('EGLL_TWR', 4),
            makeController('EGLL_W_TWR', 4),
        ];
        const badges = getAtcBadges(atcList, darkTheme);
        const towerBadges = badges.filter(b => b.key === 'tower');
        expect(towerBadges).toHaveLength(1);
    });

    it('deduplicates — multiple APP controllers produce one A badge', () => {
        const atcList = [
            makeController('EGLL_APP', 5),
            makeController('EGLL_F_APP', 5),
        ];
        const badges = getAtcBadges(atcList, darkTheme);
        const appBadges = badges.filter(b => b.key === 'approach');
        expect(appBadges).toHaveLength(1);
    });

    it('returns single controller badge (G only)', () => {
        const atcList = [makeController('EGLL_GND', 3)];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toEqual([
            { letter: 'G', color: '#1a7f37', key: 'ground' },
        ]);
    });

    it('returns C badge for clearance delivery', () => {
        const atcList = [makeController('EGLL_DEL', 2)];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toEqual([
            { letter: 'C', color: '#656d76', key: 'clearance' },
        ]);
    });

    it('returns A badge for approach controller', () => {
        const atcList = [makeController('EGLL_APP', 5)];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toEqual([
            { letter: 'A', color: '#3b7dd8', key: 'approach' },
        ]);
    });

    it('uses light theme colors when light theme is passed', () => {
        const atcList = [makeController('EGLL_TWR', 4)];
        const badges = getAtcBadges(atcList, lightTheme);
        expect(badges[0].color).toBe('#bf8700');
    });

    it('detects ATIS from json.atis array entries (callsign ending _ATIS)', () => {
        const atcList = [makeController('EGLL_ATIS', 4)];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toEqual([
            { letter: 'A', color: '#0ea5e9', key: 'atis' },
        ]);
    });

    it('detects CTR and FSS badges', () => {
        const atcList = [
            makeController('EGLL_CTR', 6),
            makeController('EGLL_FSS', 1),
        ];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toEqual([
            { letter: 'E', color: '#2BA99A', key: 'ctr' },
            { letter: 'F', color: '#A371F7', key: 'fss' },
        ]);
    });

    it('ignores controllers with unrecognized facility types', () => {
        const atcList = [
            makeController('EGLL_OBS', 0),
            makeController('EGLL_XXX', 99),
        ];
        const badges = getAtcBadges(atcList, darkTheme);
        expect(badges).toEqual([]);
    });
});
