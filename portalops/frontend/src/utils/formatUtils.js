// utils/formatUtils.js

export const formatPercentage = (used, max) => {
  if (max === 0) return 0;
  return ((used / max) * 100).toFixed(1); // keep 1 decimal place as string
};


export const formatRAM = (val) => {
  if (!val && val !== 0) return '0 MB';

  if (val >= 1024) {
    return `${(val / 1024).toFixed(2)} GB`;
  }
  return `${val} MB`;
};

export const formatStorage = (val) => {
  if (!val && val !== 0) return '0 GB';
  return `${val} GB`;
};
