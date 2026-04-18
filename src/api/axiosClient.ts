// import axios from 'axios';
// import { tokenUtils } from '../utils/token';

// const axiosClient = axios.create({
//   baseURL: import.meta.env.VITE_API_URL,
//   headers: { 'Content-Type': 'application/json' },
// });

// axiosClient.interceptors.request.use((config) => {
//   const token = tokenUtils.getAccessToken();
//   if (token) config.headers.Authorization = `Bearer ${token}`;
//   return config;
// });

// axiosClient.interceptors.response.use(
//   (res) => res,
//   (error) => {
//     if (error.response?.status === 401) {
//       tokenUtils.clear();
//       window.location.href = '/login';
//     }
//     return Promise.reject(error);
//   }
// );

// export default axiosClient;

import axios from 'axios';
import { tokenUtils } from '../utils/token';

const axiosClient = axios.create({
  // Empty baseURL = relative path → works both locally (Vite proxy) and on Vercel (vercel.json rewrite)
  baseURL: '',
  headers: { 'Content-Type': 'application/json' },
});

axiosClient.interceptors.request.use((config) => {
  const token = tokenUtils.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      tokenUtils.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;