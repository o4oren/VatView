import { init } from '../app/common/aircraftIconService';
import { getAircraftIcon, iconSizes, mapIcons } from '../app/common/iconsHelper';

const lightTheme = { accent: { primary: '#2A6BC4' } };

describe('getAircraftIcon (legacy wrapper)', () => {
    beforeAll(async () => {
        await init(lightTheme);
    });

    it('returns [imageSource, sizeDp] tuple for B738', () => {
        const result = getAircraftIcon('B738');
        expect(Array.isArray(result)).toBe(true);
        expect(result).toHaveLength(2);

        const [imageSource, sizeDp] = result;
        expect(imageSource).not.toBeNull();
        expect(imageSource.uri).toBeDefined();
        expect(typeof sizeDp).toBe('number');
        expect(sizeDp).toBeGreaterThan(0);
    });

    it('returns valid result for null code (C172 fallback)', () => {
        const [imageSource, sizeDp] = getAircraftIcon(null);
        expect(imageSource).not.toBeNull();
        expect(sizeDp).toBe(18); // C172 scale
    });

    it('returns valid result for unknown code (C172 fallback)', () => {
        const [imageSource, sizeDp] = getAircraftIcon('ZZZZ');
        expect(imageSource).not.toBeNull();
        expect(sizeDp).toBe(18);
    });
});

describe('mapIcons', () => {
    it('has B737 fallback for PilotMarkers safety net', () => {
        expect(mapIcons.B737).toBeDefined();
    });

    it('has ATC icon entries', () => {
        expect(mapIcons.tower64).toBeDefined();
        expect(mapIcons.antenna64).toBeDefined();
        expect(mapIcons.radar64).toBeDefined();
        expect(mapIcons.tower32).toBeDefined();
    });
});

describe('iconSizes', () => {
    it('exports expected size constants', () => {
        expect(iconSizes.BUILDING_SIZE).toBe(64);
        expect(iconSizes.JUMBO_SIZE).toBe(32);
        expect(iconSizes.MED_SIZE).toBe(24);
        expect(iconSizes.EXTRA_SMALL_SIZE).toBe(16);
    });
});

describe('getPilotMarkerRole', () => {
    // Import added separately since it doesn't exist yet
    const makePilot = (cid) => ({ cid });

    it('returns "me" when myCid matches pilot cid', () => {
        const { getPilotMarkerRole } = require('../app/common/iconsHelper');
        expect(getPilotMarkerRole(makePilot(1234567), '1234567', [])).toBe('me');
    });

    it('returns "me" when pilot cid is a number matching string myCid', () => {
        const { getPilotMarkerRole } = require('../app/common/iconsHelper');
        expect(getPilotMarkerRole(makePilot(999), '999', [])).toBe('me');
    });

    it('returns "friend" when pilot cid is in friendCids', () => {
        const { getPilotMarkerRole } = require('../app/common/iconsHelper');
        expect(getPilotMarkerRole(makePilot(555), '', ['555', '666'])).toBe('friend');
    });

    it('returns "other" when pilot matches neither', () => {
        const { getPilotMarkerRole } = require('../app/common/iconsHelper');
        expect(getPilotMarkerRole(makePilot(111), '999', ['555'])).toBe('other');
    });

    it('returns "other" when myCid is empty string', () => {
        const { getPilotMarkerRole } = require('../app/common/iconsHelper');
        expect(getPilotMarkerRole(makePilot(999), '', [])).toBe('other');
    });

    it('"me" takes priority over "friend" if same CID in both', () => {
        const { getPilotMarkerRole } = require('../app/common/iconsHelper');
        expect(getPilotMarkerRole(makePilot(111), '111', ['111'])).toBe('me');
    });

    it('returns "other" when friendCids is empty and myCid does not match', () => {
        const { getPilotMarkerRole } = require('../app/common/iconsHelper');
        expect(getPilotMarkerRole(makePilot(123), '456', [])).toBe('other');
    });
});
