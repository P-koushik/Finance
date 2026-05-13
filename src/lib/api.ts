import axios from 'axios';
import { getAuth } from '@react-native-firebase/auth';
import { API_BASE_URL } from '@env';

const DEFAULT_API_BASE_URL = 'https://global-server-smhn.onrender.com/finance';

export const api = axios.create({
  baseURL: API_BASE_URL || DEFAULT_API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async config => {
  const token = await getAuth().currentUser?.getIdToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
