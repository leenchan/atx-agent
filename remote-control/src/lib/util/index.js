export const isEmpty = (v) => {
  return v === undefined || v === null || v === '' ? true : false;
};

export const delay = async (seconds) => {
  return new Promise(resolve => setTimeout(resolve, seconds * 1000));
};
