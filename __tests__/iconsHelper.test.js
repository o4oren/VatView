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
