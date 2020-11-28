
const getVatsimLiveData = async () => {
  try {
    let response = await fetch(
        'https://data.vatsim.net/vatsim-data.json'
    );
    let json = await response.json();
    console.log('calling',json)
    return json;
  } catch (error) {
    console.error(error);
  }
};

export default {
  getVatsimLiveData: getVatsimLiveData
}