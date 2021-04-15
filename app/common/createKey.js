const createKey = (client) => {
    return `${client.callsign}_${client.cid}_${client.last_updated}`;
};

export default createKey;