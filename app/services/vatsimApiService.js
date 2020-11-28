import trafficActions from "../redux/actions/vatsimDataActions";

const getVatsimTraffic = async () => {
  try {
    let response = await fetch(
        'https://map.vatsim.net/livedata/live.json'
    );
    let json = await response.json();
    let aircraft = [];
    for (var key of Object.keys(json)) {
       aircraft.push(json[key]);
    }

    return aircraft;
  } catch (error) {
    console.error(error);
  }
};

const getVatsimLiveData = async () => {
  try {
    let response = await fetch(
        'http://data.vatsim.net/vatsim-data.json'
    );
    let json = await response.json();
    let result = {
      general: json.general,
      aircraft: json.clients.filter(client => client.clienttype === "PILOT"),
      atc: json.clients.filter(client => client.clienttype === "ATC"),
      server: json.servers
    }
    return result;
  } catch (error) {
    console.error(error);
  }
};

export default {
  getVatsimLiveData: getVatsimLiveData
}