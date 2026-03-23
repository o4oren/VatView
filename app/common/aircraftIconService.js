import { Skia, ImageFormat } from '@shopify/react-native-skia';
import { File, Directory, Paths } from 'expo-file-system';
import { Asset } from 'expo-asset';
import { PixelRatio } from 'react-native';

// 15 aircraft icon keys with SVG asset, scale factor, and type-code candidates
const AIRCRAFT_TYPES = {
    B737: {
        svgFile: require('../../assets/svg/b737.svg'),
        scale: 0.75,
        candidates: ['B737', 'B738', 'B739', 'B733', 'B734', 'B735', 'B736', 'B38M', 'B39M', 'B3XM'],
    },
    A320: {
        svgFile: require('../../assets/svg/a320.svg'),
        scale: 0.75,
        candidates: ['A318', 'A319', 'A320', 'A321', 'A20N', 'A21N', 'A32F', 'A32L', 'A32N', 'A32S', 'T204', 'B752', 'B753', 'B75F'],
    },
    C172: {
        svgFile: require('../../assets/svg/c172.svg'),
        scale: 0.55,
        candidates: ['C172', 'C182', 'C152', 'C206', 'C208', 'P206', 'SR20', 'SR22', 'PA22', 'PA28', 'PA31', 'PA44', 'C210', 'DA40', 'DA42', 'DR40', 'BE36'],
    },
    B747: {
        svgFile: require('../../assets/svg/b747.svg'),
        scale: 1.2,
        candidates: ['B741', 'B742', 'B744', 'B748', 'B74R', 'B74S', 'B74L'],
    },
    B767: {
        svgFile: require('../../assets/svg/b767.svg'),
        scale: 0.8,
        candidates: ['B762', 'B763', 'B764'],
    },
    B777: {
        svgFile: require('../../assets/svg/b777.svg'),
        scale: 1.0,
        candidates: ['B772', 'B773', 'B778', 'B779', 'B77X', 'B77L', 'B77W'],
    },
    B787: {
        svgFile: require('../../assets/svg/b787.svg'),
        scale: 0.9,
        candidates: ['B788', 'B789', 'B78X', 'B78J', 'MD11', 'MD10', 'DC10', 'DC1F'],
    },
    A340: {
        svgFile: require('../../assets/svg/a340.svg'),
        scale: 1.0,
        candidates: ['A342', 'A343', 'A345', 'A346', 'IL76', 'IL96'],
    },
    A330: {
        svgFile: require('../../assets/svg/a330.svg'),
        scale: 1.0,
        candidates: ['A332', 'A333', 'A338', 'A339', 'A310', 'A306', 'A300', 'A33X', 'A33Y', 'A359', 'A35K', 'A350', 'A351'],
    },
    A380: {
        svgFile: require('../../assets/svg/a380.svg'),
        scale: 1.2,
        candidates: ['A388', 'A389'],
    },
    ERJ: {
        svgFile: require('../../assets/svg/erj.svg'),
        scale: 0.65,
        candidates: ['CRJ1', 'CRJ2', 'CRJ7', 'CRJX', 'CRJ9', 'CJ', 'GLF5', 'LJ35', 'C25C', 'C510', 'C550', 'C560', 
            'C25B', 'C56X', 'C500', 'C700', 'C750', 'C650','F2TH', 'FA50', 'F27', 'F28', 'CL60', 'HDJT'],
    },
    727: {
        svgFile: require('../../assets/svg/erj.svg'),
        scale: 0.78,
        candidates: ['B721', 'B722','R722', 'T134']
    },
    E195: {
        svgFile: require('../../assets/svg/e195.svg'),
        scale: 0.65,
        candidates: ['E195', 'E95', 'E170', 'E175', 'E190'],
    },
    DC3: {
        svgFile: require('../../assets/svg/dc3.svg'),
        scale: 0.65,
        candidates: ['DC3', 'C47', 'PA34', 'B300', 'B200', 'BE58', 'DH8D', 'DH8A'],
    },
    Helicopter: {
        svgFile: require('../../assets/svg/helicopter.svg'),
        scale: 0.6,
        candidates: ['R22', 'R44', 'R66', 'AS50', 'AS60', 'H125', 'EC45', 'B06', 'H500', 'H135'],
    },
    A400: {
        svgFile: require('../../assets/svg/a400.svg'),
        scale: 0.75,
        candidates: ['A400', 'C130', 'C30J', 'C17'],
    },
    Conc: {
        svgFile: require('../../assets/svg/conc.svg'),
        scale: 1.3,
        candidates: ['CONC'],
    },
    F16: {
        svgFile: require('../../assets/svg/f16.svg'),
        scale: 0.75,
        candidates: ['F16', 'F15', 'F18', 'F18S'],
    },
    F35: {
        svgFile: require('../../assets/svg/f35.svg'),
        scale: 0.75,
        candidates: ['F35', 'F22'],
    },
};

// Target dp size per icon key — scale applied to a 32dp base to match old icon sizes.
// B737(0.75)→24dp, B747(1.1)→35dp, C172(0.55)→18dp, A380(1.2)→38dp
const getTargetDp = (scale) => Math.round(32 * scale);

// Both platforms need density-aware bitmaps:
// - Android: react-native-maps density-scales file URIs in dev mode (same as Metro-served)
// - iOS: PilotMarkers uses <Image style={{width: dp, height: dp}}> — needs high-res source
const pixelRatio = PixelRatio.get();

const cacheDir = new Directory(Paths.cache, 'aircraft-icons');

// In-memory cache: { 'B737': { uri: 'file:///...' }, ... }
let cache = {};
let currentAccentColor = null;

/**
 * Resolve a VATSIM type code to an icon key and scale.
 * Uses code.includes(candidate) matching per FSTrAk AircraftResolver.
 */
export const resolveIconKey = (typeCode) => {
    if (!typeCode) {
        return { iconKey: 'C172', scale: 0.55 };
    }

    for (const [iconKey, entry] of Object.entries(AIRCRAFT_TYPES)) {
        for (const candidate of entry.candidates) {
            if (typeCode.includes(candidate)) {
                return { iconKey, scale: entry.scale };
            }
        }
    }

    return { iconKey: 'C172', scale: 0.55 };
};

// Load all SVG files as raw XML strings
const loadSvgSources = async () => {
    const sources = {};
    for (const [iconKey, entry] of Object.entries(AIRCRAFT_TYPES)) {
        const asset = Asset.fromModule(entry.svgFile);
        await asset.downloadAsync();
        const svgFile = new File(asset.localUri);
        const xml = await svgFile.text();
        sources[iconKey] = xml;
    }
    return sources;
};

// Inject fill color into SVG XML by adding fill to <path> elements
const injectFillColor = (svgXml, fillColor) => {
    return svgXml.replace(/<path /g, `<path fill="${fillColor}" `);
};

// Render an SVG string to a PNG file on disk, return { uri }
const renderSvgToBitmap = (svgXml, fillColor, widthPx, heightPx, filename) => {
    const coloredSvg = injectFillColor(svgXml, fillColor);
    const surface = Skia.Surface.MakeOffscreen(widthPx, heightPx);
    const canvas = surface.getCanvas();
    const svg = Skia.SVG.MakeFromString(coloredSvg);
    canvas.drawSvg(svg, widthPx, heightPx);
    surface.flush();
    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.makeNonTextureImage().encodeToBase64(ImageFormat.PNG, 100);
    surface.dispose();

    const outFile = new File(cacheDir, filename);
    outFile.write(base64, { encoding: 'base64' });
    return { uri: outFile.uri };
};

/**
 * Initialize the icon cache for a given theme.
 * Pre-renders one bitmap per icon key at the correct display size.
 *
 * Important behavior:
 * We intentionally cache a single resolved size per icon key (not per size variant).
 * This avoids Android file-URI marker sizing inconsistencies seen with variant-based assets.
 * The returned `sizeDp` controls display size, while render pixels are density-scaled
 * for sharpness across devices.
 */
export const init = async (theme) => {
    const accentColor = theme.accent.primary;

    // Clean up and recreate cache directory
    if (cacheDir.exists) {
        cacheDir.delete();
    }
    cacheDir.create({ intermediates: true });

    const svgSources = await loadSvgSources();
    const newCache = {};

    for (const [iconKey, svgXml] of Object.entries(svgSources)) {
        const typeInfo = AIRCRAFT_TYPES[iconKey];
        const targetDp = getTargetDp(typeInfo.scale);
        const renderPx = Math.round(targetDp * pixelRatio);
        const filename = `${iconKey}.png`;
        newCache[iconKey] = {
            image: renderSvgToBitmap(svgXml, accentColor, renderPx, renderPx, filename),
            sizeDp: targetDp,
        };
    }

    cache = newCache;
    currentAccentColor = accentColor;
};

/**
 * Get a cached marker image for an aircraft type.
 * Returns { image: { uri }, sizeDp } synchronously from cache.
 */
export const getMarkerImage = (aircraftType) => {
    const { iconKey } = resolveIconKey(aircraftType);
    return cache[iconKey] || null;
};

export const getCurrentAccentColor = () => currentAccentColor;
export const isInitialized = () => Object.keys(cache).length > 0;
export { AIRCRAFT_TYPES };

// Test-only exports (prefixed with _test)
export const _testGetTargetDp = getTargetDp;
export const _testInjectFillColor = injectFillColor;

