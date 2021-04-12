const createKey = (client) => {

    return `${client.callsign}_${client.cid}`;
};

export default createKey;