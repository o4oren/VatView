import { DEL, GND, TWR_ATIS, APP, CTR, FSS } from './consts';

// Badge definitions in display order: ATIS → DEL → GND → TWR → APP → CTR → FSS
const BADGE_DEFS = [
    { facility: TWR_ATIS, letter: 'A', tokenKey: 'atis', isAtis: true },
    { facility: DEL, letter: 'C', tokenKey: 'clearance', isAtis: false },
    { facility: GND, letter: 'G', tokenKey: 'ground', isAtis: false },
    { facility: TWR_ATIS, letter: 'T', tokenKey: 'tower', isAtis: false },
    { facility: APP, letter: 'A', tokenKey: 'approach', isAtis: false },
    { facility: CTR, letter: 'E', tokenKey: 'ctr', isAtis: false },
    { facility: FSS, letter: 'F', tokenKey: 'fss', isAtis: false },
];

const isAtisCallsign = (callsign) =>
    typeof callsign === 'string' && callsign.toUpperCase().endsWith('ATIS');

export const getAtcBadges = (atcList, activeTheme) => {
    if (!atcList || atcList.length === 0) return [];

    const badgeColors = activeTheme.atc.badge;
    const seen = new Set();
    const badges = [];

    for (const def of BADGE_DEFS) {
        const badgeKey = `${def.letter}-${def.tokenKey}`;
        if (seen.has(badgeKey)) continue;

        const match = atcList.some((controller) => {
            if (controller.facility !== def.facility) return false;
            if (def.isAtis) return isAtisCallsign(controller.callsign);
            if (def.facility === TWR_ATIS) return !isAtisCallsign(controller.callsign);
            return true;
        });

        if (match) {
            seen.add(badgeKey);
            badges.push({
                letter: def.letter,
                color: badgeColors[def.tokenKey],
                key: def.tokenKey,
            });
        }
    }

    return badges;
};
