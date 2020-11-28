export const STATIC_DATA_UPDATED = "STATIC_DATA_UPDATED";
export const UPDATE_STATIC_DATA = "UPDATE_STATIC_DATA";

const staticDataUpdated = (data) => {
  return {
    type: STATIC_DATA_UPDATED,
    payload: {data: data}
  };
};

const updateStaticData = () => {
  return {
    type: UPDATE_STATIC_DATA,
  };
};


export default {
  staticDataUpdated: staticDataUpdated,
  updateStaticData: updateStaticData
};
