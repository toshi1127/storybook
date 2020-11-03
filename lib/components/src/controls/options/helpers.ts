import { OptionsObject } from '../types';

export const selectedKey = (value: any, options: OptionsObject) => {
  const entry = Object.entries(options).find(([_key, val]) => val === value);
  return entry ? entry[0] : undefined;
};

export const selectedKeys = (value: any[], options: OptionsObject) =>
  value
    ? Object.entries(options)
        .filter((entry) => value.includes(entry[1]))
        .map((entry) => entry[0])
    : [];

export const selectedValues = (keys: string[], options: OptionsObject) =>
  keys.map((key) => options[key]);
