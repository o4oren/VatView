import {
    getStaffedMarkerImage,
    getTrafficMarkerImage,
    invalidateCache,
    _testGetCacheSize,
} from '../app/common/airportMarkerService';

const lightTheme = {
    atc: {
        airportDot: '#2A6BC4',
        airportDotUnstaffed: '#8B949E',
    },
};

const darkTheme = {
    atc: {
        airportDot: '#3B7DD8',
        airportDotUnstaffed: '#484F58',
    },
};

describe('airportMarkerService', () => {
    beforeEach(() => {
        invalidateCache();
    });

    it('generates a staffed airport marker at continental zoom', () => {
        const result = getStaffedMarkerImage('EGLL', 'continental', lightTheme);
        expect(result).toBeDefined();
        expect(result.image).toBeDefined();
        expect(result.image.uri).toContain('data:image/png;base64,');
        expect(result.widthDp).toBeGreaterThanOrEqual(44);
        expect(result.heightDp).toBeGreaterThanOrEqual(44);
        expect(result.anchor).toEqual(expect.objectContaining({y: 0.5}));
    });

    it('generates a staffed airport marker at regional zoom', () => {
        const result = getStaffedMarkerImage('EGLL', 'regional', lightTheme);
        expect(result).toBeDefined();
        expect(result.image).toBeDefined();
        expect(result.widthDp).toBeGreaterThanOrEqual(44);
        expect(result.heightDp).toBeGreaterThanOrEqual(44);
    });

    it('generates a traffic marker with departures and arrivals', () => {
        const result = getTrafficMarkerImage('KJFK', 5, 3, 'regional', lightTheme);
        expect(result).toBeDefined();
        expect(result.image).toBeDefined();
        expect(result.widthDp).toBeGreaterThanOrEqual(44);
        expect(result.heightDp).toBeGreaterThanOrEqual(44);
        expect(result.anchor).toEqual(expect.objectContaining({y: 0.5}));
    });

    it('generates a traffic marker with departures only', () => {
        const result = getTrafficMarkerImage('KJFK', 2, 0, 'regional', lightTheme);
        expect(result).toBeDefined();
        expect(result.image).toBeDefined();
    });

    it('generates a traffic marker with arrivals only', () => {
        const result = getTrafficMarkerImage('KJFK', 0, 7, 'regional', lightTheme);
        expect(result).toBeDefined();
        expect(result.image).toBeDefined();
    });

    it('caches results for repeated calls with same parameters', () => {
        invalidateCache();
        const result1 = getStaffedMarkerImage('EGLL', 'continental', lightTheme);
        const result2 = getStaffedMarkerImage('EGLL', 'continental', lightTheme);
        expect(result1).toBe(result2);
    });

    it('generates different cache entries for different ICAOs', () => {
        invalidateCache();
        getStaffedMarkerImage('EGLL', 'regional', lightTheme);
        getStaffedMarkerImage('KJFK', 'regional', lightTheme);
        expect(_testGetCacheSize()).toBeGreaterThanOrEqual(2);
    });

    it('invalidates cache on theme change', () => {
        getStaffedMarkerImage('EGLL', 'continental', lightTheme);
        const sizeBefore = _testGetCacheSize();
        expect(sizeBefore).toBeGreaterThan(0);

        // Switching theme clears cache
        getStaffedMarkerImage('EGLL', 'continental', darkTheme);
        // Cache was cleared and rebuilt — should have exactly 1 entry now
        expect(_testGetCacheSize()).toBe(1);
    });

    it('returns marker with ICAO for zero traffic', () => {
        const result = getTrafficMarkerImage('KJFK', 0, 0, 'regional', lightTheme);
        expect(result).toBeDefined();
        expect(result.image).toBeDefined();
    });
});
