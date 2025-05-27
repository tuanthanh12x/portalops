// utils/formatUtils.js
export const formatPercentage = (used, limit) => {
  if (!limit || limit === 0) return 0;
  return ((used / limit) * 100).toFixed(1);
};

export const formatRAM = (value) => {
  const gb = value / 1024;
  return `${gb.toFixed(1)} GB`;
};

export const formatStorage = formatRAM;