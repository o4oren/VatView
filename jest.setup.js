// Mock AsyncStorage for Jest
jest.mock('@react-native-async-storage/async-storage', () => ({
    __esModule: true,
    default: {
        getItem: jest.fn(() => Promise.resolve(null)),
        setItem: jest.fn(() => Promise.resolve()),
        removeItem: jest.fn(() => Promise.resolve()),
        multiGet: jest.fn(() => Promise.resolve([])),
        multiSet: jest.fn(() => Promise.resolve()),
    },
}));

// Mock react-native-maps for Jest
jest.mock('react-native-maps', () => {
    return {
        __esModule: true,
        default: 'MapView',
        Marker: 'Marker',
        Polygon: 'Polygon',
        Circle: 'Circle',
        Polyline: 'Polyline',
    };
});

// Mock @shopify/react-native-skia for Jest
jest.mock('@shopify/react-native-skia', () => ({
    Skia: {
        Surface: {
            MakeOffscreen: jest.fn(() => ({
                getCanvas: jest.fn(() => ({
                    drawSvg: jest.fn(),
                    drawCircle: jest.fn(),
                    drawText: jest.fn(),
                })),
                flush: jest.fn(),
                makeImageSnapshot: jest.fn(() => ({
                    makeNonTextureImage: jest.fn(() => ({
                        encodeToBase64: jest.fn(() => 'mockBase64Data'),
                    })),
                })),
                dispose: jest.fn(),
            })),
        },
        SVG: {
            MakeFromString: jest.fn(() => ({})),
        },
        Paint: jest.fn(() => ({
            setColor: jest.fn(),
            setAntiAlias: jest.fn(),
        })),
        Font: jest.fn(() => ({})),
        Color: jest.fn((c) => c),
        FontMgr: {
            System: jest.fn(() => ({})),
        },
    },
    ImageFormat: {
        PNG: 0,
    },
}));

// Mock expo-asset
jest.mock('expo-asset', () => ({
    Asset: {
        fromModule: jest.fn(() => ({
            downloadAsync: jest.fn(() => Promise.resolve()),
            localUri: 'file:///mock/asset.svg',
        })),
    },
}));

// Mock expo-file-system (new File/Directory/Paths API)
const mockFileInstances = {};
jest.mock('expo-file-system', () => {
    const MockFile = jest.fn(function (...args) {
        // Build a uri from constructor args
        const parts = args.map(a => (a && a.uri) ? a.uri : String(a));
        this.uri = parts.join('/').replace(/\/+/g, '/');
        this.text = jest.fn(() => Promise.resolve('<svg><path d="M0,0"/></svg>'));
        this.write = jest.fn();
        this.exists = false;
        mockFileInstances[this.uri] = this;
    });

    const MockDirectory = jest.fn(function (...args) {
        const parts = args.map(a => (a && a.uri) ? a.uri : String(a));
        this.uri = parts.join('/').replace(/\/+/g, '/');
        this.exists = false;
        this.create = jest.fn();
        this.delete = jest.fn();
    });

    return {
        File: MockFile,
        Directory: MockDirectory,
        Paths: {
            cache: { uri: 'file:///mock/cache' },
            document: { uri: 'file:///mock/document' },
        },
    };
});
