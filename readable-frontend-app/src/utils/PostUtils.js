export const getUUID = () => ((new Date()).getTime().toString(36) + Math.random().toString(36).substr(-14));

export const getDate = (milliseconds) => (new Date(milliseconds).toString().split("G")[0]);
