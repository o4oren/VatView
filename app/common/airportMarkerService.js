import { Skia, ImageFormat } from '@shopify/react-native-skia';
import { PixelRatio } from 'react-native';
import {
    AIRPORT_MARKER_FONT_CONTINENTAL,
    AIRPORT_MARKER_FONT_REGIONAL,
} from './consts';

const pixelRatio = PixelRatio.get();
const MIN_TOUCH_TARGET_DP = 44;

// In-memory cache keyed by visual signature
let cache = {};
let currentThemeKey = null;

const TRAFFIC_GREEN = '#1A7F37';
const TRAFFIC_RED = '#CF222E';

// System font manager for SVG text rendering
let systemFontMgr = null;
const getFontMgr = () => {
    if (!systemFontMgr) {
        systemFontMgr = Skia.FontMgr.System();
    }
    return systemFontMgr;
};

const toDataUri = (base64) => `data:image/png;base64,${base64}`;
const minTouchTargetPx = Math.round(MIN_TOUCH_TARGET_DP * pixelRatio);

const renderSvgToImage = (widthPx, heightPx, svgString) => {
    const surface = Skia.Surface.MakeOffscreen(widthPx, heightPx);
    const canvas = surface.getCanvas();
    const svg = Skia.SVG.MakeFromString(svgString, getFontMgr());
    canvas.drawSvg(svg, widthPx, heightPx);
    surface.flush();
    const snapshot = surface.makeImageSnapshot();
    const base64 = snapshot.makeNonTextureImage().encodeToBase64(ImageFormat.PNG, 100);
    surface.dispose();
    return { uri: toDataUri(base64) };
};

// Escape XML special characters in text
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const estimateTextWidth = (text, fontSizePx, factor = 0.65) => Math.round(fontSizePx * factor * text.length);

const createMarkerResult = (widthPx, heightPx, svgString, anchorCenterX) => {
    const widthDp = widthPx / pixelRatio;
    const heightDp = heightPx / pixelRatio;
    const anchorCenterXDp = anchorCenterX / pixelRatio;
    return {
        image: renderSvgToImage(widthPx, heightPx, svgString),
        widthDp,
        heightDp,
        // Android: anchor as fraction (used by native image prop)
        anchor: {
            x: anchorCenterX / widthPx,
            y: 0.5,
        },
        // iOS: offset from center so the dot sits on the coordinate
        centerOffset: {
            x: widthDp / 2 - anchorCenterXDp,
            y: 0,
        },
    };
};

const buildTrafficText = (startX, textY, fontSizePx, departures, arrivals) => {
    const spacing = Math.round(3 * pixelRatio);
    let xOffset = startX;
    let textElements = '';

    if (departures > 0) {
        const depText = `▲${departures}`;
        textElements += `<text x="${xOffset}" y="${textY}" font-size="${fontSizePx}" fill="${TRAFFIC_GREEN}" font-family="sans-serif" font-weight="bold">${esc(depText)}</text>`;
        xOffset += estimateTextWidth(depText, fontSizePx, 0.7) + spacing;
    }

    if (arrivals > 0) {
        const arrText = `▼${arrivals}`;
        textElements += `<text x="${xOffset}" y="${textY}" font-size="${fontSizePx}" fill="${TRAFFIC_RED}" font-family="sans-serif" font-weight="bold">${esc(arrText)}</text>`;
        xOffset += estimateTextWidth(arrText, fontSizePx, 0.7);
    }

    return {
        textElements,
        widthPx: Math.max(0, xOffset - startX),
    };
};

const generateAirportDotWithIcao = (color, icao, fontSizeDp, dotDp, trafficInfo = null) => {
    const departures = trafficInfo?.departures || 0;
    const arrivals = trafficInfo?.arrivals || 0;
    const cacheKey = `dot-icao-${color}-${icao}-${fontSizeDp}-${departures}-${arrivals}`;
    if (cache[cacheKey]) return cache[cacheKey];

    const dotPx = Math.round(dotDp * pixelRatio);
    const fontSizePx = Math.round(fontSizeDp * pixelRatio);
    const trafficFontSizePx = Math.round(fontSizeDp * pixelRatio);
    const padding = Math.round(3 * pixelRatio);
    const textWidth = estimateTextWidth(icao, fontSizePx);
    let contentWidth = dotPx + padding + textWidth;
    const contentHeight = Math.max(dotPx, Math.max(fontSizePx, trafficFontSizePx) + 4);
    const r = dotPx / 2;
    let trafficWidth = 0;

    if (departures > 0 || arrivals > 0) {
        const trafficTextParts = [];
        if (departures > 0) trafficTextParts.push(`▲${departures}`);
        if (arrivals > 0) trafficTextParts.push(`▼${arrivals}`);
        trafficWidth = estimateTextWidth(trafficTextParts.join(' '), trafficFontSizePx, 0.7);
        contentWidth += padding + trafficWidth + padding;
    }

    const rightPadding = Math.round(4 * pixelRatio);
    const totalWidth = Math.max(contentWidth + rightPadding, minTouchTargetPx);
    const totalHeight = Math.max(contentHeight, minTouchTargetPx);
    const finalContentX = totalWidth > contentWidth + rightPadding ? Math.round((totalWidth - contentWidth) / 2) : 0;
    const contentY = totalHeight > contentHeight ? Math.round((totalHeight - contentHeight) / 2) : 0;
    const cy = contentY + (contentHeight / 2);
    const textY = cy + fontSizePx * 0.35;
    const trafficY = cy + trafficFontSizePx * 0.35;
    let trafficText = '';

    if (trafficWidth > 0) {
        const trafficStartX = finalContentX + dotPx + padding + textWidth + padding;
        trafficText = buildTrafficText(trafficStartX, trafficY, trafficFontSizePx, departures, arrivals).textElements;
    }

    const dotCenterX = finalContentX + r;

    const svg = `<svg width="${totalWidth}" height="${totalHeight}" xmlns="http://www.w3.org/2000/svg">
        <circle cx="${dotCenterX}" cy="${cy}" r="${r}" fill="${color}"/>
        <text x="${finalContentX + dotPx + padding}" y="${textY}" font-size="${fontSizePx}" fill="${color}" font-family="sans-serif" font-weight="bold">${esc(icao)}</text>
        ${trafficText}
    </svg>`;

    const result = createMarkerResult(totalWidth, totalHeight, svg, dotCenterX);
    cache[cacheKey] = result;
    return result;
};

const getThemeKey = (activeTheme) =>
    `${activeTheme.atc.airportDot}-${activeTheme.atc.airportDotUnstaffed}`;

export const invalidateCache = () => {
    cache = {};
    currentThemeKey = null;
};

export const getStaffedMarkerImage = (icao, zoomBand, activeTheme, trafficInfo = null) => {
    const themeKey = getThemeKey(activeTheme);
    if (themeKey !== currentThemeKey) {
        cache = {};
        currentThemeKey = themeKey;
    }
    const color = activeTheme.atc.airportDot;
    if (zoomBand === 'global') {
        return generateAirportDotWithIcao(color, icao, AIRPORT_MARKER_FONT_CONTINENTAL, 10, trafficInfo);
    }
    return generateAirportDotWithIcao(color, icao, AIRPORT_MARKER_FONT_REGIONAL, 12, trafficInfo);
};

export const getTrafficMarkerImage = (icao, departures, arrivals, zoomBand, activeTheme) => {
    const themeKey = getThemeKey(activeTheme);
    if (themeKey !== currentThemeKey) {
        cache = {};
        currentThemeKey = themeKey;
    }
    const color = activeTheme.atc.airportDotUnstaffed;
    const trafficInfo = (departures > 0 || arrivals > 0) ? {departures, arrivals} : null;
    if (zoomBand === 'global') {
        return generateAirportDotWithIcao(color, icao, AIRPORT_MARKER_FONT_CONTINENTAL, 10, trafficInfo);
    }
    return generateAirportDotWithIcao(color, icao, AIRPORT_MARKER_FONT_REGIONAL, 12, trafficInfo);
};

// For testing
export const _testGetCacheSize = () => Object.keys(cache).length;
