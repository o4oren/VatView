import {
    resolveIconKey,
    _testInjectFillColor,
    _testGetTargetDp,
    init,
    getMarkerImage,
    isInitialized,
    getCurrentAccentColor,
    AIRCRAFT_TYPES,
    PILOT_ROLE_COLORS,
} from '../app/common/aircraftIconService';

describe('resolveIconKey', () => {
    it('matches exact candidate code', () => {
        const result = resolveIconKey('B738');
        expect(result.iconKey).toBe('B737');
        expect(result.scale).toBe(0.75);
    });

    it('matches substring candidate (code.includes)', () => {
        const result = resolveIconKey('A320neo');
        expect(result.iconKey).toBe('A320');
    });

    it('returns C172 fallback for unknown type code', () => {
        const result = resolveIconKey('ZZZZ');
        expect(result.iconKey).toBe('C172');
        expect(result.scale).toBe(0.55);
    });

    it('returns C172 fallback for null input', () => {
        const result = resolveIconKey(null);
        expect(result.iconKey).toBe('C172');
        expect(result.scale).toBe(0.55);
    });

    it('returns C172 fallback for undefined input', () => {
        const result = resolveIconKey(undefined);
        expect(result.iconKey).toBe('C172');
        expect(result.scale).toBe(0.55);
    });

    it('returns C172 fallback for empty string', () => {
        const result = resolveIconKey('');
        expect(result.iconKey).toBe('C172');
        expect(result.scale).toBe(0.55);
    });

    it('matches B747 variants', () => {
        expect(resolveIconKey('B744').iconKey).toBe('B747');
        expect(resolveIconKey('B748').iconKey).toBe('B747');
    });

    it('matches A380 variants', () => {
        expect(resolveIconKey('A388').iconKey).toBe('A380');
        expect(resolveIconKey('A388').scale).toBe(1.2);
    });

    it('matches helicopter codes', () => {
        expect(resolveIconKey('R22').iconKey).toBe('Helicopter');
        expect(resolveIconKey('H135').iconKey).toBe('Helicopter');
    });

    it('matches Concorde', () => {
        expect(resolveIconKey('CONC').iconKey).toBe('Conc');
        expect(resolveIconKey('CONC').scale).toBe(1.3);
    });

    it('matches ERJ/bizjet codes', () => {
        expect(resolveIconKey('E170').iconKey).toBe('E195'); // E170 is Embraer E-Jet family
        expect(resolveIconKey('CRJ1').iconKey).toBe('ERJ');
        expect(resolveIconKey('GLF5').iconKey).toBe('ERJ');
    });

    it('matches E195', () => {
        expect(resolveIconKey('E195').iconKey).toBe('E195');
    });

    it('matches DC3 variants', () => {
        expect(resolveIconKey('DC3').iconKey).toBe('DC3');
        expect(resolveIconKey('B300').iconKey).toBe('B200'); // B300 is King Air 300, same family as B200
    });

    it('matches B767 variants', () => {
        expect(resolveIconKey('B762').iconKey).toBe('B767');
        expect(resolveIconKey('B763').iconKey).toBe('B767');
    });

    it('matches B777 variants', () => {
        expect(resolveIconKey('B77W').iconKey).toBe('B777');
        expect(resolveIconKey('B77L').iconKey).toBe('B777');
    });

    it('matches B787 variants', () => {
        expect(resolveIconKey('B788').iconKey).toBe('B787');
        expect(resolveIconKey('B78J').iconKey).toBe('B787');
    });

    it('matches A340 variants', () => {
        expect(resolveIconKey('A346').iconKey).toBe('A340');
        expect(resolveIconKey('IL76').iconKey).toBe('A340');
    });

    it('matches A330 variants', () => {
        expect(resolveIconKey('A332').iconKey).toBe('A330');
        expect(resolveIconKey('A359').iconKey).toBe('A330');
        expect(resolveIconKey('A35K').iconKey).toBe('A330');
    });
});

describe('getTargetDp', () => {
    it('returns correct dp for various scales', () => {
        expect(_testGetTargetDp(0.55)).toBe(18); // C172
        expect(_testGetTargetDp(0.75)).toBe(24); // B737, A320
        expect(_testGetTargetDp(1.0)).toBe(32);  // B777, A330, A340
        expect(_testGetTargetDp(1.1)).toBe(35);  // B747
        expect(_testGetTargetDp(1.2)).toBe(38);  // A380
        expect(_testGetTargetDp(1.3)).toBe(42);  // Conc
    });
});

describe('injectFillColor', () => {
    it('adds fill attribute to path elements', () => {
        const svg = '<svg><path d="M0,0"/></svg>';
        const result = _testInjectFillColor(svg, '#2A6BC4');
        expect(result).toBe('<svg><path fill="#2A6BC4" d="M0,0"/></svg>');
    });

    it('adds fill to multiple path elements', () => {
        const svg = '<svg><path d="M0,0"/><path d="M1,1"/></svg>';
        const result = _testInjectFillColor(svg, '#FF0000');
        expect(result).toContain('fill="#FF0000" d="M0,0"');
        expect(result).toContain('fill="#FF0000" d="M1,1"');
    });
});

describe('init and getMarkerImage (integration)', () => {
    const lightTheme = { accent: { primary: '#2A6BC4' }, surface: { base: '#FFFFFF' } };
    const darkTheme = { accent: { primary: '#3B7DD8' }, surface: { base: '#0D1117' } };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('populates cache and getMarkerImage returns valid entry after init', async () => {
        await init(lightTheme);

        expect(isInitialized()).toBe(true);
        expect(getCurrentAccentColor()).toBe('#2A6BC4');

        const iconKeys = Object.keys(AIRCRAFT_TYPES);
        expect(iconKeys).toHaveLength(22);

        for (const iconKey of iconKeys) {
            const result = getMarkerImage(iconKey, 'other');
            expect(result).not.toBeNull();
            expect(result.image).toBeDefined();
            expect(result.image.uri).toBeDefined();
            expect(result.sizeDp).toBeGreaterThan(0);
        }
    });

    it('init completes under 500ms in mocked test environment', async () => {
        const start = Date.now();
        await init(lightTheme);
        const elapsedMs = Date.now() - start;
        expect(elapsedMs).toBeLessThan(500);
    });

    it('getMarkerImage falls back to C172 for unknown type', async () => {
        await init(lightTheme);

        const result = getMarkerImage('ZZZZ');
        expect(result).not.toBeNull();
        expect(result.sizeDp).toBe(19); // C172 scale 0.6 → round(32*0.6) = 19
    });

    it('cache regenerates on theme change with different accent color', async () => {
        await init(lightTheme);
        expect(getCurrentAccentColor()).toBe('#2A6BC4');

        await init(darkTheme);
        expect(getCurrentAccentColor()).toBe('#3B7DD8');
        expect(isInitialized()).toBe(true);

        const result = getMarkerImage('B738');
        expect(result).not.toBeNull();
    });
});

describe('PILOT_ROLE_COLORS', () => {
    it('exports me colors for dark and light', () => {
        expect(PILOT_ROLE_COLORS.me.dark).toBe('#C0C8D0');
        expect(PILOT_ROLE_COLORS.me.light).toBe('#E53935');
    });

    it('exports friend colors for dark and light', () => {
        expect(PILOT_ROLE_COLORS.friend.dark).toBe('#00BFA5');
        expect(PILOT_ROLE_COLORS.friend.light).toBe('#00BFA5');
    });

    it('exports null for other (uses theme accent)', () => {
        expect(PILOT_ROLE_COLORS.other).toBeNull();
    });
});

describe('getMarkerImage with role', () => {
    const darkTheme = { accent: { primary: '#5BA0E6' }, surface: { base: '#0D1117' } };
    const lightTheme = { accent: { primary: '#2A6BC4' }, surface: { base: '#FFFFFF' } };

    it('returns a valid entry for role "me" on dark theme', async () => {
        await init(darkTheme);
        const result = getMarkerImage('B738', 'me');
        expect(result).not.toBeNull();
        expect(result.image.uri).toBeDefined();
        expect(result.sizeDp).toBeGreaterThan(0);
    });

    it('returns a valid entry for role "friend" on dark theme', async () => {
        await init(darkTheme);
        const result = getMarkerImage('B738', 'friend');
        expect(result).not.toBeNull();
        expect(result.image.uri).toBeDefined();
    });

    it('returns a valid entry for role "other" on dark theme', async () => {
        await init(darkTheme);
        const result = getMarkerImage('B738', 'other');
        expect(result).not.toBeNull();
        expect(result.image.uri).toBeDefined();
    });

    it('returns a valid entry for role "me" on light theme', async () => {
        await init(lightTheme);
        const result = getMarkerImage('B738', 'me');
        expect(result).not.toBeNull();
    });

    it('falls back to "other" cache when role is undefined', async () => {
        await init(darkTheme);
        const withRole = getMarkerImage('B738', 'other');
        const withoutRole = getMarkerImage('B738', undefined);
        expect(withoutRole.sizeDp).toBe(withRole.sizeDp);
    });
});
