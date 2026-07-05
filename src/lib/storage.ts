import AsyncStorage from '@react-native-async-storage/async-storage';

// Works on web (localStorage) and native.
export const storage = {
  get: (k: string) => AsyncStorage.getItem(k),
  set: (k: string, v: string) => AsyncStorage.setItem(k, v),
  del: (k: string) => AsyncStorage.removeItem(k),
};
