export const TRAFFIC_UPDATED = "TRAFFIC_UPDATED";
export const ATC_UPDATED = "ATC_UPDATED";
export const UPDATE_DATA = "UPDATE_DATA";

const trafficUpdated = (aircraft) => {
  console.log('traffic updated', aircraft)
  return {
    type: TRAFFIC_UPDATED,
    payload: {aircraft: aircraft}
  };
};

const atcUpdated = (atc) => {
  return {
    type: TRAFFIC_UPDATED,
    payload: {atc: atc}
  };
};

const updateData = () => {
  return {
    type: UPDATE_DATA,
  };
};


export default {
  trafficUpdated: trafficUpdated,
  atcUpdated: atcUpdated,
  updateData: updateData
};
