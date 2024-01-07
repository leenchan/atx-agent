import { useState, useEffect, createContext } from 'react';

export const OptionContext = createContext();

export const useOption = () => {
  const [option, setOption] = useState({});

  const set = (changes = {}) => {
    setOption(prev => ({ ...prev, ...changes }));
  };

  return {
    option,
    set,
  }
};
