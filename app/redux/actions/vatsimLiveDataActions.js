export const DATA_UPDATED = "DATA_UPDATED";
export const UPDATE_DATA = "UPDATE_DATA";

const dataUpdated = (data) => {
  return {
    type: DATA_UPDATED,
    payload: {data: data}
  };
};

const updateData = () => {
  return {
    type: UPDATE_DATA,
  };
};


export default {
  dataUpdated: dataUpdated,
  updateData: updateData
};
