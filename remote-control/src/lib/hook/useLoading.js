import { useState, useEffect, createContext } from 'react';

export const LoadingContext = createContext();

export const useLoading = () => {
  const [loading, setLoading] = useState([]);

  const add = (...keys) => {
    setLoading(prev => {
      const nextLoading = [...prev];
      for (let i = 0; i < keys.length; i += 1) {
        if (nextLoading.indexOf(keys[i]) === -1) {
          nextLoading.push(keys[i]);
        }
      }
      return nextLoading;
    });
  };
  const remove = (...keys) => {
    setLoading(prev =>
      [...prev].filter((k) => !keys.includes(k))
    );
  };
  const list = () => loading;
  const clear = () => {
    setLoading(prev => []);
  };
  const isLoading = (...keys) => {
    let isLoadingAny = false;
    if (keys.length === 0) {
      return loading.length > 0;
    }
    for (let i = 0; i < keys.length; i += 1) {
      if (loading.indexOf(keys[i]) >= 0) {
        isLoadingAny = true;
        break;
      }
    }
    return isLoadingAny;
  };

  useEffect(() => {
    // console.log(loading);
  }, [loading]);

  return {
    has: isLoading,
    add,
    remove,
    list,
    clear,
    count: loading.length,
  };
};

export default useLoading;
