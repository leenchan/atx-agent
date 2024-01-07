import { useState, createContext, useEffect } from 'react';

export const SettingContext = createContext({});

// localStorage.setItem();
// localStorage.getItem();
// localStorage.removeItem();
// localStorage.clear();

const SETTING = 'setting';

export const defaultHost = location.host.split(':')[0] + ':7912';

const save = (data) => {
  localStorage.setItem(SETTING, JSON.stringify(data));
};
const load = () => {
  return JSON.parse(localStorage.getItem(SETTING)) ?? {};
};

const initSetting = {
  host: load().host ?? defaultHost,
};

export const loadSetting = () => {
  return JSON.parse(localStorage.getItem(SETTING)) ?? {};
};

export const useSetting = () => {
  const [data, setData] = useState(initSetting);

  useEffect(() => {
    let nextSetting = load();
    if (!nextSetting.updateAt) {
      nextSetting = initSetting;
      save(initSetting);
    }
    setData(nextSetting);
  }, []);

  return {
    setting: data,
    set: (changes = {}) => {
      const nextSetting = { ...load(), ...changes, updateAt: new Date().valueOf() };
      setData(nextSetting);
      save(nextSetting);
    },
    reset: () => {
      setData(initSetting);
      save(initSetting);
    },
  };
};

export default useSetting;
