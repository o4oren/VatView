import trafficActions from "../redux/actions/trafficActions";

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

export default {
  getVatsimTraffic: getVatsimTraffic
}